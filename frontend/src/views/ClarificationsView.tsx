import React from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  Question,
  ArrowsLeftRight,
  CheckCircle,
  FileText,
  CalendarBlank
} from '@phosphor-icons/react';

export const ClarificationsView: React.FC = () => {
  const { t } = useI18n();
  const { activeProposal, requirements } = useProposal();

  // Find requirements modified by addendum
  const modifiedReqs = requirements.filter(r => r.is_modified_by_addendum || r.original_text !== r.effective_text);

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('clar.title')}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Acta de Junta #1 • Addendum A1
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('clar.subtitle')}
          </p>
        </div>
      </div>

      {/* Delta Reconciliation Cards */}
      <div className="space-y-6">
        {modifiedReqs.length > 0 ? (
          modifiedReqs.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-blue-700">
                    {r.requirement_code || r.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {r.section_title || r.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                    Modified by Addendum #1
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-4 rounded-lg bg-red-50/50 border border-red-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                    {t('clar.originalText')}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {r.original_text}
                  </p>
                </div>

                {/* Modified / Effective */}
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                    <span>{t('clar.effectiveText')}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">Active Specification</span>
                  </div>
                  <p className="text-xs text-slate-900 leading-relaxed font-medium">
                    {r.effective_text}
                  </p>
                </div>
              </div>

              {/* Rationale / Modification Note */}
              {r.modification_notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <span className="font-semibold text-slate-900 shrink-0">Addendum Resolution:</span>
                  <span>{r.modification_notes}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <p className="text-xs">No clauses modified by addendum in current proposal docket.</p>
          </div>
        )}
      </div>
    </div>
  );
};
