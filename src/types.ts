/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';

export type TerminalTheme = 'nightfly' | 'mire' | 'nephila' | 'sepulchre' | 'sepulchral_nx';

export interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  snapToGrid: boolean;
  showOverlay: boolean;
  opacity: number;
  aspectRatio: 'free' | '16:9' | '4:3' | '1:1';
}

export type WidgetType = 
  | 'terminal' 
  | 'radar' 
  | 'telemetry' 
  | 'audio_spectrum' 
  | 'vector_canvas' 
  | 'system_nodes' 
  | 'python_scripting' 
  | 'color_grading'
  | 'icon_integrator'
  | 'export_sync';

export interface ModularWidget {
  id: string;
  type: WidgetType;
  name: string;
  x: number; // grid column start (1-indexed)
  y: number; // grid row start (1-indexed)
  w: number; // grid columns span
  h: number; // grid rows span
  icon: string; // lucide icon name
  glowColor: string;
  isLocked?: boolean;
  data?: any;
}

export interface VectorShape {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'polygon';
  points: Array<{ x: number; y: number; c1?: { x: number; y: number }; c2?: { x: number; y: number } }>; // support curves
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  glowRadius: number;
  opacity: number;
}

export interface ColorGradingConfig {
  brightness: number; // 0-200
  contrast: number; // 0-200
  saturation: number; // 0-200
  hueRotate: number; // 0-360
  chromaticAberration: boolean;
  crtScanlines: boolean;
  vignette: boolean;
  noiseLevel: number; // 0-100
}

export interface ScriptPreset {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface SyncTarget {
  id: string;
  platform: 'windows' | 'linux';
  path: string;
  lastSynced: string;
  latencyMs: number;
  status: 'synchronized' | 'syncing' | 'error' | 'offline';
  speedMbps: number;
}

export interface IconAsset {
  name: string;
  category: string;
  tags: string[];
}
