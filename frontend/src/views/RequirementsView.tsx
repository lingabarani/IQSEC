import React, { useState } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  XCircle,
  WarningCircle,
  Question,
  SealCheck,
  Lightning,
  Sparkle,
  ArrowRight,
  ArrowsClockwise
} from '@phosphor-icons/react';

interface RequirementsViewProps {
  onSelectRequirement: (reqId: string) => void;
  onNotify?: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({
  onSelectRequirement,
  onNotify
}) => {
  const { t } = useI18n();
  const {
    activeProposal,
    requirements,
    loading,
    refreshRequirements,
    handleBatchApprove
  } = useProposal();

  const [search, setSearch] = useState<string>('');
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isBatchApproving, setIsBatchApproving] = useState<boolean>(false);

  if (!activeProposal) {
    return <div className="p-8 text-center text-slate-500">{t('global.loading')}</div>;
  }

  const filteredRequirements = requirements.filter(r => {
    const code = (r.requirement_code || r.code || '').toLowerCase();
    const title = (r.section_title || r.title || '').toLowerCase();
    const text = (r.effective_text || r.original_text || '').toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch = !term || code.includes(term) || title.includes(term) || text.includes(term);
    const matchesPillar = selectedPillar === 'ALL' || (r.iqsec_pillar || r.pillar) === selectedPillar;
    const matchesStatus = selectedStatus === 'ALL' || (r.compliance_status || r.status) === selectedStatus;

    return matchesSearch && matchesPillar && matchesStatus;
  });

  const handleBatch = async () => {
    setIsBatchApproving(true);
    try {
      const count = await handleBatchApprove(0.95);
      onNotify?.(`Batch Smart Triage: Automatically approved ${count} high-confidence clauses (≥95%).`, 'success');
    } finally {
      setIsBatchApproving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t('nav.requirements')} — Sábana Matrix
              </h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {requirements.length} Clauses Ingested
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive multi-column tender specifications table with real-time AI triage and evidence citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshRequirements}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <ArrowsClockwise size={16} />
              <span>{t('global.refresh')}</span>
            </button>

            <button
              onClick={handleBatch}
              disabled={isBatchApproving}
              className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkle size={16} weight="fill" className="text-amber-400" />
              <span>Batch Approve (≥95%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clauses by ID, keyword, or RFP section..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Pillar Filter */}
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Pillars</option>
              <option value="SOC_SIEM">SOC & SIEM Operations</option>
              <option value="THREAT_INTEL">Cyber Threat Intel (CTI)</option>
              <option value="CLOUD_SECURITY">Cloud Security (CSPM/CWPP)</option>
              <option value="INCIDENT_RESPONSE">Incident Response (SOAR)</option>
              <option value="GOVERNANCE_RISK_COMPLIANCE">GRC & Certifications</option>
              <option value="IDENTITY_ACCESS">Identity & PAM Vault</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="CUMPLE">Cumple (Complies)</option>
              <option value="CUMPLE_CON_EXCEPCION">Cumple con Excepción</option>
              <option value="EXCEPCION">Excepción</option>
              <option value="NO_CUMPLE">No Cumple</option>
              <option value="ACLARACION">Aclaración</option>
            </select>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-6">Code</th>
                  <th className="py-3.5 px-4">Pillar</th>
                  <th className="py-3.5 px-6">Requirement Specification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRequirements.map((r) => {
                  const code = r.requirement_code || r.code || r.id;
                  const conf = Math.round((r.confidence_score ?? r.confidence ?? 0.8) * 100);
                  const isApproved = r.human_approved;
                  const statusVal = r.compliance_status || r.status || 'CUMPLE';

                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectRequirement(r.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {code}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {r.iqsec_pillar || r.pillar}
                      </td>
                      <td className="py-3.5 px-6 max-w-md">
                        <div className="font-semibold text-slate-900 mb-0.5 truncate">
                          {r.section_title || r.title || code}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {r.effective_text || r.original_text}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {statusVal === 'CUMPLE' || statusVal === 'COMPLIES' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle size={12} weight="fill" />
                            Cumple
                          </span>
                        ) : statusVal === 'NO_CUMPLE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle size={12} weight="fill" />
                            No Cumple
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <WarningCircle size={12} weight="fill" />
                            Excepción
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <span className="font-semibold">{conf}%</span>
                          <span className="text-[10px] text-slate-400">RAG</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <SealCheck size={14} weight="fill" />
                            {r.reviewed_by || 'Alejandro Ruiz'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRequirement(r.id);
                          }}
                          className="px-3 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                        >
                          Verify Clause →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
