/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Favorite, MusicPreset, Prompt, ThemeMode } from '../types';

export class FavoritesManager extends EventTarget {
  private favorites: Map<string, Favorite> = new Map();
  private storageKey = 'dj-app-favorites';
  private sessionManager: any = null;

  constructor(sessionManager?: any) {
    super();
    this.sessionManager = sessionManager;
    this.loadFavorites();
  }

  private loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const favoritesArray = JSON.parse(stored);
        this.favorites.clear();
        
        favoritesArray.forEach((fav: any) => {
          // Converter prompts de volta para Map
          const promptsMap = new Map<string, Prompt>();
          if (fav.preset.prompts) {
            Object.entries(fav.preset.prompts).forEach(([key, prompt]: [string, any]) => {
              promptsMap.set(key, prompt as Prompt);
            });
          }
          
          const favorite: Favorite = {
            ...fav,
            preset: {
              ...fav.preset,
              prompts: promptsMap
            }
          };
          
          this.favorites.set(favorite.id, favorite);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }

  private saveFavorites() {
    try {
      // Converter Map para objeto para serialização
      const favoritesArray = Array.from(this.favorites.values()).map(fav => ({
        ...fav,
        preset: {
          ...fav.preset,
          prompts: Object.fromEntries(fav.preset.prompts)
        }
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }

  public createFavorite(name: string, prompts: Map<string, Prompt>, volume: number, theme: ThemeMode): Favorite {
    const id = `favorite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // CORREÇÃO: Criar cópia profunda real dos prompts para evitar referências
    const promptsCopy = new Map<string, Prompt>();
    prompts.forEach((prompt, key) => {
      promptsCopy.set(key, {
        promptId: prompt.promptId,
        text: prompt.text,
        weight: prompt.weight,
        cc: prompt.cc,
        color: prompt.color
      });
    });
    
    const preset: MusicPreset = {
      prompts: promptsCopy,
      volume,
      timestamp
    };

    const favorite: Favorite = {
      id,
      name,
      preset,
      theme,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.favorites.set(id, favorite);
    this.saveFavorites();
    
    // Sincronizar com o SessionManager se disponível
    if (this.sessionManager) {
      this.sessionManager.addFavoriteToSession(favorite);
    }
    
    this.dispatchEvent(new CustomEvent('favorites-changed', {
      detail: { favorites: this.getAllFavorites() }
    }));

    return favorite;
  }

  public updateFavorite(id: string, name: string): boolean {
    const favorite = this.favorites.get(id);
    if (!favorite) return false;

    favorite.name = name;
    favorite.updatedAt = Date.now();
    
    this.saveFavorites();
    
    // Sincronizar com o SessionManager se disponível
    if (this.sessionManager) {
      this.sessionManager.updateFavoriteInSession(id, name);
    }
    
    this.dispatchEvent(new CustomEvent('favorites-changed', {
      detail: { favorites: this.getAllFavorites() }
    }));

    return true;
  }

  public deleteFavorite(id: string): boolean {
    const deleted = this.favorites.delete(id);
    if (deleted) {
      this.saveFavorites();
      
      // Sincronizar com o SessionManager se disponível
      if (this.sessionManager) {
        this.sessionManager.removeFavoriteFromSession(id);
      }
      
      this.dispatchEvent(new CustomEvent('favorites-changed', {
        detail: { favorites: this.getAllFavorites() }
      }));
    }
    
    return deleted;
  }

  public getFavorite(id: string): Favorite | undefined {
    return this.favorites.get(id);
  }

  public getAllFavorites(): Favorite[] {
    return Array.from(this.favorites.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getFavoritesByTheme(theme: ThemeMode): Favorite[] {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.theme === theme)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getFavoriteByPreset(prompts: Map<string, Prompt>, volume: number): Favorite | undefined {
    // Buscar favorito com configuração similar
    for (const favorite of this.favorites.values()) {
      // CORREÇÃO: Criar cópia profunda dos prompts atuais para comparação
      const currentPromptsCopy = new Map<string, Prompt>();
      prompts.forEach((prompt, key) => {
        currentPromptsCopy.set(key, {
          promptId: prompt.promptId,
          text: prompt.text,
          weight: prompt.weight,
          cc: prompt.cc,
          color: prompt.color
        });
      });
      
      if (this.presetsAreSimilar(favorite.preset, { prompts: currentPromptsCopy, volume, timestamp: Date.now() })) {
        return favorite;
      }
    }
    return undefined;
  }

  private presetsAreSimilar(preset1: MusicPreset, preset2: MusicPreset): boolean {
    // Verificar se os prompts são similares (mesmos IDs ativos com mesmo peso)
    const activePrompts1 = Array.from(preset1.prompts.entries())
      .filter(([_, prompt]) => prompt.weight > 0)
      .map(([id, prompt]) => ({ id, weight: prompt.weight }))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    const activePrompts2 = Array.from(preset2.prompts.entries())
      .filter(([_, prompt]) => prompt.weight > 0)
      .map(([id, prompt]) => ({ id, weight: prompt.weight }))
      .sort((a, b) => a.id.localeCompare(b.id));
    
    if (activePrompts1.length !== activePrompts2.length) {
      return false;
    }
    
    // Verificar se todos os prompts ativos têm o mesmo peso
    for (let i = 0; i < activePrompts1.length; i++) {
      if (activePrompts1[i].id !== activePrompts2[i].id || 
          Math.abs(activePrompts1[i].weight - activePrompts2[i].weight) > 0.01) {
        return false;
      }
    }
    
    // Verificar se volume é similar (tolerância menor para ser mais preciso)
    const volumeDiff = Math.abs(preset1.volume - preset2.volume);
    if (volumeDiff > 0.05) {
      return false;
    }
    
    return true;
  }

  public clearAll(): void {
    this.favorites.clear();
    this.saveFavorites();
    
    this.dispatchEvent(new CustomEvent('favorites-changed', {
      detail: { favorites: this.getAllFavorites() }
    }));
  }

  public getFavoritesCount(): number {
    return this.favorites.size;
  }

  public exportFavorites(): string {
    try {
      const favoritesArray = Array.from(this.favorites.values()).map(fav => ({
        ...fav,
        preset: {
          ...fav.preset,
          prompts: Object.fromEntries(fav.preset.prompts)
        }
      }));
      
      return JSON.stringify(favoritesArray, null, 2);
    } catch (error) {
      console.error('Erro ao exportar favoritos:', error);
      return '';
    }
  }

  public importFavorites(jsonData: string): boolean {
    try {
      const favoritesArray = JSON.parse(jsonData);
      if (!Array.isArray(favoritesArray)) return false;
      
      this.favorites.clear();
      
      favoritesArray.forEach((fav: any) => {
        if (fav.id && fav.name && fav.preset) {
          // Converter prompts de volta para Map
          const promptsMap = new Map<string, Prompt>();
          if (fav.preset.prompts) {
            Object.entries(fav.preset.prompts).forEach(([key, prompt]: [string, any]) => {
              promptsMap.set(key, prompt as Prompt);
            });
          }
          
          const favorite: Favorite = {
            ...fav,
            preset: {
              ...fav.preset,
              prompts: promptsMap
            }
          };
          
          this.favorites.set(favorite.id, favorite);
        }
      });
      
      this.saveFavorites();
      
      this.dispatchEvent(new CustomEvent('favorites-changed', {
        detail: { favorites: this.getAllFavorites() }
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao importar favoritos:', error);
      return false;
    }
  }
}
