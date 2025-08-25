/**
 * @license
 * SPDX-License-Identifier: Apache-2-0
*/
import { svg, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('next-button')
export class NextButton extends LitElement {
  @property({ type: Boolean }) public isActive = false;
  @property({ type: Boolean }) public isGenerating = false;

  static override styles = css`
    :host {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    :host(:hover) svg {
      transform: scale(1.05);
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
    }
    svg {
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.25, 1.56, 0.32, 0.99);
    }
    .hitbox {
      pointer-events: all;
      position: absolute;
      width: 65%;
      aspect-ratio: 1;
      top: 9%;
      border-radius: 50%;
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    .next-icon {
      color: #FEFEFE;
      transition: color 0.3s ease;
    }
    .next-icon:hover {
      color: #4CAF50;
    }
    .next-icon.active {
      color: #4CAF50;
    }
    .next-icon.generating {
      color: #FFA500;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;

  private renderSvg() {
    return html`<svg
      width="140"
      height="140"
      viewBox="0 -10 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="6" width="96" height="96" rx="48" fill="black" fill-opacity="0.05" />
      <rect x="23.5" y="7.5" width="93" height="93" rx="46.5" stroke="black" stroke-opacity="0.1" stroke-width="1" />
      <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fill-opacity="0.05" shape-rendering="crispEdges" />
      
      ${this.renderNextIcon()}

    </svg>`;
  }

  private renderNextIcon() {
    return svg`
      <g class="next-icon ${this.isActive ? 'active' : ''} ${this.isGenerating ? 'generating' : ''}" transform="translate(70,70) scale(0.8) translate(-70,-70) translate(-7,-4)">
        <!-- triângulo (avançar) -->
        <path d="M58 71.5V36.5L85.5 54L58 71.5Z" fill="#FEFEFE" />
        <!-- barra (next) -->
        <path d="M88 71.5V36.5H96V71.5H88Z" fill="#FEFEFE" />
      </g>
    `;
  }

  private handleClick() {
    // Sempre disparar o evento, independente do estado
    this.dispatchEvent(new CustomEvent('next-clicked'));
  }

  override render() {
    // Sempre renderizar o botão, independente do estado
    return html`
      ${this.renderSvg()}
      <div class="hitbox" @click=${this.handleClick}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'next-button': NextButton;
  }
}
