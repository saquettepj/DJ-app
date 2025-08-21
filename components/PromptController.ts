/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './WeightKnob';
import type { WeightKnob } from './WeightKnob';

import type { MidiDispatcher } from '../utils/MidiDispatcher';
import type { Prompt, ControlChange } from '../types';

/** A single prompt input associated with a MIDI CC. */
@customElement('prompt-controller')
export class PromptController extends LitElement {
  static override styles = css`
    .prompt {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      box-sizing: border-box;
    }
    
    weight-knob {
      width: 80%;
      height: auto;
      flex-shrink: 0;
      margin-bottom: 8px;
    }
    
    #midi {
      font-family: monospace;
      text-align: center;
      font-size: 10px;
      border: 1px solid #fff;
      border-radius: 4px;
      padding: 2px 4px;
      color: #fff;
      background: #0006;
      cursor: pointer;
      visibility: hidden;
      user-select: none;
      margin-top: 4px;
      min-width: 30px;
      text-align: center;
    }
    
    .learn-mode & {
      color: orange;
      border-color: orange;
    }
    
    .show-cc & {
      visibility: visible;
    }
    
    #text {
      font-weight: 500;
      font-size: 12px;
      max-width: 100%;
      min-width: 40px;
      padding: 4px 6px;
      margin-top: 4px;
      flex-shrink: 0;
      border-radius: 4px;
      text-align: center;
      white-space: pre;
      overflow: hidden;
      border: none;
      outline: none;
      -webkit-font-smoothing: antialiased;
      background: #000;
      color: #fff;
      box-sizing: border-box;
      width: 100%;
      user-select: none;
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none;     /* IE/Edge */
      -moz-user-select: none;    /* Firefox */
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-drag: none;
      pointer-events: auto;
      caret-color: transparent;
    }
    
    #text:not(:focus) {
      text-overflow: ellipsis;
    }
    
    :host([filtered]) {
      weight-knob { 
        opacity: 0.5;
      }
      #text {
        background: #da2000;
        z-index: 1;
      }
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      .prompt {
        padding: 0;
        transform: scale(0.765); /* Diminuído de 0.85 para 0.765 (10% menor) */
        transform-origin: center;
      }
      
      weight-knob {
        width: 70%;
        margin-bottom: 0.75vmin;
      }
      
      #midi {
        font-size: 1.5vmin;
        border: 0.2vmin solid #fff;
        border-radius: 0.5vmin;
        padding: 2px 5px;
        margin-top: 0.75vmin;
        min-width: auto;
      }
      
      #text {
        font-size: 1.8vmin;
        max-width: 14vmin;
        min-width: 2vmin;
        padding: 0.1em 0.3em;
        margin-top: 0.5vmin;
        width: auto;
      }
    }
    
    /* Mobile landscape */
    @media (max-width: 767px) and (orientation: landscape) {
      .prompt {
        padding: 5px;
        transform: scale(0.9);
        transform-origin: center;
      }
      
      weight-knob {
        width: 75%;
        margin-bottom: 6px;
      }
      
      #midi {
        font-size: 9px;
        padding: 1px 3px;
        margin-top: 3px;
        min-width: 25px;
      }
      
      #text {
        font-size: 11px;
        padding: 3px 5px;
        margin-top: 3px;
      }
    }
    
    /* Mobile portrait */
    @media (max-width: 767px) and (orientation: portrait) {
      .prompt {
        padding: 7px;
        transform: scale(0.9);
        transform-origin: center;
      }
      
      weight-knob {
        width: 80%;
        margin-bottom: 8px;
      }
      
      #midi {
        font-size: 10px;
        padding: 2px 4px;
        margin-top: 4px;
        min-width: 30px;
      }
      
      #text {
        font-size: 12px;
        padding: 4px 6px;
        margin-top: 4px;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      .prompt {
        padding: 5px;
        transform: scale(0.9);
        transform-origin: center;
      }
      
      weight-knob {
        width: 75%;
        margin-bottom: 6px;
      }
      
      #midi {
        font-size: 9px;
        padding: 1px 3px;
        margin-top: 3px;
        min-width: 25px;
      }
      
      #text {
        font-size: 11px;
        padding: 3px 5px;
        margin-top: 3px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      .prompt {
        padding: 4px;
        transform: scale(0.9);
        transform-origin: center;
      }
      
      weight-knob {
        width: 70%;
        margin-bottom: 4px;
      }
      
      #midi {
        font-size: 8px;
        padding: 1px 2px;
        margin-top: 2px;
        min-width: 20px;
      }
      
      #text {
        font-size: 10px;
        padding: 2px 4px;
        margin-top: 2px;
      }
    }
  `;

