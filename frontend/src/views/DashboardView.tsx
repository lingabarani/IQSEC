import React from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  Question,
  SealCheck,
  TrendUp,
  FileText,
  ShieldCheck,
  ArrowRight,
  FolderOpen
} from '@phosphor-icons/react';
import { computeSummary } from '../services/api';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectRequirement: (reqId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectRequirement
}) => {
  const { t } = useI18n();
  const { activeProposal, requirements, loading } = useProposal();

  if (!activeProposal) {
    return <div className="p-8 text-center text-slate-500">{t('global.loading')}</div>;
  }

  const summary = computeSummary(requirements);
  const total = requirements.length > 0 ? requirements.length : (activeProposal.total_requirements || 150);
  const compliant = requirements.length > 0 ? summary.cumple : (activeProposal.compliant_count || 120);
  const exception = requirements.length > 0 ? summary.excepcion : (activeProposal.exception_count || 18);
  const nonCompliant = requirements.length > 0 ? summary.nocumple : (activeProposal.non_compliant_count || 12);
  const validatedCount = requirements.length > 0 ? summary.approvedCount : (activeProposal.compliant_count || 120);
  const complianceRate = activeProposal.overall_compliance_rate || Math.round((compliant / total) * 100);

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* 1. HERO BANNER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {activeProposal.tender_number}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Customer: <span className="text-slate-900 font-bold">{activeProposal.customer_id}</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {activeProposal.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            GenAI Proposal Automation Platform — Multi-Agent Ingestion, RAG Verification & Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('requirements')}
            className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
          >
            <span>Inspect Requirements</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Overall Compliance Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Compliance Rate
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendUp size={16} weight="bold" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {complianceRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {compliant} of {total} clauses satisfied
          </p>
        </div>

        {/* KPI 2: Validated Clauses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Human Validated
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <SealCheck size={16} weight="bold" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {validatedCount} / {total}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Signed off by Presales Lead
          </p>
        </div>

        {/* KPI 3: Exceptions Required */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Exceptions Required
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <WarningCircle size={16} weight="bold" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            {exception}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Architectural adjustments required
          </p>
        </div>

        {/* KPI 4: Non-Compliant / Gaps */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Non-Compliant Gaps
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <XCircle size={16} weight="bold" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 font-mono">
            {nonCompliant}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Subcontracting or OEM partners needed
          </p>
        </div>
      </div>

      {/* 3. RECENT REQUIREMENTS IN REVIEW TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Clause Verification Queue
            </h3>
            <p className="text-xs text-slate-500">
              Clauses pending human confirmation or flagged with exceptions.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('requirements')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View all {requirements.length > 0 ? requirements.length : total} clauses →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-6">Clause Code</th>
                <th className="py-3 px-4">Pillar</th>
                <th className="py-3 px-4">Requirement Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {requirements.slice(0, 5).map((r) => {
                const code = r.requirement_code || r.code || r.id;
                const conf = Math.round((r.confidence_score ?? r.confidence ?? 0.8) * 100);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-700">
                      {code}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {r.iqsec_pillar || r.pillar}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {r.section_title || r.title || r.original_text}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.human_approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Needs Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {conf}%
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectRequirement(r.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
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
  );
};
