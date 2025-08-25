/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { LitElement, css, svg } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('cd-icon')
export class CdIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      width: 1em;
      height: 1em;
      line-height: 1;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;

  override render() {
    return svg`<svg
      viewBox="0 0 58 58"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      role="img">
      <!-- Disco base -->
      <circle cx="29" cy="29" r="25" fill="#FFFFFF" fill-opacity="0.9"/>
      <!-- Borda sutil -->
      <circle cx="29" cy="29" r="25" stroke="rgba(255,255,255,0.9)" stroke-opacity="0.6"/>
      <!-- Furo central -->
      <circle cx="29" cy="29" r="5" fill="rgba(0,0,0,0)" stroke="rgba(255,255,255,0.9)" stroke-width="2"/>
      <!-- Reflexo/segmento para aparência de CD -->
      <path d="M29 4 A25 25 0 0 1 54 29 Q46 27 40 33 T21 35 A15 15 0 0 1 29 21" 
            fill="rgba(255,255,255,0.5)"/>
      <!-- Pequeno brilho -->
      <ellipse cx="23" cy="19" rx="7" ry="3.5" fill="rgba(255,255,255,0.7)"/>
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cd-icon': CdIcon
  }
}


