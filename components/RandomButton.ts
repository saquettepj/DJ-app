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
      transform: scale(1.05);
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
      <rect x="22" y="6" width="96" height="96" rx="48" fill="black" fill-opacity="0.05" />
      <rect x="23.5" y="7.5" width="93" height="93" rx="46.5" stroke="black" stroke-opacity="0.1" stroke-width="1" />
      <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fill-opacity="0.05" shape-rendering="crispEdges" />
      
      ${this.isActive ? this.renderTimerText() : this.renderDiceIcon()}

    </svg>`;
  }

  private renderTimerText() {
    // Texto centralizado com o círculo do botão (viewBox: 0 -10 140 150)
    // O centro do círculo está em (70, 70) relativo ao viewBox
    const time = this.formatTime(this.timeUntilNext);
    return svg`<text x="70" y="58" text-anchor="middle" dominant-baseline="middle" fill="#FEFEFE" font-size="18" font-weight="600">${time}</text>`;
  }

  private renderDiceIcon() {
    return svg`
      <g class="dice-icon ${this.isActive ? 'active' : ''}" transform="translate(52.5, 41.5)">
        <!-- Cubo 3D: desenhar topo e lateral atrás, depois a face frontal -->
        <!-- Topo (levemente mais claro) -->
        <polygon points="5,5 10,0 30,0 25,5" fill="white" opacity="0.7" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
        <!-- Lateral (sombra leve) -->
        <polygon points="25,5 30,0 30,20 25,25" fill="white" opacity="0.6" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>

        <!-- Face frontal (em cima) -->
        <rect x="5" y="5" width="20" height="20" rx="3" fill="white" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
        <!-- Pontos do dado (5) -->
        <circle cx="12" cy="12" r="1.5" fill="black"/>
        <circle cx="18" cy="12" r="1.5" fill="black"/>
        <circle cx="12" cy="18" r="1.5" fill="black"/>
        <circle cx="18" cy="18" r="1.5" fill="black"/>
        <circle cx="15" cy="15" r="1.5" fill="black"/>
      </g>
    `;
  }

  override render() {
    return html`
      ${this.renderSvg()}
      <div class="hitbox" @click=${this.toggleRandom}></div>
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