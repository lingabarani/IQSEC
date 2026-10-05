import React from 'react';
import { ShieldCheck, Cpu, ArrowClockwise, Sparkle } from '@phosphor-icons/react';
import { HealthStatus } from '../types';

interface HeaderProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  onRunOrchestrator: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onRefreshHealth,
  onRunOrchestrator,
  isProcessing
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_-3px_rgba(0,212,255,0.3)]">
          <ShieldCheck size={22} weight="bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">IQSEC</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wide">
              MULTI-AGENT v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Enterprise Proposal Automation & Compliance Intelligence
          </p>
        </div>
      </div>

      {/* Live System Telemetry */}
      <div className="hidden md:flex items-center gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>BEDROCK: CLAUDE 3.5</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>OPENSEARCH RAG</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DB: {health?.database.toUpperCase() || 'ONLINE'}</span>
        </div>
        <button
          onClick={onRefreshHealth}
          title="Verificar Estado"
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowClockwise size={14} />
        </button>
      </div>

      {/* Action Orchestrator Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRunOrchestrator}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer shadow-lg ${
            isProcessing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold glow-cyan border border-cyan-300/40 active:scale-[0.98]'
          }`}
        >
          <Sparkle size={16} weight="fill" className={isProcessing ? 'animate-spin' : ''} />
          <span>{isProcessing ? 'Orquestando Agentes...' : 'Ejecutar Orquestador'}</span>
        </button>
      </div>
    </header>
  );
};
