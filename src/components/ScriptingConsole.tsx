/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TerminalTheme, GridConfig, ModularWidget, VectorShape } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import { Play, Terminal, Cpu, FileCode, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';

interface ScriptingConsoleProps {
  theme: TerminalTheme;
  gridConfig: GridConfig;
  setGridConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
  widgets: ModularWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<ModularWidget[]>>;
  shapes: VectorShape[];
  setShapes: React.Dispatch<React.SetStateAction<VectorShape[]>>;
  acousticFeedback: boolean;
}

const PYTHON_PRESETS = [
  {
    id: 'py_holo_grid',
    name: 'Set 7x9 System Geometry',
    description: 'Configures a precise 7x9 terminal matrix grid conforming to NX-DARK specifications.',
    code: `import sepulchral_nx

# Initialize system geometry
rig = sepulchral_nx.get_active_rig()
rig.set_matrix_grid(cols=7, rows=9)
rig.enable_grid_overlay(opacity=0.45)
rig.sound_sweep(direction="up")

print("STATUS_OK: 7x9 modular matrix successfully synchronized.")`
  },
  {
    id: 'py_telemetry_inject',
    name: 'Generate Terminal Modules',
    description: 'Automates widget placement with high-fidelity cognitive system elements.',
    code: `import sepulchral_nx

rig = sepulchral_nx.get_active_rig()
# Clear active workspace
rig.clear_modular_widgets()

# Inject modular widgets (x, y, w, h, type, name)
rig.add_widget(1, 1, 4, 3, "terminal", "RABBIT_HOLE_RECORDER")
rig.add_widget(5, 1, 2, 2, "radar", "GLYPH_ANATOMY_ANALYZER")
rig.add_widget(1, 4, 3, 2, "audio_spectrum", "COGNITIVE_RESONATOR")

print("STATUS_OK: Cognitive elements deployed into system grid.")`
  },
  {
    id: 'py_vector_inject',
    name: 'Inject NX Glyph Geometry',
    description: 'Constructs custom floating sci-fi notches and the core NX Glyph structure.',
    code: `import sepulchral_nx

rig = sepulchral_nx.get_active_rig()
# Wipe active graphics layer
rig.clear_vectors()
rig.inject_vector_preset("nx-glyph", x=150, y=150)

print("STATUS_OK: NX-GLYPH vector nodes compiled and projected on GPU layer.")`
  }
];

const CUSTOM_PLUGINS = [
  { id: 'plug_flicker', name: 'Auto-Flicker Core', desc: 'Simulates unstable glass reactor power flicker', active: false },
  { id: 'plug_sync', name: 'Sub-Display Mirror', desc: 'Auto-mirrors main telemetry onto Display B', active: true },
  { id: 'plug_midi', name: 'Midi Synthesizer Link', desc: 'Syncs visual waveforms directly to synth frequency', active: false }
];

export const ScriptingConsole: React.FC<ScriptingConsoleProps> = ({
  theme,
  gridConfig,
  setGridConfig,
  widgets,
  setWidgets,
  shapes,
  setShapes,
  acousticFeedback
}) => {
  const palette = THEME_PALETTES[theme];
  const [activeConsoleTab, setActiveConsoleTab] = useState<'editor' | 'plugins'>('editor');
  const [selectedScriptId, setSelectedScriptId] = useState<string>('py_holo_grid');
  const [customCode, setCustomCode] = useState<string>(PYTHON_PRESETS[0].code);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'AETHER CORE v5.01 - AUTOMATION DECK',
    'Ready for python input script...'
  ]);
  const [plugins, setPlugins] = useState(CUSTOM_PLUGINS);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  const handlePresetSelect = (id: string) => {
    playClick();
    setSelectedScriptId(id);
    const script = PYTHON_PRESETS.find(p => p.id === id);
    if (script) {
      setCustomCode(script.code);
    }
  };

  const executePythonScript = () => {
    setIsRunning(true);
    if (acousticFeedback) {
      soundEngine.playSwitch();
      soundEngine.playSweep(true);
    }

    setTerminalLogs(prev => [
      ...prev,
      `>>> RUN COMPILER: ${PYTHON_PRESETS.find(p => p.id === selectedScriptId)?.name || 'Custom Script'}`,
      'Loading interpreter modules...',
      'Connecting system API wrappers...'
    ]);

    setTimeout(() => {
      // Execute mock actions
      if (selectedScriptId === 'py_holo_grid') {
        setGridConfig(prev => ({
          ...prev,
          columns: 7,
          rows: 9,
          showOverlay: true
        }));
      } else if (selectedScriptId === 'py_telemetry_inject') {
        const injectedWidgets: ModularWidget[] = [
          {
            id: 'mod_' + Date.now() + '_1',
            type: 'terminal',
            name: 'RABBIT_HOLE_RECORDER',
            x: 1,
            y: 1,
            w: 4,
            h: 3,
            icon: 'Terminal',
            glowColor: palette.primary
          },
          {
            id: 'mod_' + Date.now() + '_2',
            type: 'radar',
            name: 'GLYPH_ANATOMY_ANALYZER',
            x: 5,
            y: 1,
            w: 2,
            h: 2,
            icon: 'Radar',
            glowColor: palette.primary
          },
          {
            id: 'mod_' + Date.now() + '_3',
            type: 'audio_spectrum',
            name: 'COGNITIVE_RESONATOR',
            x: 1,
            y: 4,
            w: 3,
            h: 2,
            icon: 'Radio',
            glowColor: palette.primary
          }
        ];
        setWidgets(injectedWidgets);
      } else if (selectedScriptId === 'py_vector_inject') {
        // Mock shape injection for nx-glyph
        const baseShapes: VectorShape[] = [
          {
            id: 'shape_' + Date.now() + '_nx_l1',
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
            strokeColor: palette.primary,
            fillColor: palette.primary + '08',
            strokeWidth: 2,
            glowRadius: 8,
            opacity: 0.9
          },
          {
            id: 'shape_' + Date.now() + '_nx_cut',
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
        setShapes(baseShapes);
      }

      setTerminalLogs(prev => [
        ...prev,
        'Compiling syntax structure... Done.',
        'Executing bytecode in sandboxed container...',
        `SUCCESS: "${selectedScriptId}" ran successfully.`,
        '---------------------------------------------'
      ]);
      setIsRunning(false);
      if (acousticFeedback) {
        soundEngine.playBeep(660, 0.15);
      }
    }, 1200);
  };

  const togglePlugin = (id: string) => {
    playSwitch();
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs text-slate-300">
      {/* Console Tab Selector */}
      <div className="flex items-center justify-between p-2 bg-black/60 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5" style={{ color: palette.primary }} />
          <span className="font-semibold text-slate-200">AUTOMATION & PLUGINS</span>
        </div>

        <div className="flex space-x-1 bg-slate-900/60 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => { playClick(); setActiveConsoleTab('editor'); }}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${activeConsoleTab === 'editor' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            PYTHON SCRIPT
          </button>
          <button
            onClick={() => { playClick(); setActiveConsoleTab('plugins'); }}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${activeConsoleTab === 'plugins' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            PLUGINS
          </button>
        </div>
      </div>

      {activeConsoleTab === 'editor' ? (
        <div className="flex-1 flex flex-col md:flex-row min-h-[220px]">
          {/* Presets Column list */}
          <div className="w-full md:w-1/3 bg-slate-950/40 border-r border-slate-800 p-2 flex flex-col space-y-1">
            <span className="text-[9px] tracking-widest text-slate-500 uppercase block mb-1">SCRIPT LIBRARY</span>
            {PYTHON_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`p-2 rounded text-left transition-all border ${
                  selectedScriptId === p.id
                    ? 'border-current bg-black text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                }`}
                style={{ color: selectedScriptId === p.id ? palette.primary : 'inherit' }}
              >
                <div className="flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-bold truncate">{p.name}</span>
                </div>
                <p className="text-[8px] opacity-60 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
              </button>
            ))}
          </div>

          {/* Code Editor and output console */}
          <div className="flex-1 flex flex-col bg-slate-950/80">
            {/* Pseudo Code Screen */}
            <div className="flex-1 p-2 border-b border-slate-800 overflow-y-auto max-h-[160px] md:max-h-none flex flex-col min-h-[100px]">
              <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                <span>WORKFLOW.PY</span>
                <span className="text-yellow-500">PYTHON 3.10 CONTAINER</span>
              </div>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="flex-1 w-full bg-transparent focus:outline-none text-[10px] font-mono leading-relaxed resize-none text-emerald-300 select-text"
                spellCheck={false}
              />
            </div>

            {/* Execution console logs */}
            <div className="h-28 bg-black/90 p-2 flex flex-col overflow-y-auto border-b border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block mb-1">TERMINAL COMPILER STD_OUT</span>
              <div className="space-y-0.5 flex-1 select-text">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="flex items-start text-[9px]">
                    <span className="text-slate-500 mr-1.5 font-bold shrink-0">&gt;</span>
                    <span className="opacity-80 text-slate-300 leading-normal">{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="p-2 bg-black/60 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                COMPILED GPU THREADS ACTIVED
              </span>
              <button
                onClick={executePythonScript}
                disabled={isRunning}
                className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 hover:border-emerald-400 text-emerald-300 rounded font-bold uppercase text-[9px] flex items-center space-x-1 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400 fill-current" />
                <span>{isRunning ? 'EXECUTING...' : 'RUN SCRIPT'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: PLUGINS SECTION */
        <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
          {plugins.map((plug) => (
            <div
              key={plug.id}
              className={`p-3 rounded border bg-black/40 flex flex-col justify-between space-y-2 transition-all ${
                plug.active ? 'border-current' : 'border-slate-800/80 opacity-60'
              }`}
              style={{ color: plug.active ? palette.primary : 'inherit' }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-200">{plug.name}</span>
                  {plug.active ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950/40" />
                  ) : (
                    <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <p className="text-[8.5px] text-slate-400 mt-1 leading-relaxed">{plug.desc}</p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => togglePlugin(plug.id)}
                  className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                    plug.active 
                      ? 'bg-rose-950/20 text-rose-300 border-rose-900 hover:border-rose-400' 
                      : 'bg-emerald-950/20 text-emerald-300 border-emerald-900 hover:border-emerald-400'
                  }`}
                >
                  {plug.active ? 'DISABLE' : 'ENABLE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
