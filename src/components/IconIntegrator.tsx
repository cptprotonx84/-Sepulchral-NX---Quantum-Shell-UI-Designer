/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TerminalTheme, IconAsset } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import * as LucideIcons from 'lucide-react';
import { Upload, Search, Sparkles, Check, Info } from 'lucide-react';

interface IconIntegratorProps {
  theme: TerminalTheme;
  acousticFeedback: boolean;
  onSelectIcon?: (iconName: string) => void;
}

const ICON_CATALOG: IconAsset[] = [
  { name: 'Cpu', category: 'Hardware', tags: ['processor', 'core', 'chip'] },
  { name: 'Activity', category: 'Telemetry', tags: ['pulse', 'wave', 'heart'] },
  { name: 'Radio', category: 'Telemetry', tags: ['frequency', 'waves', 'signal'] },
  { name: 'Wifi', category: 'Network', tags: ['signal', 'ping', 'connection'] },
  { name: 'Shield', category: 'Security', tags: ['armor', 'firewall', 'protection'] },
  { name: 'Zap', category: 'Power', tags: ['lightning', 'voltage', 'reactor'] },
  { name: 'Layers', category: 'Interface', tags: ['vector', 'depth', 'matrix'] },
  { name: 'Grid', category: 'Interface', tags: ['cells', 'layout', 'alignment'] },
  { name: 'Compass', category: 'Navigation', tags: ['radar', 'bearing', 'coordinates'] },
  { name: 'Globe', category: 'Network', tags: ['orbital', 'earth', 'telemetry'] },
  { name: 'Gauge', category: 'Telemetry', tags: ['speed', 'temperature', 'reactor'] },
  { name: 'Terminal', category: 'System', tags: ['shell', 'compiler', 'python'] },
  { name: 'Database', category: 'System', tags: ['sync', 'files', 'storage'] },
  { name: 'RefreshCw', category: 'System', tags: ['sync', 'flicker', 'reload'] },
  { name: 'Flame', category: 'Power', tags: ['thermal', 'reactor', 'heat'] },
  { name: 'Atom', category: 'Power', tags: ['nuclear', 'quantum', 'core'] }
];

