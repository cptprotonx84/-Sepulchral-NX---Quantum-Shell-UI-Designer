/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customWidgetName, setCustomWidgetName] = useState('AUX_TELEMETRY');
  const [customWidgetType, setCustomWidgetType] = useState<'terminal' | 'radar' | 'telemetry' | 'audio_spectrum'>('telemetry');
  const [widgetX, setWidgetX] = useState(1);
  const [widgetY, setWidgetY] = useState(1);
  const [widgetW, setWidgetW] = useState(2);
  const [widgetH, setWidgetH] = useState(2);
  const [widgetGlowColor, setWidgetGlowColor] = useState(palette.primary);

  // AI Synthesis Platform states
  const [activeTab, setActiveTab] = useState<'manual' | 'ai' | 'hud'>('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedWidget, setGeneratedWidget] = useState<{
    name: string;
    type: 'terminal' | 'radar' | 'telemetry' | 'audio_spectrum';
    x: number;
    y: number;
    w: number;
    h: number;
    icon: string;
    glowColor: string;
    explanation: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Real-time HUD Status and telemetry stats synced from DiagnosticHUD component via CustomEvents
  const [hudStats, setHudStats] = useState({
    hudActive: true,
    injectionRate: 3000,
    sysTemp: 64.8,
    pwrDraw: 184.2,
    cpuFreq: 4.82,
    fanSpeed: 3820
  });

  // Track live event updates from DiagnosticHUD
  useEffect(() => {
    const handleStats = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setHudStats(customEvent.detail);
      }
    };
    
    window.addEventListener('hud-stats', handleStats);
    
    // Request fresh stats immediately
    window.dispatchEvent(new CustomEvent('hud-request-stats'));
    
    return () => {
      window.removeEventListener('hud-stats', handleStats);
    };
  }, [isDrawerOpen, activeTab]);

  // Drag and Drop Ref & States
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [draggingWidget, setDraggingWidget] = useState<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startWidgetX: number;
    startWidgetY: number;
  } | null>(null);

  // Keyboard navigation for selected unlocked panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWidgetId) return;

      // Ignore if typing inside input, textarea, or contentEditable
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      const activeWidget = widgets.find(w => w.id === selectedWidgetId);
      if (!activeWidget || activeWidget.isLocked) return;

      let newX = activeWidget.x;
      let newY = activeWidget.y;
      let moved = false;

      if (e.key === 'ArrowLeft') {
        newX = Math.max(1, activeWidget.x - 1);
        moved = true;
      } else if (e.key === 'ArrowRight') {
        newX = Math.min(gridConfig.columns - activeWidget.w + 1, activeWidget.x + 1);
        moved = true;
      } else if (e.key === 'ArrowUp') {
        newY = Math.max(1, activeWidget.y - 1);
        moved = true;
      } else if (e.key === 'ArrowDown') {
        newY = Math.min(gridConfig.rows - activeWidget.h + 1, activeWidget.y + 1);
        moved = true;
      }

      if (moved) {
        e.preventDefault(); // Stop default scroll
        if (acousticFeedback) soundEngine.playClick();
        setWidgets(prev => prev.map(w => w.id === selectedWidgetId ? { ...w, x: newX, y: newY } : w));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedWidgetId, widgets, gridConfig.columns, gridConfig.rows, acousticFeedback]);

  // Click & Drag mouse events
  const handleMouseDown = (e: React.MouseEvent, widget: ModularWidget) => {
    if (widget.isLocked) return;

    // Do not initiate drag if user clicked an inner interactive button/input
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    e.preventDefault();
    setSelectedWidgetId(widget.id);
    if (acousticFeedback) soundEngine.playClick();

    setDraggingWidget({
      id: widget.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWidgetX: widget.x,
      startWidgetY: widget.y
    });
  };

  // Touch Drag implementation
  const handleTouchStart = (e: React.TouchEvent, widget: ModularWidget) => {
    if (widget.isLocked) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    setSelectedWidgetId(widget.id);
    if (acousticFeedback) soundEngine.playClick();

    const touch = e.touches[0];
    setDraggingWidget({
      id: widget.id,
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
      startWidgetX: widget.x,
      startWidgetY: widget.y
    });
  };

  // Mouse Drag tracker effect
  useEffect(() => {
    if (!draggingWidget) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      const targetWidget = widgets.find(w => w.id === draggingWidget.id);
      if (!targetWidget || targetWidget.isLocked) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const cellWidth = gridRect.width / gridConfig.columns;
      const cellHeight = gridRect.height / gridConfig.rows;

      const diffX = e.clientX - draggingWidget.startMouseX;
      const diffY = e.clientY - draggingWidget.startMouseY;

      const deltaCols = Math.round(diffX / cellWidth);
      const deltaRows = Math.round(diffY / cellHeight);

      const newX = Math.max(1, Math.min(gridConfig.columns - targetWidget.w + 1, draggingWidget.startWidgetX + deltaCols));
      const newY = Math.max(1, Math.min(gridConfig.rows - targetWidget.h + 1, draggingWidget.startWidgetY + deltaRows));

      if (newX !== targetWidget.x || newY !== targetWidget.y) {
        setWidgets(prev => prev.map(w => w.id === draggingWidget.id ? { ...w, x: newX, y: newY } : w));
      }
    };

    const handleMouseUp = () => {
      if (acousticFeedback) soundEngine.playClick();
      setDraggingWidget(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWidget, widgets, gridConfig.columns, gridConfig.rows, acousticFeedback]);

  // Touch Drag tracker effect
  useEffect(() => {
    if (!draggingWidget) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!gridRef.current) return;

      const targetWidget = widgets.find(w => w.id === draggingWidget.id);
      if (!targetWidget || targetWidget.isLocked) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const cellWidth = gridRect.width / gridConfig.columns;
      const cellHeight = gridRect.height / gridConfig.rows;

      const touch = e.touches[0];
      const diffX = touch.clientX - draggingWidget.startMouseX;
      const diffY = touch.clientY - draggingWidget.startMouseY;

      const deltaCols = Math.round(diffX / cellWidth);
      const deltaRows = Math.round(diffY / cellHeight);

      const newX = Math.max(1, Math.min(gridConfig.columns - targetWidget.w + 1, draggingWidget.startWidgetX + deltaCols));
      const newY = Math.max(1, Math.min(gridConfig.rows - targetWidget.h + 1, draggingWidget.startWidgetY + deltaRows));

      if (newX !== targetWidget.x || newY !== targetWidget.y) {
        setWidgets(prev => prev.map(w => w.id === draggingWidget.id ? { ...w, x: newX, y: newY } : w));
      }
    };

    const handleTouchEnd = () => {
      if (acousticFeedback) soundEngine.playClick();
      setDraggingWidget(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingWidget, widgets, gridConfig.columns, gridConfig.rows, acousticFeedback]);

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

  const handleAiSynthesize = async () => {
    if (!aiPrompt.trim()) return;
    playSwitch();
    setIsAiGenerating(true);
    setAiError(null);
    setGeneratedWidget(null);

    try {
      const response = await fetch('/api/generate-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: aiPrompt,
          currentWidgets: widgets.map(w => ({ id: w.id, type: w.type, x: w.x, y: w.y, w: w.w, h: w.h })),
          gridColumns: gridConfig.columns,
          gridRows: gridConfig.rows
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to synthesize module.');
      }

      const data = await response.json();
      setGeneratedWidget(data);
      if (acousticFeedback) soundEngine.playSweep(true);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error occurred during cognitive synthesis.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleDeployAiWidget = () => {
    if (!generatedWidget) return;
    playSwitch();
    if (acousticFeedback) soundEngine.playSweep(true);

    const id = 'widget_ai_' + Date.now();
    const newWidget: ModularWidget = {
      id,
      type: generatedWidget.type,
      name: generatedWidget.name,
      x: generatedWidget.x,
      y: generatedWidget.y,
      w: generatedWidget.w,
      h: generatedWidget.h,
      icon: generatedWidget.icon,
      glowColor: generatedWidget.glowColor,
      isLocked: false,
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(id);
    setGeneratedWidget(null);
    setAiPrompt('');
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
    playSwitch();
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
          isLocked: false
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
          isLocked: false
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
          isLocked: false
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
          isLocked: false
        }
      ]);
    }
  }, []);

  return (
    <div className="relative flex flex-col h-full w-full font-mono text-xs select-none overflow-hidden">
      
      {/* 1. Main Matrix Canvas Area */}
      <div className="flex-1 flex flex-col space-y-2 relative h-full w-full">
        <div className="flex justify-between items-center bg-black/40 px-3 py-1.5 border border-slate-800 rounded">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 animate-pulse" style={{ color: palette.primary }} />
            <span className="font-bold text-slate-300">CENTRAL PROTOTYPE CONSOLE (STAGE A)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] opacity-40 hidden sm:inline">GRID SNAP LOCK: {gridConfig.snapToGrid ? 'ON' : 'OFF'}</span>
            <button
              onClick={() => {
                if (acousticFeedback) soundEngine.playSwitch();
                setIsDrawerOpen(!isDrawerOpen);
              }}
              className="px-2.5 py-1 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-[9px] tracking-wider cursor-pointer flex items-center space-x-1 transition-all"
              style={{ borderColor: isDrawerOpen ? palette.primary : 'rgba(51, 65, 85, 0.4)' }}
            >
              <Sliders className="w-3.5 h-3.5" style={{ color: palette.primary }} />
              <span>{isDrawerOpen ? 'CLOSE DRAWER' : 'DEPLOY PANEL ◀'}</span>
            </button>
          </div>
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
            ref={gridRef}
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
                  onMouseDown={(e) => handleMouseDown(e, w)}
                  onTouchStart={(e) => handleTouchStart(e, w)}
                  className={`relative flex flex-col border rounded overflow-hidden transition-all duration-300 group select-none ${
                    w.isLocked 
                      ? 'cursor-pointer' 
                      : draggingWidget?.id === w.id 
                      ? 'cursor-grabbing' 
                      : 'cursor-grab'
                  } ${
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

                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (acousticFeedback) {
                            soundEngine.playClick();
                            soundEngine.playSwitch();
                          }
                          toggleLockWidget(w.id);
                        }}
                        className="p-1.5 rounded bg-slate-950/40 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer relative z-10 border border-slate-800/40"
                        title={w.isLocked ? "Unlock Widget (Locked)" : "Lock Widget (Unlocked)"}
                      >
                        {w.isLocked ? (
                          <Lock className="w-[18px] h-[18px] text-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.7)] animate-pulse" />
                        ) : (
                          <Unlock className="w-[18px] h-[18px] text-emerald-500 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.7)]" />
                        )}
                      </button>
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

      {/* Retractable floating pull-out handles on the right edge */}
      <AnimatePresence>
        {!isDrawerOpen && (
          <>
            {/* Diagnostic HUD Pullout Tab */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => {
                if (acousticFeedback) soundEngine.playSwitch();
                setActiveTab('hud');
                setIsDrawerOpen(true);
              }}
              className="absolute right-0 top-1/2 -translate-y-[165%] z-20 flex items-center bg-[#07090b]/95 border border-slate-800 border-r-0 hover:border-slate-700 rounded-l px-2.5 py-4 cursor-pointer group shadow-lg transition-all"
              style={{ 
                boxShadow: `inset 0 0 10px rgba(6,182,212,0.15), 0 4px 15px rgba(0,0,0,0.6)`,
                borderLeft: `2.5px solid #06b6d4`
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <LucideIcons.LineChart className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-[9px] font-bold text-cyan-400 group-hover:text-cyan-300 tracking-widest uppercase select-none [writing-mode:vertical-lr] rotate-180">
                  DIAGNOSTIC HUD
                </span>
                <span className="text-[10px] text-cyan-500 font-bold group-hover:text-cyan-300">◀</span>
              </div>
            </motion.button>

            {/* AI Compiler Pullout Tab */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => {
                if (acousticFeedback) soundEngine.playSwitch();
                setActiveTab('ai');
                setIsDrawerOpen(true);
              }}
              className="absolute right-0 top-1/2 -translate-y-[55%] z-20 flex items-center bg-[#07090b]/95 border border-slate-800 border-r-0 hover:border-slate-700 rounded-l px-2.5 py-4 cursor-pointer group shadow-lg transition-all"
              style={{ 
                boxShadow: `inset 0 0 10px rgba(16,185,129,0.15), 0 4px 15px rgba(0,0,0,0.6)`,
                borderLeft: `2.5px solid #10b981`
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-bold text-emerald-400 group-hover:text-emerald-300 tracking-widest uppercase select-none [writing-mode:vertical-lr] rotate-180">
                  AI COMPILER
                </span>
                <span className="text-[10px] text-emerald-500 font-bold group-hover:text-emerald-300">◀</span>
              </div>
            </motion.button>

            {/* Config Panel Pullout Tab */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => {
                if (acousticFeedback) soundEngine.playSwitch();
                setActiveTab('manual');
                setIsDrawerOpen(true);
              }}
              className="absolute right-0 top-1/2 -translate-y-[-55%] z-20 flex items-center bg-[#07090b]/95 border border-slate-800 border-r-0 hover:border-slate-700 rounded-l px-2.5 py-4 cursor-pointer group shadow-lg transition-all"
              style={{ 
                boxShadow: `inset 0 0 10px ${palette.glowLight}, 0 4px 15px rgba(0,0,0,0.6)`,
                borderLeft: `2.5px solid ${palette.primary}`
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <Sliders className="w-4 h-4 text-slate-300 group-hover:text-white" style={{ color: palette.primary }} />
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-white tracking-widest uppercase select-none [writing-mode:vertical-lr] rotate-180">
                  CONFIG PANEL
                </span>
                <span className="text-[10px] text-slate-500 font-bold group-hover:text-white">◀</span>
              </div>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Shield */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (acousticFeedback) soundEngine.playClick();
                setIsDrawerOpen(false);
              }}
              className="absolute inset-0 bg-black/60 z-20 cursor-pointer pointer-events-auto"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 190 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-[#07090b]/98 border-l border-slate-800 z-30 p-4 flex flex-col space-y-4 shadow-2xl pointer-events-auto"
              style={{
                boxShadow: `-10px 0 30px rgba(0,0,0,0.85), inset 0 0 15px ${palette.glowLight}`,
                borderLeft: `2.5px solid ${activeTab === 'ai' ? '#10b981' : activeTab === 'hud' ? '#06b6d4' : palette.primary}`
              }}
            >
              {/* Heavy terminal frame corner ticks */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-700 opacity-40"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-slate-700 opacity-40"></div>

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  {activeTab === 'ai' ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  ) : activeTab === 'hud' ? (
                    <LucideIcons.LineChart className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : (
                    <SlidersHorizontal className="w-4 h-4" style={{ color: palette.primary }} />
                  )}
                  <div>
                    <span className="text-[10px] tracking-widest text-slate-200 uppercase font-bold block">
                      {activeTab === 'ai' ? 'AI MODULE SYNTHESIS' : activeTab === 'hud' ? 'DIAGNOSTIC HUD' : 'DEPLOYMENT PANEL'}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">
                      {activeTab === 'ai' ? 'MODEL_COHERENCE_ORCHESTRATOR' : activeTab === 'hud' ? 'REALTIME_SENSOR_MATRIX' : 'CALIBRATION_DECK_07'}
                    </span>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => {
                    if (acousticFeedback) soundEngine.playSwitch();
                    setIsDrawerOpen(false);
                  }}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[9px] font-bold cursor-pointer flex items-center space-x-1"
                >
                  <span>CLOSE [▶]</span>
                </button>
              </div>

              {/* Scrollable form controls */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* Triple Mode Switcher Tab Group */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950/90 border border-slate-900 p-1 rounded">
                  <button
                    onClick={() => { playClick(); setActiveTab('manual'); }}
                    className={`py-1.5 text-[8.5px] font-bold uppercase rounded tracking-wider cursor-pointer transition-all ${
                      activeTab === 'manual'
                        ? 'bg-slate-900/90 text-white border border-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    style={{ color: activeTab === 'manual' ? palette.primary : 'inherit' }}
                  >
                    MANUAL
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab('ai'); }}
                    className={`py-1.5 text-[8.5px] font-bold uppercase rounded tracking-wider cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                      activeTab === 'ai'
                        ? 'bg-slate-900/90 text-white border border-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    style={{ color: activeTab === 'ai' ? palette.primary : 'inherit' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
                    <span>AI COMPILE</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab('hud'); }}
                    className={`py-1.5 text-[8.5px] font-bold uppercase rounded tracking-wider cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                      activeTab === 'hud'
                        ? 'bg-slate-900/90 text-white border border-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    style={{ color: activeTab === 'hud' ? palette.primary : 'inherit' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400" />
                    <span>DIAG HUD</span>
                  </button>
                </div>

                {activeTab === 'manual' && (
                  <div className="space-y-4 font-sans">
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
                        <label className="text-[9px] text-slate-500 uppercase block font-bold">ELEMENT TITLE</label>
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
                        <label className="text-[9px] text-slate-500 uppercase block font-bold">COGNITIVE MODULE PATTERN</label>
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
                              className={`py-1.5 rounded border text-[9px] transition-all flex flex-col items-center justify-center cursor-pointer ${
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
                      <div className="border border-slate-800 bg-black/45 p-2.5 rounded space-y-3">
                        <span className="text-[9px] tracking-widest text-slate-500 uppercase block border-b border-slate-800/60 pb-1 font-bold">COGNITIVE PLACEMENT (SNAP LOCK)</span>

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
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        AI MODULE SYNTHESIS
                      </span>
                      <p className="text-[9px] text-slate-500">Describe your custom module idea to automatically compile grid telemetry parameters.</p>
                    </div>

                    {/* Architectural constraints banner */}
                    <div className="p-2 bg-slate-950/80 border border-slate-900/80 rounded space-y-1 text-slate-400">
                      <span className="text-[8.5px] font-bold text-slate-500 block uppercase tracking-wider">📐 PHYSICAL HARDWARE CONSTRAINTS</span>
                      <p className="text-[8px] leading-relaxed">
                        The Sepulchral AI strictly operates under existing render modules: <b className="text-slate-300">Telemetry</b> (waves), <b className="text-slate-300">Radar</b> (scans), <b className="text-slate-300">Terminal</b> (logs), and <b className="text-slate-300">Audio Spectrum</b> (vocals). Non-compatible hardware elements will not be synthesized.
                      </p>
                    </div>

                    {/* Pre-configured Quick Ideas */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 uppercase block font-bold">SAMPLE BLUEPRINTS</label>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { text: "🛡️ THREAT RADAR", idea: "A radar layout placed nicely near coordinates with a rosa pink alarm tracker tracking incoming ballistic or solar threat vectors" },
                          { text: "⚡ FUSION FREQUENCY", idea: "A telemetry widget monitoring a stable cyan-colored core fusion reactor energy waveform" },
                          { text: "📝 ERROR COMPILER LOGGER", idea: "A terminal console that records and lists fatal compile warnings, drift status logs, and memory buffers" }
                        ].map((blueprint) => (
                          <button
                            key={blueprint.text}
                            onClick={() => { playClick(); setAiPrompt(blueprint.idea); }}
                            className="w-full px-2 py-1 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left text-[8px] text-slate-400 hover:text-white rounded transition-colors cursor-pointer truncate font-mono uppercase"
                          >
                            {blueprint.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Input area */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase block font-bold">DESCRIBE MODULE INSTANCE</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="E.G. A cyber defense orbital scanner tracking debris in outer sectors..."
                        rows={3}
                        className="w-full bg-slate-950/80 border border-slate-800 px-2 py-1.5 rounded focus:outline-none focus:border-current text-[10px] text-white font-mono placeholder:text-slate-600 resize-none"
                      />
                    </div>

                    {/* Compile Trigger Button */}
                    <button
                      onClick={handleAiSynthesize}
                      disabled={isAiGenerating || !aiPrompt.trim()}
                      className={`w-full py-2 border rounded font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer ${
                        isAiGenerating || !aiPrompt.trim()
                          ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                          : 'bg-indigo-950/20 hover:bg-indigo-900/40 border-indigo-900 hover:border-indigo-400 text-indigo-300'
                      }`}
                    >
                      {isAiGenerating ? 'SYNTHESIZING MATRIX...' : 'COMPILE INTELLECT IDEA'}
                    </button>

                    {/* AI Loading scanning line animation */}
                    {isAiGenerating && (
                      <div className="relative h-1.5 w-full bg-slate-950 rounded overflow-hidden border border-slate-900">
                        <div 
                          className="h-full absolute top-0 bottom-0 animate-pulse"
                          style={{
                            width: '40%',
                            backgroundColor: palette.primary,
                            animation: 'scannerMove 1.5s infinite ease-in-out'
                          }}
                        />
                        <style>{`
                          @keyframes scannerMove {
                            0% { left: -40%; }
                            100% { left: 100%; }
                          }
                        `}</style>
                      </div>
                    )}

                    {/* Error display */}
                    {aiError && (
                      <div className="p-2 border border-rose-900 bg-rose-950/20 text-rose-400 rounded font-mono text-[8.5px] leading-relaxed">
                        <span className="font-bold block uppercase mb-0.5">⚠️ SYNTHESIS_ERROR:</span>
                        {aiError}
                      </div>
                    )}

                    {/* AI Generated layout output card */}
                    {generatedWidget && (
                      <div 
                        className="border bg-slate-950/90 p-3 rounded space-y-2.5 relative overflow-hidden"
                        style={{ borderColor: generatedWidget.glowColor + '40' }}
                      >
                        {/* Simulated visual widget preview box matching generated type */}
                        <div className="absolute top-1 right-2 px-1 py-0.5 rounded text-[7px] font-bold border border-current bg-black/60 capitalize" style={{ color: generatedWidget.glowColor }}>
                          {generatedWidget.type}
                        </div>

                        <span className="text-[8.5px] tracking-widest text-slate-500 uppercase block border-b border-slate-800 pb-1 font-bold">SYNTHESIZED BLUEPRINT SPECTRA</span>

                        <div className="space-y-1 text-[9px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">MODULE TITLE:</span>
                            <span className="font-bold font-mono tracking-wider text-white flex items-center space-x-1">
                              <span className="inline-block w-2 h-2 rounded-full mr-1 animate-pulse" style={{ backgroundColor: generatedWidget.glowColor }} />
                              {generatedWidget.name}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">COMPILER CLASSIFICATION:</span>
                            <span className="text-slate-200 font-bold uppercase">{generatedWidget.type.replace('_', ' ')}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">COGNITIVE PLACEMENT:</span>
                            <span className="text-slate-200">Col {generatedWidget.x}, Row {generatedWidget.y} <b className="text-slate-400">[{generatedWidget.w}x{generatedWidget.h}]</b></span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">VECTOR GLYPH SYMBOL:</span>
                            <span className="text-slate-200 font-bold flex items-center gap-1">
                              {getWidgetIcon(generatedWidget.icon)}
                              {generatedWidget.icon}
                            </span>
                          </div>
                        </div>

                        <div className="p-1.5 bg-black/50 border border-slate-900 rounded font-sans text-[8.5px] text-slate-400 leading-relaxed italic">
                          "{generatedWidget.explanation}"
                        </div>

                        {/* Deploy Synthesized widget trigger button */}
                        <button
                          onClick={handleDeployAiWidget}
                          className="w-full py-1.5 bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900 hover:border-emerald-400 text-emerald-300 rounded font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer"
                        >
                          INITIALIZE SYNTHESIS ASSET
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'hud' && (
                  <div className="space-y-4 font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1 font-sans">
                        <LucideIcons.LineChart className="w-4 h-4 text-cyan-400 animate-pulse" />
                        DIAGNOSTIC TELEMETRY
                      </span>
                      <p className="text-[9px] text-slate-500 font-sans">View real-time engine vitals, toggle sensors, and inject live probes.</p>
                    </div>

                    {/* Compact Interactive HUD Controls */}
                    <div className="border border-slate-800 bg-slate-950/80 p-3 rounded space-y-3 shadow-inner">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                        <span className="text-[8.5px] text-slate-500 uppercase block font-bold">STATE CONTROLLER</span>
                        <div className="flex items-center space-x-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${hudStats.hudActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                          <span className="text-[8px] font-bold text-slate-400 tracking-tight uppercase">
                            {hudStats.hudActive ? 'SENSORS_ON' : 'SLEEP'}
                          </span>
                        </div>
                      </div>

                      {/* Primary Toggle Switch */}
                      <button
                        onClick={() => {
                          playSwitch();
                          window.dispatchEvent(new CustomEvent('hud-control', { detail: { type: 'toggle' } }));
                        }}
                        className={`w-full text-center py-2 rounded font-bold tracking-widest transition-all cursor-pointer border text-[9px] ${
                          hudStats.hudActive 
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30' 
                            : 'bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-900/30'
                        }`}
                      >
                        {hudStats.hudActive ? 'DISABLE FLOATING SENSORS' : 'ENGAGE FLOATING SENSORS'}
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Quick Inject trigger */}
                        <button
                          onClick={() => {
                            playClick();
                            window.dispatchEvent(new CustomEvent('hud-control', { detail: { type: 'inject' } }));
                          }}
                          disabled={!hudStats.hudActive}
                          className="text-center py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 font-bold text-slate-300 tracking-wide text-[8.5px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          INJECT RANDOM
                        </button>

                        {/* Cycle Speed toggle */}
                        <button
                          onClick={() => {
                            playClick();
                            const nextRate = hudStats.injectionRate === 1500 ? 3000 : hudStats.injectionRate === 3000 ? 5000 : 1500;
                            window.dispatchEvent(new CustomEvent('hud-control', { detail: { type: 'set-rate', value: nextRate } }));
                          }}
                          disabled={!hudStats.hudActive}
                          className="text-center py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 font-bold text-slate-300 tracking-wide text-[8.5px] transition-all cursor-pointer disabled:opacity-40"
                        >
                          CYCLE: {hudStats.injectionRate}MS
                        </button>
                      </div>
                    </div>

                    {/* Numerical Gauges deck */}
                    <div className="border border-slate-800 bg-black/45 p-2.5 rounded space-y-3 text-[9px]">
                      <span className="text-[8.5px] tracking-widest text-slate-500 uppercase block border-b border-slate-800/60 pb-1 font-bold">REALTIME GAUGE READOUTS</span>
                      
                      {/* CPU FREQ */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>CORE FLUX FREQUENCY</span>
                          <span className="text-emerald-400 font-mono font-bold">{hudStats.cpuFreq} GHz</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, ((hudStats.cpuFreq - 3.2) / 1.9) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* TEMP */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>CHASSIS THERMAL READOUT</span>
                          <span className="text-rose-400 font-mono font-bold">{hudStats.sysTemp}°C</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, ((hudStats.sysTemp - 52) / 32) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* POWER DRAW */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>BUS POWER DRAW THROUGHPUT</span>
                          <span className="text-yellow-400 font-mono font-bold">{hudStats.pwrDraw} W</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-yellow-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, ((hudStats.pwrDraw - 120) / 170) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* COOLER RPM */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>ACTIVE COOLER BLADE VELOCITY</span>
                          <span className="text-cyan-400 font-mono font-bold">{hudStats.fanSpeed} RPM</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, ((hudStats.fanSpeed - 2500) / 2300) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sensor Catalog to Click & Inject */}
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] text-slate-500 uppercase block font-bold font-sans">CLICK SENSOR TO INJECT SIGNAL</label>
                      <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-0.5 border border-slate-900 rounded p-1 bg-slate-950/30">
                        {[
                          { label: 'SYS_CORE_0_TEMP', val: `${hudStats.sysTemp}°C`, color: 'text-rose-500', icon: LucideIcons.Thermometer },
                          { label: 'GPU_HOTSPOT_PROBE', val: `${(hudStats.sysTemp + 4.2).toFixed(1)}°C`, color: 'text-orange-400', icon: LucideIcons.Flame },
                          { label: 'BUS_PWR_THROUGHPUT', val: `${hudStats.pwrDraw} W`, color: 'text-yellow-400', icon: LucideIcons.Zap },
                          { label: 'CPU_CORE_FREQ_LOG', val: `${hudStats.cpuFreq} GHz`, color: 'text-emerald-400', icon: LucideIcons.Cpu },
                          { label: 'ACTIVE_COOLER_RPM', val: `${hudStats.fanSpeed} RPM`, color: 'text-cyan-400', icon: LucideIcons.Fan },
                          { label: 'COGNITIVE_DRIFT', val: `0.082 ms`, color: 'text-pink-400', icon: LucideIcons.Activity },
                          { label: 'VECTOR_ALIGNS_PACKET', val: `7x9 COMP_OK`, color: 'text-purple-400', icon: LucideIcons.Crosshair },
                          { label: 'DB_BUFFER_FLUSH', val: `4.8 MB/s`, color: 'text-blue-400', icon: LucideIcons.Database },
                          { label: 'PORT_STREAM_GATE', val: `3000 // OPEN`, color: 'text-amber-500', icon: LucideIcons.Network },
                          { label: 'WIFI_TELEMETRY_LATENCY', val: `12 ms`, color: 'text-indigo-400', icon: LucideIcons.Wifi },
                        ].map((sensor, idx) => {
                          const IconComp = sensor.icon;
                          return (
                            <button
                              key={sensor.label}
                              disabled={!hudStats.hudActive}
                              onClick={() => {
                                playClick();
                                window.dispatchEvent(new CustomEvent('hud-control', { detail: { type: 'inject', value: idx } }));
                              }}
                              className="w-full flex items-center justify-between p-1.5 bg-slate-900/40 hover:bg-slate-800/60 disabled:hover:bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/80 rounded text-left text-[8px] text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed group"
                            >
                              <div className="flex items-center space-x-1.5 truncate">
                                <IconComp className={`w-3 h-3 ${sensor.color} shrink-0`} />
                                <span className="font-mono text-[7.5px] truncate">{sensor.label}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 font-mono shrink-0">
                                <span className="text-white font-bold text-[8px]">{sensor.val}</span>
                                <span className="text-slate-600 group-hover:text-emerald-400 transition-colors font-bold text-[9px] shrink-0">▶</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Widget controller panel */}
                {selectedWidgetId ? (
                  <div className="border border-slate-800 bg-slate-950/60 p-2.5 rounded flex flex-col space-y-2.5">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-bold">
                      <span>SELECTED ENTITY</span>
                      <span className="text-white font-bold">{selectedWidgetId}</span>
                    </div>

                    {/* Placement Adjuster for Active selections */}
                    <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1.5 rounded">
                      <button
                        onClick={() => {
                          const w = widgets.find(w => w.id === selectedWidgetId);
                          if (w) updateWidgetPosition(selectedWidgetId, 'x', Math.max(1, w.x - 1));
                        }}
                        className="py-1.5 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px] cursor-pointer"
                      >
                        MOVE LEFT
                      </button>
                      <button
                        onClick={() => {
                          const w = widgets.find(w => w.id === selectedWidgetId);
                          if (w) updateWidgetPosition(selectedWidgetId, 'x', Math.min(gridConfig.columns - w.w + 1, w.x + 1));
                        }}
                        className="py-1.5 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px] cursor-pointer"
                      >
                        MOVE RIGHT
                      </button>
                      <button
                        onClick={() => {
                          const w = widgets.find(w => w.id === selectedWidgetId);
                          if (w) updateWidgetPosition(selectedWidgetId, 'y', Math.max(1, w.y - 1));
                        }}
                        className="py-1.5 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px] cursor-pointer"
                      >
                        MOVE UP
                      </button>
                      <button
                        onClick={() => {
                          const w = widgets.find(w => w.id === selectedWidgetId);
                          if (w) updateWidgetPosition(selectedWidgetId, 'y', Math.min(gridConfig.rows - w.h + 1, w.y + 1));
                        }}
                        className="py-1.5 text-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded uppercase text-[8px] cursor-pointer"
                      >
                        MOVE DOWN
                      </button>
                    </div>

                    {/* Style & Property Editor Deck */}
                    <div className="border border-slate-900 bg-black/30 p-2 rounded space-y-2.5">
                      <span className="text-[8px] tracking-wider text-slate-500 uppercase block border-b border-slate-900 pb-1 font-bold">🎨 STYLE CALIBRATION DECK</span>
                      
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-bold">ELEMENT TITLE</label>
                        <input
                          type="text"
                          value={widgets.find(w => w.id === selectedWidgetId)?.name || ''}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/\s+/g, '_');
                            setWidgets(prev => prev.map(w => w.id === selectedWidgetId ? { ...w, name: val } : w));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[9px] text-white font-mono uppercase focus:outline-none focus:border-current"
                          style={{ borderColor: widgets.find(w => w.id === selectedWidgetId)?.glowColor + '60' }}
                        />
                      </div>

                      {/* Width & Height adjuster */}
                      <div className="space-y-2 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>SPAN WIDTH</span>
                            <span>{widgets.find(w => w.id === selectedWidgetId)?.w} CELLS</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max={gridConfig.columns} 
                            value={widgets.find(w => w.id === selectedWidgetId)?.w || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setWidgets(prev => prev.map(w => {
                                if (w.id === selectedWidgetId) {
                                  const safeW = Math.min(val, gridConfig.columns - w.x + 1);
                                  return { ...w, w: Math.max(1, safeW) };
                                }
                                return w;
                              }));
                            }}
                            className="w-full h-1 bg-slate-850 rounded-lg cursor-pointer"
                            style={{ accentColor: widgets.find(w => w.id === selectedWidgetId)?.glowColor }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>SPAN HEIGHT</span>
                            <span>{widgets.find(w => w.id === selectedWidgetId)?.h} CELLS</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max={gridConfig.rows} 
                            value={widgets.find(w => w.id === selectedWidgetId)?.h || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setWidgets(prev => prev.map(w => {
                                if (w.id === selectedWidgetId) {
                                  const safeH = Math.min(val, gridConfig.rows - w.y + 1);
                                  return { ...w, h: Math.max(1, safeH) };
                                }
                                return w;
                              }));
                            }}
                            className="w-full h-1 bg-slate-850 rounded-lg cursor-pointer"
                            style={{ accentColor: widgets.find(w => w.id === selectedWidgetId)?.glowColor }}
                          />
                        </div>
                      </div>

                      {/* Glow Accent Selection */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-900/60">
                        <label className="text-[8px] text-slate-500 block font-bold">GLOW ACCENT SELECTION</label>
                        <div className="flex items-center gap-1.5">
                          {[
                            { hex: '#14b8a6', label: 'Cyan' },
                            { hex: '#f59e0b', label: 'Amber' },
                            { hex: '#10b981', label: 'Emerald' },
                            { hex: '#8b5cf6', label: 'Violet' },
                            { hex: '#f43f5e', label: 'Rose' },
                            { hex: '#e2e8f0', label: 'Ice' }
                          ].map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => {
                                playClick();
                                setWidgets(prev => prev.map(w => w.id === selectedWidgetId ? { ...w, glowColor: color.hex } : w));
                              }}
                              className={`w-4.5 h-4.5 rounded-sm transition-all border ${
                                widgets.find(w => w.id === selectedWidgetId)?.glowColor === color.hex
                                  ? 'border-white scale-110 shadow-lg'
                                  : 'border-slate-800 hover:scale-105'
                              }`}
                              style={{ 
                                backgroundColor: color.hex,
                                boxShadow: widgets.find(w => w.id === selectedWidgetId)?.glowColor === color.hex 
                                  ? `0 0 6px ${color.hex}` 
                                  : 'none'
                              }}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1.5 pt-1.5 border-t border-slate-900/60">
                      <button
                        onClick={() => toggleLockWidget(selectedWidgetId)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center space-x-1 uppercase text-[9px] cursor-pointer"
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
                        className="py-1.5 px-3 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900 text-rose-300 rounded flex items-center justify-center uppercase text-[9px] cursor-pointer"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
