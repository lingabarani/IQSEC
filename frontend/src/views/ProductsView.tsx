import React from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  Package,
  ShieldCheck,
  Tag,
  Factory,
  CheckCircle,
  Sparkle
} from '@phosphor-icons/react';

export const ProductsView: React.FC = () => {
  const { t } = useI18n();
  const { products } = useProposal();

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('prod.title')}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {products.length} Solutions Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('prod.subtitle')} for automated tender RFP response mapping.
          </p>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                  {p.sku}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {p.name}
              </h3>
              <p className="text-xs font-medium text-blue-600 mb-3">
                {p.category} • {p.version}
              </p>

              <div className="space-y-2 mb-4 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Manufacturer / Partner
                  </div>
                  <div className="font-semibold text-slate-800">
                    {p.manufacturer}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {p.tier}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Core Capabilities
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {p.capabilities}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Automated RAG Mapping</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle size={14} weight="fill" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
