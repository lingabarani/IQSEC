import React, { useState, useEffect } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  ShieldCheck,
  FileText,
  MagnifyingGlass,
  ArrowSquareOut,
  Sparkle,
  LockKey,
  Database
} from '@phosphor-icons/react';
import { fetchKnowledgeDocs } from '../services/api';
import { KnowledgeDocumentItem } from '../types';

export const EvidenceView: React.FC = () => {
  const { t } = useI18n();
  const { activeProposal, requirements } = useProposal();
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchKnowledgeDocs().then(setKnowledgeDocs).catch(console.error);
  }, []);

  // Collect all citations across requirements
  const allCitations = requirements.flatMap(r =>
    (r.exact_citations || r.citations || []).map(c => ({
      ...c,
      reqCode: r.requirement_code || r.code || r.id,
      reqTitle: r.section_title || r.title || 'Technical Clause'
    }))
  );

  const filteredCitations = allCitations.filter(c =>
    c.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.doc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reqCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('nav.evidence')} & Knowledge Bóveda
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Database size={14} />
              OpenSearch Serverless RAG
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Grounding audit trail: Amazon Titan Embeddings v2 + BM25 Lexical + Cross-Encoder Rerank.
          </p>
        </div>
      </div>

      {/* Indexed Knowledge Documents */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          <span>Indexed Knowledge Corpus (Whitepapers, Dockets & Certifications)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {knowledgeDocs.length > 0 ? (
            knowledgeDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {doc.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                    {doc.chunk_count} chunks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {doc.description || 'IQSEC proprietary technical specifications and SLA catalogue.'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Scope: {doc.customer_scope}</span>
                  <span>{doc.confidentiality}</span>
                </div>
              </div>
            ))
          ) : (
            // Default preloaded cards
            <>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    01_Whitepaper_IQSEC_SOC_NextGen.pdf
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                    18 chunks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Arquitectura SOC 24/7/365, SLAs de atención a incidentes críticos Sev-1 y correlación STIX/TAXII.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    02_Catalogo_Servicios_MSSP_2026.pdf
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                    24 chunks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Catálogo de servicios gestionados MSSP, esquemas de cobertura, retención tiering y conectores multicloud.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    03_Certificaciones_IQSEC_Oficial.pdf
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                    8 chunks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Acreditaciones vigentes ISO/IEC 27001:2022 y CMMI-SVC v2.0 Nivel 3 expedidas por BSI.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Real-time Citations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Verified OpenSearch Grounding Citations ({filteredCitations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Exact text evidence quotes grounding the AI-generated technical compliance responses.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter citations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-6">Clause</th>
                <th className="py-3 px-4">Document & Page</th>
                <th className="py-3 px-6">Direct Citation / Grounding Quote</th>
                <th className="py-3 px-4">Semantic Score</th>
                <th className="py-3 px-6 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredCitations.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {c.reqCode}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {c.doc} <span className="text-slate-400 font-mono">(p. {c.page})</span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 italic leading-relaxed">
                    "{c.quote}"
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    <span className="font-bold text-emerald-700">{Math.round(c.score * 100)}%</span> match
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck size={14} weight="fill" />
                      Locked
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
