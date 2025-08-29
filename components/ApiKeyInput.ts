/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { GoogleGenAI } from '@google/genai';

@customElement('api-key-input')
export class ApiKeyInput extends LitElement {

  @property({ type: String }) apiKey: string = '';
  @state() private inputValue: string = '';
  @state() private isConfigured: boolean = false;
  @state() private isValidating: boolean = false;
  @state() private validationError: string = '';

  override connectedCallback() {
    super.connectedCallback();
    // Carregar a última chave que funcionou ou da sessão atual
    this.loadApiKey();
  }

  private loadApiKey() {
    // Primeiro, tentar carregar de uma sessão existente
    const currentSessionId = localStorage.getItem('dj-app-current-session');
    if (currentSessionId) {
      const sessionsData = localStorage.getItem('dj-app-sessions');
      if (sessionsData) {
        try {
          const sessions = JSON.parse(sessionsData);
          const currentSession = sessions.find((s: any) => s.id === currentSessionId);
          if (currentSession && currentSession.apiKey) {
            this.inputValue = currentSession.apiKey;
            this.requestUpdate();
            return;
          }
        } catch (error) {
          console.error('Erro ao carregar sessão:', error);
        }
      }
    }
    
    // Se não houver sessão, carregar a última chave que funcionou
    this.loadLastWorkingKey();
  }

  private loadLastWorkingKey() {
    const lastWorkingKey = localStorage.getItem('gemini_last_working_key');
    if (lastWorkingKey && lastWorkingKey.trim().length > 20) {
      this.inputValue = lastWorkingKey;
      this.requestUpdate();
    }
  }

  private checkExistingSession(apiKey: string): any | null {
    try {
      const sessionsData = localStorage.getItem('dj-app-sessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        return sessions.find((s: any) => s.apiKey === apiKey) || null;
      }
    } catch (error) {
      console.error('Erro ao verificar sessão existente:', error);
    }
    return null;
  }

  private saveLastWorkingKey(apiKey: string) {
    // Salvar apenas a última chave que funcionou
    localStorage.setItem('gemini_last_working_key', apiKey);
  }

