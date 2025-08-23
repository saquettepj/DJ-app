/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface Prompt {
  readonly promptId: string;
  text: string;
  weight: number;
  cc: number;
  color: string;
}

export interface ControlChange {
  channel: number;
  cc: number;
  value: number;
}

export type PlaybackState = 'stopped' | 'playing' | 'loading' | 'paused';

// Sistema de Favoritos
export interface MusicPreset {
  prompts: Map<string, Prompt>;
  volume: number;
  timestamp: number;
}

export interface Favorite {
  readonly id: string;
  name: string;
  preset: MusicPreset;
  theme: 'basic' | 'rpg';
  createdAt: number;
  updatedAt: number;
}
