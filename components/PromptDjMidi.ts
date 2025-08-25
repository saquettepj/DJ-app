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
import './NextButton';
import './VolumeControl';
import './FavoriteButton';
import type { PlaybackState, Prompt } from '../types';
import { RandomPromptGenerator } from '../utils/RandomPromptGenerator';
import { FavoritesManager } from '../utils/FavoritesManager';

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
    }
    
    prompt-controller {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
    }
    
    #grid > * {
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      min-width: 0;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
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
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
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
      min-height: 56px; /* Altura mínima maior que o volume-control */
    }
    
    random-button {
      width: 50px;
      height: 50px;
      min-height: 48px; /* Altura mínima igual ao volume-control */
    }
    
    clear-button {
      width: 50px;
      height: 50px;
      min-height: 48px; /* Altura mínima igual ao volume-control */
    }
    
    next-button {
      width: 50px;
      height: 50px;
      min-height: 48px; /* Altura mínima igual ao volume-control */
    }
    
    .volume-favorite-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      justify-content: center;
    }

    volume-control {
      width: 100%;
      max-width: 300px;
    }

    favorite-button {
      height: 48px;
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      :host {
        justify-content: center;
        overflow: hidden;
      }
      
      #grid {
        width: 87vmin;
        grid-template-columns: repeat(6, 1fr);
        gap: 2.5vmin;
        margin-left: 12vmin;
        padding: 0;
        padding-bottom: 120px;
      }
      
      #grid > * {
        width: 120%;
        height: 120%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1.2);
        transform-origin: center;
      }
      
      .controls {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: row;
        gap: 0;
        padding: 16px;
        background: transparent;
        backdrop-filter: none;
        border-radius: 0;
        border: none;
        z-index: 1000;
        margin: 0;
        margin-left: 6.5vmin;
      }
      
      .main-buttons {
        gap: 0;
        align-items: center;
      }
      
      play-pause-button {
        width: 15vmin;
        height: auto;
        min-height: 56px; /* Altura mínima maior que o volume-control */
      }
      
      random-button {
        width: 10vmin;
        height: auto;
        margin-left: 1vmin;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      next-button {
        width: 10vmin;
        height: auto;
        margin-left: 1vmin;
        margin-right: 1vmin;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      clear-button {
        width: 10vmin;
        height: auto;
        margin-right: 1vmin;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      .volume-favorite-row {
        gap: 1.5vmin;
        align-items: center;
        justify-content: center;
      }
      
      volume-control, favorite-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      volume-control {
        align-self: stretch;
      }
      
      favorite-button {
        align-self: center;
      }

      volume-control {
        width: auto;
        min-width: 280px;
        max-width: 320px;
        margin-right: 1vmin;
        margin-left: max(30px, 2vmin);
        margin-bottom: 1.5vmin;
      }

      favorite-button {
        width: auto;
        height: auto;
        aspect-ratio: 1;
        min-width: 48px;
        min-height: 48px;
        margin-bottom: 1.5vmin;
      }
    }
    
    /* Desktop responsive - tela menor */
    @media (min-width: 768px) and (max-width: 1200px) {
      #grid {
        width: 80vmin;
        grid-template-columns: repeat(6, 1fr);
        margin-left: 10vmin;
        padding-bottom: 100px; /* Menos espaço para controles menores */
      }
      
      #grid > * {
        width: 120%;
        height: 120%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1.2);
        transform-origin: center;
      }
      
      .controls {
        bottom: 5px;
        padding: 12px;
      }
      
      volume-control {
        width: auto;
        min-width: 240px;
        max-width: 280px;
        margin-right: 0.5vmin;
        margin-left: max(30px, 0.5vmin);
      }
      
      favorite-button {
        width: auto;
        height: auto;
        aspect-ratio: 1;
        min-width: 44px;
        min-height: 44px;
      }
      
      /* Garantir altura mínima dos botões principais igual ao volume-control */
      play-pause-button {
        min-height: 56px; /* Altura mínima maior que o volume-control */
      }
      
      random-button, clear-button, next-button {
        min-height: 44px;
      }
    }
    
    /* Desktop responsive - tela muito pequena */
    @media (min-width: 768px) and (max-width: 900px) {
      #grid {
        width: 75vmin;
        grid-template-columns: repeat(6, 1fr);
        margin-left: 8vmin;
        padding-bottom: 80px; /* Ainda menos espaço */
      }
      
      #grid > * {
        width: 120%;
        height: 120%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1.2);
        transform-origin: center;
      }
      
      .controls {
        bottom: 0px;
        padding: 10px;
      }
      
      volume-control {
        width: auto;
        min-width: 200px;
        max-width: 240px;
        margin-right: 0.3vmin;
        margin-left: max(30px, 0.3vmin);
      }
      
      favorite-button {
        width: auto;
        height: auto;
        aspect-ratio: 1;
        min-width: 40px;
        min-height: 40px;
      }
      
      /* Garantir altura mínima dos botões principais igual ao volume-control */
      play-pause-button {
        min-height: 56px; /* Altura mínima maior que o volume-control */
      }
      
      random-button, clear-button, next-button {
        min-height: 40px;
      }
    }
    
    /* Mobile landscape */
    @media (max-width: 767px) and (orientation: landscape) {
      :host {
        overflow-y: auto;
        overflow-x: hidden;
        height: auto;
        min-height: 100vh;
        position: relative;
      }
      
      #grid {
        grid-template-columns: repeat(6, 1fr);
        gap: 6px;
        padding: 30px 40px;
        padding-bottom: 220px;
        min-height: calc(100vh - 200px);
        position: relative;
        z-index: 1;
      }
      
      #grid > * {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .controls {
        bottom: 70px;
        padding: 6px;
        padding-bottom: 12px;
        gap: 0;
        position: fixed;
        z-index: 1000;
      }
      
      .main-buttons {
        gap: 6px;
      }
      
      .volume-favorite-row {
        gap: 6px;
      }
      
      play-pause-button {
        width: 81px;
        height: 81px;
        min-height: 56px; /* Altura mínima maior que o volume-control */
      }
      
      random-button, clear-button, next-button {
        width: 69px;
        height: 69px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      favorite-button {
        height: 48px;
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
        padding: 16px 50px;
        margin-top: 16px;
        padding-bottom: 240px;
        min-height: calc(100vh - 200px);
        position: relative;
        z-index: 1;
      }
      
      #grid > * {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
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
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      random-button, clear-button, next-button {
        width: 69px;
        height: 69px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      #grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        padding: 12px 35px;
        padding-bottom: 180px;
      }
      
      #grid > * {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .controls {
        bottom: 70px;
        padding: 6px;
        padding-bottom: 12px;
        gap: 0;
      }
      
      .main-buttons {
        gap: 6px;
      }
      
      play-pause-button {
        width: 70px;
        height: 70px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      random-button, clear-button, next-button {
        width: 60px;
        height: 60px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
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
      
      #grid > * {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .controls {
        bottom: 60px;
        padding: 4px;
        gap: 0;
      }
      
      .main-buttons {
        gap: 4px;
      }
      
      play-pause-button {
        width: 64px;
        height: 64px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
      
      random-button, clear-button, next-button {
        width: 60px;
        height: 60px;
        min-height: 48px; /* Altura mínima igual ao volume-control */
      }
    }
  `;

  private prompts: Map<string, Prompt>;
  public randomPromptGenerator: RandomPromptGenerator;

  @property({ type: String }) public playbackState: PlaybackState = 'stopped';
  @state() public audioLevel = 0;
  @property({ type: String }) public currentTheme: 'basic' | 'rpg' = 'basic';
  @property({ type: Object }) public favoritesManager: FavoritesManager | null = null;
  @property({ type: Number }) public currentVolume: number = 0.5;
  @state() private isNextGenerating = false;

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
    
    // Listener único para mudanças de configuração
    this.addEventListener('configuration-changed', () => {
      this.updateFavoriteButtonState();
    });
  }

  private handlePromptChanged(e: CustomEvent<Prompt>) {
    const { promptId, text, weight, cc } = e.detail;
    const prompt = this.prompts.get(promptId);

    if (!prompt) {
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

    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));

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
    // Se estiver pausando, parar também o modo aleatório
    if (this.playbackState === 'playing') {
      this.randomPromptGenerator.stopGenerating();
      
      // Desativar visualmente o botão aleatório
      const randomButton = this.shadowRoot?.querySelector('random-button') as any;
      if (randomButton && randomButton.forceDeactivate) {
        randomButton.forceDeactivate();
      }
    }
    
    this.dispatchEvent(new CustomEvent('play-pause'));
  }

  public addFilteredPrompt(prompt: string) {
    this.filteredPrompts = new Set([...this.filteredPrompts, prompt]);
  }

  public updatePrompts(newPrompts: Map<string, Prompt>) {
    // Criar uma cópia completamente independente dos prompts
    const independentPrompts = new Map<string, Prompt>();
    newPrompts.forEach((prompt, key) => {
      independentPrompts.set(key, {
        promptId: prompt.promptId,
        text: prompt.text,
        weight: prompt.weight,
        cc: prompt.cc,
        color: prompt.color
      });
    });
    
    // Atualizar os prompts com os objetos independentes
    this.prompts = independentPrompts;
    
    // Salvar no localStorage
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(this.prompts.entries())));
    
    // Força a atualização imediata do background
    this.makeBackground();
    
    // Atualizar a interface
    this.requestUpdate();
    
    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));
    
    // Disparar evento de mudança de prompts
    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
  }
  
  // Método dedicado para atualizar o estado do botão de favoritos
  private updateFavoriteButtonState() {
    if (this.shadowRoot) {
      const favoriteButton = this.shadowRoot.querySelector('favorite-button') as any;
      if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
        // Verificar se a configuração atual está favoritada
        const isFavorited = this.isCurrentConfigFavorited();
        
        // Forçar atualização do estado
        favoriteButton.setCurrentConfigFavorited(isFavorited);
        
        // Verificação adicional: se o estado ainda estiver incorreto após um delay, forçar novamente
        setTimeout(() => {
          if (favoriteButton.isCurrentConfigFavorited !== isFavorited) {
            favoriteButton.setCurrentConfigFavorited(isFavorited);
          }
        }, 10);
      }
    }
  }
  
  // Método público para forçar a atualização do estado do botão de favoritos
  public forceUpdateFavoriteButtonState() {
    this.updateFavoriteButtonState();
  }

  public forceSyncPrompts() {
    // Forçar sincronização completa dos prompts
    this.requestUpdate();
    this.makeBackground();
    
    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));
    
    // Disparar evento de mudança de prompts novamente para garantir sincronização
    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
  }

  private handleRandomActivated() {
    // Se não estiver tocando (stopped ou paused), ativar o play automaticamente quando ativar o aleatório
    if (this.playbackState === 'stopped' || this.playbackState === 'paused') {
      this.dispatchEvent(new CustomEvent('play-pause'));
    }
    
    // Usar o tema atual definido na propriedade
    this.randomPromptGenerator.setTheme(this.currentTheme);
    this.randomPromptGenerator.startGenerating(this.prompts);
    
    // Deselecionar qualquer fita selecionada na barra de favoritos
    this.dispatchEvent(new CustomEvent('deselect-favorites'));
    
    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));
  }

  private handleRandomDeactivated() {
    this.randomPromptGenerator.stopGenerating();
  }

  private handleClearConfiguration() {
    // Parar o modo aleatório antes de limpar
    if (this.randomPromptGenerator) {
      this.randomPromptGenerator.stopGenerating();
    }
    
    // Desativar visualmente o botão aleatório
    if (this.shadowRoot) {
      const randomButton = this.shadowRoot.querySelector('random-button') as any;
      if (randomButton && randomButton.forceDeactivate) {
        randomButton.forceDeactivate();
      }
    }
    
    // Criar novos prompts com peso 0 (não modificar os existentes)
    const clearedPrompts = new Map<string, Prompt>();
    this.prompts.forEach((prompt, key) => {
      clearedPrompts.set(key, {
        ...prompt,
        weight: 0
      });
    });
    
    // Atualizar os prompts com os novos objetos
    this.prompts = clearedPrompts;
    
    // Resetar volume para padrão
    this.currentVolume = 0.5;
    
    // Salvar no localStorage
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(this.prompts.entries())));
    
    // Atualizar a interface
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent('prompts-changed', { detail: this.prompts }),
    );
    
    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));
    
    // Deselecionar qualquer fita selecionada na barra de favoritos
    this.dispatchEvent(new CustomEvent('deselect-favorites'));
  }

  private handleVolumeChange(e: CustomEvent<{ volume: number }>) {
    const volume = e.detail.volume;
    // Atualizar volume interno
    this.currentVolume = volume;
    
    // Disparar evento único de mudança de configuração
    this.dispatchEvent(new CustomEvent('configuration-changed', {
      detail: { prompts: this.prompts, volume: this.currentVolume }
    }));
    
    // Repassar o evento para o componente pai
    this.dispatchEvent(new CustomEvent('volume-changed', {
      detail: { volume }
    }));
  }

  private handleFavoriteCreated(e: CustomEvent<{ name: string, theme: 'basic' | 'rpg' }>) {
    this.dispatchEvent(new CustomEvent('favorite-created', {
      detail: { 
        name: e.detail.name,
        theme: e.detail.theme,
        prompts: this.prompts
      }
    }));
  }

  private handleFavoriteRemoved() {
    this.dispatchEvent(new CustomEvent('favorite-removed'));
  }

  public isCurrentConfigFavorited(): boolean {
    if (!this.favoritesManager) {
      return false;
    }
    
    // Verificar se a configuração atual é igual a algum favorito
    const currentPreset = {
      prompts: this.prompts,
      volume: this.getCurrentVolume(),
      timestamp: Date.now()
    };
    
    const matchingFavorite = this.favoritesManager.getFavoriteByPreset(
      currentPreset.prompts,
      currentPreset.volume
    );
    
    return !!matchingFavorite;
  }

  private getCurrentVolume(): number {
    // Tentar obter o volume atual do LiveMusicHelper se disponível
    // Por enquanto, usar um valor padrão que será atualizado pelo arquivo principal
    return this.currentVolume || 0.5;
  }

  private handleNextClicked() {
    if (this.isNextGenerating) {
      return;
    }
    
    this.isNextGenerating = true;
    
    // Se não estiver tocando (stopped ou paused), ativar o play automaticamente
    if (this.playbackState === 'stopped' || this.playbackState === 'paused') {
      this.dispatchEvent(new CustomEvent('play-pause'));
    }
    
    // Sempre gerar nova combinação aleatória
    this.randomPromptGenerator.forceGenerate(this.prompts);
    
    // Só resetar o timer se o aleatório estiver ativo
    if (this.randomPromptGenerator.isActive()) {
      // Resetar o timer para 2 minutos
      const randomButton = this.shadowRoot?.querySelector('random-button') as any;
      if (randomButton && randomButton.resetTimer) {
        randomButton.resetTimer();
      }
    }
    
    // Resetar o loading após um delay
    setTimeout(() => {
      this.isNextGenerating = false;
    }, 2000); // 2 segundos de loading
    
    // Deselecionar qualquer fita selecionada na barra de favoritos
    this.dispatchEvent(new CustomEvent('deselect-favorites'));
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
          <next-button
            .isGenerating=${this.isNextGenerating}
            @next-clicked=${this.handleNextClicked}
          ></next-button>
          <random-button
            @random-activated=${this.handleRandomActivated}
            @random-deactivated=${this.handleRandomDeactivated}
          ></random-button>
        </div>
        <div class="volume-favorite-row">
          <volume-control 
            .volume=${this.currentVolume}
            @volume-changed=${this.handleVolumeChange}
          ></volume-control>
          <favorite-button
            .currentTheme=${this.currentTheme}
            .isCurrentConfigFavorited=${this.isCurrentConfigFavorited()}
            @favorite-created=${this.handleFavoriteCreated}
            @favorite-removed=${this.handleFavoriteRemoved}
          ></favorite-button>
        </div>
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