  static override styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'Google Sans', sans-serif;
      padding: 20px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .api-key-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px;
      max-width: 450px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      box-sizing: border-box;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }

    .logo {
      font-size: 48px;
      margin-bottom: 20px;
      display: block;
    }

    .title {
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .input-group {
      margin-bottom: 25px;
      text-align: left;
    }

    label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      display: block;
    }

    input {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      color: white;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .save-button {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .save-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
    }

    .save-button:active {
      transform: translateY(0);
    }

    .save-button:disabled {
      background: rgba(255, 255, 255, 0.2);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .save-button.validating {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    }

    .status-indicator {
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
      font-size: 14px;
      opacity: 0.8;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4CAF50;
    }

    .status-dot.invalid {
      background: #f44336;
    }

    .status-dot.empty {
      background: #ff9800;
    }

    .status-dot.validating {
      background: #2196F3;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .error-message {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-top: 15px;
      font-size: 14px;
      text-align: left;
    }

    .hidden {
      display: none !important;
    }

    .fade-out {
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    /* Mobile styles */
    @media (max-width: 767px) {
      :host {
        padding: 16px;
        overflow: hidden;
      }
      
      .api-key-card {
        padding: 24px 20px;
        border-radius: 16px;
        max-width: none;
        width: 100%;
        max-height: calc(100vh - 32px);
        overflow-y: auto;
      }
      
      .logo {
        font-size: 40px;
        margin-bottom: 16px;
      }
      
      .title {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .subtitle {
        font-size: 14px;
        margin-bottom: 24px;
        line-height: 1.4;
      }
      
      .input-group {
        margin-bottom: 20px;
      }
      
      input {
        padding: 14px 16px;
        font-size: 16px;
      }
      
      .save-button {
        padding: 14px 16px;
        font-size: 16px;
        margin-top: 8px;
      }
      
      .status-indicator {
        margin-top: 16px;
        font-size: 13px;
      }
      
      .error-message {
        padding: 10px;
        margin-top: 12px;
        font-size: 13px;
      }
    }
    
    /* Mobile landscape - orientação horizontal */
    @media (max-width: 767px) and (orientation: landscape) {
      :host {
        padding: 8px;
        align-items: center;
        justify-content: center;
        padding-top: 0;
        height: 100vh;
        overflow-y: auto;
      }
      
      .api-key-card {
        padding: 16px 14px;
        border-radius: 12px;
        max-width: 380px;
        margin: 0 auto;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
      }
      
      .logo {
        font-size: 28px;
        margin-bottom: 8px;
      }
      
      .title {
        font-size: 18px;
        margin-bottom: 4px;
      }
      
      .subtitle {
        font-size: 11px;
        margin-bottom: 12px;
        line-height: 1.2;
      }
      
      .input-group {
        margin-bottom: 12px;
      }
      
      input {
        padding: 10px 12px;
        font-size: 14px;
      }
      
      .save-button {
        padding: 10px 12px;
        font-size: 14px;
        margin-top: 4px;
      }
      
      .status-indicator {
        margin-top: 10px;
        font-size: 11px;
      }
      
      .error-message {
        padding: 6px;
        margin-top: 8px;
        font-size: 11px;
      }
    }
    
    /* Mobile landscape - tela muito pequena */
    @media (max-width: 767px) and (orientation: landscape) and (max-height: 500px) {
      :host {
        padding: 6px;
        padding-top: 0;
        align-items: center;
        justify-content: center;
      }
      
      .api-key-card {
        padding: 12px 10px;
        border-radius: 10px;
        max-width: 320px;
        max-height: calc(100vh - 16px);
      }
      
      .logo {
        font-size: 24px;
        margin-bottom: 6px;
      }
      
      .title {
        font-size: 16px;
        margin-bottom: 3px;
      }
      
      .subtitle {
        font-size: 10px;
        margin-bottom: 10px;
        line-height: 1.1;
      }
      
      .input-group {
        margin-bottom: 8px;
      }
      
      input {
        padding: 8px 10px;
        font-size: 13px;
      }
      
      .save-button {
        padding: 8px 10px;
        font-size: 13px;
        margin-top: 3px;
      }
      
      .status-indicator {
        margin-top: 8px;
        font-size: 10px;
      }
      
      .error-message {
        padding: 5px;
        margin-top: 6px;
        font-size: 10px;
      }
    }
    
    /* Mobile landscape - tela extra pequena */
    @media (max-width: 767px) and (orientation: landscape) and (max-height: 400px) {
      :host {
        padding: 4px;
        padding-top: 6px;
      }
      
      .api-key-card {
        padding: 10px 8px;
        border-radius: 8px;
        max-width: 280px;
        max-height: calc(100vh - 12px);
      }
      
      .logo {
        font-size: 20px;
        margin-bottom: 4px;
      }
      
      .title {
        font-size: 14px;
        margin-bottom: 2px;
      }
      
      .subtitle {
        font-size: 9px;
        margin-bottom: 8px;
        line-height: 1.1;
      }
      
      .input-group {
        margin-bottom: 6px;
      }
      
      input {
        padding: 6px 8px;
        font-size: 12px;
      }
      
      .save-button {
        padding: 6px 8px;
        font-size: 12px;
        margin-top: 2px;
      }
      
      .status-indicator {
        margin-top: 6px;
        font-size: 9px;
      }
      
      .error-message {
        padding: 4px;
        margin-top: 4px;
        font-size: 9px;
      }
    }
    
    /* Mobile landscape - tela extremamente pequena */
    @media (max-width: 767px) and (orientation: landscape) and (max-height: 300px) {
      :host {
        padding: 2px;
        padding-top: 4px;
      }
      
      .api-key-card {
        padding: 8px 6px;
        border-radius: 6px;
        max-width: 240px;
        max-height: calc(100vh - 8px);
      }
      
      .logo {
        font-size: 18px;
        margin-bottom: 3px;
      }
      
      .title {
        font-size: 12px;
        margin-bottom: 1px;
      }
      
      .subtitle {
        font-size: 8px;
        margin-bottom: 6px;
        line-height: 1.0;
      }
      
      .input-group {
        margin-bottom: 4px;
      }
      
      input {
        padding: 5px 6px;
        font-size: 11px;
      }
      
      .save-button {
        padding: 5px 6px;
        font-size: 11px;
        margin-top: 1px;
      }
      
      .status-indicator {
        margin-top: 4px;
        font-size: 8px;
      }
      
      .error-message {
        padding: 3px;
        margin-top: 3px;
        font-size: 8px;
      }
    }
    
    /* Small mobile */
    @media (max-width: 480px) {
      :host {
        padding: 12px;
        overflow: hidden;
      }
      
      .api-key-card {
        padding: 20px 16px;
        border-radius: 14px;
        max-height: calc(100vh - 24px);
        overflow-y: auto;
      }
      
      .logo {
        font-size: 36px;
        margin-bottom: 14px;
      }
      
      .title {
        font-size: 22px;
        margin-bottom: 6px;
      }
      
      .subtitle {
        font-size: 13px;
        margin-bottom: 20px;
      }
      
      .input-group {
        margin-bottom: 18px;
      }
      
      input {
        padding: 12px 14px;
        font-size: 15px;
      }
      
      .save-button {
        padding: 12px 14px;
        font-size: 15px;
      }
    }
    
    /* Extra small mobile */
    @media (max-width: 360px) {
      :host {
        padding: 8px;
        overflow: hidden;
      }
      
      .api-key-card {
        padding: 16px 12px;
        border-radius: 12px;
        max-height: calc(100vh - 16px);
        overflow-y: auto;
      }
      
      .logo {
        font-size: 32px;
        margin-bottom: 12px;
      }
      
      .title {
        font-size: 20px;
        margin-bottom: 4px;
      }
      
      .subtitle {
        font-size: 12px;
        margin-bottom: 16px;
      }
      
      .input-group {
        margin-bottom: 16px;
      }
      
      input {
        padding: 10px 12px;
        font-size: 14px;
      }
      
      .save-button {
        padding: 10px 12px;
        font-size: 14px;
      }
    }
  `;

  private async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim(), apiVersion: 'v1alpha' });
      
      // Usar exatamente a mesma lógica que o LiveMusicHelper usa
      // para capturar erros de API Key inválida
      const validationPromise = new Promise<boolean>((resolve, reject) => {
        let resolved = false;
        let session: any = null;
        
        // Timeout de 10 segundos para dar tempo suficiente
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (session && typeof session.close === 'function') {
              session.close();
            }
            reject(new Error('API Key não respondeu - provavelmente inválida'));
          }
        }, 10000);
        
        // Usar exatamente os mesmos callbacks do LiveMusicHelper
        ai.live.music.connect({
          model: 'lyria-realtime-exp',
          callbacks: {
            onmessage: async (e: any) => {
              if (e.setupComplete && !resolved) {
                resolved = true;
                clearTimeout(timeout);
                if (session && typeof session.close === 'function') {
                  session.close();
                }
                resolve(true);
              }
            },
            onerror: (error: any) => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                if (session && typeof session.close === 'function') {
                  session.close();
                }
                reject(new Error('API Key inválida - erro de conexão'));
              }
            },
            onclose: () => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                reject(new Error('API Key inválida - conexão fechada'));
              }
            },
          },
        }).then((createdSession) => {
          session = createdSession;
          // Não resolver aqui - aguardar o setupComplete no onmessage
        }).catch((error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(error);
          }
        });
      });
      
      await validationPromise;
      return true;
      
    } catch (error) {
      
      // Usar mensagens de erro mais específicas baseadas no que realmente acontece
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('api key inválida') || 
            errorMessage.includes('conexão fechada') ||
            errorMessage.includes('não respondeu') ||
            errorMessage.includes('erro de conexão')) {
          this.validationError = 'API Key inválida ou inexistente. Verifique se a chave está correta.';
        } else {
          this.validationError = `Erro na validação: ${error.message}`;
        }
      } else {
        this.validationError = 'API Key inválida ou erro desconhecido.';
      }
      
      return false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.inputValue = target.value;
    this.validationError = ''; // Limpar erro ao digitar
  }

  private async saveApiKey() {
    const trimmedKey = this.inputValue.trim();
    
    if (trimmedKey && trimmedKey.length > 20) {
      // Validação básica de formato
      if (!this.isValidApiKeyFormat(trimmedKey)) {
        this.validationError = 'Formato da API Key inválido. Deve começar com "AI" e conter apenas letras, números e hífens.';
        return;
      }
      
      this.isValidating = true;
      this.validationError = '';
      
      // Validar a API Key
      const isValid = await this.validateApiKey(trimmedKey);
      
      if (isValid) {
        // API Key válida, salvar no histórico e continuar
        this.saveLastWorkingKey(trimmedKey);
        this.apiKey = trimmedKey;
        this.isConfigured = true;
        
        // Verificar se já existe uma sessão com esta API Key
        const existingSession = this.checkExistingSession(trimmedKey);
        if (existingSession) {
          console.log('Sessão existente encontrada, restaurando favoritos...');
        }
        
        this.dispatchApiKeyChange(trimmedKey);
        
        // Fazer fade out do card e remover completamente
        const card = this.shadowRoot?.querySelector('.api-key-card');
        if (card) {
          card.classList.add('fade-out');
          setTimeout(() => {
            // Remover completamente o componente do DOM
            if (this.parentNode) {
              this.parentNode.removeChild(this);
            }
          }, 500);
        }
      } else {
        // API Key inválida, mostrar erro
        this.isValidating = false;
        this.requestUpdate();
      }
    }
  }

  private isValidApiKeyFormat(apiKey: string): boolean {
    // API Keys do Google Gemini geralmente começam com "AI" e contêm apenas letras, números e hífens
    const apiKeyPattern = /^AI[a-zA-Z0-9\-_]{20,}$/;
    return apiKeyPattern.test(apiKey);
  }

  private dispatchApiKeyChange(apiKey: string) {
    const event = new CustomEvent('api-key-changed', {
      detail: { apiKey },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private getStatusInfo() {
    if (this.isValidating) {
      return { text: 'Validando API Key...', class: 'validating' };
    }
    if (!this.inputValue) {
      return { text: 'Digite sua chave da API', class: 'empty' };
    }
    if (this.inputValue.length < 20) {
      return { text: 'Chave muito curta', class: 'invalid' };
    }
    if (!this.isValidApiKeyFormat(this.inputValue)) {
      return { text: 'Formato inválido', class: 'invalid' };
    }
    return { text: 'Chave válida', class: 'valid' };
  }

  private canSave() {
    const trimmedKey = this.inputValue.trim();
    return trimmedKey.length > 20 && 
           this.isValidApiKeyFormat(trimmedKey) && 
           !this.isValidating;
  }

  override render() {
    if (this.isConfigured) {
      return html``;
    }

    const status = this.getStatusInfo();
    
    return html`
      <div class="api-key-card">
        <div class="logo">🎵</div>
        <p class="subtitle">
          Configure sua chave da API do Google Gemini para começar a criar música com IA
        </p>
        
        <div class="input-group">
          <label for="api-key-input">Chave da API Gemini</label>
          <input
            id="api-key-input"
            type="password"
            .value=${this.inputValue}
            @input=${this.handleInputChange}
            placeholder="Cole sua chave da API aqui..."
            autocomplete="off"
            ?disabled=${this.isValidating}
          />
        </div>
        
        <button 
          class="save-button ${this.isValidating ? 'validating' : ''}" 
          @click=${this.saveApiKey}
          ?disabled=${!this.canSave()}
        >
          ${this.isValidating ? 'Validando...' : 'Começar a Criar Música'}
        </button>
        
        ${this.validationError ? html`
          <div class="error-message">
            ❌ ${this.validationError}
          </div>
        ` : ''}
        
        <div class="status-indicator">
          <div class="status-dot ${status.class}"></div>
          <span>${status.text}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'api-key-input': ApiKeyInput
  }
}
