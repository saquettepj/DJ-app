/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { svg, css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('random-button')
export class RandomButton extends LitElement {
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
    .dice-icon {
      fill: #FEFEFE;
      transition: fill 0.3s ease;
    }
    .dice-icon.active {
      fill: #4CAF50;
      animation: pulse 2s infinite;
    }
    .circle-bg.active {
      fill: rgba(76, 175, 80, 0.1);
      stroke: #4CAF50;
      stroke-width: 2;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .timer {
      position: absolute;
      right: -80px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #ffffff;
      font-weight: 600;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  `;

  @property({ type: Boolean }) public isActive = false;
  @state() private timeUntilNext = 0;
  @state() private isGenerating = false;

  private intervalId: number | null = null;
  private timerId: number | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.startTimer();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
  }

  private startTimer() {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      if (this.isActive) {
        if (this.timeUntilNext > 0) {
          this.timeUntilNext--;
          this.requestUpdate();
        } else {
          // Timer chegou a zero, reiniciar para 2 minutos
          this.timeUntilNext = 120;
          this.requestUpdate();
        }
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private toggleRandom() {
    this.isActive = !this.isActive;
    
    if (this.isActive) {
      this.timeUntilNext = 120; // 2 minutos
      this.startTimer();
      this.dispatchEvent(new CustomEvent('random-activated'));
    } else {
      this.timeUntilNext = 0;
      this.stopTimer();
      this.dispatchEvent(new CustomEvent('random-deactivated'));
    }
    
    this.requestUpdate();
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private renderSvg() {
    return html`<svg
      width="140"
      height="140"
      viewBox="0 -10 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="22"
        y="6"
        width="96"
        height="96"
        rx="48"
        fill="black"
        fill-opacity="0.05" />
      <rect
        x="23.5"
        y="7.5"
        width="93"
        height="93"
        rx="46.5"
        stroke="black"
        stroke-opacity="0.3"
        stroke-width="3" />
      <g filter="url(#filter0_ddi_1048_7373)">
        <rect
          x="25"
          y="9"
          width="90"
          height="90"
          rx="45"
          fill="white"
          fill-opacity="0.05"
          shape-rendering="crispEdges"
          class="circle-bg ${this.isActive ? 'active' : ''}" />
      </g>
      ${this.renderDiceIcon()}
      <defs>
        <filter
          id="filter0_ddi_1048_7373"
          x="0"
          y="0"
          width="140"
          height="140"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1048_7373" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="16" />
          <feGaussianBlur stdDeviation="12.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1048_7373"
            result="effect2_dropShadow_1048_7373" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1048_7373"
            result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect3_innerShadow_1048_7373" />
        </filter>
      </defs>
    </svg>`;
  }

  private renderDiceIcon() {
    return svg`
      <g class="dice-icon ${this.isActive ? 'active' : ''}" transform="translate(55, 39)">
        <!-- Dado 3D -->
        <rect x="0" y="10" width="20" height="20" rx="3" fill="currentColor" opacity="0.9"/>
        <rect x="5" y="5" width="20" height="20" rx="3" fill="currentColor"/>
        <polygon points="25,5 30,0 30,20 25,25" fill="currentColor" opacity="0.7"/>
        <polygon points="5,5 25,5 30,0 10,0" fill="currentColor" opacity="0.8"/>
        
        <!-- Pontos do dado -->
        <circle cx="12" cy="12" r="1.5" fill="white"/>
        <circle cx="18" cy="12" r="1.5" fill="white"/>
        <circle cx="12" cy="18" r="1.5" fill="white"/>
        <circle cx="18" cy="18" r="1.5" fill="white"/>
        <circle cx="15" cy="15" r="1.5" fill="white"/>
      </g>
    `;
  }

  override render() {
    return html`
      ${this.renderSvg()}
      <div class="hitbox" @click=${this.toggleRandom}></div>
      ${this.isActive ? html`
        <div class="timer">
          ${this.formatTime(this.timeUntilNext)}
        </div>
      ` : ''}
    `;
  }

  public startGenerating() {
    this.isGenerating = true;
    this.requestUpdate();
  }

  public stopGenerating() {
    this.isGenerating = false;
    this.requestUpdate();
  }

  public resetTimer() {
    if (this.isActive) {
      this.timeUntilNext = 120; // Reset para 2 minutos
      this.requestUpdate();
    }
  }

  public forceDeactivate() {
    this.isActive = false;
    this.timeUntilNext = 0;
    this.stopTimer();
    this.requestUpdate();
  }
}