export const IconIntegrator: React.FC<IconIntegratorProps> = ({
  theme,
  acousticFeedback,
  onSelectIcon
}) => {
  const palette = THEME_PALETTES[theme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('Cpu');
  const [customPaths, setCustomPaths] = useState('M 50 20 L 80 80 L 20 80 Z');
  const [customIconName, setCustomIconName] = useState('U_TRIANGLE_SHIELD');
  const [uploadedIcons, setUploadedIcons] = useState<Array<{ name: string; path: string }>>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  const filteredIcons = ICON_CATALOG.filter((icon) => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          icon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || icon.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderIcon = (name: string, size = 18, color = palette.primary) => {
    const IconComp = (LucideIcons as any)[name];
    if (!IconComp) return null;
    return <IconComp size={size} color={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />;
  };

  const handleIconSelect = (name: string) => {
    playClick();
    setSelectedIconName(name);
    if (onSelectIcon) {
      onSelectIcon(name);
    }
  };

  const handleUploadIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPaths.trim() || !customIconName.trim()) return;

    playSwitch();
    setUploadedIcons(prev => [...prev, { name: customIconName, path: customPaths }]);
    setSuccessMsg('VECTOR ASSET COMPILED');
    
    // Clear message after 2s
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const categories = ['all', 'Hardware', 'Telemetry', 'Network', 'Security', 'Interface'];

  return (
    <div className="flex flex-col h-full font-mono text-xs text-slate-300">
      {/* Selector Header */}
      <div className="flex items-center justify-between p-2 bg-black/60 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: palette.primary }} />
          <span className="font-semibold text-slate-200">ICON SYNTHESIS & INTEGRATIONS</span>
        </div>
        <span className="text-[10px] opacity-40 font-mono">INTEGRATION ENGINE STATUS: ACTIVE</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-[220px]">
        {/* LEFT COLUMN: Icon Directory Browser */}
        <div className="border-r border-slate-800 p-3 flex flex-col space-y-3">
          {/* Search bar and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="SEARCH TECH ICON DIRECTORY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded focus:outline-none focus:border-current text-[10px] text-white uppercase placeholder-slate-600 transition-colors"
                style={{ caretColor: palette.primary }}
              />
            </div>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { playClick(); setActiveCategory(cat); }}
                  className={`px-1.5 py-0.5 rounded border text-[8px] uppercase font-bold tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-white/10 text-white border-current'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                  style={{ color: activeCategory === cat ? palette.primary : 'inherit' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of dynamic Lucide Icons */}
          <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] md:max-h-none border border-slate-800/60 bg-slate-950/30 p-2 rounded">
            {filteredIcons.map((icon) => (
              <button
                key={icon.name}
                onClick={() => handleIconSelect(icon.name)}
                className={`p-2.5 rounded border transition-all flex flex-col items-center justify-center space-y-2 group ${
                  selectedIconName === icon.name
                    ? 'bg-black border-current'
                    : 'border-slate-900 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/30'
                }`}
                style={{ color: selectedIconName === icon.name ? palette.primary : 'inherit' }}
              >
                {renderIcon(icon.name, 18, selectedIconName === icon.name ? palette.primary : '#475569')}
                <span className="text-[8px] text-slate-400 font-mono truncate w-full text-center group-hover:text-white transition-colors">
                  {icon.name}
                </span>
              </button>
            ))}

            {/* Uploaded custom icons rendering */}
            {uploadedIcons.map((icon, idx) => (
              <button
                key={idx}
                onClick={() => { playClick(); setSelectedIconName(icon.name); }}
                className={`p-2.5 rounded border transition-all flex flex-col items-center justify-center space-y-2 group ${
                  selectedIconName === icon.name
                    ? 'bg-black border-current'
                    : 'border-slate-900 bg-slate-900/10 hover:border-slate-800'
                }`}
                style={{ color: selectedIconName === icon.name ? palette.primary : 'inherit' }}
              >
                {/* Render custom mini SVG */}
                <svg viewBox="0 0 100 100" className="w-[18px] h-[18px]">
                  <path
                    d={icon.path}
                    fill="none"
                    stroke={selectedIconName === icon.name ? palette.primary : '#475569'}
                    strokeWidth="4"
                  />
                </svg>
                <span className="text-[8px] text-slate-400 font-mono truncate w-full text-center group-hover:text-white">
                  {icon.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Custom Icon compiler & Vector Coordinate customizer */}
        <div className="p-3 flex flex-col justify-between space-y-3 bg-slate-950/20">
          <form onSubmit={handleUploadIcon} className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
              <Upload className="w-3.5 h-3.5" style={{ color: palette.primary }} />
              <span className="uppercase tracking-widest">SVG COORDINATE SOURCE</span>
            </div>

            {/* Custom Icon Name */}
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 uppercase block">INTEGRATION IDENTIFIER</label>
              <input
                type="text"
                value={customIconName}
                onChange={(e) => setCustomIconName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="E.G. TARGET_SCOPE_X"
                className="w-full bg-slate-950/80 border border-slate-800 px-2 py-1.5 rounded focus:outline-none focus:border-current text-[10px] text-white uppercase font-mono"
                required
              />
            </div>

            {/* SVG Path Coordinate Entry */}
            <div className="flex-1 space-y-1 flex flex-col min-h-[70px]">
              <label className="text-[9px] text-slate-500 uppercase block">SVG PATH VECTOR DATA (100x100 Grid)</label>
              <textarea
                value={customPaths}
                onChange={(e) => setCustomPaths(e.target.value)}
                className="flex-1 w-full p-2 bg-slate-950/90 border border-slate-800 rounded focus:outline-none focus:border-current text-[9px] text-emerald-400 font-mono leading-relaxed resize-none font-bold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900 hover:border-emerald-400 text-emerald-300 rounded font-bold uppercase text-[9px] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>COMPILE CUSTOM VECTOR ICON</span>
            </button>
          </form>

          {/* Real-time Compiled Icon Preview Monitor */}
          <div className="border border-slate-800/80 bg-black/60 p-2.5 rounded flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Dynamic canvas render preview */}
              <div 
                className="w-12 h-12 border border-dashed border-slate-700 rounded flex items-center justify-center bg-slate-900/20"
                style={{ boxShadow: `inset 0 0 10px ${palette.glowLight}` }}
              >
                {selectedIconName && (ICON_CATALOG.find(i => i.name === selectedIconName) ? (
                  renderIcon(selectedIconName, 24, palette.primary)
                ) : (
                  // Custom uploaded icon path rendering
                  <svg viewBox="0 0 100 100" className="w-8 h-8">
                    <path
                      d={uploadedIcons.find(ui => ui.name === selectedIconName)?.path || customPaths}
                      fill="none"
                      stroke={palette.primary}
                      strokeWidth="3.5"
                      style={{ filter: `drop-shadow(0 0 4px ${palette.primary})` }}
                    />
                  </svg>
                ))}
              </div>

              <div>
                <span className="text-[10px] font-bold text-white block">{selectedIconName}</span>
                <span className="text-[8px] text-slate-400">Class: vector.glow_node</span>
              </div>
            </div>

            {/* Status alerts */}
            {successMsg ? (
              <div className="flex items-center space-x-1 text-[9px] text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded">
                <Check className="w-3 h-3" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-[8.5px] text-slate-500">
                <Info className="w-3.5 h-3.5" />
                <span>Select to embed in widgets</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
