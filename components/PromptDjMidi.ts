/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { throttle } from '../utils/throttle';

import './PromptController';
import './PlayPauseButton';
import './RandomButton';
import './ClearButton';
import './VolumeControl';
import type { PlaybackState, Prompt } from '../types';
import { RandomPromptGenerator } from '../utils/RandomPromptGenerator';

/** The grid of prompt inputs. */
@customElement('prompt-dj-midi')
export class PromptDjMidi extends LitElement {
  static override styles = css`
    :host {
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }
    
    #background {
      will-change: background-image;
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: -1;
      background: #111;
    }
    
    #grid {
      width: 100%;
      height: auto;
      display: grid;
      gap: 8px;
      padding: 16px;
      margin-top: 0;
      margin-left: 0;
      box-sizing: border-box;
      padding-bottom: 200px; /* Espaço para os controles fixos */
    }
    
    prompt-controller {
      width: 100%;
      height: 100%;
    }
    
    .controls {
      position: fixed;
      bottom: 80px; /* Espaço para a barra de temas */
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
    }
    
    .main-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    play-pause-button {
      width: 60px;
      height: 60px;
    }
    
    random-button {
      width: 50px;
      height: 50px;
    }
    
    clear-button {
      width: 50px;
      height: 50px;
    }
    
    volume-control {
      width: 100%;
      max-width: 300px;
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      :host {
        justify-content: center;
        overflow: hidden;
      }
      
      #grid {
        width: 80vmin;
        height: 80vmin;
        grid-template-columns: repeat(4, 1fr);
        gap: 2.5vmin;
        margin-top: 8vmin;
        margin-left: 12vmin;
        padding: 0;
        padding-bottom: 0;
      }
      
      .controls {
        position: relative;
        bottom: auto;
        left: auto;
        right: auto;
        flex-direction: row;
        gap: 0;
        padding: 0;
        background: transparent;
        backdrop-filter: none;
        border-top: none;
        margin-top: 2vmin;
      }
      
      .main-buttons {
        gap: 0;
      }
      
      play-pause-button {
        width: 15vmin;
        height: auto;
      }
      
      random-button {
        width: 10vmin;
        height: auto;
        margin-left: 2vmin;
      }
      
      clear-button {
        width: 10vmin;
        height: auto;
        margin-right: 2vmin;
      }
      
      volume-control {
        width: auto;
        max-width: none;
        margin-right: 2vmin;
      }
    }
    
    /* Mobile landscape */
    @media (max-width: 767px) and (orientation: landscape) {
      #grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 12px 20px;
        padding-bottom: 160px;
      }
      
      .controls {
        bottom: 70px;
        padding: 6px;
      }
      
      .main-buttons {
        gap: 6px;
      }
      
      play-pause-button {
        width: 81px;
        height: 81px;
      }
      
      random-button, clear-button {
        width: 69px;
        height: 69px;
      }
    }
    
    /* Mobile portrait */
    @media (max-width: 767px) and (orientation: portrait) {
      :host {
        overflow-y: auto;
        overflow-x: hidden;
        height: auto;
        min-height: 100vh;
        position: relative;
      }
      
      #grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 16px 20px;
        margin-top: 16px;
        padding-bottom: 200px;
        min-height: calc(100vh - 200px);
        position: relative;
        z-index: 1;
      }
      
      .controls {
        bottom: 80px;
        padding: 8px;
        position: fixed;
        z-index: 1000;
      }
      
      .main-buttons {
        gap: 8px;
      }
      
      play-pause-button {
        width: 82px;
        height: 82px;
      }
      
      random-button, clear-button {
        width: 69px;
        height: 69px;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      #grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        padding: 12px 18px;
        padding-bottom: 180px;
      }
      
      .controls {
        bottom: 70px;
        padding: 6px;
      }
      
      .main-buttons {
        gap: 6px;
      }
      
      play-pause-button {
        width: 70px;
        height: 70px;
      }
      
      random-button, clear-button {
        width: 60px;
        height: 60px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      #grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
        padding: 8px 16px;
        margin-top: 8px;
        padding-bottom: 160px;
      }
      
      .controls {
        bottom: 60px;
        padding: 4px;
      }
      
      .main-buttons {
        gap: 4px;
      }
      
      play-pause-button {
        width: 64px;
        height: 64px;
      }
      
      random-button, clear-button {
        width: 60px;
        height: 60px;
      }
    }
  `;

  private prompts: Map<string, Prompt>;
  public randomPromptGenerator: RandomPromptGenerator;

  @property({ type: String }) public playbackState: PlaybackState = 'stopped';
  @state() public audioLevel = 0;
  @property({ type: String }) public currentTheme: 'basic' | 'rpg' = 'basic';

