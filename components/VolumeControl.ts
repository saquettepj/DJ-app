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
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      box-sizing: border-box;
      width: 100%;
      max-width: 300px;
      position: relative;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
    }

    :host::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      z-index: -1;
    }



    .volume-label {
      color: #FEFEFE !important;
      font-family: Arial, sans-serif;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .volume-slider {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.3);
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      min-width: 60px;
      position: relative;
      z-index: 1;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .volume-slider::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #FEFEFE;
      cursor: pointer;
      border: 2px solid rgba(0, 0, 0, 0.3);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .volume-slider::-webkit-slider-thumb:hover {
      background: #ffffff;
      transform: scale(1.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .volume-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #FEFEFE;
      cursor: pointer;
      border: 2px solid rgba(0, 0, 0, 0.3);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .volume-slider::-moz-range-thumb:hover {
      background: #ffffff;
      transform: scale(1.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .volume-value {
      color: #FEFEFE;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: 600;
      min-width: 35px;
      text-align: center;
      flex-shrink: 0;
    }

    .volume-icon {
      width: 16px;
      height: 16px;
      fill: #FEFEFE;
      opacity: 0.8;
      flex-shrink: 0;
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      :host {
        width: auto;
        max-width: none;
        gap: 0.8rem;
        padding: 0.8rem 1.5rem;
        border-radius: 40px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      :host::before {
        border-radius: 40px;
      }


      
      .volume-label {
        font-size: 12px;
        letter-spacing: 1px;
      }
      
      .volume-slider {
        width: 120px;
        min-width: 120px;
      }
      
      .volume-slider::-webkit-slider-thumb {
        width: 16px;
        height: 16px;
      }
      
      .volume-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
      }
      
      .volume-value {
        font-size: 14px;
        min-width: 40px;
      }
      
      .volume-icon {
        width: 20px;
        height: 20px;
      }
    }
    
    /* Mobile landscape */
    @media (max-width: 767px) and (orientation: landscape) {
      :host {
        padding: 6px 10px;
        gap: 6px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      :host::before {
        border-radius: 16px;
      }


      
      .volume-label {
        font-size: 9px;
        letter-spacing: 0.3px;
      }
      
      .volume-slider {
        min-width: 50px;
      }
      
      .volume-slider::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
      }
      
      .volume-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
      }
      
      .volume-value {
        font-size: 11px;
        min-width: 30px;
      }
      
      .volume-icon {
        width: 14px;
        height: 14px;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      :host {
        padding: 6px 8px;
        gap: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      :host::before {
        border-radius: 14px;
      }


      
      .volume-label {
        font-size: 8px;
        letter-spacing: 0.2px;
      }
      
      .volume-slider {
        min-width: 40px;
      }
      
      .volume-slider::-webkit-slider-thumb {
        width: 10px;
        height: 10px;
      }
      
      .volume-slider::-moz-range-thumb {
        width: 10px;
        height: 10px;
      }
      
      .volume-value {
        font-size: 10px;
        min-width: 25px;
      }
      
      .volume-icon {
        width: 12px;
        height: 12px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      :host {
        padding: 4px 6px;
        gap: 3px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      :host::before {
        border-radius: 12px;
      }


      
      .volume-label {
        font-size: 7px;
        letter-spacing: 0.1px;
      }
      
      .volume-slider {
        min-width: 35px;
      }
      
      .volume-slider::-webkit-slider-thumb {
        width: 8px;
        height: 8px;
      }
      
      .volume-slider::-moz-range-thumb {
        width: 8px;
        height: 8px;
      }
      
      .volume-value {
        font-size: 9px;
        min-width: 20px;
      }
      
      .volume-icon {
        width: 10px;
        height: 10px;
      }
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
