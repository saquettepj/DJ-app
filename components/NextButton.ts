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
      transform: scale(1.2);
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
      <rect x="23.5" y="7.5" width="93" height="93" rx="46.5" stroke="black" stroke-opacity="0.3" stroke-width="3" />
      <g filter="url(#filter0_ddi_1048_7373)">
        <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fill-opacity="0.05" shape-rendering="crispEdges" />
      </g>
      ${this.renderNextIcon()}
      <defs>
        <filter id="filter0_ddi_1048_7373" x="0" y="0" width="140" height="140" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1048_7373" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="16" />
          <feGaussianBlur stdDeviation="12.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_1048_7373" result="effect2_dropShadow_1048_7373" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1048_7373" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_1048_7373" />
        </filter>
      </defs>
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
