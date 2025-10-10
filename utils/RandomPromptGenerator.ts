/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GoogleGenAI, LiveMusicSession } from '@google/genai';
import type { Prompt, ThemeMode } from '../types';

export class RandomPromptGenerator extends EventTarget {
  private ai: GoogleGenAI;
  private model: string;
  private session: LiveMusicSession | null = null;
  private isGenerating = false;
  private intervalId: number | null = null;
  private lastPromptTime: number = 0;
  private currentTheme: ThemeMode = 'basic';

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
      // Em vez de gerar novos prompts, usar os prompts existentes e reorganizá-los
      const existingPrompts = Array.from(prompts.values());
      if (existingPrompts.length > 0) {
        const promptTexts = existingPrompts.map(prompt => prompt.text);
        this.applyRandomConfiguration(prompts, promptTexts);
        this.dispatchEvent(new CustomEvent('prompt-generated', { detail: 'Prompts reorganizados' }));
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
          'Choral',
          'Dragon Lair',
          'Enchanted Garden'
        ];
      } else if (this.currentTheme === 'relax') {
        // Prompts Relax exatamente como definidos no index.tsx
        themePrompts = [
          'Ocean Waves',
          'Gentle Rain',
          'Silence Flowers',
          'Calm Sunset',
          'Soft Clouds',
          'Morning Mist',
          'Calm Piano',
          'Calm Guitar',
          'Slow Morning',
          'Soft Flute',
          'Forest Calm',
          'Slow Dreams',
          'Peaceful Lute',
          'Relaxing Sky',
          'Quiet Wind',
          'Soothing Drops',
          'Peach Fuzz',
          'Peaceful Ocarina'
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
          'Thrash',
          'Ambient',
          'Synthwave'
        ];
      }
      
      // Escolher prompts aleatórios únicos
      const selectedPrompts = themePrompts.slice(0, 18); // Pegar 18 prompts únicos
      
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
        // Cores RPG atualizadas e na ordem correta
        const rpgColors = [
          '#8B0000', '#004225', '#9400D3', '#FFD700', '#2E8B57', '#000080',
          '#FF8C00', '#4682B4', '#8A2BE2', '#483D8B', '#2F4F4F', '#8B4513',
          '#DC143C', '#4B0082', '#FFFACD', '#E6E6FA', '#B22222', '#00FA9A'
        ];
        color = rpgColors[index] || '#9900ff'; // fallback
      } else if (this.currentTheme === 'relax') {
        // Cores Relax atualizadas e na ordem correta
        const relaxColors = [
          '#68A0B2', '#B0C4DE', '#DDA0DD', '#FBC4AB', '#F0F8FF', '#B0E0E6',
          '#F5DEB3', '#CD853F', '#98D8C8', '#C0D6E4', '#556B2F', '#E0B0FF',
          '#D2B48C', '#87CEFA', '#E5E4E2', '#A2D0C1', '#B87333', '#E5A774'
        ];
        color = relaxColors[index] || '#87CEEB'; // fallback
      } else {
        // Cores Default (Basic) atualizadas e na ordem correta
        const defaultColors = [
          '#F4A261', '#E07A5F', '#0029FF', '#A40E4C', '#A2D2FF', '#F77F00',
          '#4ADE80', '#C9B464', '#FFF8B8', '#F038FF', '#333333', '#D8FF3E',
          '#FF70A6', '#3A506B', '#1B4332', '#C81D25', '#AEC6CF', '#FF00E5'
        ];
        color = defaultColors[index] || '#9900ff'; // fallback
      }
      
      // Gerar peso aleatório com 70% - 90% de chance de estar desativado
      const randomWeight = Math.random() < (this.currentTheme === 'rpg' ? 0.85 : this.currentTheme === 'relax' ? 0.90 : 0.80) ? 0 : Math.random();
      
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
    
    // Verifica se todos os prompts resultaram em peso 0.
    const allPrompts = Array.from(prompts.values());
    const allWeightsAreZero = allPrompts.every(prompt => prompt.weight === 0);

    // Se todos os pesos forem zero e houver prompts na lista,
    // escolhe um aleatoriamente e define seu peso para 0.5.
    if (allWeightsAreZero && allPrompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPrompts.length);
      const promptToActivate = allPrompts[randomIndex];
      
      // Atualiza o peso do prompt escolhido
      promptToActivate.weight = 0.5;
      
      // Atualiza o prompt no Map para garantir a consistência
      prompts.set(promptToActivate.promptId, promptToActivate);
    }
    
    // Salvar no localStorage
    localStorage.setItem('promptDjMidi-prompts', JSON.stringify(Array.from(prompts.entries())));
  }

  public setTheme(theme: ThemeMode) {
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
