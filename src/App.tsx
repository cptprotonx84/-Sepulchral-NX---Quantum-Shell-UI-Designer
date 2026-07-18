/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TerminalTheme, GridConfig, ModularWidget, VectorShape, ColorGradingConfig } from './types';
import { TerminalOverlay, THEME_PALETTES, CyberFrame } from './components/TerminalOverlay';
import { ControlPanel } from './components/ControlPanel';
import { GridDesigner } from './components/GridDesigner';
import { DiagnosticHUD } from './components/DiagnosticHUD';
import { VectorEditor } from './components/VectorEditor';
import { ScriptingConsole } from './components/ScriptingConsole';
import { IconIntegrator } from './components/IconIntegrator';
import { ExportSyncPanel } from './components/ExportSyncPanel';
import { soundEngine } from './components/SoundEngine';
import { 
  Terminal as TermIcon, 
  Settings, 
  Cpu, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Monitor, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<TerminalTheme>('nightfly');
  const [acousticFeedback, setAcousticFeedback] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'single' | 'dual' | 'triple'>('dual');
  
  // Real-time panel visibility and layout state
  const [layoutConfig, setLayoutConfig] = useState({
    showControlPanel: true,
    showGridDesigner: true,
    showVectorEditor: true,
    showScriptingConsole: true,
    showIconIntegrator: true,
    showExportSyncPanel: true,
  });

  // Real-time grid state
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    columns: 8,
    rows: 6,
    gap: 12,
    snapToGrid: true,
    showOverlay: true,
    opacity: 0.35,
    aspectRatio: 'free'
  });

  // Vector shapes state
  const [shapes, setShapes] = useState<VectorShape[]>([
    {
      id: 'shape_init_c1',
      type: 'circle',
      points: [{ x: 150, y: 150 }],
      strokeColor: '#05ffa1',
      fillColor: 'transparent',
      strokeWidth: 1.5,
      glowRadius: 5,
      opacity: 0.7
    }
  ]);

  // Modular widgets state
  const [widgets, setWidgets] = useState<ModularWidget[]>([]);

  // GPU Color grading & visual properties
  const [colorConfig, setColorConfig] = useState<ColorGradingConfig>({
    brightness: 100,
    contrast: 105,
    saturation: 100,
    hueRotate: 0,
    chromaticAberration: true,
    crtScanlines: true,
    vignette: true,
    noiseLevel: 20
  });

  // Synchronized icon transport name
  const [selectedIconName, setSelectedIconName] = useState<string>('Cpu');

  // Real-time Local/UTC Clock State
  const [timeStr, setTimeStr] = useState<string>('00:00:00 UTC');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const palette = THEME_PALETTES[theme];

  // Adjust shapes default strokes when theme shifts
  useEffect(() => {
    setShapes(prev => prev.map(s => ({
      ...s,
      strokeColor: palette.primary
    })));
  }, [theme]);

  const toggleSoundHum = () => {
    const val = !acousticFeedback;
    setAcousticFeedback(val);
    soundEngine.toggleAmbientHum(val);
    if (val) {
      soundEngine.playSwitch();
      soundEngine.playSweep(true);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-mono text-slate-300 relative select-none overflow-x-hidden"
      style={{ 
        backgroundColor: palette.bg,
        backgroundImage: palette.radialGradient,
        transition: 'background-color 0.5s ease, background-image 0.5s ease'
      }}
    >
      {/* 1. Immersive CRT Glass screen overlay */}
      <TerminalOverlay 
        theme={theme}
        crtScanlines={colorConfig.crtScanlines}
        chromaticAberration={colorConfig.chromaticAberration}
        vignette={colorConfig.vignette}
        noiseLevel={colorConfig.noiseLevel}
      />

      {/* 2. IMMERSIVE UPPER COGNITIVE STATUS HEADER BAR */}
      <header 
        className="relative border-b-4 border-black bg-[#0d0f12] px-5 py-3 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.8)]"
        style={{ borderBottomColor: palette.accent + '20' }}
      >
        {/* Heavy terminal frame corner ticks */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-600 opacity-40"></div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-slate-600 opacity-40"></div>
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-slate-600 opacity-40"></div>
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-slate-600 opacity-40"></div>

        {/* Main Logo & Platform Status Tag */}
        <div className="flex items-center space-x-3 w-full md:w-auto relative z-10">
          <div className="relative">
            {/* Spinning status reactor - shaped with subtle cyber cut terminals */}
            <div 
              className="w-9 h-9 rounded-md border border-dashed flex items-center justify-center animate-spin"
              style={{ borderColor: palette.primary, animationDuration: '10s' }}
            >
              <Cpu className="w-4 h-4" style={{ color: palette.primary }} />
            </div>
            {/* Blinking green core LED */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-wider text-[15px] font-mono select-none flex items-center">
                <span className="text-[#05ffa1]">°∆</span>
                <span className="text-white ml-1.5 mr-0.5">Sepulchral</span>
                <span className="text-[#05ffa1] font-bold">{'{'}</span>
                <span className="text-[#05ffa1] font-bold">NX</span>
                <span className="text-[#05ffa1] font-bold">{'}'}</span>
                <span className="text-white ml-1 mr-1.5">Labs</span>
                <span className="text-[#05ffa1]">∆°</span>
              </span>
              <span className="bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[8px] text-emerald-400 font-bold animate-pulse">
                SESSION 0007 // ACTIVE
              </span>
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">
              NX-DARK LABS // TYPE SYSTEM v0.1 // INSTRUMENT COGNITIVE SHAPER
            </p>
          </div>
        </div>

        {/* Real-time Diagnostics Bar */}
        <div className="flex items-center space-x-4 bg-slate-950/80 px-3.5 py-1.5 border border-slate-900 rounded w-full md:w-auto overflow-x-auto relative z-10">
          {/* UTC Clock */}
          <div className="flex items-center space-x-1.5 text-slate-400 shrink-0">
            <Clock className="w-3.5 h-3.5" style={{ color: palette.primary }} />
            <span className="font-bold text-[11px] text-slate-200 select-all">{timeStr}</span>
          </div>

          {/* Coherence level */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-slate-500 text-[10px]">COHERENCE:</span>
            <span className="text-emerald-400 font-bold">0.78</span>
          </div>

          {/* Depth / Branches */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-slate-500 text-[10px]">DEPTH:</span>
            <span className="text-white font-bold">12</span>
            <span className="text-slate-500 text-[10px] ml-1">BRANCHES:</span>
            <span className="text-white font-bold">04</span>
          </div>

          {/* Warning drift status */}
          <div className="flex items-center space-x-1.5 text-rose-500 shrink-0 font-bold animate-pulse bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping mr-0.5" />
            <span className="text-[9px]">STATUS: DRIFT DETECTED</span>
          </div>
        </div>

        {/* Header volume, acoustics and display setups */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end relative z-10">
          {/* Workspace Layout Quick Toggles */}
          <div className="flex items-center space-x-1 bg-black/40 border border-slate-800/60 p-1 rounded">
            <button
              onClick={() => {
                soundEngine.playSwitch();
                setLayoutConfig(prev => ({ ...prev, showControlPanel: !prev.showControlPanel }));
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold tracking-wide uppercase transition-colors cursor-pointer ${
                layoutConfig.showControlPanel
                  ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-800/40'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
              title="Toggle Left Sidebar"
            >
              SIDEBAR
            </button>
            <button
              onClick={() => {
                soundEngine.playSwitch();
                setLayoutConfig(prev => ({ ...prev, showGridDesigner: !prev.showGridDesigner }));
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold tracking-wide uppercase transition-colors cursor-pointer ${
                layoutConfig.showGridDesigner
                  ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-800/40'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
              title="Toggle Grid Canvas"
            >
              GRID
            </button>
          </div>

          {/* Quick Sound Toggle Switch */}
          <button
            onClick={toggleSoundHum}
            className={`px-2.5 py-1 rounded border transition-all flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
              acousticFeedback 
                ? 'bg-black border-emerald-500 text-emerald-400' 
                : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {acousticFeedback ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{acousticFeedback ? 'ACOUSTIC ACTIVE' : 'ACOUSTIC MUTED'}</span>
          </button>
        </div>
      </header>
 
       {/* Audio Permit Ambient warning alert */}
       {!acousticFeedback && (
         <div 
           className="relative bg-black border-b border-amber-500/20 px-6 py-2.5 text-amber-500 text-[10px] tracking-wide animate-pulse font-mono flex items-center justify-center space-x-3 shadow-lg select-none"
         >
           {/* Yellow/Amber hazard-striped left/right accents */}
           <div className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40 font-bold select-none tracking-tighter">
             /// /// ///
           </div>
           <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/40 font-bold select-none tracking-tighter">
             /// /// ///
           </div>
           
           <span className="flex items-center space-x-2 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded">
             <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping mr-1"></span>
             <span className="font-bold">⚠️ COGNITIVE ACOUSTIC OFFLINE:</span>
             <span className="text-slate-300">CLICK "ACOUSTIC MUTED" TO ENGAGE AMBIENT REACTOR HUM & MECHANICAL ACTUATORS.</span>
           </span>
         </div>
       )}
 
       {/* 3. CORE MULTI-DISPLAY INTERACTIVE GRID LAYOUT */}
       <main className={`flex-1 p-4 grid gap-4 overflow-y-auto ${layoutConfig.showControlPanel ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1'}`}>
         
         {/* DISPLAY BLOCK 1 (Left Sidebar): Analog Controls & Calibration parameters */}
         {layoutConfig.showControlPanel && (
           <section className="xl:col-span-1 flex flex-col h-full space-y-4">
             <CyberFrame 
               theme={theme}
               title="SYSTEM GEOMETRY REGULATOR"
               subTitle="CONTROL_DECK"
               className="flex-1"
               defaultHeight={600}
             >
               <ControlPanel 
                 theme={theme}
                 setTheme={setTheme}
                 gridConfig={gridConfig}
                 setGridConfig={setGridConfig}
                 colorConfig={colorConfig}
                 setColorConfig={setColorConfig}
                 acousticFeedback={acousticFeedback}
                 setAcousticFeedback={setAcousticFeedback}
                 displayMode={displayMode}
                 setDisplayMode={setDisplayMode}
                 layoutConfig={layoutConfig}
                 setLayoutConfig={setLayoutConfig}
               />
             </CyberFrame>
           </section>
         )}
 
         {/* DISPLAY BLOCK 2 & 3 (Central workspace): Grid matrix & Prototyping deck */}
         <section className={`${layoutConfig.showControlPanel ? 'xl:col-span-3' : 'xl:col-span-1'} flex flex-col space-y-4 h-full`}>
           
           {/* A. Central grid stage component */}
           {layoutConfig.showGridDesigner && (
             <CyberFrame 
               theme={theme}
               title={palette.title}
               subTitle="GPU_ACCELERATED_WORKSPACE"
               className="flex-1 min-h-[460px] xl:min-h-0"
               defaultHeight={460}
             >
               <GridDesigner 
                 theme={theme}
                 gridConfig={gridConfig}
                 widgets={widgets}
                 setWidgets={setWidgets}
                 acousticFeedback={acousticFeedback}
                 selectedIconName={selectedIconName}
               />
               <DiagnosticHUD 
                 theme={theme}
                 acousticFeedback={acousticFeedback}
                 className="absolute inset-0 pointer-events-none"
               />
             </CyberFrame>
           )}
 
           {/* B. Dual ancillary workspaces: Vector Editor & Python Automation Terminal */}
           {(layoutConfig.showVectorEditor || layoutConfig.showScriptingConsole) && (
             <div className={`grid gap-4 ${layoutConfig.showVectorEditor && layoutConfig.showScriptingConsole ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
               
               {/* Vector path manipulation */}
               {layoutConfig.showVectorEditor && (
                 <CyberFrame 
                   theme={theme}
                   title="INSTRUMENT GRAPHIC SHAPER"
                   subTitle="7X9_MODULAR_GLYPHS"
                   className="min-h-[300px] lg:min-h-0"
                   defaultHeight={285}
                 >
                   <VectorEditor 
                     theme={theme}
                     colorConfig={colorConfig}
                     shapes={shapes}
                     setShapes={setShapes}
                     acousticFeedback={acousticFeedback}
                   />
                 </CyberFrame>
               )}
 
               {/* Python console scripting system */}
               {layoutConfig.showScriptingConsole && (
                 <CyberFrame 
                   theme={theme}
                   title="AUTOMATION SCRIPTING CONSOLE"
                   subTitle="CONTROL_SANDBOX"
                   className="min-h-[300px] lg:min-h-0"
                   defaultHeight={285}
                 >
                   <ScriptingConsole 
                     theme={theme}
                     gridConfig={gridConfig}
                     setGridConfig={setGridConfig}
                     widgets={widgets}
                     setWidgets={setWidgets}
                     shapes={shapes}
                     setShapes={setShapes}
                     acousticFeedback={acousticFeedback}
                   />
                 </CyberFrame>
               )}
             </div>
           )}
 
           {/* C. Secondary ancillary row: Icon Integrator & Export target syncer */}
           {(layoutConfig.showIconIntegrator || layoutConfig.showExportSyncPanel) && (
             <div className={`grid gap-4 ${layoutConfig.showIconIntegrator && layoutConfig.showExportSyncPanel ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
               
               {/* Custom Icon Catalog integrations */}
               {layoutConfig.showIconIntegrator && (
                 <CyberFrame 
                   theme={theme}
                   title="VECTOR GLYPH COMPILER"
                   subTitle="CATALOG_REGISTRY"
                   className="min-h-[280px]"
                   defaultHeight={285}
                 >
                   <IconIntegrator 
                     theme={theme}
                     acousticFeedback={acousticFeedback}
                     onSelectIcon={setSelectedIconName}
                   />
                 </CyberFrame>
               )}
 
               {/* Blueprints Exporter & Linux/Windows target syncer */}
               {layoutConfig.showExportSyncPanel && (
                 <CyberFrame 
                   theme={theme}
                   title="BLUEPRINT DEPLOYMENT"
                   subTitle="SYNCHRONICITY_DECK"
                   className="min-h-[280px]"
                   defaultHeight={285}
                 >
                   <ExportSyncPanel 
                     theme={theme}
                     gridConfig={gridConfig}
                     widgets={widgets}
                     shapes={shapes}
                     acousticFeedback={acousticFeedback}
                   />
                 </CyberFrame>
               )}
             </div>
           )}
         </section>
       </main>

      {/* 4. FUTURISTIC RETRO STAMP FOOTER */}
      <footer className="border-t border-slate-900 bg-black/90 px-4 py-2.5 text-center text-[10px] text-slate-500 flex flex-col md:flex-row items-center justify-between font-mono">
        <span className="font-semibold text-slate-400">SEPULCHRAL LABS // WE BUILD IN THE DARK SO OTHERS CAN SEE</span>
        <span className="opacity-80">GEOMETRY_OK // ACTIVE THREADS: [NIGHTFLY // MIRE // NEPHILA // SEPULCHRE // SEPULCHRAL{'{'}NX{'}'}]</span>
      </footer>
    </div>
  );
}
