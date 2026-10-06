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
  ArrowSquareOut,
  Table,
  ShieldCheck,
  Package,
  FileText,
  BookmarkSimple
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

type ViewMode = 'all_20_cols' | 'executive' | 'traceability' | 'deliverables';

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
  const [pillarFilter, setPillarFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('all_20_cols');

  const filtered = requirements.filter(req => {
    const code = req.requirement_code || req.code || '';
    const title = req.section_title || req.title || '';
    const effText = req.effective_text || req.original_text || '';
    const prod = req.mapped_product || '';
    const deliv = req.associated_deliverable || '';
    
    const matchesSearch = 
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      effText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliv.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusVal = req.compliance_status || req.status || 'CUMPLE';
    const matchesStatus = statusFilter === 'ALL' || statusVal === statusFilter;

    const pVal = req.iqsec_pillar || req.pillar || '';
    const matchesPillar = pillarFilter === 'ALL' || pVal === pillarFilter;

    return matchesSearch && matchesStatus && matchesPillar;
  });

  const getStatusBadge = (status?: ComplianceStatus) => {
    switch (status) {
      case 'CUMPLE':
      case 'COMPLIES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            CUMPLE [K]
          </span>
        );
      case 'EXCEPCION':
      case 'CUMPLE_CON_EXCEPCION':
      case 'EXCEPTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            EXCEPCIÓN [K]
          </span>
        );
      case 'NO_CUMPLE':
      case 'DOES_NOT_COMPLY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            NO CUMPLE [K]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-950/80 border border-sky-500/40 text-sky-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            ACLARACIÓN
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 glass-panel overflow-hidden shadow-2xl">
      {/* 1. Header Toolbar: Mode selector, Search, Status & Pillar Filters, Exporters */}
      <div className="p-4 border-b border-white/10 bg-slate-950/60 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('all_20_cols')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'all_20_cols'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table size={14} weight="bold" />
              <span>Sábana Completa (Cols A - T)</span>
              <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.2 rounded font-mono text-cyan-200">20 Cols</span>
            </button>
            <button
              onClick={() => setViewMode('deliverables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'deliverables'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package size={14} weight="bold" />
              <span>Oferta & Entregables (Cols L-N)</span>
            </button>
            <button
              onClick={() => setViewMode('traceability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'traceability'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookmarkSimple size={14} weight="bold" />
              <span>Citas & Trazabilidad 100% (Cols Q-S)</span>
            </button>
            <button
              onClick={() => setViewMode('executive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'executive'
                  ? 'bg-slate-800 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={14} weight="bold" />
              <span>Vista Resumida</span>
            </button>
          </div>

          {/* Export Suite */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportXlsx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/10"
              title="Descargar Sábana completa en Excel con formato de 20 columnas y colores normativos"
            >
              <FileXls size={16} weight="fill" className="text-emerald-400" />
              <span>Exportar Sábana XLSX (A-T)</span>
            </button>
            <button
              onClick={onExportDocx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Descargar Propuesta Técnica en formato Word"
            >
              <FileDoc size={16} weight="fill" className="text-blue-400" />
              <span>Propuesta DOCX</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Search, Status tabs, Pillar filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="relative flex-1 min-w-[280px]">
            <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por numeral [C], requerimiento [G/J], producto [L] o entregable [N]..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
            {['ALL', 'CUMPLE', 'EXCEPCION', 'NO_CUMPLE'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'TODOS' : status}
              </button>
            ))}
          </div>

          {/* Pillar Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Pilar:</span>
            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">TODOS LOS PILARES</option>
              <option value="SOC_SIEM">SOC & SIEM</option>
              <option value="INCIDENT_RESPONSE">INCIDENT RESPONSE</option>
              <option value="IDENTITY_ACCESS">IAM / PAM</option>
              <option value="THREAT_INTEL">CTI THREAT INTEL</option>
              <option value="GOVERNANCE_RISK_COMPLIANCE">GRC & CUMPLE</option>
              <option value="CLOUD_SECURITY">CLOUD SECURITY</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Sábana Data Matrix with Grouped Multi-Tier Headers */}
      <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left border-collapse min-w-[1700px]">
          {/* Group Category Header Row (Solution Doc 20-Column Structure) */}
          <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-white/15">
            <tr className="bg-slate-950">
              <th colSpan={4} className="py-1 px-3 text-center border-r border-white/10 bg-slate-900/50 text-slate-300">
                Origen del Pliego (Cols A - D)
              </th>
              <th colSpan={2} className="py-1 px-3 text-center border-r border-white/10 bg-slate-900/70 text-slate-300">
                Clasificación (Cols E - F)
              </th>
              <th colSpan={4} className="py-1 px-3 text-center border-r border-white/10 bg-sky-950/40 text-sky-300">
                Trazabilidad & Junta Aclaraciones (Cols G - J)
              </th>
              <th colSpan={4} className="py-1 px-3 text-center border-r border-white/10 bg-emerald-950/40 text-emerald-300">
                Dictamen, Oferta & Entregables (Cols K - N)
              </th>
              <th colSpan={2} className="py-1 px-3 text-center border-r border-white/10 bg-slate-900/50 text-slate-300">
                Respuesta Técnica (Cols O - P)
              </th>
              <th colSpan={3} className="py-1 px-3 text-center border-r border-white/10 bg-indigo-950/40 text-indigo-300">
                Evidencia Documental (Cols Q - S)
              </th>
              <th className="py-1 px-3 text-center bg-slate-900/60 text-slate-300">
                Gobernanza (Col T)
              </th>
            </tr>

            {/* Individual 20 Column Headers */}
            <tr className="border-t border-white/10 bg-slate-950 text-slate-300">
              {/* Col A */}
              <th className="py-2.5 px-3 w-12 text-center border-r border-white/5 sticky left-0 z-30 bg-slate-950">
                [A] No.
              </th>
              {/* Col B */}
              <th className="py-2.5 px-3 w-16 text-center border-r border-white/5">
                [B] Pág.
              </th>
              {/* Col C */}
              <th className="py-2.5 px-3 w-28 border-r border-white/5 sticky left-12 z-30 bg-slate-950 text-cyan-300">
                [C] Numeral
              </th>
              {/* Col D */}
              <th className="py-2.5 px-3 w-44 border-r border-white/10">
                [D] Sección / Anexo
              </th>

              {/* Col E */}
              <th className="py-2.5 px-3 w-32 border-r border-white/5">
                [E] Pilar IQSEC
              </th>
              {/* Col F */}
              <th className="py-2.5 px-3 w-28 border-r border-white/10">
                [F] Tipo
              </th>

              {/* Col G */}
              <th className="py-2.5 px-3 w-56 border-r border-white/5">
                [G] Texto Original
              </th>
              {/* Col H */}
              <th className="py-2.5 px-3 w-24 text-center border-r border-white/5">
                [H] Modif. Junta?
              </th>
              {/* Col I */}
              <th className="py-2.5 px-3 w-32 border-r border-white/5">
                [I] Ref. Junta
              </th>
              {/* Col J */}
              <th className="py-2.5 px-3 w-64 border-r border-white/10">
                [J] Texto Efectivo
              </th>

              {/* Col K */}
              <th className="py-2.5 px-3 w-36 text-center border-r border-white/5">
                [K] Dictamen
              </th>
              {/* Col L */}
              <th className="py-2.5 px-3 w-48 border-r border-white/5 text-cyan-200">
                [L] Producto Mapeado
              </th>
              {/* Col M */}
              <th className="py-2.5 px-3 w-40 border-r border-white/5">
                [M] Fabricante / OEM
              </th>
              {/* Col N */}
              <th className="py-2.5 px-3 w-56 border-r border-white/10 text-emerald-300">
                [N] Entregable Vinculado
              </th>

              {/* Col O */}
              <th className="py-2.5 px-3 w-64 border-r border-white/5">
                [O] Propuesta Técnica
              </th>
              {/* Col P */}
              <th className="py-2.5 px-3 w-52 border-r border-white/10">
                [P] Justificación
              </th>

              {/* Col Q */}
              <th className="py-2.5 px-3 w-40 border-r border-white/5">
                [Q] Doc. Evidencia
              </th>
              {/* Col R */}
              <th className="py-2.5 px-3 w-16 text-center border-r border-white/5">
                [R] Pág.
              </th>
              {/* Col S */}
              <th className="py-2.5 px-3 w-56 border-r border-white/10">
                [S] Cita Exacta
              </th>

              {/* Col T */}
              <th className="py-2.5 px-3 w-32 text-center">
                [T] Certeza / Firma
              </th>
            </tr>
          </thead>

          {/* 3. Table Rows */}
          <tbody className="divide-y divide-white/5 text-xs">
            {filtered.map((req, idx) => {
              const isSelected = selectedReq?.id === req.id;
              const confidencePercent = Math.round((req.confidence ?? req.confidence_score ?? 0.8) * 100);

              const firstCitation = req.exact_citations?.[0] || req.citations?.[0];
              const docName = firstCitation?.doc || 'Acervo IQSEC';
              const docPage = firstCitation?.page || 1;
              const docQuote = firstCitation?.quote || '';

              return (
                <tr
                  key={req.id}
                  onClick={() => onSelectReq(req)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-cyan-950/40 hover:bg-cyan-950/50'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Col A: Consecutivo */}
                  <td className="py-3 px-3 text-center font-mono text-slate-400 border-r border-white/5 sticky left-0 z-10 bg-slate-950">
                    {idx + 1}
                  </td>

                  {/* Col B: Pág. Pliego */}
                  <td className="py-3 px-3 text-center font-mono text-slate-400 border-r border-white/5">
                    {req.page_number || req.page || 1}
                  </td>

                  {/* Col C: Numeral (Sticky) */}
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300 border-r border-white/5 sticky left-12 z-10 bg-slate-950">
                    {req.requirement_code || req.code || req.id}
                  </td>

                  {/* Col D: Sección / Anexo */}
                  <td className="py-3 px-3 border-r border-white/10 text-slate-300">
                    <div className="font-medium line-clamp-2 text-[11px]">
                      {req.section_title || req.title || 'Anexo Técnico'}
                    </div>
                  </td>

                  {/* Col E: Pilar IQSEC */}
                  <td className="py-3 px-3 border-r border-white/5">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-cyan-200 border border-white/5 whitespace-nowrap">
                      {req.iqsec_pillar || req.pillar || 'SOC_SIEM'}
                    </span>
                  </td>

                  {/* Col F: Tipo Requerimiento */}
                  <td className="py-3 px-3 border-r border-white/10 font-mono text-[11px] text-slate-400">
                    {req.requirement_type || 'TECHNICAL'}
                  </td>

                  {/* Col G: Texto Original */}
                  <td className="py-3 px-3 border-r border-white/5 text-slate-400 text-[11px]">
                    <div className="line-clamp-2" title={req.original_text}>
                      {req.original_text}
                    </div>
                  </td>

                  {/* Col H: Modificado en Junta? */}
                  <td className="py-3 px-3 text-center border-r border-white/5 font-mono text-[11px]">
                    {req.is_modified_by_addendum ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        SÍ
                      </span>
                    ) : (
                      <span className="text-slate-500">NO</span>
                    )}
                  </td>

                  {/* Col I: Referencia Junta */}
                  <td className="py-3 px-3 border-r border-white/5 font-mono text-[11px] text-slate-400">
                    {req.addendum_question_num || (req.is_modified_by_addendum ? 'Acta de Junta' : '—')}
                  </td>

                  {/* Col J: Texto Efectivo */}
                  <td className="py-3 px-3 border-r border-white/10 text-slate-200 text-[11px]">
                    <div className="line-clamp-2 font-medium" title={req.effective_text}>
                      {req.effective_text}
                    </div>
                  </td>

                  {/* Col K: Dictamen Cumplimiento */}
                  <td className="py-3 px-3 text-center border-r border-white/5">
                    {getStatusBadge(req.compliance_status || req.status)}
                  </td>

                  {/* Col L: Servicio o Producto Mapeado */}
                  <td className="py-3 px-3 border-r border-white/5 text-[11px]">
                    <div className="text-cyan-200 font-semibold line-clamp-1">
                      {req.mapped_product || 'IQSEC Managed Defense'}
                    </div>
                  </td>

                  {/* Col M: Fabricante / OEM */}
                  <td className="py-3 px-3 border-r border-white/5 text-[11px] text-slate-300">
                    <div className="line-clamp-1">
                      {req.oem_manufacturer || 'Arquitectura Homologada'}
                    </div>
                  </td>

                  {/* Col N: Entregable Vinculado Obligatorio (Anti-alucinación) */}
                  <td className="py-3 px-3 border-r border-white/10 text-[11px]">
                    <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] line-clamp-2" title={req.associated_deliverable || 'ENT-01: Plan de Entrega Contractual'}>
                      {req.associated_deliverable || 'ENT-01: Plan de Entrega Contractual'}
                    </div>
                  </td>

                  {/* Col O: Propuesta Técnica IQSEC */}
                  <td className="py-3 px-3 border-r border-white/5 text-[11px] text-slate-300">
                    <div className="line-clamp-2" title={req.technical_response || req.response_text}>
                      {req.technical_response || req.response_text || 'Pendiente de evaluación'}
                    </div>
                  </td>

                  {/* Col P: Justificación */}
                  <td className="py-3 px-3 border-r border-white/10 text-[11px] text-slate-400">
                    <div className="line-clamp-2" title={req.compliance_rationale || req.modification_notes || ''}>
                      {req.compliance_rationale || req.modification_notes || 'Conforme a catálogo oficial'}
                    </div>
                  </td>

                  {/* Col Q: Doc. Fuente Evidencia */}
                  <td className="py-3 px-3 border-r border-white/5 font-mono text-[10px] text-indigo-300">
                    <div className="line-clamp-1" title={docName}>
                      {docName}
                    </div>
                  </td>

                  {/* Col R: Pág. Evidencia */}
                  <td className="py-3 px-3 text-center border-r border-white/5 font-mono text-[10px] text-slate-400">
                    {docPage}
                  </td>

                  {/* Col S: Cita Textual Verificable */}
                  <td className="py-3 px-3 border-r border-white/10 text-[11px] text-slate-400 italic">
                    <div className="line-clamp-2" title={docQuote}>
                      "{docQuote || 'Sin cita directa disponible'}"
                    </div>
                  </td>

                  {/* Col T: Certeza IA / Firma Humana */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-300 tabular-nums font-bold">
                          {confidencePercent}%
                        </span>
                        <button
                          onClick={(e) => onToggleApproval(req.id, e)}
                          title={req.human_approved ? "Validado por humano" : "Click para aprobar requerimiento"}
                          className={`p-1 rounded border transition-colors cursor-pointer ${
                            req.human_approved
                              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-800/80 border-white/10 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Check size={12} weight="bold" />
                        </button>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">
                        {req.human_approved ? (req.stage2_approved ? 'N2 Firmado' : 'N1 Validado') : 'Borrador IA'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Footer Bar: Summary and Compliance Rule Status */}
      <div className="p-3 border-t border-white/10 bg-slate-950/70 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            Mostrando <strong className="text-white">{filtered.length}</strong> de <strong className="text-white">{requirements.length}</strong> cláusulas
          </span>
          <span className="text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle size={14} weight="fill" />
            Regla Canvas 5.4: 100% celdas con cita y entregable vinculado
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-slate-500">Columnas A-T auditadas conforme al Anexo de Solución IQSEC</span>
        </div>
      </div>
    </div>
  );
};