  @property({ type: Object })
  private filteredPrompts = new Set<string>();

  constructor(
    initialPrompts: Map<string, Prompt>,
    ai: any,
    model: string,
  ) {
    super();
    this.prompts = initialPrompts;
    this.randomPromptGenerator = new RandomPromptGenerator(ai, model);

    // Configurar eventos do gerador de prompts aleatórios
    this.randomPromptGenerator.addEventListener('prompt-generated', (e: CustomEvent<string>) => {
      this.requestUpdate();
      this.dispatchEvent(
        new CustomEvent('prompts-changed', { detail: this.prompts }),
      );
      
      // Notificar o botão sobre o novo prompt gerado
      const randomButton = this.shadowRoot?.querySelector('random-button') as any;
      if (randomButton && randomButton.setLastGeneratedPrompt) {
        randomButton.setLastGeneratedPrompt(e.detail);
      }
    });
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  private handlePromptChanged(e: CustomEvent<Prompt>) {
    const { promptId, text, weight, cc } = e.detail;
    const prompt = this.prompts.get(promptId);

    if (!prompt) {
      console.error('prompt not found', promptId);
      return;
    }

    prompt.text = text;
    prompt.weight = weight;
    prompt.cc = cc;

    const newPrompts = new Map(this.prompts);
    newPrompts.set(promptId, prompt);

    this.prompts = newPrompts;
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(this.prompts.entries())));
    this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
  }

  /** Generates radial gradients for each prompt based on weight and color. */
  private readonly makeBackground = throttle(
    () => {
      const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

      const MAX_WEIGHT = 0.5;
      const MAX_ALPHA = 0.6;

      const bg: string[] = [];

      [...this.prompts.values()].forEach((p, i) => {
        const alphaPct = clamp01(p.weight / MAX_WEIGHT) * MAX_ALPHA;
        const alpha = Math.round(alphaPct * 0xff)
          .toString(16)
          .padStart(2, '0');

        const stop = p.weight / 2;
        const x = (i % 4) / 3;
        const y = Math.floor(i / 4) / 3;
        const s = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${p.color}${alpha} 0px, ${p.color}00 ${stop * 100}%)`;

        bg.push(s);
      });

      return bg.join(', ');
    },
    30, // don't re-render more than once every XXms
  );



  private playPause() {
    this.dispatchEvent(new CustomEvent('play-pause'));
  }

  public addFilteredPrompt(prompt: string) {
    this.filteredPrompts = new Set([...this.filteredPrompts, prompt]);
  }

  public updatePrompts(newPrompts: Map<string, Prompt>) {
    this.prompts = newPrompts;
    this.requestUpdate();
    
    // Força a atualização imediata do background
    this.makeBackground();
    
    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
  }

  private handleRandomActivated() {
    // Usar o tema atual definido na propriedade
    this.randomPromptGenerator.setTheme(this.currentTheme);
    this.randomPromptGenerator.startGenerating(this.prompts);
  }

  private handleRandomDeactivated() {
    this.randomPromptGenerator.stopGenerating();
  }

  private handleClearConfiguration() {
    // Limpar todos os prompts (definir peso como 0)
    this.prompts.forEach((prompt) => {
      prompt.weight = 0;
    });
    
    // Salvar no localStorage
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(this.prompts.entries())));
    
    // Atualizar a interface
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
  }

  private handleVolumeChange(e: CustomEvent<{ volume: number }>) {
    const volume = e.detail.volume;
    // Repassar o evento para o componente pai
    this.dispatchEvent(new CustomEvent('volume-changed', {
      detail: { volume }
    }));
  }

  override render() {
    const bg = styleMap({
      backgroundImage: this.makeBackground(),
    });
    return html`<div id="background" style=${bg}></div>
      <div id="grid">${this.renderPrompts()}</div>
      <div class="controls">
        <div class="main-buttons">
          <clear-button @click=${this.handleClearConfiguration}></clear-button>
          <play-pause-button .playbackState=${this.playbackState} @click=${this.playPause}></play-pause-button>
          <random-button
            @random-activated=${this.handleRandomActivated}
            @random-deactivated=${this.handleRandomDeactivated}
          ></random-button>
        </div>
        <volume-control @volume-changed=${this.handleVolumeChange}></volume-control>
      </div>`;
  }

  private renderPrompts() {
    return [...this.prompts.values()].map((prompt) => {
      return html`<prompt-controller
        promptId=${prompt.promptId}
        ?filtered=${this.filteredPrompts.has(prompt.text)}
        cc=${prompt.cc}
        text=${prompt.text}
        weight=${prompt.weight}
        color=${prompt.color}
        audioLevel=${this.audioLevel}
        @prompt-changed=${this.handlePromptChanged}>
      </prompt-controller>`;
    });
  }
}