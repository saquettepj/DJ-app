/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { PlaybackState, Prompt } from '../types';
import type { AudioChunk, GoogleGenAI, LiveMusicFilteredPrompt, LiveMusicServerMessage, LiveMusicSession } from '@google/genai';
import { decode, decodeAudioData } from './audio';
import { throttle } from './throttle';

export class LiveMusicHelper extends EventTarget {

  private ai: GoogleGenAI;
  private model: string;

  private session: LiveMusicSession | null = null;
  private sessionPromise: Promise<LiveMusicSession> | null = null;

  private connectionError = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectInterval: number | null = null;

  private filteredPrompts = new Set<string>();
  private nextStartTime = 0;
  private bufferTime = 2;

  public readonly audioContext: AudioContext;
  public extraDestination: AudioNode | null = null;

  private outputNode: GainNode;
  private playbackState: PlaybackState = 'stopped';
  private previousPlaybackState: PlaybackState = 'stopped';
  private currentVolume: number = 0.5;

  private prompts: Map<string, Prompt>;

  constructor(ai: GoogleGenAI, model: string) {
    super();
    this.ai = ai;
    this.model = model;
    this.prompts = new Map();
    this.audioContext = new AudioContext({ sampleRate: 48000 });
    this.outputNode = this.audioContext.createGain();
  }

  private getSession(): Promise<LiveMusicSession> {
    if (!this.sessionPromise) this.sessionPromise = this.connect();
    return this.sessionPromise;
  }

