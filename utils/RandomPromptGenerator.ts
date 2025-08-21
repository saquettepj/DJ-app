/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GoogleGenAI, LiveMusicSession } from '@google/genai';
import type { Prompt } from '../types';

export class RandomPromptGenerator extends EventTarget {
  private ai: GoogleGenAI;
  private model: string;
  private session: LiveMusicSession | null = null;
  private isGenerating = false;
  private intervalId: number | null = null;
  private lastPromptTime: number = 0;
  private currentTheme: 'basic' | 'rpg' = 'basic';

  constructor(ai: GoogleGenAI, model: string) {
    super();
    this.ai = ai;
    this.model = model;
  }

  public async startGenerating(prompts: Map<string, Prompt>) {
    if (this.intervalId) return;
    
    // Gerar primeiro prompt imediatamente
    await this.generateRandomPrompt(prompts);
    
    // Configurar intervalo para gerar a cada 2 minutos
    this.intervalId = window.setInterval(async () => {
      await this.generateRandomPrompt(prompts);
    }, 2 * 60 * 1000); // 2 minutos
    
    this.dispatchEvent(new CustomEvent('generation-started'));
  }

  public stopGenerating() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.dispatchEvent(new CustomEvent('generation-stopped'));
  }

  private async generateRandomPrompt(prompts: Map<string, Prompt>) {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    this.dispatchEvent(new CustomEvent('generation-started'));
    
    try {
      // Gerar múltiplos prompts aleatórios
      const newPrompts = await this.generateMultiplePromptsWithAI();
      if (newPrompts && newPrompts.length > 0) {
        this.applyRandomConfiguration(prompts, newPrompts);
        this.dispatchEvent(new CustomEvent('prompt-generated', { detail: newPrompts.join(', ') }));
      }
    } catch (error) {
      this.dispatchEvent(new CustomEvent('generation-error', { detail: error.message }));
    } finally {
      this.isGenerating = false;
      this.dispatchEvent(new CustomEvent('generation-finished'));
    }
  }

  private async generateMultiplePromptsWithAI(): Promise<string[]> {
    try {
      // Usar exatamente os mesmos prompts do index.tsx baseados no tema atual
      let themePrompts: string[] = [];
      
      if (this.currentTheme === 'rpg') {
        // Prompts RPG exatamente como definidos no index.tsx
        themePrompts = [
          'Epic Battle',
          'Mystical Forest',
          'Dimensional Portal',
          'Lost Treasure',
          'Elf Village',
          'Dark Forest',
          'Soft Fire',
          'Legendary Warrior',
          'Sacred Temple',
          'Mythical Beast',
          'Cave',
          'Tribal Drums',
          'Horror Scream',
          'Heroic legend',
          'Angelical Cry',
          'Choral'
        ];
      } else {
        // Prompts Basic exatamente como definidos no index.tsx
        themePrompts = [
          'Bossa Nova',
          'Chillwave',
          'Drum and Bass',
          'Post Punk',
          'Shoegaze',
          'Funk',
          'Chiptune',
          'Lush Strings',
          'Sparkling Arpeggios',
          'Staccato Rhythms',
          'Punchy Kick',
          'Dubstep',
          'K Pop',
          'Neo Soul',
          'Trip Hop',
          'Thrash'
        ];
      }
      
      // Escolher prompts aleatórios únicos
      const selectedPrompts = themePrompts.slice(0, 16); // Pegar 16 prompts únicos
      
      // Simular delay de IA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return selectedPrompts;
    } catch (error) {
      return [];
    }
  }

  private applyRandomConfiguration(prompts: Map<string, Prompt>, newPromptTexts: string[]) {
    // Registrar o tempo da última configuração
    this.lastPromptTime = Date.now();
    
    // Limpar todos os prompts existentes
    prompts.clear();
    

    // Criar nova configuração aleatória usando as cores originais do index.tsx
    newPromptTexts.forEach((text, index) => {
      const promptId = `prompt-${index}`;
      
      // Usar as cores originais do index.tsx baseadas no tema
      let color: string;
      if (this.currentTheme === 'rpg') {
        // Cores RPG do index.tsx
        const rpgColors = [
          '#8B0000', '#4B0082', '#00CED1', '#FFD700', '#32CD32', '#20B2AA',
          '#FF8C00', '#DC143C', '#8A2BE2', '#FF1493', '#2F4F4F', '#8B4513',
          '#DC143C', '#800080', '#87CEEB', '#DDA0DD'
        ];
        color = rpgColors[index] || '#9900ff'; // fallback se index > 15
      } else {
        // Cores Basic do index.tsx
        const basicColors = [
          '#9900ff', '#5200ff', '#ff25f6', '#2af6de', '#ffdd28', '#2af6de',
          '#9900ff', '#3dffab', '#d8ff3e', '#d9b2ff', '#3dffab', '#ffdd28',
          '#ff25f6', '#d8ff3e', '#5200ff', '#d9b2ff'
        ];
        color = basicColors[index] || '#9900ff'; // fallback se index > 15
      }
      
      // Gerar peso aleatório com 20% de chance de estar desativado
      const randomWeight = Math.random() < (this.currentTheme === 'rpg' ? 0.5 : 0.4) ? 0 : Math.random();
      
      // Usar o CC original do index.tsx (0 a 15)
      const randomCC = index;
      
      prompts.set(promptId, {
        promptId,
        text,
        weight: randomWeight,
        cc: randomCC,
        color: color,
      });
    });
    
    // Salvar no localStorage
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(prompts.entries())));
  }

  public setTheme(theme: 'basic' | 'rpg') {
    this.currentTheme = theme;
  }

  public forceGenerate(prompts: Map<string, Prompt>) {
    // Força a geração sempre, independente do estado
    this.generateRandomPrompt(prompts);
  }

  public isActive(): boolean {
    return this.intervalId !== null;
  }

  public getTimeUntilNext(): number {
    if (!this.intervalId) return 0;
    
    // Calcular tempo baseado no último prompt gerado
    const now = Date.now();
    const lastPromptTime = this.lastPromptTime || now;
    const intervalMs = 2 * 60 * 1000; // 2 minutos em milissegundos
    
    const timeSinceLastPrompt = now - lastPromptTime;
    const timeUntilNext = Math.max(0, intervalMs - timeSinceLastPrompt);
    
    return Math.ceil(timeUntilNext / 1000); // Retorna em segundos
  }
}
