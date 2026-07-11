/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TerminalTheme, GridConfig, ModularWidget } from '../types';
import { THEME_PALETTES, CyberFrame } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import * as LucideIcons from 'lucide-react';
import { 
  Terminal as TermIcon, 
  Activity, 
  Music, 
  Radar as RadarIcon, 
  Settings, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  Maximize2, 
  Sliders, 
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';

interface GridDesignerProps {
  theme: TerminalTheme;
  gridConfig: GridConfig;
  widgets: ModularWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<ModularWidget[]>>;
  acousticFeedback: boolean;
  selectedIconName: string;
}

export const GridDesigner: React.FC<GridDesignerProps> = ({
  theme,
  gridConfig,
  widgets,
  setWidgets,
  acousticFeedback,
  selectedIconName
}) => {
  const palette = THEME_PALETTES[theme];
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [customWidgetName, setCustomWidgetName] = useState('AUX_TELEMETRY');
  const [customWidgetType, setCustomWidgetType] = useState<'terminal' | 'radar' | 'telemetry' | 'audio_spectrum'>('telemetry');
  const [widgetX, setWidgetX] = useState(1);
  const [widgetY, setWidgetY] = useState(1);
  const [widgetW, setWidgetW] = useState(2);
  const [widgetH, setWidgetH] = useState(2);
  const [widgetGlowColor, setWidgetGlowColor] = useState(palette.primary);

  // Keep widget glow synchronized when theme changes
  useEffect(() => {
    setWidgetGlowColor(palette.primary);
  }, [theme]);

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  const handleAddWidget = () => {
    playSwitch();
    soundEngine.playSweep(true);
    const id = 'widget_' + Date.now();
    const newWidget: ModularWidget = {
      id,
      type: customWidgetType,
      name: customWidgetName.toUpperCase().replace(/\s+/g, '_'),
      x: widgetX,
      y: widgetY,
      w: widgetW,
      h: widgetH,
      icon: selectedIconName || 'Activity',
      glowColor: widgetGlowColor,
      isLocked: false
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(id);
  };

  const handleDeleteWidget = (id: string) => {
    playSwitch();
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  };

  const toggleLockWidget = (id: string) => {
    playClick();
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isLocked: !w.isLocked } : w));
  };

  const updateWidgetPosition = (id: string, axis: 'x' | 'y' | 'w' | 'h', val: number) => {
    playClick();
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const updated = { ...w, [axis]: val };
      return updated;
    }));
  };

  const getWidgetIcon = (iconName: string) => {
    const IconComp = (LucideIcons as any)[iconName];
    if (!IconComp) return <Activity className="w-4 h-4" />;
    return <IconComp className="w-4 h-4" />;
  };

  // Pre-load default widgets if none are present
  useEffect(() => {
    if (widgets.length === 0) {
      setWidgets([
        {
          id: 'w_terminal',
          type: 'terminal',
          name: 'RABBIT_HOLE_RECORDER',
          x: 1,
          y: 1,
          w: 4,
          h: 3,
          icon: 'Terminal',
          glowColor: palette.primary,
          isLocked: true
        },
        {
          id: 'w_radar',
          type: 'radar',
          name: 'GLYPH_ANATOMY_ANALYZER',
          x: 5,
          y: 1,
          w: 2,
          h: 2,
          icon: 'Radar',
          glowColor: palette.primary,
          isLocked: true
        },
        {
          id: 'w_audio',
          type: 'audio_spectrum',
          name: 'COGNITIVE_RESONATOR',
          x: 1,
          y: 4,
          w: 3,
          h: 2,
          icon: 'Radio',
          glowColor: palette.primary,
          isLocked: true
        },
        {
          id: 'w_telemetry',
          type: 'telemetry',
          name: 'NEURAL_DRIFT_FLOW',
          x: 4,
          y: 4,
          w: 3,
          h: 2,
          icon: 'Activity',
          glowColor: palette.primary,
          isLocked: true
        }
      ]);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 font-mono text-xs select-none">
      
      {/* 1. Main Matrix Canvas Area */}
      <div className="flex-1 flex flex-col space-y-2">
        <div className="flex justify-between items-center bg-black/40 px-3 py-1.5 border border-slate-800 rounded">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 animate-pulse" style={{ color: palette.primary }} />
            <span className="font-bold text-slate-300">CENTRAL PROTOTYPE CONSOLE (STAGE A)</span>
          </div>
          <span className="text-[10px] opacity-40">GRID SNAP LOCK: {gridConfig.snapToGrid ? 'ON' : 'OFF'}</span>
        </div>

        {/* The stage representation */}
        <div 
          className="relative flex-1 min-h-[380px] lg:min-h-0 bg-slate-950/80 border border-slate-900 rounded p-4 overflow-hidden"
          style={{
            backgroundImage: gridConfig.showOverlay 
              ? `radial-gradient(circle, ${palette.primary} 1.5px, transparent 1.5px)`
              : 'none',
            backgroundSize: '24px 24px',
            backgroundColor: '#020508'
          }}
        >
          {/* Virtual desktop modular grid */}
          <div 
            className="w-full h-full grid relative transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
              gap: `${gridConfig.gap}px`,
              aspectRatio: gridConfig.aspectRatio === '16:9' 
                ? '16/9' 
                : gridConfig.aspectRatio === '4:3' 
                ? '4/3' 
                : gridConfig.aspectRatio === '1:1' 
                ? '1/1' 
                : 'auto'
            }}
          >
            {widgets.map((w) => {
              const isSelected = selectedWidgetId === w.id;
              
              return (
                <div
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playClick();
                    setSelectedWidgetId(w.id);
                  }}
                  className={`relative flex flex-col border rounded overflow-hidden transition-all duration-300 group cursor-pointer ${
                    isSelected 
                      ? 'border-white ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10'
                      : 'border-slate-800/80 bg-slate-900/30'
                  }`}
                  style={{
                    gridColumnStart: w.x,
                    gridColumnEnd: w.x + w.w,
                    gridRowStart: w.y,
                    gridRowEnd: w.y + w.h,
                    boxShadow: isSelected 
                      ? `0 0 15px ${palette.glow}, inset 0 0 10px ${palette.glowLight}` 
                      : `inset 0 0 5px rgba(0,0,0,0.4)`
                  }}
                >
                  {/* Widget Tech Header bar */}
                  <div className="flex items-center justify-between px-2 py-1.5 bg-black/50 border-b border-slate-950/80 text-[9px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="shrink-0" style={{ color: w.glowColor || palette.primary }}>
                        {getWidgetIcon(w.icon)}
                      </span>
                      <span className="font-bold tracking-widest text-slate-300 group-hover:text-white transition-colors truncate max-w-[120px]">
                        {w.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {w.isLocked ? (
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                      ) : (
                        <Unlock className="w-2.5 h-2.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>

                  {/* Widget Animated Content Mockup */}
                  <div className="flex-1 p-2 bg-black/40 flex flex-col justify-center overflow-hidden">
                    {w.type === 'terminal' && (
                      <div className="h-full font-mono text-[8px] text-emerald-400 leading-normal flex flex-col justify-end space-y-1 select-text">
                        <div className="text-white font-bold opacity-90">SESSION 0007 -- ACTIVE</div>
                        <div className="opacity-75">COHERENCE: 0.78 | DEPTH: 12 | BRANCHES: 04</div>
                        <div className="text-rose-500 font-bold opacity-90 animate-pulse">STATUS: DRIFT DETECTED ⚠️</div>
                        <div className="opacity-60">SCAR 004 // ORIGIN UNKNOWN</div>
                        <div className="text-slate-500 text-[7px] truncate">C:\PROJECTS\UNKNOWN\NODE_73.LOG</div>
                        <div className="text-slate-400 animate-pulse flex items-center font-sans tracking-wide mt-1">
                          <span className="mr-1">&gt;</span> WE BUILD IN THE DARK SO OTHERS CAN SEE
                        </div>
                      </div>
                    )}

                    {w.type === 'radar' && (
                      <div className="h-full w-full flex items-center justify-center relative bg-slate-950/20">
                        {/* Simulated glowing vector radar sweep */}
                        <div 
                          className="w-16 h-16 rounded-full border border-dashed relative animate-spin flex items-center justify-center"
                          style={{ borderColor: w.glowColor || palette.primary, animationDuration: '4s' }}
                        >
                          {/* sweep radar radius beam */}
                          <div 
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(from 0deg, transparent 40%, ${w.glowColor || palette.primary} 100%)`,
                              opacity: 0.18
                            }}
                          />
                        </div>
                        {/* Target reticle dot */}
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping top-4 right-10" />
                        <div className="absolute w-1 h-1 rounded-full bg-rose-400 top-4 right-10" />
                        <span className="absolute bottom-1 right-2 text-[7px] text-slate-600 font-bold">RAD_LOCK</span>
                      </div>
                    )}

                    {w.type === 'audio_spectrum' && (
                      <div className="h-10 flex items-end justify-between px-2 gap-1 bg-slate-950/10">
                        {[50, 80, 45, 95, 60, 75, 40, 85, 30, 90, 55, 70].map((height, idx) => (
                          <div
                            key={idx}
                            className="w-full rounded-t"
                            style={{
                              height: `${height}%`,
                              backgroundColor: w.glowColor || palette.primary,
                              opacity: 0.5 + (idx % 3) * 0.2,
                              animation: `spectra 1.5s ease-in-out infinite alternate`,
                              animationDelay: `${idx * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {w.type === 'telemetry' && (
                      <div className="h-full flex flex-col justify-between">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>CORE FLUX FREQ</span>
                          <span className="text-white">4.82 GHz</span>
                        </div>
                        {/* Vector sinewave path */}
                        <svg viewBox="0 0 100 25" className="w-full h-8 overflow-visible opacity-80">
                          <path
                            d="M 0 12 Q 12.5 0 25 12 T 50 12 T 75 12 T 100 12"
                            fill="none"
                            stroke={w.glowColor || palette.primary}
                            strokeWidth="1.5"
                            style={{ filter: `drop-shadow(0 0 2px ${w.glowColor || palette.primary})` }}
                            className="telemetry-wave"
                          />
                        </svg>
                        <div className="flex justify-between items-center text-[7px] text-slate-600">
                          <span>TEMP: 322K</span>
                          <span className="text-emerald-400">NORM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tiny layout tags */}
                  <div className="absolute bottom-1 left-2 text-[6.5px] text-slate-600 group-hover:text-slate-400 transition-colors">
                    {`C:${w.x} R:${w.y} [${w.w}x${w.h}]`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Side Panel: Widget Placement Configuration Drawer */}
      <div className="w-full lg:w-80 flex flex-col bg-black/40 border border-slate-800 p-3 rounded space-y-4 shrink-0">
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" />
            DEPLOY NEW ELEMENT
          </span>
          <p className="text-[9px] text-slate-500">Compile and drop custom telemetry modules directly onto the stage grid.</p>
        </div>

        {/* Form elements */}
        <div className="space-y-3.5">
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block">ELEMENT TITLE</label>
            <input
              type="text"
              value={customWidgetName}
              onChange={(e) => setCustomWidgetName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              placeholder="E.G. AUX_TELEMETRY"
              className="w-full bg-slate-950/80 border border-slate-800 px-2 py-1.5 rounded focus:outline-none focus:border-current text-[10px] text-white font-mono uppercase"
            />
          </div>

          {/* Module type selection */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block">COGNITIVE MODULE PATTERN</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'telemetry', label: 'Telemetry Flow' },
                { type: 'radar', label: 'Orbital Radar' },
                { type: 'terminal', label: 'Compiler Log' },
                { type: 'audio_spectrum', label: 'Audio Spectra' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => { playClick(); setCustomWidgetType(item.type as any); }}
                  className={`py-1.5 rounded border text-[9px] transition-all flex flex-col items-center justify-center ${
                    customWidgetType === item.type
                      ? 'border-current bg-black text-white font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                  style={{ color: customWidgetType === item.type ? palette.primary : 'inherit' }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Position settings (X, Y, W, H sliders) */}
          <div className="border border-slate-800 bg-black/40 p-2.5 rounded space-y-3">
            <span className="text-[9px] tracking-widest text-slate-500 uppercase block border-b border-slate-800/60 pb-1">COGNITIVE PLACEMENT (SNAP LOCK)</span>

            {/* X Column coordinate slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>GRID ROW ORIGIN (COL START)</span>
                <span>C: {widgetX}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max={gridConfig.columns} 
                value={widgetX}
                onInput={playClick}
                onChange={(e) => setWidgetX(parseInt(e.target.value))}
                className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                style={{ color: palette.primary }}
              />
            </div>

            {/* Y Row coordinate slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>GRID COLUMN ORIGIN (ROW START)</span>
                <span>R: {widgetY}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max={gridConfig.rows} 
                value={widgetY}
                onInput={playClick}
                onChange={(e) => setWidgetY(parseInt(e.target.value))}
                className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                style={{ color: palette.primary }}
              />
            </div>

            {/* Width span slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>COLUMNS ELEMENT WIDTH</span>
                <span>{widgetW} CELLS</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max={Math.max(1, gridConfig.columns - widgetX + 1)} 
                value={widgetW}
                onInput={playClick}
                onChange={(e) => setWidgetW(parseInt(e.target.value))}
                className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                style={{ color: palette.primary }}
              />
            </div>

            {/* Height span slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>ROWS ELEMENT HEIGHT</span>
                <span>{widgetH} CELLS</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max={Math.max(1, gridConfig.rows - widgetY + 1)} 
                value={widgetH}
                onInput={playClick}
                onChange={(e) => setWidgetH(parseInt(e.target.value))}
                className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
                style={{ color: palette.primary }}
              />
            </div>
          </div>

          {/* Render selected Icon Indicator */}
          {selectedIconName && (
            <div className="p-2 bg-slate-900/40 rounded border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span style={{ color: palette.primary }}>
                  {getWidgetIcon(selectedIconName)}
                </span>
                <span className="text-[9px] uppercase text-slate-400">EMBEDDED ICON SYST:</span>
                <span className="text-[10px] text-white font-bold">{selectedIconName}</span>
              </div>
              <span className="text-[8px] text-emerald-400">LINKED</span>
            </div>
          )}

          {/* Spawn trigger buttons */}
          <button
            onClick={handleAddWidget}
            className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900 hover:border-emerald-400 text-emerald-300 rounded font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer"
          >
            DEPLOY COMPILATION ASSET
          </button>
        </div>

        {/* Selected Widget controller panel */}
        {selectedWidgetId ? (
          <div className="border border-slate-800 bg-slate-950/60 p-2 rounded flex flex-col space-y-2">
            <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase">
              <span>SELECTED ENTITY</span>
              <span className="text-white font-bold">{selectedWidgetId}</span>
            </div>

            {/* Placement Adjuster for Active selections */}
            <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded">
              <button
                onClick={() => {
                  const w = widgets.find(w => w.id === selectedWidgetId);
                  if (w) updateWidgetPosition(selectedWidgetId, 'x', Math.max(1, w.x - 1));
                }}
                className="py-1 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px]"
              >
                MOVE LEFT
              </button>
              <button
                onClick={() => {
                  const w = widgets.find(w => w.id === selectedWidgetId);
                  if (w) updateWidgetPosition(selectedWidgetId, 'x', Math.min(gridConfig.columns - w.w + 1, w.x + 1));
                }}
                className="py-1 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px]"
              >
                MOVE RIGHT
              </button>
              <button
                onClick={() => {
                  const w = widgets.find(w => w.id === selectedWidgetId);
                  if (w) updateWidgetPosition(selectedWidgetId, 'y', Math.max(1, w.y - 1));
                }}
                className="py-1 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px]"
              >
                MOVE UP
              </button>
              <button
                onClick={() => {
                  const w = widgets.find(w => w.id === selectedWidgetId);
                  if (w) updateWidgetPosition(selectedWidgetId, 'y', Math.min(gridConfig.rows - w.h + 1, w.y + 1));
                }}
                className="py-1 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px]"
              >
                MOVE DOWN
              </button>
            </div>

            <div className="flex space-x-1.5 pt-1.5 border-t border-slate-900/60">
              <button
                onClick={() => toggleLockWidget(selectedWidgetId)}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center space-x-1 uppercase text-[9px]"
              >
                {widgets.find(w => w.id === selectedWidgetId)?.isLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>UNLOCK COORDS</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>LOCK COORDS</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDeleteWidget(selectedWidgetId)}
                className="py-1.5 px-3 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900 text-rose-300 rounded flex items-center justify-center uppercase text-[9px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 border border-slate-900 bg-slate-950/40 rounded text-center text-slate-600 uppercase tracking-widest text-[9px]">
            SELECT GRID ELEMENT TO CALIBRATE
          </div>
        )}
      </div>

      <style>{`
        @keyframes spectra {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        .telemetry-wave {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: wave-offset 3s linear infinite;
        }
        @keyframes wave-offset {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
