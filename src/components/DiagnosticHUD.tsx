/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Flame, 
  Thermometer, 
  Gauge, 
  Compass, 
  Fan, 
  Network, 
  Database,
  Crosshair,
  Wifi,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { TerminalTheme } from '../types';
import { THEME_PALETTES } from './TerminalOverlay';
import { soundEngine } from './SoundEngine';

interface FloatingMetric {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  x: number; // percentage width
  y: number; // percentage height
  driftX: number;
  driftY: number;
  duration: number; // lifespan in ms
  scale: number;
}

interface DiagnosticHUDProps {
  theme: TerminalTheme;
  acousticFeedback: boolean;
  className?: string;
}

export const DiagnosticHUD: React.FC<DiagnosticHUDProps> = ({
  theme,
  acousticFeedback,
  className = ''
}) => {
  const palette = THEME_PALETTES[theme];
  
  // HUD Status states
  const [hudActive, setHudActive] = useState<boolean>(true);
  const [injectionRate, setInjectionRate] = useState<number>(3000); // ms
  const [metrics, setMetrics] = useState<FloatingMetric[]>([]);
  
  // Persistent realtime mock gauges
  const [sysTemp, setSysTemp] = useState<number>(64.8);
  const [pwrDraw, setPwrDraw] = useState<number>(184.2);
  const [cpuFreq, setCpuFreq] = useState<number>(4.82);
  const [fanSpeed, setFanSpeed] = useState<number>(3820);
  
  // Sound wrapper
  const triggerSound = useCallback((type: 'click' | 'switch' | 'ping') => {
    if (!acousticFeedback) return;
    if (type === 'click') {
      soundEngine.playClick();
    } else if (type === 'switch') {
      soundEngine.playSwitch();
    } else if (type === 'ping') {
      soundEngine.playSweep(true);
    }
  }, [acousticFeedback]);

  // Handle live fluctuate statistics
  useEffect(() => {
    const timer = setInterval(() => {
      setSysTemp(prev => Math.max(52, Math.min(84, +(prev + (Math.random() - 0.5) * 2).toFixed(1))));
      setPwrDraw(prev => Math.max(120, Math.min(290, +(prev + (Math.random() - 0.5) * 12).toFixed(1))));
      setCpuFreq(prev => Math.max(3.2, Math.min(5.1, +(prev + (Math.random() - 0.5) * 0.1).toFixed(2))));
      setFanSpeed(prev => Math.max(2500, Math.min(4800, Math.floor(prev + (Math.random() - 0.5) * 160))));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Injected logs/floating metrics catalog
  const sensorCatalog = [
    { label: 'SYS_CORE_0_TEMP', getVal: () => `${sysTemp}°C`, icon: Thermometer, color: 'text-[#ef4444]' },
    { label: 'GPU_HOTSPOT_PROBE', getVal: () => `${(sysTemp + 4.2).toFixed(1)}°C`, icon: Flame, color: 'text-orange-400' },
    { label: 'BUS_PWR_THROUGHPUT', getVal: () => `${pwrDraw} W`, icon: Zap, color: 'text-yellow-400' },
    { label: 'CPU_CORE_FREQ_LOG', getVal: () => `${cpuFreq} GHz`, icon: Cpu, color: 'text-emerald-400' },
    { label: 'ACTIVE_COOLER_RPM', getVal: () => `${fanSpeed} RPM`, icon: Fan, color: 'text-cyan-400' },
    { label: 'COGNITIVE_DRIFT', getVal: () => `${(Math.random() * 0.12).toFixed(3)} ms`, icon: Activity, color: 'text-pink-400' },
    { label: 'VECTOR_ALIGNS_PACKET', getVal: () => `7x9 COMPILER_OK`, icon: Crosshair, color: 'text-purple-400' },
    { label: 'DB_BUFFER_FLUSH', getVal: () => `${(Math.random() * 8.4 + 1.2).toFixed(1)} MB/s`, icon: Database, color: 'text-blue-400' },
    { label: 'PORT_STREAM_GATE', getVal: () => `3000 // OPEN`, icon: Network, color: 'text-amber-500' },
    { label: 'WIFI_TELEMETRY_LATENCY', getVal: () => `${Math.floor(Math.random() * 15 + 4)} ms`, icon: Wifi, color: 'text-indigo-400' },
  ];

  // Function to inject a single random floating metric tag
  const injectMetric = useCallback((specificIndex?: number) => {
    if (!hudActive) return;
    
    const index = typeof specificIndex === 'number' && specificIndex >= 0 && specificIndex < sensorCatalog.length 
      ? specificIndex 
      : Math.floor(Math.random() * sensorCatalog.length);
    const randomSensor = sensorCatalog[index];
    const id = `float_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newMetric: FloatingMetric = {
      id,
      label: randomSensor.label,
      value: randomSensor.getVal(),
      icon: randomSensor.icon,
      color: randomSensor.color,
      x: Math.floor(Math.random() * 65) + 15, // stay away from absolute edges
      y: Math.floor(Math.random() * 55) + 20,
      driftX: (Math.random() - 0.5) * 35, // slow horizontal drift
      driftY: -40 - Math.random() * 40,   // continuous floating upward
      duration: 4000 + Math.random() * 2000,
      scale: 0.85 + Math.random() * 0.2
    };

    setMetrics(prev => {
      // Keep metrics list compact to prevent cluttering
      const trimmed = prev.length > 5 ? prev.slice(prev.length - 4) : prev;
      return [...trimmed, newMetric];
    });
  }, [hudActive, sysTemp, pwrDraw, cpuFreq, fanSpeed]);

  // Periodic injector loop
  useEffect(() => {
    if (!hudActive) return;
    
    // Inject first immediately
    const timeoutInitial = setTimeout(() => injectMetric(), 800);
    
    const interval = setInterval(() => {
      injectMetric();
    }, injectionRate);

    return () => {
      clearTimeout(timeoutInitial);
      clearInterval(interval);
    };
  }, [hudActive, injectionRate, injectMetric]);

  const handleMetricClick = (m: FloatingMetric) => {
    triggerSound('ping');
    // Remove clicked element
    setMetrics(prev => prev.filter(item => item.id !== m.id));
  };

  // BROADCAST REAL-TIME STATS UPDATES TO DRAWER LISTENER
  useEffect(() => {
    const event = new CustomEvent('hud-stats', {
      detail: { hudActive, injectionRate, sysTemp, pwrDraw, cpuFreq, fanSpeed }
    });
    window.dispatchEvent(event);
  }, [hudActive, injectionRate, sysTemp, pwrDraw, cpuFreq, fanSpeed]);

  // LISTEN FOR INCOMING COMMANDS FROM DRAWER CONTROLLER
  useEffect(() => {
    const handleControl = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, value } = customEvent.detail || {};
      if (type === 'toggle') {
        setHudActive(prev => !prev);
      } else if (type === 'set-active') {
        setHudActive(!!value);
      } else if (type === 'set-rate') {
        setInjectionRate(value);
      } else if (type === 'inject') {
        injectMetric(typeof value === 'number' ? value : undefined);
      }
    };
    
    const handleRequest = () => {
      window.dispatchEvent(new CustomEvent('hud-stats', {
        detail: { hudActive, injectionRate, sysTemp, pwrDraw, cpuFreq, fanSpeed }
      }));
    };

    window.addEventListener('hud-control', handleControl);
    window.addEventListener('hud-request-stats', handleRequest);
    
    // Send initial load stats immediately
    handleRequest();

    return () => {
      window.removeEventListener('hud-control', handleControl);
      window.removeEventListener('hud-request-stats', handleRequest);
    };
  }, [injectMetric, hudActive, injectionRate, sysTemp, pwrDraw, cpuFreq, fanSpeed]);

  return (
    <div className={`relative ${className} select-none`}>
      
      {/* 1. FLOATING SENSOR LAYER (AnimatePresence) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <AnimatePresence>
          {hudActive && metrics.map(m => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ 
                  opacity: [0, 0.95, 0.95, 0],
                  scale: m.scale,
                  x: m.driftX,
                  y: m.driftY,
                }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: m.duration / 1000, ease: 'easeOut' }}
                onAnimationComplete={() => {
                  // clean up naturally
                  setMetrics(prev => prev.filter(item => item.id !== m.id));
                }}
                className="absolute pointer-events-auto cursor-crosshair group flex flex-col font-mono"
                style={{ 
                  left: `${m.x}%`, 
                  top: `${m.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleMetricClick(m)}
              >
                {/* Vector Grid Target Reticle Lines */}
                <div 
                  className="absolute -inset-2.5 border border-dashed rounded opacity-0 group-hover:opacity-60 transition-all scale-95 group-hover:scale-100"
                  style={{ borderColor: palette.primary }}
                />
                
                {/* Floating Content Card */}
                <div 
                  className="flex items-center space-x-1.5 px-2 py-1 rounded bg-black/90 border border-slate-800/80 shadow-[0_0_12px_rgba(0,0,0,0.85)]"
                  style={{ 
                    borderLeft: `2.5px solid ${palette.primary}`,
                    boxShadow: `inset 0 0 4px ${palette.glowLight}, 0 4px 10px rgba(0,0,0,0.6)`
                  }}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${m.color} animate-pulse`} />
                  <div className="flex flex-col text-left">
                    <span className="text-[7.5px] text-slate-400 leading-none tracking-widest">{m.label}</span>
                    <span className="text-[10px] font-bold text-white tracking-wider leading-snug mt-0.5">{m.value}</span>
                  </div>
                  
                  {/* Miniature pulse dot indicator */}
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping self-start mt-0.5" />
                </div>
                
                {/* Vertical trace/connector line to ground */}
                <div className="w-px h-6 bg-gradient-to-b from-slate-800/60 to-transparent self-center -mt-0.5" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
};
