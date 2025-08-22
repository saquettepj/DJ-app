/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlaybackState, Prompt } from './types';
import { GoogleGenAI, LiveMusicFilteredPrompt } from '@google/genai';
import { PromptDjMidi } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';
import { Sidebar, type ThemeMode } from './components/Sidebar';
import { ApiKeyInput } from './components/ApiKeyInput';

let currentTheme: ThemeMode = 'basic';
let pdjMidi: PromptDjMidi | null = null;
let liveMusicHelper: LiveMusicHelper | null = null;
let ai: GoogleGenAI;
let model = 'lyria-realtime-exp';

function initializeAI(apiKey: string) {
  if (apiKey && apiKey.trim().length > 0) {
    ai = new GoogleGenAI({ apiKey: apiKey.trim(), apiVersion: 'v1alpha' });
    return true;
  }
  return false;
}

function main() {
  // Sempre iniciar com tema 'basic' - não persistir o tema da barra
  currentTheme = 'basic';
  
  const initialPrompts = buildDefaultPrompts(currentTheme);

  // Adicionar o componente de input da API Key primeiro
  const apiKeyInput = new ApiKeyInput();
  document.body.appendChild(apiKeyInput);

  // Listener para mudanças na API Key
  apiKeyInput.addEventListener('api-key-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{ apiKey: string }>;
    const apiKey = customEvent.detail.apiKey;
    
    if (initializeAI(apiKey)) {
      // Reinicializar componentes com nova API Key
      if (pdjMidi && liveMusicHelper) {
        // Recriar instâncias com nova API Key
        try {
          document.body.removeChild(pdjMidi);
          if (liveMusicHelper.extraDestination) {
            document.body.removeChild(liveMusicHelper.extraDestination as any);
          }
        } catch (error) {
          // Ignorar erros de remoção
        }
        initializeComponents(initialPrompts);
      } else {
        // Primeira inicialização
        initializeComponents(initialPrompts);
      }
      
      // Adicionar a sidebar após inicializar os componentes
      const sidebar = new Sidebar();
      sidebar.currentTheme = currentTheme;
      document.body.appendChild(sidebar);
      
      // Listener para mudanças de tema
      sidebar.addEventListener('theme-changed', ((e: Event) => {
        const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
        const theme = customEvent.detail.theme;
        handleThemeChange(theme);
      }));
    }
  }));
}

function initializeComponents(initialPrompts: Map<string, Prompt>) {
  pdjMidi = new PromptDjMidi(initialPrompts, ai, model);
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(initialPrompts);

  // Configurar eventos dos componentes
  pdjMidi.addEventListener('play-pause', () => {
    liveMusicHelper.playPause();
  });

  pdjMidi.addEventListener('volume-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{ volume: number }>;
    const volume = customEvent.detail.volume;
    handleVolumeChange(volume);
  }));

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    // audioAnalyser será inicializado depois
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<LiveMusicFilteredPrompt>;
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason!, 'error');
    
    // Esconder toast de prompt filtrado após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
    
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error, 'error');
    
    // Esconder toast de erro após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  pdjMidi.addEventListener('error', errorToast);
  
  // Listener para conexão restaurada
  liveMusicHelper.addEventListener('connection-restored', async (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const message = customEvent.detail;
    toastMessage.show(message, 'success');
    
    // Esconder toast após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
    
    // Dar play na música automaticamente se ela estava tocando antes da desconexão
    if (message.includes('Retomando a música')) {
      try {
        // Mostrar mensagem de carregamento
        toastMessage.show('Carregando música...', 'info');
        
        // Esconder toast de carregamento após 5 segundos
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
        
        await liveMusicHelper.play();
        
        // Mostrar mensagem de sucesso após o play e esconder após 5 segundos
        setTimeout(() => {
          toastMessage.show('Música retomada com sucesso!', 'success');
          setTimeout(() => {
            toastMessage.hide();
          }, 5000);
        }, 1000);
      } catch (error) {
        console.error('Erro ao dar play na música após reconexão:', error);
        toastMessage.show('Erro ao retomar a música após reconexão', 'error');
        
        // Esconder toast de erro após 5 segundos
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
      }
    }
  });

  // Inicializar AudioAnalyser
  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  pdjMidi.addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    const prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
  }));
}



