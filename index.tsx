/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlaybackState, Prompt, Favorite, ThemeMode } from './types';
import { GoogleGenAI, LiveMusicFilteredPrompt } from '@google/genai';
import { PromptDjMidi } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';
import { Sidebar } from './components/Sidebar';
import { ApiKeyInput } from './components/ApiKeyInput';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { FavoritesManager } from './utils/FavoritesManager';
import { SessionManager } from './utils/SessionManager';

let currentTheme: ThemeMode = 'basic';
let pdjMidi: PromptDjMidi | null = null;
let liveMusicHelper: LiveMusicHelper | null = null;
let ai: GoogleGenAI;
let model = 'lyria-realtime-exp';
let sessionManager: SessionManager | null = null;
let favoritesManager: FavoritesManager | null = null;
let favoritesSidebar: FavoritesSidebar | null = null;
let selectedFavoriteId: string | null = null;

const DEFAULT_PROMPTS = [
  { color: '#F4A261', text: 'Bossa Nova' },        // Cor quente e praiana, como o Rio de Janeiro
  { color: '#E07A5F', text: 'Chillwave' },         // Tom nostálgico, de pôr do sol desbotado
  { color: '#0029FF', text: 'Drum and Bass' },     // Azul elétrico, futurista e energético
  { color: '#A40E4C', text: 'Post Punk' },         // Sóbrio e intenso, remetendo a capas clássicas
  { color: '#A2D2FF', text: 'Shoegaze' },          // Azul claro e etéreo, como um sonho
  { color: '#F77F00', text: 'Funk' },              // Laranja vibrante e "groovy", anos 70
  { color: '#4ADE80', text: 'Chiptune' },          // Verde pixelado, de videogame 8-bit
  { color: '#C9B464', text: 'Lush Strings' },      // Dourado sofisticado, como uma orquestra
  { color: '#FFF8B8', text: 'Sparkling Arpeggios' }, // Amarelo pálido e brilhante, cintilante
  { color: '#F038FF', text: 'Staccato Rhythms' },  // Magenta agudo e preciso
  { color: '#333333', text: 'Punchy Kick' },       // Cinza escuro, sólido e impactante
  { color: '#D8FF3E', text: 'Dubstep' },           // Verde-limão "tóxico", clássico do gênero
  { color: '#FF70A6', text: 'K Pop' },             // Rosa vibrante, polido e energético
  { color: '#3A506B', text: 'Neo Soul' },          // Azul "jazz", urbano e sofisticado
  { color: '#1B4332', text: 'Trip Hop' },          // Verde escuro e atmosférico, "moody"
  { color: '#C81D25', text: 'Thrash' },            // Vermelho agressivo e cru
  { color: '#AEC6CF', text: 'Ambient' },           // Azul acinzentado, calmo e expansivo
  { color: '#FF00E5', text: 'Synthwave' },         // Magenta neon, estética retrofuturista
];

const RPG_PROMPTS = [
  { color: '#8B0000', text: 'Epic Battle' },       // Vermelho escuro, cor de sangue e fúria
  { color: '#004225', text: 'Mystical Forest' },   // Verde profundo e mágico
  { color: '#9400D3', text: 'Dimensional Portal' },// Roxo vibrante e sobrenatural
  { color: '#FFD700', text: 'Lost Treasure' },     // Dourado brilhante, a cor da recompensa
  { color: '#2E8B57', text: 'Elf Village' },       // Verde sereno, integrado à natureza
  { color: '#000080', text: 'Deep Ocean' },        // Azul marinho, representando a profundeza
  { color: '#FF8C00', text: 'Soft fire' },         // Laranja escuro, de uma fogueira controlada
  { color: '#4682B4', text: 'Legendary Warrior' }, // Azul aço, nobre e heróico
  { color: '#8A2BE2', text: 'Sacred Temple' },     // Violeta, cor da espiritualidade e magia
  { color: '#483D8B', text: 'Mythical Beast' },    // Roxo escuro, imponente e misterioso
  { color: '#2F4F4F', text: 'Cave' },              // Cinza ardósia, escuro e rochoso
  { color: '#8B4513', text: 'Tribal Drums' },      // Marrom terra, rústico e primal
  { color: '#DC143C', text: 'Horror Scream' },     // Carmesim, a cor do pavor e do perigo
  { color: '#4B0082', text: 'Soul Demon' },        // Índigo, escuridão profunda e maligna
  { color: '#FFFACD', text: 'Angelical Cry' },     // Um tom de creme celestial, quase branco
  { color: '#E6E6FA', text: 'Choral' },            // Lavanda suave, etéreo e harmonioso
  { color: '#B22222', text: 'Dragon Lair' },       // Vermelho "tijolo", de fogo e rocha vulcânica
  { color: '#00FA9A', text: 'Enchanted Garden' },  // Verde menta, vibrante e mágico
];

