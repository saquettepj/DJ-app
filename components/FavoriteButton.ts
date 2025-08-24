/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('favorite-button')
export class FavoriteButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .favorite-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      pointer-events: all;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      min-height: 48px;
      min-width: 48px;
      max-height: 48px;
      max-width: 48px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .favorite-btn::before {
      content: '';
      position: absolute;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      border-radius: 50%;
      background: white;
      opacity: 0.05;
      z-index: 1;
    }

    .favorite-btn:hover::before {
      transform: scale(1.05);
    }

    .favorite-btn:active::before {
      transform: scale(0.95);
    }

    .favorite-btn.favorited::before {
      background: rgba(244, 67, 54, 0.1);
    }

    .favorite-btn .heart-icon {
      font-size: 1.2em;
      color: white;
      z-index: 2;
      position: relative;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .favorite-btn.favorited .heart-icon {
      color: #f44336;
    }

    .input-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-overlay.showing {
      opacity: 1;
      visibility: visible;
    }

    .input-card {
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      transform: scale(0.8);
      transition: transform 0.3s ease;
    }

    .input-overlay.showing .input-card {
      transform: scale(1);
    }

    .input-title {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 20px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .input-field {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 16px;
      color: white;
      margin-bottom: 20px;
      box-sizing: border-box;
      transition: all 0.3s ease;
    }

    .input-field:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .input-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .input-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 100px;
    }

    .save-btn {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .save-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    .cancel-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .save-btn:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Desktop responsive - tela menor */
    @media (min-width: 768px) and (max-width: 1200px) {
      .favorite-btn {
        min-height: 44px;
        min-width: 44px;
        max-height: 44px;
        max-width: 44px;
      }
      
      .heart-icon {
        font-size: 1.1em;
      }
    }
    
    /* Desktop responsive - tela muito pequena */
    @media (min-width: 768px) and (max-width: 900px) {
      .favorite-btn {
        min-height: 40px;
        min-width: 40px;
        max-height: 40px;
        max-width: 40px;
      }
      
      .heart-icon {
        font-size: 1em;
      }
    }

    /* Desktop - input próximo ao botão */
    @media (min-width: 769px) {
      .input-overlay {
        position: absolute;
        top: auto;
        left: auto;
        right: 0;
        bottom: 100%;
        width: auto;
        height: auto;
        background: transparent;
        display: block;
        margin-bottom: 10px;
        z-index: 10001;
      }
      
      .input-card {
        position: relative;
        min-width: 320px;
        width: auto;
        max-width: 400px;
        transform-origin: bottom right;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .input-overlay.showing .input-card {
        transform: scale(1);
      }
    }

    /* Mobile landscape */
    @media (max-width: 768px) and (orientation: landscape) {
      .input-card {
        padding: 20px;
        max-width: 350px;
      }
      
      .input-title {
        font-size: 20px;
        margin-bottom: 15px;
      }
      
      .input-field {
        padding: 12px 16px;
        margin-bottom: 15px;
      }
      
      .input-actions {
        gap: 12px;
      }
      
      .input-btn {
        padding: 10px 20px;
        min-width: 80px;
      }
    }

    /* Mobile portrait - input acima dos controles principais */
    @media (max-width: 768px) and (orientation: portrait) {
      .input-overlay {
        position: fixed;
        top: auto;
        bottom: 200px; /* Posicionar acima dos controles principais */
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 400px;
        height: auto;
        background: transparent;
        z-index: 10001;
      }
      
      .input-card {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 25px;
        transform: scale(0.9);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
      }
      
      .input-overlay.showing .input-card {
        transform: scale(1);
      }
      
      .input-title {
        font-size: 22px;
        margin-bottom: 18px;
      }
      
      .input-field {
        padding: 14px 18px;
        margin-bottom: 18px;
        font-size: 16px;
      }
      
      .input-actions {
        gap: 15px;
      }
      
      .input-btn {
        padding: 12px 24px;
        min-width: 100px;
        font-size: 15px;
      }
    }
  `;

  @state() showingInput = false;
  @state() favoriteName = '';
  @state() isFavorited = false;
  @property({ type: String }) currentTheme: 'basic' | 'rpg' = 'basic';
  @property({ type: Boolean }) isCurrentConfigFavorited = false;

  override render() {
    return html`
      <button 
        class=${classMap({
          'favorite-btn': true,
          'favorited': this.isCurrentConfigFavorited
        })}
        @click=${this.toggleFavorite}
        title=${this.isCurrentConfigFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        aria-label=${this.isCurrentConfigFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <span class="heart-icon">${this.isCurrentConfigFavorited ? '❤️' : '🤍'}</span>
      </button>

      <div class=${classMap({
        'input-overlay': true,
        'showing': this.showingInput
      })} @click=${this.handleOverlayClick}>
        
        <div class="input-card">
          <h3 class="input-title">💿 Salvar Música</h3>
          
          <input 
            class="input-field"
            type="text"
            placeholder="Digite o nome da sua música favorita..."
            .value=${this.favoriteName}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
          >
          
          <div class="input-actions">
            <button 
              class="input-btn cancel-btn"
              @click=${this.hideInput}
            >
              Cancelar
            </button>
            <button 
              class="input-btn save-btn"
              ?disabled=${!this.favoriteName.trim()}
              @click=${this.saveFavorite}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private toggleFavorite() {
    if (this.isCurrentConfigFavorited) {
      // Remover dos favoritos
      this.dispatchEvent(new CustomEvent('favorite-removed'));
    } else {
      // Mostrar input para salvar
      this.showInput();
    }
  }

  private showInput() {
    this.showingInput = true;
    this.favoriteName = '';
    
    // Adicionar listener global apenas para desktop
    if (window.innerWidth > 768) {
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick, true);
      }, 100);
    }
    
    // Aguardar o próximo frame para garantir que o DOM foi atualizado
    this.updateComplete.then(() => {
      // Aguardar a animação terminar
      setTimeout(() => {
        const input = this.shadowRoot?.querySelector('.input-field') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select(); // Selecionar todo o texto se houver
        }
      }, 350); // Um pouco mais que a animação de 300ms
    });
  }

  private hideInput() {
    this.showingInput = false;
    this.favoriteName = '';
    // Remover listener global
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  private handleOverlayClick(e: Event) {
    // Fechar apenas se clicar no overlay (fundo), não no card
    if (e.target === e.currentTarget) {
      this.hideInput();
    }
  }

  private handleInput(e: Event) {
    this.favoriteName = (e.target as HTMLInputElement).value;
  }

  private handleDocumentClick = (e: Event) => {
    // Não fechar se o input não estiver sendo exibido
    if (!this.showingInput) return;
    
    const target = e.target as Element;
    
    // Verificar se o clique foi no próprio componente ou seus filhos
    if (this.contains(target)) {
      return;
    }
    
    // Verificar se o clique foi dentro do shadow DOM
    if (this.shadowRoot && this.shadowRoot.contains(target)) {
      return;
    }
    
    // Verificar o composedPath para elementos do Shadow DOM
    const composedPath = e.composedPath();
    for (const element of composedPath) {
      if (element === this) {
        return;
      }
      if (element instanceof Element && this.shadowRoot?.contains(element)) {
        return;
      }
    }
    
    // Se chegou até aqui, o clique foi fora do componente
    this.hideInput();
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.favoriteName.trim()) {
      this.saveFavorite();
    } else if (e.key === 'Escape') {
      this.hideInput();
    }
  }

  private saveFavorite() {
    if (this.favoriteName.trim()) {
      this.dispatchEvent(new CustomEvent('favorite-created', {
        detail: { 
          name: this.favoriteName.trim(),
          theme: this.currentTheme
        }
      }));
      this.hideInput();
    }
  }

  public setCurrentConfigFavorited(favorited: boolean) {
    this.isCurrentConfigFavorited = favorited;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Limpar listener global se o componente for removido
    document.removeEventListener('click', this.handleDocumentClick, true);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'favorite-button': FavoriteButton
  }
}
