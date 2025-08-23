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
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    .favorites-toggle-btn::after {
      content: '💿';
      position: absolute;
      top: calc(50% - 2.5px);
      left: calc(50%);
      transform: translate(-50%, -50%);
      font-size: 40px;
    }
    
    .favorites-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    
    /* Mobile styles */
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
        justify-content: center;
        gap: 1rem;
        padding: 12px;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1001;
        display: flex;
        pointer-events: auto;
      }
      
      .theme-button {
        width: 50px;
        height: 50px;
        display: block;
        pointer-events: auto;
      }

      .favorites-toggle-btn {
        width: 50px;
        height: 50px;
        font-size: 22px;
      }
      
      .favorites-toggle-btn::after {
        font-size: 32px;
      }
      
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
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
        width: 80px;
        height: 80px;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      :host {
        padding: 8px;
        gap: 0.5rem;
      }
      
      .theme-button {
        width: 45px;
        height: 45px;
      }

      .favorites-toggle-btn {
        width: 45px;
        height: 45px;
      }
      
      .favorites-toggle-btn::after {
        font-size: 28px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      :host {
        padding: 6px;
        gap: 0.25rem;
      }
      
      .theme-button {
        width: 40px;
        height: 40px;
      }

      .favorites-toggle-btn {
        width: 40px;
        height: 40px;
      }
      
      .favorites-toggle-btn::after {
        font-size: 24px;
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
        title="Mostrar/Ocultar Favoritos"
        aria-label="Mostrar/Ocultar Favoritos"
      >
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