  private async connect(): Promise<LiveMusicSession> {
    this.sessionPromise = this.ai.live.music.connect({
      model: this.model,
      callbacks: {
        onmessage: async (e: LiveMusicServerMessage) => {
          if (e.setupComplete) {
            this.connectionError = false;
            this.reconnectAttempts = 0;
            // Notificar sucesso de reconexão com informação sobre o estado anterior
            const shouldResume = this.previousPlaybackState === 'playing';
            this.dispatchEvent(new CustomEvent('connection-restored', { 
              detail: shouldResume ? 'Conexão restaurada com sucesso! Retomando a música...' : 'Conexão restaurada com sucesso!' 
            }));
          }
          if (e.filteredPrompt) {
            this.filteredPrompts = new Set([...this.filteredPrompts, e.filteredPrompt.text!])
            this.dispatchEvent(new CustomEvent<LiveMusicFilteredPrompt>('filtered-prompt', { detail: e.filteredPrompt }));
          }
          if (e.serverContent?.audioChunks) {
            await this.processAudioChunks(e.serverContent.audioChunks);
          }
        },
        onerror: () => {
          this.connectionError = true;
          this.previousPlaybackState = this.playbackState;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { 
            detail: 'Erro de conexão detectado. Tentando reconectar automaticamente...' 
          }));
          this.attemptReconnect();
        },
        onclose: () => {
          this.connectionError = true;
          this.previousPlaybackState = this.playbackState;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { 
            detail: 'Conexão perdida. Tentando reconectar automaticamente...' 
          }));
          this.attemptReconnect();
        },
      },
    });
    return this.sessionPromise;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: 'Falha na reconexão. Por favor, reinicie o áudio manualmente.' 
      }));
      return;
    }

    this.reconnectAttempts++;
    
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    this.reconnectInterval = window.setTimeout(async () => {
      try {
        this.dispatchEvent(new CustomEvent('error', { 
          detail: `Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}...` 
        }));
        
        // Tentar reconectar
        this.session = null;
        this.sessionPromise = null;
        await this.getSession();
      } catch (error) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      }
    }, 2000); // 2 segundos entre tentativas
  }

  private setPlaybackState(state: PlaybackState) {
    this.playbackState = state;
    this.dispatchEvent(new CustomEvent('playback-state-changed', { detail: state }));
  }

  private async processAudioChunks(audioChunks: AudioChunk[]) {
    if (this.playbackState === 'paused' || this.playbackState === 'stopped') return;
    const audioBuffer = await decodeAudioData(
      decode(audioChunks[0].data!),
      this.audioContext,
      48000,
      2,
    );
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputNode);
    if (this.nextStartTime === 0) {
      this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
      setTimeout(() => {
        this.setPlaybackState('playing');
      }, this.bufferTime * 1000);
    }
    if (this.nextStartTime < this.audioContext.currentTime) {
      this.setPlaybackState('loading');
      this.nextStartTime = 0;
      return;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  public get activePrompts() {
    return Array.from(this.prompts.values())
      .filter((p) => {
        return !this.filteredPrompts.has(p.text) && p.weight !== 0;
      })
  }

  public readonly setWeightedPrompts = throttle(async (prompts: Map<string, Prompt>) => {
    this.prompts = prompts;

    if (this.activePrompts.length === 0) {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: 'É necessário ter pelo menos um prompt ativo para reproduzir.' 
      }));
      this.pause();
      return;
    }

    // store the prompts to set later if we haven't connected yet
    // there should be a user interaction before calling setWeightedPrompts
    if (!this.session) return;

    try {
      await this.session.setWeightedPrompts({
        weightedPrompts: this.activePrompts,
      });
    } catch (e: any) {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: `Erro ao configurar prompts: ${e.message}` 
      }));
      this.pause();
    }
  }, 200);

  // Método específico para reconexão sem throttle
  private async setWeightedPromptsForReconnection() {
    if (this.activePrompts.length === 0) {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: 'É necessário ter pelo menos um prompt ativo para reproduzir.' 
      }));
      return;
    }

    if (!this.session) return;

    try {
      await this.session.setWeightedPrompts({
        weightedPrompts: this.activePrompts,
      });
    } catch (e: any) {
      console.error('Erro ao configurar prompts para reconexão:', e);
      this.dispatchEvent(new CustomEvent('error', { 
        detail: `Erro ao configurar prompts: ${e.message}` 
      }));
      // Não chamar pause() aqui para não interferir com a reconexão
      throw e; // Re-throw para ser capturado pelo método play()
    }
  }

  public async play() {
    try {
      this.setPlaybackState('loading');
      this.session = await this.getSession();
      
      // Aguardar um pouco para garantir que a sessão esteja completamente estabelecida
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Usar método específico para reconexão se necessário
      if (this.previousPlaybackState === 'playing') {
        try {
          await this.setWeightedPromptsForReconnection();
          // Resetar o estado anterior após reconexão bem-sucedida
          this.previousPlaybackState = 'stopped';
        } catch (error) {
          console.error('Erro na reconexão, tentando método padrão:', error);
          // Se falhar, tentar método padrão
          await this.setWeightedPrompts(this.prompts);
        }
      } else {
        await this.setWeightedPrompts(this.prompts);
      }
      
      this.audioContext.resume();
      this.session.play();
      this.outputNode.connect(this.audioContext.destination);
      if (this.extraDestination) this.outputNode.connect(this.extraDestination);
      this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.outputNode.gain.linearRampToValueAtTime(this.currentVolume, this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Erro no método play:', error);
      this.setPlaybackState('stopped');
      throw error;
    }
  }

  public pause() {
    if (this.session) this.session.pause();
    this.setPlaybackState('paused');
    this.outputNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
    this.nextStartTime = 0;
    this.outputNode = this.audioContext.createGain();
    // Restaurar o volume atual no novo GainNode
    this.outputNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
    // Não resetar previousPlaybackState aqui para preservar o estado anterior
  }

  public stop() {
    if (this.session) this.session.stop();
    this.setPlaybackState('stopped');
    this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
    this.nextStartTime = 0;
    this.session = null;
    this.sessionPromise = null;
    // Não resetar previousPlaybackState aqui para preservar o estado anterior
  }

  public async playPause() {
    switch (this.playbackState) {
      case 'playing':
        return this.pause();
      case 'paused':
      case 'stopped':
        return this.play();
      case 'loading':
        return this.stop();
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public setVolume(volume: number) {
    // Armazenar o volume atual
    this.currentVolume = volume;
    // Aplicar volume ao GainNode (0.0 a 1.0)
    this.outputNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

}