  @property({ type: String }) promptId = '';
  @property({ type: String }) text = '';
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '';
  @property({ type: Boolean, reflect: true }) filtered = false;

  @property({ type: Number }) cc = 0;
  @property({ type: Number }) channel = 0; // Not currently used

  @property({ type: Boolean }) learnMode = false;
  @property({ type: Boolean }) showCC = false;

  @query('weight-knob') private weightInput!: WeightKnob;
  @query('#text') private textInput!: HTMLInputElement;

  @property({ type: Object })
  midiDispatcher: MidiDispatcher | null = null;

  @property({ type: Number }) audioLevel = 0;

  private lastValidText!: string;

  override connectedCallback() {
    super.connectedCallback();
    this.midiDispatcher?.addEventListener('cc-message', (e: Event) => {
      const customEvent = e as CustomEvent<ControlChange>;
      const { channel, cc, value } = customEvent.detail;
      if (this.learnMode) {
        this.cc = cc;
        this.channel = channel;
        this.learnMode = false;
        this.dispatchPromptChange();
      } else if (cc === this.cc) {
        this.weight = (value / 127) * 2;
        this.dispatchPromptChange();
      }
    });
  }

  override firstUpdated() {
    // contenteditable is applied to textInput so we can "shrink-wrap" to text width
    // It's set here and not render() because Lit doesn't believe it's a valid attribute.
    this.textInput.setAttribute('contenteditable', 'plaintext-only');

    // contenteditable will do weird things if this is part of the template.
    this.textInput.textContent = this.text;
    this.lastValidText = this.text;
  }

  update(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('showCC') && !this.showCC) {
      this.learnMode = false;
    }
    if (changedProperties.has('text') && this.textInput) {
      this.textInput.textContent = this.text;
    }
    super.update(changedProperties);
  }

  private dispatchPromptChange() {
    this.dispatchEvent(
      new CustomEvent<Prompt>('prompt-changed', {
        detail: {
          promptId: this.promptId,
          text: this.text,
          weight: this.weight,
          cc: this.cc,
          color: this.color,
        },
      }),
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.textInput.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.resetText();
      this.textInput.blur();
    }
  }

  private resetText() {
    this.text = this.lastValidText;
    this.textInput.textContent = this.lastValidText;
  }

  private async updateText() {
    const newText = this.textInput.textContent?.trim();
    if (!newText) {
      this.resetText();
    } else {
      this.text = newText;
      this.lastValidText = newText;
    }
    this.dispatchPromptChange();
    // Show the prompt from the beginning if it's cropped
    this.textInput.scrollLeft = 0;
  }

  private onFocus() {
    // Não mostrar cursor nem seleção ao receber foco
    // Apenas permitir edição quando o usuário começar a digitar
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }

  private updateWeight() {
    this.weight = this.weightInput.value;
    this.dispatchPromptChange();
  }

  private toggleLearnMode() {
    this.learnMode = !this.learnMode;
  }

  override render() {
    const classes = classMap({
      'prompt': true,
      'learn-mode': this.learnMode,
      'show-cc': this.showCC,
    });
    return html`<div class=${classes}>
      <weight-knob
        id="weight"
        value=${this.weight}
        color=${this.filtered ? '#888' : this.color}
        audioLevel=${this.filtered ? 0 : this.audioLevel}
        @input=${this.updateWeight}></weight-knob>
      <span
        id="text"
        spellcheck="false"
        @focus=${this.onFocus}
        @keydown=${this.onKeyDown}
        @blur=${this.updateText}></span>
      <div id="midi" @click=${this.toggleLearnMode}>
        ${this.learnMode ? 'Learn' : `CC:${this.cc}`}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompt-controller': PromptController;
  }
} 