const RELAX_PROMPTS = [
  { color: '#68A0B2', text: 'Ocean Waves' },       // Azul-petróleo suave, cor do mar calmo
  { color: '#B0C4DE', text: 'Gentle Rain' },       // Azul acinzentado claro, como a chuva na janela
  { color: '#DDA0DD', text: 'Silence Flowers' },   // Lilás pálido, delicado e silencioso
  { color: '#FBC4AB', text: 'Calm Sunset' },       // Laranja rosado suave, do pôr do sol
  { color: '#F0F8FF', text: 'Soft Clouds' },       // Quase branco, um azul muito pálido de nuvem
  { color: '#B0E0E6', text: 'Morning Mist' },      // Azul pálido, a cor da névoa da manhã
  { color: '#F5DEB3', text: 'Calm Piano' },        // Bege "trigo", remetendo à madeira do piano
  { color: '#CD853F', text: 'Calm Guitar' },       // Tom de madeira clara, do violão acústico
  { color: '#98D8C8', text: 'Slow Morning' },      // Verde menta pastel, suave e tranquilo
  { color: '#C0D6E4', text: 'Soft Flute' },        // Um tom prateado/azulado, leve como o som
  { color: '#556B2F', text: 'Forest Calm' },       // Verde oliva escuro, a calma da floresta densa
  { color: '#E0B0FF', text: 'Slow Dreams' },       // Roxo claro, onírico e suave
  { color: '#D2B48C', text: 'Peaceful Lute' },     // Tan, a cor da madeira de um alaúde
  { color: '#87CEFA', text: 'Relaxing Sky' },      // Azul céu claro e limpo
  { color: '#E5E4E2', text: 'Quiet Wind' },        // Cinza muito claro, a cor do ar em movimento
  { color: '#A2D0C1', text: 'Soothing Drops' },    // Verde água, como gotas de orvalho
  { color: '#B87333', text: 'Peaceful Ocarina' },  // Terracota, a cor da argila de uma ocarina
  { color: '#E5A774', text: 'Warm Tea' },          // Cor de mel, quente e reconfortante
];

function initializeAI(apiKey: string) {
  if (apiKey && apiKey.trim().length > 0) {
    ai = new GoogleGenAI({ apiKey: apiKey.trim(), apiVersion: 'v1alpha' });
    return true;
  }
  return false;
}

function main() {
  // Inicializar o SessionManager primeiro
  sessionManager = new SessionManager();
  
  // Tentar carregar sessão existente
  const existingSession = sessionManager.getCurrentSession();
  if (existingSession) {
    // Se existe uma sessão, usar o tema dela
    currentTheme = existingSession.theme;
  } else {
    // Sempre iniciar com tema 'basic' se não houver sessão
    currentTheme = 'basic';
  }
  
  // Aguardar o DOM estar pronto antes de executar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const initialPrompts = buildDefaultPrompts(currentTheme);
      initializeApp(initialPrompts);
    });
  } else {
    const initialPrompts = buildDefaultPrompts(currentTheme);
    initializeApp(initialPrompts);
  }
}

function restoreFavoritesFromSession(session: { favorites: Array<{ name: string; preset: { prompts: Record<string, any>; volume: number }; theme: ThemeMode }> }) {
  if (favoritesManager && session.favorites) {
    // Limpar favoritos atuais
    favoritesManager.clearAll();
    
    // Restaurar favoritos da sessão
    session.favorites.forEach((favorite) => {
      // Converter prompts de volta para Map
      const promptsMap = new Map<string, any>();
      if (favorite.preset.prompts) {
        Object.entries(favorite.preset.prompts).forEach(([key, prompt]) => {
          promptsMap.set(key, prompt);
        });
      }
      
      // Recriar o favorito
      favoritesManager.createFavorite(
        favorite.name,
        promptsMap,
        favorite.preset.volume,
        favorite.theme
      );
    });
  }
}

