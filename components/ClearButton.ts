/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { svg, css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('clear-button')
export class ClearButton extends LitElement {
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
    .clear-icon {
      fill: #FEFEFE;
      transition: fill 0.3s ease;
    }
    .clear-icon:hover {
      fill: #ff6b6b;
    }
  `;

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
        stroke-opacity="0.1"
        stroke-width="1" />
      <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fill-opacity="0.05" shape-rendering="crispEdges" />
      
      ${this.renderClearIcon()}

    </svg>`;
  }

  private renderClearIcon() {
    return svg`
      <g class="clear-icon" transform="translate(50, 39)">
        <!-- Ícone de lixeira -->
        <rect x="5" y="8" width="30" height="25" rx="2" fill="currentColor" opacity="0.9"/>
        <rect x="3" y="5" width="34" height="3" rx="1" fill="currentColor"/>
        <rect x="13" y="2" width="14" height="3" rx="1" fill="currentColor"/>
        
        <!-- Linhas da lixeira -->
        <rect x="12" y="12" width="2" height="16" rx="1" fill="white"/>
        <rect x="18" y="12" width="2" height="16" rx="1" fill="white"/>
        <rect x="24" y="12" width="2" height="16" rx="1" fill="white"/>
      </g>
    `;
  }

  override render() {
    return html`${this.renderSvg()}<div class="hitbox"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clear-button': ClearButton
  }
}
