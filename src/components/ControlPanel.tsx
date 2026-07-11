/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TerminalTheme, GridConfig, ColorGradingConfig } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import { Volume2, VolumeX, Grid, Layers, Monitor, RotateCcw, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

const THEME_LABELS: Record<TerminalTheme, string> = {
  nightfly: 'NightFly',
  mire: 'The MIRE',
  nephila: 'Nephila Systems',
  sepulchre: 'The Sepulchre',
  sepulchral_nx: 'Sepulchral{NX}'
};

interface ControlPanelProps {
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  gridConfig: GridConfig;
  setGridConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
  colorConfig: ColorGradingConfig;
  setColorConfig: React.Dispatch<React.SetStateAction<ColorGradingConfig>>;
  acousticFeedback: boolean;
  setAcousticFeedback: (val: boolean) => void;
  displayMode: 'single' | 'dual' | 'triple';
  setDisplayMode: (m: 'single' | 'dual' | 'triple') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  theme,
  setTheme,
  gridConfig,
  setGridConfig,
  colorConfig,
  setColorConfig,
  acousticFeedback,
  setAcousticFeedback,
  displayMode,
  setDisplayMode
}) => {
  const palette = THEME_PALETTES[theme];
  const [activeTab, setActiveTab] = useState<'analog' | 'grid' | 'display'>('analog');

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  const handleThemeChange = (newTheme: TerminalTheme) => {
    setTheme(newTheme);
    if (acousticFeedback) {
      soundEngine.playSwitch();
      soundEngine.playBeep(440, 0.15);
    }
  };

  const toggleAcoustic = () => {
    const next = !acousticFeedback;
    setAcousticFeedback(next);
    soundEngine.toggleAmbientHum(next);
    // Directly play sound on toggled engine
    if (next) {
      soundEngine.playSwitch();
      soundEngine.playSweep(true);
    }
  };

  const resetAllFilters = () => {
    playSwitch();
    setColorConfig({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
      chromaticAberration: true,
      crtScanlines: true,
      vignette: true,
      noiseLevel: 20
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs font-mono select-none">
      {/* Control Category Tab Selectors - Analog buttons */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-black/60 border-b border-slate-800">
        <button
          onClick={() => { setActiveTab('analog'); playClick(); }}
          className={`py-1.5 rounded transition-all flex items-center justify-center space-x-1 border text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'analog'
              ? `bg-[rgba(51,255,51,0.05)] text-white border-current`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          style={{ color: activeTab === 'analog' ? palette.primary : 'inherit' }}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Analog FX</span>
        </button>
        <button
          onClick={() => { setActiveTab('grid'); playClick(); }}
          className={`py-1.5 rounded transition-all flex items-center justify-center space-x-1 border text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'grid'
              ? `bg-[rgba(51,255,51,0.05)] text-white border-current`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          style={{ color: activeTab === 'grid' ? palette.primary : 'inherit' }}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Matrix Grid</span>
        </button>
        <button
          onClick={() => { setActiveTab('display'); playClick(); }}
          className={`py-1.5 rounded transition-all flex items-center justify-center space-x-1 border text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'display'
              ? `bg-[rgba(51,255,51,0.05)] text-white border-current`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          style={{ color: activeTab === 'display' ? palette.primary : 'inherit' }}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Displays</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: ANALOG DIALS & CRT CONTROLS */}
        {activeTab === 'analog' && (
          <div className="space-y-4">
            {/* Theme selector bay (Physical button array) */}
            <div>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1.5">SYSTEM GEOMETRY CHAPER</span>
              <div className="grid grid-cols-5 gap-1">
                {(Object.keys(THEME_PALETTES) as TerminalTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`relative py-3 rounded border transition-all text-[9px] uppercase font-bold flex flex-col items-center justify-center h-16 ${
                      theme === t 
                        ? 'bg-black border-current'
                        : 'border-slate-800 bg-slate-900/30 text-slate-500 hover:text-slate-300'
                    }`}
                    style={{ color: theme === t ? palette.primary : 'inherit' }}
                  >
                    {/* Small physical light bulb indicator LED */}
                    <span 
                      className={`w-1.5 h-1.5 rounded-full absolute top-1.5 transition-all duration-300 ${
                        theme === t ? 'shadow-[0_0_8px_rgba(255,255,255,1)]' : ''
                      }`}
                      style={{ backgroundColor: theme === t ? palette.primary : '#1e293b' }}
                    />
                    <span className="mt-2 text-[8px] leading-tight text-center truncate w-full px-0.5">
                      {THEME_LABELS[t]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chunk Toggle Switches */}
            <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-2.5">
              <span className="text-[10px] tracking-widest text-slate-400 uppercase block">CORE REACTOR POWER TOGGLES</span>
              
              {/* ACOUSTIC FEEDBACK SW */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  {acousticFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  ACOUSTIC COUPLING
                </span>
                <button 
                  onClick={toggleAcoustic}
                  className="flex items-center focus:outline-none transition-colors"
                >
                  {acousticFeedback ? (
                    <ToggleRight className="w-10 h-6 text-emerald-400 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* CRT Scanline Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">SCANLINE RASTER</span>
                <button 
                  onClick={() => {
                    playSwitch();
                    setColorConfig(prev => ({ ...prev, crtScanlines: !prev.crtScanlines }));
                  }}
                  className="flex items-center focus:outline-none"
                >
                  {colorConfig.crtScanlines ? (
                    <ToggleRight className="w-10 h-6 cursor-pointer" style={{ color: palette.primary }} />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Chromatic aberration */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">CHROMATIC DEVIATION</span>
                <button 
                  onClick={() => {
                    playSwitch();
                    setColorConfig(prev => ({ ...prev, chromaticAberration: !prev.chromaticAberration }));
                  }}
                  className="flex items-center focus:outline-none"
                >
                  {colorConfig.chromaticAberration ? (
                    <ToggleRight className="w-10 h-6 cursor-pointer" style={{ color: palette.primary }} />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Vignette toggle */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">VIGNETTE APERTURE</span>
                <button 
                  onClick={() => {
                    playSwitch();
                    setColorConfig(prev => ({ ...prev, vignette: !prev.vignette }));
                  }}
                  className="flex items-center focus:outline-none"
                >
                  {colorConfig.vignette ? (
                    <ToggleRight className="w-10 h-6 cursor-pointer" style={{ color: palette.primary }} />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Slider dials for advanced color-grading / GPU acceleration */}
            <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-slate-400 uppercase">GPU COLOR GRADIENTS</span>
                <button 
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white border border-slate-800 bg-slate-900/40 px-1.5 py-0.5 rounded"
                >
                  <RotateCcw className="w-3 h-3" />
                  CALIBRATE
                </button>
              </div>

              {/* BRIGHTNESS */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>BRIGHTNESS EMISSION</span>
                  <span className="text-white">{colorConfig.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={colorConfig.brightness}
                  onInput={playClick}
                  onChange={(e) => setColorConfig(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* CONTRAST */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>CONTRAST FILTER</span>
                  <span className="text-white">{colorConfig.contrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={colorConfig.contrast}
                  onInput={playClick}
                  onChange={(e) => setColorConfig(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* HUE-ROTATE */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>HUE DEVIATION MATRIX</span>
                  <span className="text-white">{colorConfig.hueRotate}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={colorConfig.hueRotate}
                  onInput={playClick}
                  onChange={(e) => setColorConfig(prev => ({ ...prev, hueRotate: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* NOISE LEVEL */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>CRT GLASS COGNITIVE NOISE</span>
                  <span className="text-white">{colorConfig.noiseLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={colorConfig.noiseLevel}
                  onInput={playClick}
                  onChange={(e) => setColorConfig(prev => ({ ...prev, noiseLevel: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRID & MATRIX DESIGN SETTINGS */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-3.5">
              <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1">PROTOTYPING MATRIX SETTINGS</span>

              {/* Column Adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>MATRIX COLUMNS</span>
                  <span className="text-white">{gridConfig.columns}</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  value={gridConfig.columns}
                  onInput={playClick}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* Row Adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>MATRIX ROWS</span>
                  <span className="text-white">{gridConfig.rows}</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  value={gridConfig.rows}
                  onInput={playClick}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* Gap Adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>MATRIX ELEMENT GAP</span>
                  <span className="text-white">{gridConfig.gap}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="32" 
                  step="4"
                  value={gridConfig.gap}
                  onInput={playClick}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, gap: parseInt(e.target.value) }))}
                  className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                  style={{ color: palette.primary }}
                />
              </div>

              {/* Grid overlay toggle */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                <span className="text-slate-300">SHOW GRID OVERLAY</span>
                <button 
                  onClick={() => {
                    playSwitch();
                    setGridConfig(prev => ({ ...prev, showOverlay: !prev.showOverlay }));
                  }}
                  className="flex items-center focus:outline-none"
                >
                  {gridConfig.showOverlay ? (
                    <ToggleRight className="w-10 h-6 cursor-pointer" style={{ color: palette.primary }} />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Snap lock */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-rose-400/90 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping mr-1" />
                  SNAP-TO-MATRIX LOCK
                </span>
                <button 
                  onClick={() => {
                    playSwitch();
                    setGridConfig(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
                  }}
                  className="flex items-center focus:outline-none"
                >
                  {gridConfig.snapToGrid ? (
                    <ToggleRight className="w-10 h-6 cursor-pointer" style={{ color: palette.primary }} />
                  ) : (
                    <ToggleLeft className="w-10 h-6 text-slate-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-2">
              <span className="text-[10px] tracking-widest text-slate-400 uppercase block">CANVAS RATIO BAY</span>
              <div className="grid grid-cols-2 gap-2">
                {(['free', '16:9', '4:3', '1:1'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      playClick();
                      setGridConfig(prev => ({ ...prev, aspectRatio: r }));
                    }}
                    className={`py-1.5 rounded border uppercase text-[10px] transition-all flex items-center justify-center space-x-1 ${
                      gridConfig.aspectRatio === r
                        ? 'border-current bg-black text-white'
                        : 'border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                    style={{ color: gridConfig.aspectRatio === r ? palette.primary : 'inherit' }}
                  >
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISPLAYS (Multi-display rig simulations) */}
        {activeTab === 'display' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-3.5">
              <span className="text-[10px] tracking-widest text-slate-400 uppercase block mb-1">MULTI-MONITOR MATRIX RIG</span>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'single', label: 'MONITOR A', desc: 'Central' },
                  { mode: 'dual', label: 'MONITOR A+B', desc: 'Aux Dual' },
                  { mode: 'triple', label: 'MONITOR A+B+C', desc: 'Panoramic' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      playSwitch();
                      setDisplayMode(item.mode as any);
                    }}
                    className={`py-2 rounded border transition-all text-center flex flex-col items-center justify-center ${
                      displayMode === item.mode
                        ? 'bg-black border-current font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                    style={{ color: displayMode === item.mode ? palette.primary : 'inherit' }}
                  >
                    <span className="text-[10px] font-bold">{item.label}</span>
                    <span className="text-[8px] opacity-40">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 space-y-1.5 border-t border-slate-800/60 pt-2.5">
                <p>⚡ GPU Acceleration: <span className="text-emerald-400">ENABLED via WebGL Canvas Context</span></p>
                <p>🖥️ Desktop Targets: <span className="text-emerald-400">Windows & Linux Standard Shells</span></p>
                <p>🔄 Rendering latency: <span className="text-emerald-400">~1.2 ms (60 FPS locked)</span></p>
              </div>
            </div>

            {/* Simulated Multi-display preview block */}
            <div className="border border-slate-800 bg-black/60 p-2.5 rounded flex flex-col items-center justify-center h-28 space-y-2">
              <span className="text-[9px] tracking-widest text-slate-500 uppercase block">RIG ORIENTATION PREVIEW</span>
              
              <div className="flex gap-1.5 items-center justify-center">
                {/* Main panel */}
                <div 
                  className="w-10 h-6 border transition-all flex items-center justify-center text-[7px]"
                  style={{
                    borderColor: palette.primary,
                    backgroundColor: displayMode ? 'rgba(51,255,51,0.1)' : 'transparent',
                    boxShadow: `0 0 5px ${palette.glowLight}`
                  }}
                >
                  CON A
                </div>
                {/* Panel B */}
                {(displayMode === 'dual' || displayMode === 'triple') && (
                  <div 
                    className="w-8 h-6 border transition-all flex items-center justify-center text-[7px]"
                    style={{
                      borderColor: palette.primary,
                      backgroundColor: 'rgba(51,255,51,0.05)',
                      boxShadow: `0 0 3px ${palette.glowLight}`
                    }}
                  >
                    CON B
                  </div>
                )}
                {/* Panel C */}
                {displayMode === 'triple' && (
                  <div 
                    className="w-8 h-6 border transition-all flex items-center justify-center text-[7px]"
                    style={{
                      borderColor: palette.primary,
                      backgroundColor: 'rgba(51,255,51,0.05)',
                      boxShadow: `0 0 3px ${palette.glowLight}`
                    }}
                  >
                    CON C
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Retro brand stamp */}
      <div className="p-2 border-t border-slate-800 bg-black/60 text-center flex items-center justify-between text-[9px] text-slate-500">
        <span>AETHER OS // CONTROL_BAY</span>
        <span>REV 4.02</span>
      </div>
    </div>
  );
};