function buildDefaultPrompts(theme: ThemeMode = 'basic') {
  const promptsList = theme === 'basic' ? DEFAULT_PROMPTS : RPG_PROMPTS;
  
  // Pick 3 random prompts to start at weight = 1
  const startOnIndices = [...Array(promptsList.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < promptsList.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = promptsList[i];
    const { text, color } = prompt;
    prompts.set(promptId, {
      promptId,
      text,
      weight: startOnIndices.includes(i) ? 1 : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

const DEFAULT_PROMPTS = [
  { color: '#9900ff', text: 'Bossa Nova' },
  { color: '#5200ff', text: 'Chillwave' },
  { color: '#ff25f6', text: 'Drum and Bass' },
  { color: '#2af6de', text: 'Post Punk' },
  { color: '#ffdd28', text: 'Shoegaze' },
  { color: '#2af6de', text: 'Funk' },
  { color: '#9900ff', text: 'Chiptune' },
  { color: '#3dffab', text: 'Lush Strings' },
  { color: '#d8ff3e', text: 'Sparkling Arpeggios' },
  { color: '#d9b2ff', text: 'Staccato Rhythms' },
  { color: '#3dffab', text: 'Punchy Kick' },
  { color: '#ffdd28', text: 'Dubstep' },
  { color: '#ff25f6', text: 'K Pop' },
  { color: '#d8ff3e', text: 'Neo Soul' },
  { color: '#5200ff', text: 'Trip Hop' },
  { color: '#d9b2ff', text: 'Thrash' },
  { color: '#ff6b35', text: 'Ambient' },
  { color: '#4ecdc4', text: 'Synthwave' },
];

const RPG_PROMPTS = [
  { color: '#8B0000', text: 'Epic Battle' },
  { color: '#4B0082', text: 'Mystical Forest' },
  { color: '#00CED1', text: 'Dimensional Portal' },
  { color: '#FFD700', text: 'Lost Treasure' },
  { color: '#32CD32', text: 'Elf Village' },
  { color: '#20B2AA', text: 'Deep Ocean' },
  { color: '#FF8C00', text: 'Soft fire' },
  { color: '#DC143C', text: 'Legendary Warrior' },
  { color: '#8A2BE2', text: 'Sacred Temple' },
  { color: '#FF1493', text: 'Mythical Beast' },
  { color: '#2F4F4F', text: 'Cave' },
  { color: '#8B4513', text: 'Tribal Drums' },
  { color: '#DC143C', text: 'Horror Scream' },
  { color: '#800080', text: 'Soul Demon' },
  { color: '#87CEEB', text: 'Angelical Cry' },
  { color: '#DDA0DD', text: 'Choral' },
  { color: '#FF6347', text: 'Dragon Lair' },
  { color: '#00FA9A', text: 'Enchanted Garden' },
];

function handleThemeChange(theme: ThemeMode) {
  currentTheme = theme;
  
  // Parar o modo aleatório antes de trocar o tema
  if (pdjMidi && pdjMidi.randomPromptGenerator) {
    pdjMidi.randomPromptGenerator.stopGenerating();
  }
  
  // Desativar visualmente o botão aleatório
  if (pdjMidi && pdjMidi.shadowRoot) {
    const randomButton = pdjMidi.shadowRoot.querySelector('random-button') as any;
    if (randomButton && randomButton.forceDeactivate) {
      randomButton.forceDeactivate();
    }
  }
  
  // Limpar configuração anterior (zerar todos os pesos)
  const clearedPrompts = new Map<string, Prompt>();
  
  // Gerar novos prompts baseados no tema
  const newPrompts = buildDefaultPrompts(theme);
  
  // Zerar todos os pesos para garantir configuração limpa
  newPrompts.forEach((prompt) => {
    prompt.weight = 0;
    clearedPrompts.set(prompt.promptId, prompt);
  });
  
  // Atualizar o PromptDjMidi com os novos prompts zerados
  if (pdjMidi) {
    pdjMidi.currentTheme = theme;
    pdjMidi.updatePrompts(clearedPrompts);
  }
  
  // Atualizar o LiveMusicHelper
  if (liveMusicHelper) {
    liveMusicHelper.setWeightedPrompts(clearedPrompts);
  }
  
  // Atualizar o tema no RandomPromptGenerator
  if (pdjMidi && pdjMidi.randomPromptGenerator) {
    pdjMidi.randomPromptGenerator.setTheme(theme);
  }
  
  // Força a atualização da UI imediatamente
  requestAnimationFrame(() => {
    if (pdjMidi) {
      pdjMidi.requestUpdate();
    }
  });
}

function handleVolumeChange(volume: number) {
  // Aplicar o volume ao LiveMusicHelper
  if (liveMusicHelper) {
    liveMusicHelper.setVolume(volume);
    
  }
}

main();