/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TerminalTheme, GridConfig, ModularWidget, VectorShape, SyncTarget } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';
import { Download, Copy, Share2, Check, RefreshCw, Cpu, Server, Database, CheckSquare, AlertTriangle } from 'lucide-react';

interface ExportSyncPanelProps {
  theme: TerminalTheme;
  gridConfig: GridConfig;
  widgets: ModularWidget[];
  shapes: VectorShape[];
  acousticFeedback: boolean;
}

const INITIAL_SYNC_TARGETS: SyncTarget[] = [
  { id: 'sync_win', platform: 'windows', path: 'C:\\Users\\AppData\\Local\\AetherShell\\sync', lastSynced: 'Just Now', latencyMs: 2.1, status: 'synchronized', speedMbps: 120.4 },
  { id: 'sync_lin', platform: 'linux', path: '/home/usr/.config/aethershell/sync', lastSynced: 'Just Now', latencyMs: 1.8, status: 'synchronized', speedMbps: 142.1 }
];

export const ExportSyncPanel: React.FC<ExportSyncPanelProps> = ({
  theme,
  gridConfig,
  widgets,
  shapes,
  acousticFeedback
}) => {
  const palette = THEME_PALETTES[theme];
  const [activeTab, setActiveTab] = useState<'export' | 'sync'>('export');
  const [syncTargets, setSyncTargets] = useState<SyncTarget[]>(INITIAL_SYNC_TARGETS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'svg' | 'tailwind'>('json');
  const [latencyTicks, setLatencyTicks] = useState<number[]>([45, 52, 49, 58, 41, 48, 51, 44]);

  const playClick = () => {
    if (acousticFeedback) soundEngine.playClick();
  };

  const playSwitch = () => {
    if (acousticFeedback) soundEngine.playSwitch();
  };

  // Generate dynamic ticks for the sync graph
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyTicks(prev => {
        const next = [...prev.slice(1)];
        const nextVal = Math.max(10, Math.min(250, prev[prev.length - 1] + (Math.random() * 40 - 20)));
        next.push(Math.round(nextVal));
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const triggerSyncSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    playSwitch();
    soundEngine.playSweep(true);

    setSyncTargets(prev => prev.map(t => ({ ...t, status: 'syncing' })));

    setTimeout(() => {
      setSyncTargets(prev => prev.map(t => ({
        ...t,
        status: 'synchronized',
        lastSynced: 'Just Now',
        latencyMs: parseFloat((Math.random() * 2 + 1).toFixed(1)),
        speedMbps: parseFloat((100 + Math.random() * 60).toFixed(1))
      })));
      setIsSyncing(false);
      if (acousticFeedback) soundEngine.playBeep(880, 0.15);
    }, 1800);
  };

  const getExportData = () => {
    if (exportFormat === 'json') {
      return JSON.stringify({
        meta: {
          app: "Quantum Shell UI",
          compiledAt: new Date().toISOString(),
          targetPlatforms: ["windows", "linux"]
        },
        grid: gridConfig,
        widgets: widgets.map(({ id, type, name, x, y, w, h }) => ({ id, type, name, x, y, w, h })),
        vectorShapes: shapes
      }, null, 2);
    }

    if (exportFormat === 'svg') {
      // Build visual SVG
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="background:#050a0f;">\n`;
      shapes.forEach(s => {
        let pathD = '';
        if (s.type === 'circle') {
          const c = s.points[0];
          pathD = `M ${c.x} ${c.y - 45} A 45 45 0 1 1 ${c.x - 0.01} ${c.y - 45} Z`;
        } else if (s.type === 'rect') {
          const c = s.points[0];
          pathD = `M ${c.x - 60} ${c.y - 60} L ${c.x + 60} ${c.y - 60} L ${c.x + 60} ${c.y + 60} L ${c.x - 60} ${c.y + 60} Z`;
        } else {
          pathD = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        }
        svgContent += `  <path d="${pathD}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="${s.fillColor}" opacity="${s.opacity}" />\n`;
      });
      svgContent += `</svg>`;
      return svgContent;
    }

    // Tailwind template code
    return `<!-- Quantum Shell UI Blueprint -->
<div class="relative w-full h-screen bg-slate-950 p-6 flex flex-col font-mono">
  <!-- Grid Matrix: cols-${gridConfig.columns} rows-${gridConfig.rows} -->
  <div class="grid grid-cols-${gridConfig.columns} grid-rows-${gridConfig.rows} gap-${gridConfig.gap / 4} flex-1">
    ${widgets.map(w => `
    <!-- Modular Widget: ${w.name} -->
    <div class="col-span-${w.w} row-span-${w.h} border border-emerald-500/20 bg-slate-900/40 rounded p-4 relative shadow-lg">
      <div class="text-xs font-bold text-slate-300 uppercase flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${w.name}</span>
      </div>
    </div>`).join('\n    ')}
  </div>
</div>`;
  };

  const handleDownload = () => {
    playSwitch();
    const data = getExportData();
    const extension = exportFormat === 'json' ? 'json' : exportFormat === 'svg' ? 'svg' : 'html';
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-shell-prototype.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    playClick();
    navigator.clipboard.writeText(getExportData());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs text-slate-300">
      {/* Header Selector Tabs */}
      <div className="flex items-center justify-between p-2 bg-black/60 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <Database className="w-3.5 h-3.5" style={{ color: palette.primary }} />
          <span className="font-semibold text-slate-200">PROJECT METRICS & EXPORTS</span>
        </div>

        <div className="flex space-x-1 bg-slate-900/60 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => { playClick(); setActiveTab('export'); }}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${activeTab === 'export' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            EXPORT Blueprints
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('sync'); }}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${activeTab === 'sync' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            FILES SYNC
          </button>
        </div>
      </div>

      {activeTab === 'export' ? (
        <div className="flex-1 p-3 flex flex-col justify-between space-y-3">
          {/* Format selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] tracking-widest text-slate-500 uppercase block">SELECT COMPILING FORMAT</span>
            <div className="grid grid-cols-3 gap-2">
              {(['json', 'svg', 'tailwind'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => { playClick(); setExportFormat(format); }}
                  className={`py-2 rounded border uppercase text-[10px] transition-all flex flex-col items-center justify-center ${
                    exportFormat === format
                      ? 'border-current bg-black text-white font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                  style={{ color: exportFormat === format ? palette.primary : 'inherit' }}
                >
                  <span>{format.toUpperCase()}</span>
                  <span className="text-[7.5px] opacity-40">
                    {format === 'json' ? 'Data Layout' : format === 'svg' ? 'Raw Vector' : 'Tailwind HTML'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compiled Output Code Block Preview */}
          <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded p-2 flex flex-col justify-between max-h-[140px] md:max-h-none min-h-[100px]">
            <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1">
              <span>COMPILED OUTPUT PREVIEW</span>
              <span>Lines: {getExportData().split('\n').length}</span>
            </div>
            <pre className="flex-1 overflow-auto text-[9.5px] leading-relaxed text-slate-400 font-mono pr-2 select-text whitespace-pre-wrap max-h-[110px] md:max-h-none">
              {getExportData()}
            </pre>
          </div>

          {/* Download Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-400 text-slate-300 rounded font-bold uppercase text-[9px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED BLUEPRINT</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY TO CLIPBOARD</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900 hover:border-emerald-400 text-emerald-300 rounded font-bold uppercase text-[9px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              style={{ color: palette.primary, borderColor: palette.primary }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD FILE</span>
            </button>
          </div>
        </div>
      ) : (
        /* TAB 2: FILES SYNCHRONIZATION AND TELEMETRY */
        <div className="flex-1 p-3 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-slate-500 uppercase">SYNCHRONIZATION TARGETS</span>
              <button
                onClick={triggerSyncSync}
                disabled={isSyncing}
                className="px-2 py-0.5 border border-slate-800 hover:border-slate-400 text-slate-400 hover:text-white bg-slate-900/40 rounded text-[9px] uppercase tracking-wider flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'SYNCING...' : 'SYNC PROJECT'}</span>
              </button>
            </div>

            {/* Sync Directory paths list */}
            <div className="space-y-2">
              {syncTargets.map((target) => (
                <div key={target.id} className="border border-slate-900 bg-black/40 rounded p-2 flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5" style={{ color: palette.primary }} />
                      <span className="text-[10px] uppercase font-bold text-white">
                        {target.platform === 'windows' ? 'Windows Shell App' : 'Linux Kernel Daemon'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] text-slate-500">LATENCY: {target.latencyMs}ms</span>
                      <span className="text-[8px] text-slate-500">SPEED: {target.speedMbps} MB/s</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${target.status === 'syncing' ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400'}`} />
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-400 truncate opacity-80 font-mono select-text bg-black/60 p-1 rounded border border-slate-950">
                    {target.path}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time synchronization graphs */}
          <div className="border border-slate-900 bg-black/60 p-2.5 rounded space-y-2">
            <div className="flex justify-between items-center text-[9px] text-slate-500">
              <span className="uppercase tracking-widest">Low-latency Transfer Graph (MB/s)</span>
              <span className="text-emerald-400 font-bold">STABLE CROSS-PLATFORM DUPLEX</span>
            </div>

            {/* Simulated bar chart graph */}
            <div className="h-14 flex items-end justify-between gap-1 border-b border-slate-800 pt-3">
              {latencyTicks.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{
                    height: `${(val / 250) * 100}%`,
                    backgroundColor: palette.primary,
                    opacity: 0.15 + (idx / latencyTicks.length) * 0.8,
                    boxShadow: `0 0 8px ${palette.glow}`
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-slate-600">
              <span>T-15s</span>
              <span>T-10s</span>
              <span>T-5s</span>
              <span>Live Dual-Core Thread</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
