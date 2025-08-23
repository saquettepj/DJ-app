/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Favorite, MusicPreset, Prompt } from '../types';

@customElement('favorites-sidebar')
export class FavoritesSidebar extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    :host(.hidden) {
      transform: translateX(100%);
    }

    .header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }

    .title {
      color: white;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      text-align: center;
    }

    .favorites-list {
      height: calc(100vh - 80px);
      overflow-y: auto;
      padding: 20px;
    }

    .favorite-tape {
      background: rgba(0, 0, 0, 0.2);
      border: none;
      border-radius: 20px;
      padding: 0;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      height: 60px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .favorite-tape:hover {
      background: rgba(0, 0, 0, 0.35);
      transform: translateY(-2px);
    }

    .favorite-tape.selected {
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }

    .favorite-name {
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 90px;
      text-align: left;
      line-height: 1.4;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 15px;
    }

    .favorite-actions {
      position: absolute;
      top: 50%;
      right: 15px;
      display: flex;
      gap: 8px;
      z-index: 2;
      transform: translateY(-50%);
    }

    .action-btn {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 12px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-btn {
      background: rgba(255, 193, 7, 0.8);
      color: #000;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .edit-btn:hover {
      background: rgba(255, 193, 7, 1);
      transform: scale(1.1);
    }

    .delete-btn {
      background: rgba(244, 67, 54, 0.8);
      color: white;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 1);
      transform: scale(1.1);
    }

    .delete-btn.deleting {
      background: rgba(244, 67, 54, 1);
      animation: pulse 1s infinite;
    }

    .delete-progress-container {
      position: absolute;
      bottom: -1px;
      left: 3px;
      right: 3px;
      height: 3px;
      border-radius: 0 0 17px 17px;
      overflow: hidden;
      z-index: 1;
    }

    .delete-progress {
      position: absolute;
      bottom: 0;
      left: 8px;
      height: 100%;
      width: 95%;
      background: rgba(244, 67, 54, 0.8);
      border-radius: 0 0 17px 17px;
      transition: width 0.1s linear;
      box-shadow: 0 0 8px rgba(244, 67, 54, 0.3);
      transform-origin: left;
    }

    .edit-input {
      width: calc(100% - 90px);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 14px;
      color: white;
      box-sizing: border-box;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 15px;
      margin: 0;
    }

    .edit-input:focus {
      outline: none;
      border-color: rgba(255, 193, 7, 0.8);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
    }

    .edit-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .empty-state {
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
      line-height: 1.4;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    /* Responsividade */
    @media (max-width: 768px) {
      :host {
        width: 280px;
      }
    }

    @media (max-width: 480px) {
      :host {
        width: 260px;
      }
      
      .header {
        padding: 15px;
      }
      
      .favorites-list {
        padding: 15px;
      }
      
      .favorite-tape {
        padding: 12px;
        margin-bottom: 12px;
      }
    }
  `;

  @property({ type: Array }) favorites: Favorite[] = [];
  @property({ type: String }) selectedFavoriteId: string | null = null;
  @property({ type: String }) currentTheme: 'basic' | 'rpg' = 'basic';
  @state() editingId: string | null = null;
  @state() editingName: string = '';
  @state() deletingId: string | null = null;
  @state() deleteProgress: number = 0;
  @state() deleteTimeout: number | null = null;

  private documentClickHandler = (e: Event) => {
    if (this.editingId && !this.contains(e.target as Node) && !this.shadowRoot?.contains(e.target as Node)) {
      this.cancelEdit();
    }
  };

  override render() {
    return html`
      <div class="header">
        <h2 class="title">💿 Favoritos - ${this.currentTheme.toUpperCase()}</h2>
      </div>
      
      <div class="favorites-list">
        ${this.favorites.length === 0 
          ? this.renderEmptyState()
          : this.favorites.map(favorite => this.renderFavoriteTape(favorite))
        }
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">💿</div>
        <div class="empty-text">
          Nenhuma música favoritada no tema ${this.currentTheme.toUpperCase()} ainda.<br>
          Use o botão ♥ para salvar suas músicas favoritas!
        </div>
      </div>
    `;
  }

  private renderFavoriteTape(favorite: Favorite) {
    const isSelected = this.selectedFavoriteId === favorite.id;
    const isEditing = this.editingId === favorite.id;
    const isDeleting = this.deletingId === favorite.id;

    return html`
      <div class=${classMap({
        'favorite-tape': true,
        'selected': isSelected,
        'deleting': isDeleting
      })} @click=${() => this.selectFavorite(favorite)}>
        
        ${isEditing 
          ? html`
              <input 
                class="edit-input"
                .value=${this.editingName}
                placeholder="Digite o novo nome..."
                @input=${(e: Event) => this.editingName = (e.target as HTMLInputElement).value}
                @keydown=${(e: KeyboardEvent) => this.handleEditKeydown(e, favorite)}
                @blur=${() => this.cancelEdit()}
                autofocus
              >
            `
          : html`
              <h3 class="favorite-name" title=${favorite.name}>${favorite.name}</h3>
            `
        }
        
        <div class="favorite-actions" @click=${(e: Event) => e.stopPropagation()}>
          <button 
            class="action-btn edit-btn"
            @click=${() => this.startEdit(favorite)}
            title="Editar nome"
            aria-label="Editar nome do favorito"
          >
            ✏️
          </button>
          <button 
            class=${classMap({
              'action-btn': true,
              'delete-btn': true,
              'deleting': isDeleting
            })}
            @mousedown=${() => this.startDelete(favorite)}
            @mouseup=${() => this.cancelDelete()}
            @mouseleave=${() => this.cancelDelete()}
            @touchstart=${() => this.startDelete(favorite)}
            @touchend=${() => this.cancelDelete()}
            title="Pressione e segure por 3s para excluir"
            aria-label="Excluir favorito"
          >
            🗑️
          </button>
        </div>
        
        ${isDeleting ? html`
          <div class="delete-progress-container">
            <div class="delete-progress" style="width: ${this.deleteProgress}%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private selectFavorite(favorite: Favorite) {
    if (this.editingId === favorite.id) return;
    
    this.dispatchEvent(new CustomEvent('favorite-selected', {
      detail: { favorite }
    }));
  }

  private startEdit(favorite: Favorite) {
    this.editingId = favorite.id;
    this.editingName = favorite.name;
    // Adicionar listener para clique fora do input
    setTimeout(() => {
      document.addEventListener('click', this.documentClickHandler, true);
    }, 0);
  }

  private handleEditKeydown(e: KeyboardEvent, favorite: Favorite) {
    if (e.key === 'Enter') {
      this.saveEdit(favorite);
    } else if (e.key === 'Escape') {
      this.cancelEdit();
    }
  }

  private saveEdit(favorite: Favorite) {
    if (this.editingName.trim()) {
      this.dispatchEvent(new CustomEvent('favorite-updated', {
        detail: { 
          id: favorite.id, 
          name: this.editingName.trim() 
        }
      }));
    }
    this.cancelEdit();
  }

  private cancelEdit() {
    this.editingId = null;
    this.editingName = '';
    // Remover listener do documento
    document.removeEventListener('click', this.documentClickHandler, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Limpar listener ao remover o componente
    document.removeEventListener('click', this.documentClickHandler, true);
  }

  private startDelete(favorite: Favorite) {
    this.deletingId = favorite.id;
    this.deleteProgress = 0;
    
    const startTime = Date.now();
    const duration = 3000; // 3 segundos
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      this.deleteProgress = Math.min((elapsed / duration) * 100, 100);
      
      if (elapsed < duration) {
        this.deleteTimeout = window.setTimeout(updateProgress, 10);
      } else {
        this.completeDelete(favorite);
      }
    };
    
    updateProgress();
  }

  private cancelDelete() {
    if (this.deleteTimeout) {
      clearTimeout(this.deleteTimeout);
      this.deleteTimeout = null;
    }
    this.deletingId = null;
    this.deleteProgress = 0;
  }

  private completeDelete(favorite: Favorite) {
    this.cancelDelete();
    this.dispatchEvent(new CustomEvent('favorite-deleted', {
      detail: { id: favorite.id }
    }));
  }

  public show() {
    this.classList.remove('hidden');
  }

  public hide() {
    this.classList.add('hidden');
  }

  public toggle() {
    this.classList.toggle('hidden');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'favorites-sidebar': FavoritesSidebar
  }
}
