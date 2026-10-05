import React, { useState } from 'react';
import { 
  MagnifyingGlass, 
  Funnel, 
  CheckCircle, 
  Check, 
  Warning, 
  XCircle, 
  Question,
  FileDoc,
  FileXls,
  ArrowSquareOut
} from '@phosphor-icons/react';
import { Requirement, ComplianceStatus, IQSECPillar } from '../types';

interface SabanaTableProps {
  requirements: Requirement[];
  selectedReq: Requirement | null;
  onSelectReq: (req: Requirement) => void;
  onToggleApproval: (id: string, e: React.MouseEvent) => void;
  onExportDocx: () => void;
  onExportXlsx: () => void;
}

export const SabanaTable: React.FC<SabanaTableProps> = ({
  requirements,
  selectedReq,
  onSelectReq,
  onToggleApproval,
  onExportDocx,
  onExportXlsx
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = requirements.filter(req => {
    const code = req.requirement_code || req.code || '';
    const title = req.section_title || req.title || '';
    const matchesSearch = 
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.effective_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusVal = req.compliance_status || req.status || 'CUMPLE';
    const matchesStatus = statusFilter === 'ALL' || statusVal === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: ComplianceStatus) => {
    switch (status) {
      case 'CUMPLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            CUMPLE
          </span>
        );
      case 'EXCEPCION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            EXCEPCIÓN
          </span>
        );
      case 'NO_CUMPLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            NO CUMPLE
          </span>
        );
      case 'ACLARACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-950/80 border border-sky-500/40 text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            ACLARACIÓN
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 glass-panel overflow-hidden">
      {/* Control Bar: Search, Filters, and Export Suite */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, título o texto de requerimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
            {['ALL', 'CUMPLE', 'EXCEPCION', 'ACLARACION'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Deliverable Exporters */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportDocx}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <FileDoc size={16} className="text-blue-400" />
            <span>Propuesta DOCX</span>
          </button>
          <button
            onClick={onExportXlsx}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <FileXls size={16} className="text-emerald-400" />
            <span>Matriz Sábana XLSX</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Matrix */}
      <div className="overflow-x-auto max-h-[580px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4 w-28">Código</th>
              <th className="py-3 px-4">Cláusula Licitatoria</th>
              <th className="py-3 px-4 w-36">Pilar IQSEC</th>
              <th className="py-3 px-4 w-32">Dictamen</th>
              <th className="py-3 px-4 w-32">Confianza IA</th>
              <th className="py-3 px-4 w-28 text-center">Aprobado</th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filtered.map(req => {
              const isSelected = selectedReq?.id === req.id;
              const confidencePercent = Math.round((req.confidence ?? req.confidence_score ?? 0.8) * 100);

              return (
                <tr
                  key={req.id}
                  onClick={() => onSelectReq(req)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-cyan-950/30 hover:bg-cyan-950/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    {req.requirement_code || req.code || req.id}
                  </td>
                  <td className="py-3 px-4 max-w-md">
                    <div className="font-semibold text-white mb-0.5 line-clamp-1">
                      {req.section_title || req.title || req.requirement_code}
                    </div>
                    <div className="text-slate-400 line-clamp-1 text-[11px]">
                      {req.effective_text}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-white/5">
                      {req.iqsec_pillar || req.pillar}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(req.compliance_status || req.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                        {confidencePercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => onToggleApproval(req.id, e)}
                      title={req.human_approved ? "Aprobado formalmente" : "Click para aprobar requerimiento"}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        req.human_approved
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800/60 border-white/10 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Check size={14} weight="bold" />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    <ArrowSquareOut size={14} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