function initializeApp(initialPrompts: Map<string, Prompt>) {
  // Adicionar o componente de input da API Key primeiro
  const apiKeyInput = new ApiKeyInput();
  document.body.appendChild(apiKeyInput);

  // Listener para mudanças na API Key
  apiKeyInput.addEventListener('api-key-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{ apiKey: string }>;
    const apiKey = customEvent.detail.apiKey;
    
    if (initializeAI(apiKey)) {
      // Criar ou trocar para nova sessão
      if (sessionManager) {
        sessionManager.switchSession(apiKey, currentTheme);
        
        // Carregar favoritos da sessão
        const session = sessionManager.getCurrentSession();
        if (session) {
          // Restaurar favoritos da sessão
          restoreFavoritesFromSession(session);
        }
      }
      
      // Reinicializar componentes com nova API Key
      if (pdjMidi && liveMusicHelper) {
        // Recriar instâncias com nova API Key
        try {
          document.body.removeChild(pdjMidi);
          if (liveMusicHelper.extraDestination) {
            document.body.removeChild(liveMusicHelper.extraDestination as any);
          }
        } catch (error) {
          // Ignorar erros de remoção
        }
        initializeComponents(initialPrompts);
      } else {
        // Primeira inicialização
        initializeComponents(initialPrompts);
      }
      
      // Adicionar a sidebar após inicializar os componentes
      const sidebar = new Sidebar();
      sidebar.currentTheme = currentTheme;
      document.body.appendChild(sidebar);
      
      // Listener para mudanças de tema
      sidebar.addEventListener('theme-changed', ((e: Event) => {
        const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
        const theme = customEvent.detail.theme;
        handleThemeChange(theme);
      }));

      // Listener para toggle de favoritos
      sidebar.addEventListener('toggle-favorites', () => {
        if (favoritesSidebar) {
          favoritesSidebar.toggle();
        }
      });

      // Listener para deselecionar favoritos quando mudar de tema
      sidebar.addEventListener('deselect-favorites', () => {
        if (favoritesSidebar) {
          favoritesSidebar.selectedFavoriteId = null;
          selectedFavoriteId = null;
        }
      });
    }
  }));
}

