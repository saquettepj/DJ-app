/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Arquivo centralizado com todas as tipagens do projeto DJ App
 * Este arquivo deve ser importado por todos os outros arquivos que precisem de tipos
 */

// ============================================================================
// TIPOS DE TEMA
// ============================================================================

/**
 * Tipos de tema disponíveis no sistema
 */
export type ThemeMode = 'basic' | 'rpg' | 'relax';

// ============================================================================
// TIPOS DE ÁUDIO E MIDI
// ============================================================================

/**
 * Estado de reprodução da música
 */
export type PlaybackState = 'stopped' | 'playing' | 'loading' | 'paused';

/**
 * Interface para mudanças de controle MIDI
 */
export interface ControlChange {
  channel: number;
  cc: number;
  value: number;
}

// ============================================================================
// TIPOS DE PROMPTS
// ============================================================================

/**
 * Interface para prompts de música
 */
export interface Prompt {
  readonly promptId: string;
  text: string;
  weight: number;
  cc: number;
  color: string;
}

// ============================================================================
// TIPOS DE FAVORITOS
// ============================================================================

/**
 * Interface para presets de música
 */
export interface MusicPreset {
  prompts: Map<string, Prompt>;
  volume: number;
  timestamp: number;
}

/**
 * Interface para favoritos salvos
 */
export interface Favorite {
  readonly id: string;
  name: string;
  preset: MusicPreset;
  theme: ThemeMode;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// TIPOS DE SESSÃO
// ============================================================================

/**
 * Interface para sessões do usuário
 */
export interface Session {
  id: string;
  apiKey: string;
  favorites: Favorite[];
  createdAt: number;
  lastActive: number;
  theme: ThemeMode;
}

// ============================================================================
// TIPOS DE EVENTOS PERSONALIZADOS
// ============================================================================

/**
 * Evento de mudança de tema
 */
export interface ThemeChangedEvent {
  theme: ThemeMode;
}

/**
 * Evento de mudança de API Key
 */
export interface ApiKeyChangedEvent {
  apiKey: string;
}

/**
 * Evento de mudança de volume
 */
export interface VolumeChangedEvent {
  volume: number;
}

/**
 * Evento de seleção de favorito
 */
export interface FavoriteSelectedEvent {
  favorite: Favorite;
}

/**
 * Evento de atualização de favorito
 */
export interface FavoriteUpdatedEvent {
  id: string;
  name: string;
}

/**
 * Evento de exclusão de favorito
 */
export interface FavoriteDeletedEvent {
  id: string;
}

/**
 * Evento de criação de favorito
 */
export interface FavoriteCreatedEvent {
  name: string;
  theme: ThemeMode;
  prompts: Map<string, Prompt>;
}

/**
 * Evento de mudança de favoritos
 */
export interface FavoritesChangedEvent {
  favorites: Favorite[];
}

/**
 * Evento de mudança de sessão
 */
export interface SessionChangedEvent {
  session: Session;
}

/**
 * Evento de mudança de tema da sessão
 */
export interface SessionThemeChangedEvent {
  theme: ThemeMode;
}

/**
 * Evento de mudança de favoritos da sessão
 */
export interface SessionFavoritesChangedEvent {
  favorites: Favorite[];
}

/**
 * Evento de limpeza de sessão
 */
export interface SessionClearedEvent {}

// ============================================================================
// TIPOS DE COMPONENTES
// ============================================================================

/**
 * Interface para componentes que podem ser favoritados
 */
export interface Favoritable {
  isCurrentConfigFavorited(): boolean;
}

/**
 * Interface para componentes que podem ser aleatorizados
 */
export interface Randomizable {
  startGenerating(): void;
  stopGenerating(): void;
  setTheme(theme: ThemeMode): void;
}

// ============================================================================
// TIPOS DE UTILITÁRIOS
// ============================================================================

/**
 * Tipo para funções de callback genéricas
 */
export type Callback<T = void> = () => T;

/**
 * Tipo para funções de callback com parâmetros
 */
export type CallbackWithParams<T, P = void> = (params: P) => T;

/**
 * Tipo para funções de callback assíncronas
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * Tipo para funções de callback assíncronas com parâmetros
 */
export type AsyncCallbackWithParams<T, P = void> = (params: P) => Promise<T>;

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

/**
 * Interface para configurações do sistema
 */
export interface SystemConfig {
  defaultTheme: ThemeMode;
  defaultVolume: number;
  maxVolume: number;
  minVolume: number;
  autoPlay: boolean;
  autoSave: boolean;
}

/**
 * Interface para configurações de tema
 */
export interface ThemeConfig {
  name: ThemeMode;
  displayName: string;
  description: string;
  color: string;
  icon: string;
}

// ============================================================================
// TIPOS DE ESTADO
// ============================================================================

/**
 * Interface para estado global da aplicação
 */
export interface AppState {
  currentTheme: ThemeMode;
  currentVolume: number;
  isPlaying: boolean;
  currentSession: Session | null;
  selectedFavoriteId: string | null;
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

/**
 * Interface para resultados de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Interface para validação de API Key
 */
export interface ApiKeyValidation extends ValidationResult {
  apiKey: string;
}

// ============================================================================
// TIPOS DE PERSISTÊNCIA
// ============================================================================

/**
 * Interface para operações de persistência
 */
export interface PersistenceManager {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Interface para dados serializáveis
 */
export interface Serializable {
  toJSON(): string;
  fromJSON(json: string): void;
}

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

/**
 * Interface para erros customizados da aplicação
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

/**
 * Tipos de erro comuns
 */
export type ErrorType = 
  | 'API_KEY_INVALID'
  | 'NETWORK_ERROR'
  | 'AUDIO_ERROR'
  | 'MIDI_ERROR'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// TIPOS DE NOTIFICAÇÃO
// ============================================================================

/**
 * Tipos de notificação disponíveis
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface para notificações
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp: number;
}

// ============================================================================
// TIPOS DE HISTÓRICO
// ============================================================================

/**
 * Interface para itens de histórico
 */
export interface HistoryItem {
  id: string;
  action: string;
  details: any;
  timestamp: number;
  userId?: string;
}

/**
 * Interface para histórico de sessões
 */
export interface SessionHistory extends HistoryItem {
  action: 'session_created' | 'session_switched' | 'session_cleared';
  details: {
    sessionId: string;
    apiKey: string;
    theme: ThemeMode;
  };
}

/**
 * Interface para histórico de favoritos
 */
export interface FavoriteHistory extends HistoryItem {
  action: 'favorite_created' | 'favorite_updated' | 'favorite_deleted';
  details: {
    favoriteId: string;
    name: string;
    theme: ThemeMode;
  };
}
