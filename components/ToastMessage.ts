/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('toast-message')
export class ToastMessage extends LitElement {
  static override styles = css`
    .toast {
      line-height: 1.6;
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.2);
      color: white;
      padding: 18px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      width: min(450px, 80vw);
      transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      border: none;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
      text-wrap: pretty;
      z-index: 9999;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    button {
      border-radius: 100px;
      aspect-ratio: 1;
      border: none;
      color: #000;
      cursor: pointer;
      position: relative;
      font-size: 14px;
      font-weight: bold;
      width: 24px;
      height: 24px;
      line-height: 1;
      padding: 0;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    button::after {
      content: '✕';
      position: absolute;
      top: 50%;
      left: calc(50% + 0.5px);
      transform: translate(-50%, -50%);
      font-size: 14px;
      font-weight: bold;
    }
    
    .toast:not(.showing) {
      transition-duration: 1s;
      transform: translate(-50%, -200%);
    }
    
    a {
      color: #acacac;
      text-decoration: underline;
    }
  `;

  @property({ type: String }) message = '';
  @property({ type: Boolean }) showing = false;
  @property({ type: String }) type: 'info' | 'success' | 'error' = 'info';

  private renderMessageWithLinks() {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = this.message.split( urlRegex );
    return parts.map( ( part, i ) => {
      if ( i % 2 === 0 ) return part;
      return html`<a href=${part} target="_blank" rel="noopener">${part}</a>`;
    } );
  }

  override render() {
    return html`<div class=${classMap({ 
      showing: this.showing, 
      toast: true,
      success: this.type === 'success',
      error: this.type === 'error'
    })}>
      <div class="message">${this.renderMessageWithLinks()}</div>
      <button @click=${this.hide}></button>
    </div>`;
  }

  show(message: string, type: 'info' | 'success' | 'error' = 'info') {
    this.showing = true;
    this.message = message;
    this.type = type;
  }

  hide() {
    this.showing = false;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'toast-message': ToastMessage
  }
}
