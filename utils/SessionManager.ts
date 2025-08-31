/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Favorite, ThemeMode, Session } from '../types';

export class SessionManager extends EventTarget {
  private currentSession: Session | null = null;
  private sessions: Map<string, Session> = new Map();
  private storageKey = 'dj-app-sessions';
  private currentSessionKey = 'dj-app-current-session';

  constructor() {
    super();
    this.loadSessions();
    this.loadCurrentSession();
  }

  private loadSessions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const sessionsArray = JSON.parse(stored);
        this.sessions.clear();
        
        sessionsArray.forEach((sessionData: any) => {
          // Converter favoritos de volta para objetos Favorite
          const favorites: Favorite[] = sessionData.favorites.map((fav: any) => {
            // Converter prompts de volta para Map
            const promptsMap = new Map<string, any>();
            if (fav.preset.prompts) {
              Object.entries(fav.preset.prompts).forEach(([key, prompt]: [string, any]) => {
                promptsMap.set(key, prompt);
              });
            }
            
            return {
              ...fav,
              preset: {
                ...fav.preset,
                prompts: promptsMap
              }
            };
          });
          
          const session: Session = {
            ...sessionData,
            favorites
          };
          
          this.sessions.set(session.id, session);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  }

  private saveSessions() {
    try {
      // Converter Map para array e serializar favoritos
      const sessionsArray = Array.from(this.sessions.values()).map(session => ({
        ...session,
        favorites: session.favorites.map(fav => ({
          ...fav,
          preset: {
            ...fav.preset,
            prompts: Object.fromEntries(fav.preset.prompts)
          }
        }))
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(sessionsArray));
    } catch (error) {
      console.error('Erro ao salvar sessões:', error);
    }
  }

  private loadCurrentSession() {
    try {
      const currentSessionId = localStorage.getItem(this.currentSessionKey);
      if (currentSessionId && this.sessions.has(currentSessionId)) {
        this.currentSession = this.sessions.get(currentSessionId) || null;
        if (this.currentSession) {
          this.updateSessionActivity(this.currentSession.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão atual:', error);
    }
  }

  private saveCurrentSession() {
    try {
      if (this.currentSession) {
        localStorage.setItem(this.currentSessionKey, this.currentSession.id);
      } else {
        localStorage.removeItem(this.currentSessionKey);
      }
    } catch (error) {
      console.error('Erro ao salvar sessão atual:', error);
    }
  }

  public createSession(apiKey: string, theme: ThemeMode = 'basic'): Session {
    // Se já existe uma sessão com esta API Key, reutilizar
    const existingSession = this.findSessionByApiKey(apiKey);
    
    if (existingSession) {
      // Atualizar a sessão existente
      existingSession.lastActive = Date.now();
      existingSession.theme = theme;
      this.currentSession = existingSession;
      this.saveCurrentSession();
      this.saveSessions();
      
      this.dispatchEvent(new CustomEvent('session-changed', {
        detail: { session: this.currentSession }
      }));
      
      return existingSession;
    }

    // Criar nova sessão
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newSession: Session = {
      id: sessionId,
      apiKey,
      favorites: [],
      createdAt: now,
      lastActive: now,
      theme
    };

    this.sessions.set(sessionId, newSession);
    this.currentSession = newSession;
    
    this.saveCurrentSession();
    this.saveSessions();
    
    this.dispatchEvent(new CustomEvent('session-changed', {
      detail: { session: this.currentSession }
    }));
    
    return newSession;
  }

  public switchSession(apiKey: string, theme: ThemeMode = 'basic'): Session {
    // Limpar sessão anterior se existir
    if (this.currentSession) {
      this.clearCurrentSession();
    }
    
    // Criar ou reutilizar sessão com nova API Key
    return this.createSession(apiKey, theme);
  }

  public getCurrentSession(): Session | null {
    return this.currentSession;
  }

  public getCurrentApiKey(): string | null {
    return this.currentSession?.apiKey || null;
  }

  public getCurrentFavorites(): Favorite[] {
    return this.currentSession?.favorites || [];
  }

  public getCurrentTheme(): ThemeMode {
    return this.currentSession?.theme || 'basic';
  }

  public updateSessionActivity(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      this.saveSessions();
    }
  }

  public updateSessionTheme(theme: ThemeMode) {
    if (this.currentSession) {
      this.currentSession.theme = theme;
      this.saveSessions();
      
      this.dispatchEvent(new CustomEvent('session-theme-changed', {
        detail: { theme }
      }));
    }
  }

  public addFavoriteToSession(favorite: Favorite) {
    if (this.currentSession) {
      // Verificar se o favorito já existe na sessão
      const existingIndex = this.currentSession.favorites.findIndex(f => f.id === favorite.id);
      
      if (existingIndex >= 0) {
        // Atualizar favorito existente
        this.currentSession.favorites[existingIndex] = favorite;
      } else {
        // Adicionar novo favorito
        this.currentSession.favorites.push(favorite);
      }
      
      this.saveSessions();
      
      this.dispatchEvent(new CustomEvent('session-favorites-changed', {
        detail: { favorites: this.currentSession.favorites }
      }));
    }
  }

  public removeFavoriteFromSession(favoriteId: string) {
    if (this.currentSession) {
      const index = this.currentSession.favorites.findIndex(f => f.id === favoriteId);
      if (index >= 0) {
        this.currentSession.favorites.splice(index, 1);
        this.saveSessions();
        
        this.dispatchEvent(new CustomEvent('session-favorites-changed', {
          detail: { favorites: this.currentSession.favorites }
        }));
      }
    }
  }

  public updateFavoriteInSession(favoriteId: string, name: string) {
    if (this.currentSession) {
      const favorite = this.currentSession.favorites.find(f => f.id === favoriteId);
      if (favorite) {
        favorite.name = name;
        favorite.updatedAt = Date.now();
        this.saveSessions();
        
        this.dispatchEvent(new CustomEvent('session-favorites-changed', {
          detail: { favorites: this.currentSession.favorites }
        }));
      }
    }
  }

  public clearCurrentSession() {
    if (this.currentSession) {
      // Preservar a API Key e favoritos na sessão
      this.currentSession.lastActive = Date.now();
      this.saveSessions();
      
      // Limpar referência atual
      this.currentSession = null;
      this.saveCurrentSession();
      
      this.dispatchEvent(new CustomEvent('session-cleared'));
    }
  }

  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }

  public findSessionByApiKey(apiKey: string): Session | undefined {
    return Array.from(this.sessions.values()).find(session => session.apiKey === apiKey);
  }

  public deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      // Se era a sessão atual, limpar
      if (this.currentSession?.id === sessionId) {
        this.currentSession = null;
        this.saveCurrentSession();
      }
      
      this.saveSessions();
      
      this.dispatchEvent(new CustomEvent('session-deleted', {
        detail: { sessionId }
      }));
    }
    
    return deleted;
  }

  public clearAllSessions(): void {
    this.sessions.clear();
    this.currentSession = null;
    this.saveCurrentSession();
    this.saveSessions();
    
    this.dispatchEvent(new CustomEvent('all-sessions-cleared'));
  }

  public exportSessions(): string {
    try {
      const sessionsArray = Array.from(this.sessions.values()).map(session => ({
        ...session,
        favorites: session.favorites.map(fav => ({
          ...fav,
          preset: {
            ...fav.preset,
            prompts: Object.fromEntries(fav.preset.prompts)
          }
        }))
      }));
      
      return JSON.stringify(sessionsArray, null, 2);
    } catch (error) {
      console.error('Erro ao exportar sessões:', error);
      return '';
    }
  }

  public importSessions(jsonData: string): boolean {
    try {
      const sessionsArray = JSON.parse(jsonData);
      if (!Array.isArray(sessionsArray)) return false;
      
      this.sessions.clear();
      
      sessionsArray.forEach((sessionData: any) => {
        if (sessionData.id && sessionData.apiKey) {
          // Converter favoritos de volta para objetos Favorite
          const favorites: Favorite[] = sessionData.favorites.map((fav: any) => {
            // Converter prompts de volta para Map
            const promptsMap = new Map<string, any>();
            if (fav.preset.prompts) {
              Object.entries(fav.preset.prompts).forEach(([key, prompt]: [string, any]) => {
                promptsMap.set(key, prompt);
              });
            }
            
            return {
              ...fav,
              preset: {
                ...fav.preset,
                prompts: promptsMap
              }
            };
          });
          
          const session: Session = {
            ...sessionData,
            favorites
          };
          
          this.sessions.set(session.id, session);
        }
      });
      
      this.saveSessions();
      
      this.dispatchEvent(new CustomEvent('sessions-imported', {
        detail: { sessions: this.getAllSessions() }
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao importar sessões:', error);
      return false;
    }
  }
}
