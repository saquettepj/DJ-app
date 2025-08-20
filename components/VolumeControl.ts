/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('volume-control')
export class VolumeControl extends LitElement {

  @property({ type: Number }) volume: number = 0.5;

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(0, 0, 0, 0.8);
      padding: 0.8rem 1.5rem;
      border-radius: 40px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .volume-label {
      color: white;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      white-space: nowrap;
    }

    .volume-slider {
      width: 120px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    .volume-slider::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }

    .volume-slider::-webkit-slider-thumb:hover {
      background: #45a049;
      transform: scale(1.1);
    }

    .volume-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }

    .volume-slider::-moz-range-thumb:hover {
      background: #45a049;
      transform: scale(1.1);
    }

    .volume-value {
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      min-width: 40px;
      text-align: center;
    }

    .volume-icon {
      width: 20px;
      height: 20px;
      fill: white;
      opacity: 0.8;
    }
  `;

  private handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.volume = parseFloat(target.value);
    
    // Disparar evento para o componente pai
    this.dispatchEvent(new CustomEvent('volume-changed', {
      detail: { volume: this.volume }
    }));
  }

  override render() {
    return html`
      <svg class="volume-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
      
      <span class="volume-label">Volume</span>
      
      <input 
        type="range" 
        class="volume-slider"
        min="0" 
        max="1" 
        step="0.01" 
        .value=${this.volume}
        @input=${this.handleVolumeChange}
      />
      
      <span class="volume-value">${Math.round(this.volume * 100)}%</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'volume-control': VolumeControl
  }
}
