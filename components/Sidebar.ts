/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { svg, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ThemeMode = 'basic' | 'rpg';

@customElement('app-sidebar')
export class Sidebar extends LitElement {

  @property({ type: String, reflect: true }) currentTheme: ThemeMode = 'basic';

  override connectedCallback() {
    super.connectedCallback();
  }

  static override styles = css`
    :host {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      z-index: 1000;
      pointer-events: auto;
    }
    
    .theme-button {
      position: relative;
      width: 80px;
      height: 80px;
      pointer-events: auto;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    .theme-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    
    svg {
      width: 100%;
      height: 100%;
      transition: transform 0.3s cubic-bezier(0.25, 1.56, 0.32, 0.99);
    }
    
    .hitbox {
      pointer-events: auto;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10;
    }
    
    .active {
      filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
    }
    
    .inactive {
      opacity: 0.6;
    }
    
    .inactive:hover {
      opacity: 0.8;
    }

    .favorites-toggle-btn {
      width: 80px;
      height: 80px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 38px;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    .favorites-toggle-btn span {
      margin-top: -4px;
      margin-left: 0.5px;
    }
    
    .favorites-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    
    /* Desktop responsive - tela menor */
    @media (min-width: 768px) and (max-width: 1200px) {
      :host {
        width: 160px;
        gap: 1.5rem;
      }
      
      .theme-button {
        width: 80px;
        height: 80px;
      }
    }
    
    /* Desktop responsive - tela muito pequena */
    @media (min-width: 768px) and (max-width: 900px) {
      :host {
        width: 140px;
        gap: 1rem;
      }
      
      .theme-button {
        width: 55px;
        height: 55px;
      }
      
      .favorites-toggle-btn {
        width: 55px;
        height: 55px;
        font-size: 26px;
      }
    }
    
    /* Mobile styles - deve vir DEPOIS das regras de desktop para ter prioridade */
    @media (max-width: 767px) {
      :host {
        position: fixed;
        left: 0;
        right: 0;
        top: auto;
        bottom: 0;
        height: auto;
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 12px;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1001;
        display: flex;
        pointer-events: auto;
        min-height: 80px;
        box-sizing: border-box;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex-wrap: nowrap;
      }
      
      .theme-button {
        width: 40px !important;
        height: 40px !important;
        display: block;
        pointer-events: auto;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex: 0 0 auto;
      }

      .favorites-toggle-btn {
        width: 40px !important;
        height: 40px !important;
        font-size: 20px;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex: 0 0 auto;
      }
      
      .favorites-toggle-btn span {
        margin-top: -1px;
        margin-left: 0.3px;
        line-height: 1;
        display: block;
        vertical-align: middle;
        text-align: center;
      }
      
      svg {
        width: 100%;
        height: 100%;
        display: block;
        max-width: 40px;
        max-height: 40px;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
      }
    }
    
    /* Mobile Landscape - orientação horizontal - deve ter prioridade máxima */
    @media (max-width: 767px) and (orientation: landscape) {
      :host {
        min-height: 60px;
        padding: 8px 12px;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex-wrap: nowrap;
      }
      
      .theme-button {
        width: 55px !important;
        height: 55px !important;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex: 0 0 auto;
      }

      .favorites-toggle-btn {
        width: 55px !important;
        height: 55px !important;
        font-size: 26px;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
        flex: 0 0 auto;
      }
      
      .favorites-toggle-btn span {
        margin-top: -0.5px;
        margin-left: 0.2px;
        line-height: 1;
        display: block;
        vertical-align: middle;
        text-align: center;
      }
      
      svg {
        max-width: 55px;
        max-height: 55px;
        line-height: 1;
        vertical-align: middle;
        text-align: center;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      :host {
        padding: 8px;
        gap: 0.5rem;
        min-height: 70px;
      }
      
      .theme-button {
        width: 35px !important;
        height: 35px !important;
      }

      .favorites-toggle-btn {
        width: 35px !important;
        height: 35px !important;
        font-size: 16px;
      }
      
      .favorites-toggle-btn span {
        margin-top: -0.5px;
        margin-left: 0.3px;
      }
      
      svg {
        max-width: 35px;
        max-height: 35px;
      }
    }
    
    /* Small mobile landscape */
    @media (max-width: 480px) and (orientation: landscape) {
      :host {
        min-height: 50px;
        padding: 6px 8px;
        gap: 0.4rem;
      }
      
      .theme-button {
        width: 30px !important;
        height: 30px !important;
      }

      .favorites-toggle-btn {
        width: 30px !important;
        height: 30px !important;
        font-size: 14px;
      }
      
      .favorites-toggle-btn span {
        margin-top: 0px;
        margin-left: 0.2px;
      }
      
      svg {
        max-width: 30px;
        max-height: 30px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      :host {
        padding: 6px;
        gap: 0.25rem;
        min-height: 60px;
      }
      
      .theme-button {
        width: 32px !important;
        height: 32px !important;
      }

      .favorites-toggle-btn {
        width: 32px !important;
        height: 32px !important;
        font-size: 14px;
      }
      
      .favorites-toggle-btn span {
        margin-top: 0px;
        margin-left: 0.3px;
      }
      
      svg {
        max-width: 32px;
        max-height: 32px;
      }
    }
    
    /* Extra small mobile landscape */
    @media (max-width: 360px) and (orientation: landscape) {
      :host {
        min-height: 45px;
        padding: 5px 6px;
        gap: 0.2rem;
      }
      
      .theme-button {
        width: 28px !important;
        height: 28px !important;
      }

      .favorites-toggle-btn {
        width: 28px !important;
        height: 28px !important;
        font-size: 12px;
      }
      
      .favorites-toggle-btn span {
        margin-top: 0px;
        margin-left: 0.2px;
      }
      
      svg {
        max-width: 28px;
        max-height: 28px;
      }
    }
  `;

  private renderBasicButton() {
    const isActive = this.currentTheme === 'basic';
    return html`
      <div class="theme-button ${isActive ? 'active' : 'inactive'}" 
           @click=${() => this.switchTheme('basic')}>
        ${this.renderBasicSvg()}
        <div class="hitbox" @click=${() => this.switchTheme('basic')}></div>
      </div>
    `;
  }

  private renderRpgButton() {
    const isActive = this.currentTheme === 'rpg';
    return html`
      <div class="theme-button ${isActive ? 'active' : 'inactive'}"
           @click=${() => this.switchTheme('rpg')}>
        ${this.renderRpgSvg()}
        <div class="hitbox" @click=${() => this.switchTheme('rpg')}></div>
      </div>
    `;
  }

  private renderBasicSvg() {
    return svg`<svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="24"
        y="24"
        width="112"
        height="112"
        rx="56"
        fill="black"
        fill-opacity="0.05" />
      <rect
        x="27"
        y="27"
        width="106"
        height="106"
        rx="53"
        stroke="black"
        stroke-opacity="0.1"
        stroke-width="1" />
      <g filter="url(#filter0_ddi_basic)">
        <rect
          x="30"
          y="30"
          width="100"
          height="100"
          rx="50"
          fill="white"
          fill-opacity="0.05"
          shape-rendering="crispEdges" />
      </g>
      <text x="80" y="90" text-anchor="middle" fill="#FEFEFE" font-family="Arial, sans-serif" font-size="24" font-weight="bold">BASIC</text>
      <defs>
        <filter
          id="filter0_ddi_basic"
          x="0"
          y="0"
          width="160"
          height="160"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow"
            result="shape" />
        </filter>
      </defs>
    </svg>`;
  }

  private renderRpgSvg() {
    return svg`<svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="24"
        y="24"
        width="112"
        height="112"
        rx="56"
        fill="black"
        fill-opacity="0.05" />
      <rect
        x="27"
        y="27"
        width="106"
        height="106"
        rx="53"
        stroke="black"
        stroke-opacity="0.1"
        stroke-width="1" />
      <g filter="url(#filter0_ddi_rpg)">
        <rect
          x="30"
          y="30"
          width="100"
          height="100"
          rx="50"
          fill="white"
          fill-opacity="0.05"
          shape-rendering="crispEdges" />
      </g>
      <text x="80" y="90" text-anchor="middle" fill="#FEFEFE" font-family="Arial, sans-serif" font-size="24" font-weight="bold">RPG</text>
      <defs>
        <filter
          id="filter0_ddi_rpg"
          x="0"
          y="0"
          width="160"
          height="160"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow"
            result="shape" />
        </filter>
      </defs>
    </svg>`;
  }

  private switchTheme(theme: ThemeMode) {
    if (theme !== this.currentTheme) {
      this.currentTheme = theme;
      this.requestUpdate();
      const event = new CustomEvent('theme-changed', { 
        detail: { theme },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
      
      // Deselecionar qualquer fita selecionada na barra de favoritos
      this.dispatchEvent(new CustomEvent('deselect-favorites'));
    }
  }

  override render() {
    return html`
      ${this.renderBasicButton()}
      ${this.renderRpgButton()}
      <button 
        class="favorites-toggle-btn"
        @click=${this.toggleFavorites}
        aria-label="Mostrar/Ocultar Favoritos"
      >
        <span>💿</span>
      </button>
    `;
  }

  private toggleFavorites() {
    this.dispatchEvent(new CustomEvent('toggle-favorites'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': Sidebar
  }
}