function initializeComponents(initialPrompts: Map<string, Prompt>) {
  pdjMidi = new PromptDjMidi(initialPrompts, ai, model);
  
  // Definir o tema atual no PromptDjMidi (importante para sessões carregadas)
  pdjMidi.currentTheme = currentTheme;
  
  // Inicializar sistema de favoritos com SessionManager
  favoritesManager = new FavoritesManager(sessionManager);
  
  // Passar o FavoritesManager para o PromptDjMidi
  pdjMidi.favoritesManager = favoritesManager;
  
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  // Criar barra lateral de favoritos
  favoritesSidebar = new FavoritesSidebar();
  favoritesSidebar.currentTheme = currentTheme;
  favoritesSidebar.favorites = favoritesManager.getFavoritesByTheme(currentTheme);
  favoritesSidebar.selectedFavoriteId = selectedFavoriteId;
  favoritesSidebar.hide(); // Começar com a barra de favoritos oculta
  document.body.appendChild(favoritesSidebar);

  liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(initialPrompts);

  // Configurar eventos dos componentes
  pdjMidi.addEventListener('play-pause', () => {
    liveMusicHelper.playPause();
  });

  pdjMidi.addEventListener('volume-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{ volume: number }>;
    const volume = customEvent.detail.volume;
    handleVolumeChange(volume);
  }));

  // Listener para deselecionar favoritos quando usar clear, aleatório ou next
  pdjMidi.addEventListener('deselect-favorites', () => {
    if (favoritesSidebar) {
      favoritesSidebar.selectedFavoriteId = null;
      selectedFavoriteId = null;
    }
    
    // Atualizar estado do FavoriteButton após deselecionar
    setTimeout(() => {
      if (pdjMidi && pdjMidi.shadowRoot) {
        const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
        if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
          const isFavorited = pdjMidi.isCurrentConfigFavorited();
          favoriteButton.setCurrentConfigFavorited(isFavorited);
        }
      }
    }, 100);
  });

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    // audioAnalyser será inicializado depois
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<LiveMusicFilteredPrompt>;
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason!, 'error');
    
    // Esconder toast de prompt filtrado após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
    
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error, 'error');
    
    // Esconder toast de erro após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  pdjMidi.addEventListener('error', errorToast);
  
  // Listener para conexão restaurada
  liveMusicHelper.addEventListener('connection-restored', async (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const message = customEvent.detail;
    toastMessage.show(message, 'success');
    
    // Esconder toast após 5 segundos
    setTimeout(() => {
      toastMessage.hide();
    }, 5000);
    
    // Dar play na música automaticamente se ela estava tocando antes da desconexão
    if (message.includes('Retomando a música')) {
      try {
        // Mostrar mensagem de carregamento
        toastMessage.show('Carregando música...', 'info');
        
        // Esconder toast de carregamento após 5 segundos
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
        
        await liveMusicHelper.play();
        
        // Mostrar mensagem de sucesso após o play e esconder após 5 segundos
        setTimeout(() => {
          toastMessage.show('Música retomada com sucesso!', 'success');
          setTimeout(() => {
            toastMessage.hide();
          }, 5000);
        }, 1000);
      } catch (error) {
        console.error('Erro ao dar play na música após reconexão:', error);
        toastMessage.show('Erro ao retomar a música após reconexão', 'error');
        
        // Esconder toast de erro após 5 segundos
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
      }
    }
  });

  // Inicializar AudioAnalyser
  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  pdjMidi.addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    const prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
    
    // Atualizar estado do FavoriteButton
    if (pdjMidi && pdjMidi.shadowRoot) {
      const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
      if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
        const isFavorited = pdjMidi.isCurrentConfigFavorited();
        favoriteButton.setCurrentConfigFavorited(isFavorited);
      }
    }
  }));

  // Listeners para eventos de favoritos
  pdjMidi.addEventListener('favorite-created', async (e: CustomEvent<{ name: string, theme: ThemeMode, prompts: Map<string, Prompt> }>) => {
    if (!favoritesManager) return;
    
    const { name, theme, prompts } = e.detail;
    const volume = liveMusicHelper?.getVolume() || 0.5;
    
    const favorite = favoritesManager.createFavorite(name, prompts, volume, theme);
    
            // Atualizar sidebar
        if (favoritesSidebar) {
          favoritesSidebar.favorites = favoritesManager.getFavoritesByTheme(favoritesSidebar.currentTheme);
      
      // Marcar o novo favorito como selecionado
      selectedFavoriteId = favorite.id;
      favoritesSidebar.selectedFavoriteId = selectedFavoriteId;
    }
    
    // CORREÇÃO: Forçar verificação do estado do botão após seleção automática
    // Como é seleção automática, não passa pelo fluxo normal de favorite-selected
    setTimeout(() => {
      if (pdjMidi && pdjMidi.shadowRoot) {
        const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
        if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
          const isFavorited = pdjMidi.isCurrentConfigFavorited();
          favoriteButton.setCurrentConfigFavorited(isFavorited);
        }
      }
    }, 100);
  });

  pdjMidi.addEventListener('favorite-removed', () => {
    // Atualizar estado do botão se necessário
    if (pdjMidi && pdjMidi.shadowRoot) {
      const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
      if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
        const isFavorited = pdjMidi.isCurrentConfigFavorited();
        favoriteButton.setCurrentConfigFavorited(isFavorited);
      }
    }
  });

  // Listeners para eventos da sidebar de favoritos
  if (favoritesSidebar) {
    favoritesSidebar.addEventListener('favorite-selected', async (e: CustomEvent<{ favorite: Favorite }>) => {
      const { favorite } = e.detail;
      
      // Aplicar preset do favorito
      if (pdjMidi && liveMusicHelper) {
        // Desativar shuffle primeiro
        if (pdjMidi.randomPromptGenerator) {
          pdjMidi.randomPromptGenerator.stopGenerating();
        }
        
        // Desativar visualmente o botão aleatório
        if (pdjMidi.shadowRoot) {
          const randomButton = pdjMidi.shadowRoot.querySelector('random-button') as any;
          if (randomButton && randomButton.forceDeactivate) {
            randomButton.forceDeactivate();
          }
        }
        
        // Atualizar prompts primeiro
        pdjMidi.updatePrompts(favorite.preset.prompts);
        
        // Aguardar a atualização dos prompts antes de continuar
        setTimeout(async () => {
          // Forçar sincronização completa dos prompts
          pdjMidi.forceSyncPrompts();
          
          // Atualizar volume
          liveMusicHelper.setVolume(favorite.preset.volume);
          
          // Atualizar volume no PromptDjMidi para comparação de favoritos
          pdjMidi.currentVolume = favorite.preset.volume;
          
          // Aplicar prompts no LiveMusicHelper
          liveMusicHelper.setWeightedPrompts(favorite.preset.prompts);
          
          // Marcar como selecionado
          selectedFavoriteId = favorite.id;
          favoritesSidebar.selectedFavoriteId = selectedFavoriteId;
          
          // Forçar atualização do estado do FavoriteButton
          if (pdjMidi && pdjMidi.shadowRoot) {
            const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
            if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
              const isFavorited = pdjMidi.isCurrentConfigFavorited();
              favoriteButton.setCurrentConfigFavorited(isFavorited);
            }
          }
          
          // Dar play automático na música após aplicar a configuração
          // Só dar play se não estiver tocando
          if (liveMusicHelper.getPlaybackState() !== 'playing') {
            try {
              await liveMusicHelper.play();
            } catch (error) {
              console.error('Erro ao iniciar música automaticamente:', error);
            }
          }
        }, 100);
      }
    });

    favoritesSidebar.addEventListener('favorite-updated', (e: CustomEvent<{ id: string, name: string }>) => {
      const { id, name } = e.detail;
      
      if (favoritesManager) {
        favoritesManager.updateFavorite(id, name);
        
        // Atualizar sidebar
        favoritesSidebar.favorites = favoritesManager.getFavoritesByTheme(favoritesSidebar.currentTheme);
        
        // Mostrar toast
        toastMessage.show(`Favorito renomeado para "${name}"!`, 'success');
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
      }
    });

    favoritesSidebar.addEventListener('favorite-deleted', (e: CustomEvent<{ id: string }>) => {
      const { id } = e.detail;
      
      if (favoritesManager) {
        favoritesManager.deleteFavorite(id);
        
        // Atualizar sidebar
        favoritesSidebar.favorites = favoritesManager.getFavoritesByTheme(favoritesSidebar.currentTheme);
        
        // Se era o favorito selecionado, desmarcar
        if (selectedFavoriteId === id) {
          selectedFavoriteId = null;
          favoritesSidebar.selectedFavoriteId = null;
        }
        
        // Atualizar estado do FavoriteButton após deletar favorito
        if (pdjMidi && pdjMidi.shadowRoot) {
          const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
          if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
            const isFavorited = pdjMidi.isCurrentConfigFavorited();
            favoriteButton.setCurrentConfigFavorited(isFavorited);
          }
        }
        
        // Mostrar toast
        toastMessage.show('Favorito excluído com sucesso!', 'success');
        setTimeout(() => {
          toastMessage.hide();
        }, 5000);
      }
    });
  }

  // Listeners para desmarcar favoritos em outras ações
  pdjMidi.addEventListener('random-activated', () => {
    // Desmarcar favorito selecionado
    selectedFavoriteId = null;
    if (favoritesSidebar) {
      favoritesSidebar.selectedFavoriteId = null;
    }
  });

  pdjMidi.addEventListener('next-clicked', () => {
    // Desmarcar favorito selecionado
    selectedFavoriteId = null;
    if (favoritesSidebar) {
      favoritesSidebar.selectedFavoriteId = null;
    }
  });

  // Listener para deseleção de favoritos
  document.addEventListener('deselect-favorites', () => {
    // Limpar seleção atual
    if (selectedFavoriteId) {
      selectedFavoriteId = null;
      if (favoritesSidebar) {
        favoritesSidebar.selectedFavoriteId = null;
      }
    }
    
    // Atualizar estado do FavoriteButton após deselecionar
    setTimeout(() => {
      if (pdjMidi && pdjMidi.shadowRoot) {
        const favoriteButton = pdjMidi.shadowRoot.querySelector('favorite-button') as any;
        if (favoriteButton && favoriteButton.setCurrentConfigFavorited) {
          const isFavorited = pdjMidi.isCurrentConfigFavorited();
          favoriteButton.setCurrentConfigFavorited(isFavorited);
        }
      }
    }, 100);
  });
}



