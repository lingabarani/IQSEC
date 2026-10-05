import React from 'react';
import { CheckCircle, Warning, XCircle, Question, Target, Percent } from '@phosphor-icons/react';
import { ComplianceSummary } from '../types';

interface StatCardsProps {
  summary: ComplianceSummary;
}

export const StatCards: React.FC<StatCardsProps> = ({ summary }) => {
  const complianceRate = summary.total > 0 ? ((summary.cumple / summary.total) * 100).toFixed(1) : '0.0';
  const approvalRate = summary.total > 0 ? ((summary.approvedCount / summary.total) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      label: 'REQUERIMIENTOS TOTALES',
      value: summary.total.toString(),
      subtext: `${summary.approvedCount} aprobados por humanos`,
      icon: <Target size={18} className="text-cyan-400" />,
      accentColor: 'border-cyan-500/30'
    },
    {
      label: 'CUMPLIMIENTO TOTAL',
      value: `${complianceRate}%`,
      subtext: `${summary.cumple} cláusulas cumplen 100%`,
      icon: <CheckCircle size={18} weight="fill" className="text-emerald-400" />,
      accentColor: 'border-emerald-500/30'
    },
    {
      label: 'EXCEPCIONES / ACLARACIÓN',
      value: (summary.excepcion + summary.aclaracion).toString(),
      subtext: `${summary.excepcion} excepción, ${summary.aclaracion} aclaración`,
      icon: <Warning size={18} weight="fill" className="text-amber-400" />,
      accentColor: 'border-amber-500/30'
    },
    {
      label: 'CONFIANZA PROMEDIO IA',
      value: `${summary.avgConfidence.toFixed(1)}%`,
      subtext: 'Verificado contra evidencia RAG',
      icon: <Percent size={18} weight="bold" className="text-blue-400" />,
      accentColor: 'border-blue-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl bg-slate-900/60 border ${card.accentColor} glass-panel relative overflow-hidden group hover:border-white/20 transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
              {card.label}
            </span>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-white/5">
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1 tabular-nums">
            {card.value}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
