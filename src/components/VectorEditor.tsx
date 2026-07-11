/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TerminalTheme, VectorShape, ColorGradingConfig } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import { Circle, Square, Edit, Trash2, Plus, Zap, RefreshCw, SlidersHorizontal, Sun, Layers } from 'lucide-react';

interface VectorEditorProps {
  theme: TerminalTheme;
  colorConfig: ColorGradingConfig;
  shapes: VectorShape[];
  setShapes: React.Dispatch<React.SetStateAction<VectorShape[]>>;
  acousticFeedback: boolean;
}

export const VectorEditor: React.FC<VectorEditorProps> = ({
  theme,
  colorConfig,
  shapes,
  setShapes,
  acousticFeedback
}) => {
  const palette = THEME_PALETTES[theme];
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<'select' | 'path' | 'rect' | 'circle'>('select');
  const [newPoints, setNewPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [strokeColor, setStrokeColor] = useState(palette.primary);
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [glowRadius, setGlowRadius] = useState(6);
  const [opacity, setOpacity] = useState(0.8);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Keep stroke color updated with theme
    setStrokeColor(palette.primary);
  }, [theme]);

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (drawMode === 'path') {
      playClick();
      setNewPoints(prev => [...prev, { x, y }]);
    } else if (drawMode === 'rect' || drawMode === 'circle') {
      playSwitch();
      const id = 'shape_' + Date.now();
      const newShape: VectorShape = {
        id,
        type: drawMode === 'rect' ? 'rect' : 'circle',
        points: [{ x, y }],
        strokeColor,
        fillColor: fillColor === 'transparent' ? 'transparent' : strokeColor + '20',
        strokeWidth,
        glowRadius,
        opacity
      };
      setShapes(prev => [...prev, newShape]);
      setSelectedShapeId(id);
      setDrawMode('select');
    }
  };

  const completePath = () => {
    if (newPoints.length < 2) return;
    playSwitch();
    const id = 'shape_' + Date.now();
    const newShape: VectorShape = {
      id,
      type: 'path',
      points: [...newPoints],
      strokeColor,
      fillColor: 'transparent',
      strokeWidth,
      glowRadius,
      opacity
    };
    setShapes(prev => [...prev, newShape]);
    setSelectedShapeId(id);
    setNewPoints([]);
    setDrawMode('select');
  };

  const clearCanvas = () => {
    playSwitch();
    setShapes([]);
    setSelectedShapeId(null);
    setNewPoints([]);
  };

  const deleteShape = (id: string) => {
    playSwitch();
    setShapes(prev => prev.filter(s => s.id !== id));
    if (selectedShapeId === id) setSelectedShapeId(null);
  };

  const loadPreset = (presetName: 'reticle' | 'hex' | 'scope' | 'nx-glyph') => {
    playSwitch();
    const id = 'shape_' + Date.now();
    let newShapes: VectorShape[] = [];

    if (presetName === 'reticle') {
      // Crosshair Scope Reticle
      newShapes = [
        {
          id: id + '_c1',
          type: 'circle',
          points: [{ x: 150, y: 150 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 1,
          glowRadius: 4,
          opacity: 0.5
        },
        {
          id: id + '_c2',
          type: 'circle',
          points: [{ x: 150, y: 150 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 10,
          opacity: 0.9
        },
        {
          id: id + '_p1',
          type: 'path',
          points: [{ x: 150, y: 50 }, { x: 150, y: 110 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 4,
          opacity: 0.8
        },
        {
          id: id + '_p2',
          type: 'path',
          points: [{ x: 150, y: 190 }, { x: 150, y: 250 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 4,
          opacity: 0.8
        },
        {
          id: id + '_p3',
          type: 'path',
          points: [{ x: 50, y: 150 }, { x: 110, y: 150 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 4,
          opacity: 0.8
        },
        {
          id: id + '_p4',
          type: 'path',
          points: [{ x: 190, y: 150 }, { x: 250, y: 150 }],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 4,
          opacity: 0.8
        }
      ];
    } else if (presetName === 'hex') {
      // Hexagonal Radar Tech Notch
      newShapes = [
        {
          id: id + '_hex',
          type: 'path',
          points: [
            { x: 150, y: 50 },
            { x: 236, y: 100 },
            { x: 236, y: 200 },
            { x: 150, y: 250 },
            { x: 64, y: 200 },
            { x: 64, y: 100 },
            { x: 150, y: 50 }
          ],
          strokeColor,
          fillColor: 'transparent',
          strokeWidth: 2,
          glowRadius: 8,
          opacity: 0.85
        }
      ];
    } else if (presetName === 'scope') {
      // Telemetry Notch Frame
      newShapes = [
        {
          id: id + '_rect',
          type: 'rect',
          points: [{ x: 150, y: 150 }],
          strokeColor,
          fillColor: strokeColor + '10',
          strokeWidth: 1.5,
          glowRadius: 6,
          opacity: 0.7
        },
        {
          id: id + '_notch',
          type: 'path',
          points: [{ x: 60, y: 60 }, { x: 90, y: 60 }, { x: 60, y: 90 }, { x: 60, y: 60 }],
          strokeColor,
          fillColor: strokeColor + '40',
          strokeWidth: 2,
          glowRadius: 8,
          opacity: 0.9
        }
      ];
    } else if (presetName === 'nx-glyph') {
      // NX glyph geometry with 22.5 degree slope and squared curves representation
      newShapes = [
        {
          id: id + '_nx_l1',
          type: 'path',
          points: [
            { x: 90, y: 80 },
            { x: 90, y: 220 },
            { x: 115, y: 220 },
            { x: 115, y: 140 },
            { x: 185, y: 220 },
            { x: 210, y: 220 },
            { x: 210, y: 80 },
            { x: 185, y: 80 },
            { x: 185, y: 160 },
            { x: 115, y: 80 },
            { x: 90, y: 80 }
          ],
          strokeColor,
          fillColor: strokeColor + '08',
          strokeWidth: 2,
          glowRadius: 8,
          opacity: 0.9
        },
        {
          id: id + '_nx_cut',
          type: 'path',
          points: [
            { x: 70, y: 110 },
            { x: 110, y: 70 },
            { x: 230, y: 190 },
            { x: 190, y: 230 },
            { x: 70, y: 110 }
          ],
          strokeColor: '#ef4444',
          fillColor: 'transparent',
          strokeWidth: 1.5,
          glowRadius: 10,
          opacity: 0.8
        }
      ];
    }

    setShapes(prev => [...prev, ...newShapes]);
    if (acousticFeedback) soundEngine.playSweep(true);
  };

  const getShapePath = (shape: VectorShape) => {
    if (shape.type === 'path') {
      return shape.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    if (shape.type === 'rect') {
      const center = shape.points[0];
      const size = 60; // default preset sizing
      return `M ${center.x - size} ${center.y - size} L ${center.x + size} ${center.y - size} L ${center.x + size} ${center.y + size} L ${center.x - size} ${center.y + size} Z`;
    }
    if (shape.type === 'circle') {
      const center = shape.points[0];
      const r = 45; // default size
      return `M ${center.x} ${center.y - r} A ${r} ${r} 0 1 1 ${center.x - 0.01} ${center.y - r} Z`;
    }
    return '';
  };

  // Convert color adjustment to real SVG filters
  const filterStyle = {
    filter: `
      brightness(${colorConfig.brightness}%) 
      contrast(${colorConfig.contrast}%) 
      saturate(${colorConfig.saturation}%) 
      hue-rotate(${colorConfig.hueRotate}deg)
    `
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs text-slate-300">
      {/* Tool Header Selector */}
      <div className="flex items-center justify-between p-2 bg-black/60 border-b border-slate-800">
        <div className="flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5" style={{ color: palette.primary }} />
          <span className="font-semibold text-slate-200">VECTOR LAB</span>
        </div>

        {/* Vector presets */}
        <div className="flex space-x-1.5">
          <button
            onClick={() => loadPreset('reticle')}
            className="px-1.5 py-0.5 rounded border border-slate-800 hover:border-current bg-slate-900/40 text-[9px] uppercase tracking-wider transition-colors"
          >
            + RETICLE
          </button>
          <button
            onClick={() => loadPreset('hex')}
            className="px-1.5 py-0.5 rounded border border-slate-800 hover:border-current bg-slate-900/40 text-[9px] uppercase tracking-wider transition-colors"
          >
            + HEXAGON
          </button>
          <button
            onClick={() => loadPreset('scope')}
            className="px-1.5 py-0.5 rounded border border-slate-800 hover:border-current bg-slate-900/40 text-[9px] uppercase tracking-wider transition-colors"
          >
            + NOTCH
          </button>
          <button
            onClick={() => loadPreset('nx-glyph')}
            className="px-1.5 py-0.5 rounded border border-rose-900 hover:border-rose-400 text-rose-400 bg-rose-950/20 text-[9px] uppercase font-bold tracking-wider transition-all"
          >
            + NX GLYPH
          </button>
        </div>
      </div>

      {/* Vector Editor Area: SVG Draw Area */}
      <div className="flex-1 min-h-[220px] bg-slate-950/90 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
        {/* Draw tool state controls */}
        <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1 bg-black/80 border border-slate-800 p-1 rounded">
          <button
            onClick={() => { playClick(); setDrawMode('select'); }}
            className={`p-1.5 rounded text-left transition-colors flex items-center space-x-1.5 ${drawMode === 'select' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="text-[9px]">SELECT</span>
          </button>
          <button
            onClick={() => { playClick(); setDrawMode('path'); }}
            className={`p-1.5 rounded text-left transition-colors flex items-center space-x-1.5 ${drawMode === 'path' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[9px]">PATH</span>
          </button>
          <button
            onClick={() => { playClick(); setDrawMode('rect'); }}
            className={`p-1.5 rounded text-left transition-colors flex items-center space-x-1.5 ${drawMode === 'rect' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="text-[9px]">RECT</span>
          </button>
          <button
            onClick={() => { playClick(); setDrawMode('circle'); }}
            className={`p-1.5 rounded text-left transition-colors flex items-center space-x-1.5 ${drawMode === 'circle' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span className="text-[9px]">CIRCLE</span>
          </button>
        </div>

        {/* Dynamic coordinate overlay on active pointer */}
        {drawMode === 'path' && newPoints.length > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-black/80 px-2 py-0.5 rounded border border-slate-800 text-[9px] text-slate-400 flex items-center space-x-2">
            <span>Points: {newPoints.length}</span>
            <button 
              onClick={completePath}
              className="text-emerald-400 font-bold hover:underline"
            >
              [COMPLETE]
            </button>
          </div>
        )}

        {/* Real-time SVG Canvas */}
        <svg
          ref={svgRef}
          onClick={handleCanvasClick}
          className="w-full h-full min-h-[220px] max-h-[340px] cursor-crosshair relative"
          style={filterStyle}
        >
          {/* Neon Glow Filters */}
          <defs>
            <filter id="vector-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-heavy" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="1.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines in SVG */}
          <g opacity="0.12">
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={palette.primary} strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </g>

          {/* Draw active nodes when drawing a path */}
          {drawMode === 'path' && newPoints.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="3" fill={palette.primary} className="animate-pulse" />
              {idx > 0 && (
                <line 
                  x1={newPoints[idx - 1].x} 
                  y1={newPoints[idx - 1].y} 
                  x2={p.x} 
                  y2={p.y} 
                  stroke={palette.primary} 
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
              )}
            </g>
          ))}

          {/* Render active completed shapes */}
          {shapes.map((shape) => {
            const isSelected = selectedShapeId === shape.id;
            return (
              <g key={shape.id} onClick={(e) => {
                e.stopPropagation();
                playClick();
                setSelectedShapeId(shape.id);
              }}>
                <path
                  d={getShapePath(shape)}
                  stroke={shape.strokeColor}
                  strokeWidth={isSelected ? shape.strokeWidth + 1.5 : shape.strokeWidth}
                  fill={shape.fillColor}
                  opacity={shape.opacity}
                  filter={shape.glowRadius > 4 ? "url(#vector-glow)" : undefined}
                  className="transition-all duration-200 cursor-pointer hover:opacity-100"
                />
                {/* Visual Anchors for path drawing mode */}
                {isSelected && shape.points.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke={shape.strokeColor}
                    strokeWidth="1.5"
                    className="cursor-move"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {shapes.length === 0 && newPoints.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600 font-mono text-[10px] uppercase tracking-wider space-y-1">
            <SlidersHorizontal className="w-6 h-6 opacity-30 text-current" style={{ color: palette.primary }} />
            <span>NO VECTOR ENTITIES LOADED</span>
            <span>CLICK TO ADD OR LOAD A PRESET</span>
          </div>
        )}
      </div>

      {/* Vector Settings Configuration Panel */}
      <div className="p-3 bg-black/40 grid grid-cols-2 gap-3.5 border-t border-slate-900">
        <div className="space-y-2">
          <span className="text-[9px] tracking-widest text-slate-500 uppercase block">GRADIENT / RASTER OPTIONS</span>
          
          {/* Stroke Width Slider */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>STROKE THICKNESS</span>
              <span>{strokeWidth}px</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={strokeWidth}
              onInput={playClick}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setStrokeWidth(val);
                if (selectedShapeId) {
                  setShapes(prev => prev.map(s => s.id === selectedShapeId ? { ...s, strokeWidth: val } : s));
                }
              }}
              className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
              style={{ color: palette.primary }}
            />
          </div>

          {/* Glow Slider */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>GLOW ENERGY RADIUS</span>
              <span>{glowRadius}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="16" 
              value={glowRadius}
              onInput={playClick}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setGlowRadius(val);
                if (selectedShapeId) {
                  setShapes(prev => prev.map(s => s.id === selectedShapeId ? { ...s, glowRadius: val } : s));
                }
              }}
              className="w-full accent-current h-1 bg-slate-800 rounded-lg cursor-pointer"
              style={{ color: palette.primary }}
            />
          </div>
        </div>

        {/* Active entities and canvas sweep */}
        <div className="space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] tracking-widest text-slate-500 uppercase block">ACTIVE SHAPE SELECT</span>
            {selectedShapeId ? (
              <div className="flex items-center justify-between bg-black/60 p-1.5 rounded border border-slate-800 text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span className="text-white truncate max-w-[80px]">{selectedShapeId}</span>
                </div>
                <button
                  onClick={() => deleteShape(selectedShapeId)}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-black/20 p-1.5 rounded border border-slate-800/40 text-[10px] text-slate-500 text-center uppercase">
                NO ENTITY SELECT
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={clearCanvas}
              className="flex-1 py-1 text-center bg-rose-900/20 hover:bg-rose-900/30 border border-rose-900/50 hover:border-rose-400 text-rose-300 rounded uppercase text-[9px] font-bold transition-all"
            >
              CLEAR MATRIX
            </button>
            <button
              onClick={() => {
                playSwitch();
                setSelectedShapeId(null);
                setNewPoints([]);
              }}
              className="flex-1 py-1 text-center bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-400 text-slate-300 rounded uppercase text-[9px] font-bold transition-all"
            >
              DESELECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