function buildDefaultPrompts(theme: ThemeMode = 'basic') {
  let promptsList;
  switch (theme) {
    case 'basic':
      promptsList = DEFAULT_PROMPTS;
      break;
    case 'rpg':
      promptsList = RPG_PROMPTS;
      break;
    case 'relax':
      promptsList = RELAX_PROMPTS;
      break;
    default:
      promptsList = DEFAULT_PROMPTS;
  }
  
  // Pick 3 random prompts to start at weight = 1
  const startOnIndices = [...Array(promptsList.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < promptsList.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = promptsList[i];
    const { text, color } = prompt;
    prompts.set(promptId, {
      promptId,
      text,
      weight: startOnIndices.includes(i) ? 1 : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

function handleThemeChange(theme: ThemeMode) {
  currentTheme = theme;
  
  // Atualizar o tema na sessão atual
  if (sessionManager) {
    sessionManager.updateSessionTheme(theme);
  }
  
  // Parar o modo aleatório antes de trocar o tema
  if (pdjMidi && pdjMidi.randomPromptGenerator) {
    pdjMidi.randomPromptGenerator.stopGenerating();
  }
  
  // Desativar visualmente o botão aleatório
  if (pdjMidi && pdjMidi.shadowRoot) {
    const randomButton = pdjMidi.shadowRoot.querySelector('random-button') as any;
    if (randomButton && randomButton.forceDeactivate) {
      randomButton.forceDeactivate();
    }
  }
  
  // Limpar configuração anterior (zerar todos os pesos)
  const clearedPrompts = new Map<string, Prompt>();
  
  // Gerar novos prompts baseados no tema
  const newPrompts = buildDefaultPrompts(theme);
  
  // Zerar todos os pesos para garantir configuração limpa
  newPrompts.forEach((prompt) => {
    prompt.weight = 0;
    clearedPrompts.set(prompt.promptId, prompt);
  });
  
  // Atualizar o PromptDjMidi com os novos prompts zerados
  if (pdjMidi) {
    pdjMidi.currentTheme = theme;
    pdjMidi.updatePrompts(clearedPrompts);
  }
  
  // Atualizar o LiveMusicHelper
  if (liveMusicHelper) {
    liveMusicHelper.setWeightedPrompts(clearedPrompts);
  }
  
  // Atualizar o tema no RandomPromptGenerator
  if (pdjMidi && pdjMidi.randomPromptGenerator) {
    pdjMidi.randomPromptGenerator.setTheme(theme);
  }
  
  // Atualizar o FavoritesSidebar com o novo tema
  if (favoritesSidebar) {
    favoritesSidebar.currentTheme = theme;
    favoritesSidebar.favorites = favoritesManager!.getFavoritesByTheme(theme);
    favoritesSidebar.selectedFavoriteId = null; // Deselecionar ao trocar de tema
    selectedFavoriteId = null;
  }
  
  // Força a atualização da UI imediatamente
  requestAnimationFrame(() => {
    if (pdjMidi) {
      pdjMidi.requestUpdate();
    }
  });
}

function handleVolumeChange(volume: number) {
  // Aplicar o volume ao LiveMusicHelper
  if (liveMusicHelper) {
    liveMusicHelper.setVolume(volume);
  }
  
  // Atualizar o volume no PromptDjMidi para comparação de favoritos
  if (pdjMidi) {
    pdjMidi.currentVolume = volume;
  }
}

main();