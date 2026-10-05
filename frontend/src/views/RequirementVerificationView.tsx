import React, { useState, useEffect } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  XCircle,
  Flag,
  Lightning,
  ShieldCheck,
  FileText,
  MagnifyingGlass,
  ArrowRight,
  FloppyDisk,
  Building,
  CalendarBlank,
  User,
  CurrencyDollar,
  Sparkle,
  ArrowSquareOut
} from '@phosphor-icons/react';

interface RequirementVerificationViewProps {
  onOpenEvidenceDrawer?: (citation: any) => void;
  onNotify?: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RequirementVerificationView: React.FC<RequirementVerificationViewProps> = ({
  onOpenEvidenceDrawer,
  onNotify
}) => {
  const { t } = useI18n();
  const {
    activeProposal,
    requirements,
    activeRequirement,
    setActiveRequirement,
    handleReviewRequirement,
    loading
  } = useProposal();

  const [activeTab, setActiveTab] = useState<'overview' | 'detail' | 'matrix' | 'evidence'>('detail');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'edit'>('edit');
  const [presalesComment, setPresalesComment] = useState<string>('');
  const [editedResponse, setEditedResponse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'validated'>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state whenever activeRequirement changes
  useEffect(() => {
    if (activeRequirement) {
      setPresalesComment(activeRequirement.modification_notes || '');
      setEditedResponse(
        activeRequirement.technical_response ||
        activeRequirement.response_text ||
        activeRequirement.compliance_rationale ||
        ''
      );
      if (activeRequirement.human_approved) {
        setReviewDecision('approve');
      } else if (activeRequirement.status === 'NO_CUMPLE' || activeRequirement.compliance_status === 'NO_CUMPLE') {
        setReviewDecision('reject');
      } else {
        setReviewDecision('edit');
      }
    }
  }, [activeRequirement]);

  if (!activeProposal) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm font-medium">{t('global.loading')}</p>
      </div>
    );
  }

  // Filter requirements for Right Clause Navigator
  const filteredRequirements = requirements.filter(r => {
    const code = r.requirement_code || r.code || '';
    const title = r.section_title || r.title || '';
    const matchesSearch = code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'flagged') return !r.human_approved && (r.status === 'EXCEPCION' || r.status === 'NO_CUMPLE');
    if (filterMode === 'validated') return r.human_approved;
    return true;
  });

  const currentIndex = requirements.findIndex(r => r.id === activeRequirement?.id);
  const totalClauses = requirements.length || activeProposal.total_requirements || 150;
  const validatedCount = requirements.filter(r => r.human_approved).length || activeProposal.compliant_count || 120;
  const progressPercent = Math.round((validatedCount / totalClauses) * 100);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveRequirement(requirements[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < requirements.length - 1) {
      setActiveRequirement(requirements[currentIndex + 1]);
    }
  };

  const handleSave = async (advance: boolean = false) => {
    if (!activeRequirement) return;
    setIsSaving(true);
    try {
      let targetStatus = activeRequirement.compliance_status || activeRequirement.status;
      let approved = false;

      if (reviewDecision === 'approve') {
        targetStatus = 'CUMPLE';
        approved = true;
      } else if (reviewDecision === 'reject') {
        targetStatus = 'NO_CUMPLE';
        approved = true;
      } else {
        targetStatus = 'CUMPLE_CON_EXCEPCION';
        approved = false;
      }

      const success = await handleReviewRequirement(
        activeRequirement.id,
        targetStatus,
        editedResponse,
        approved,
        presalesComment
      );

      if (success) {
        onNotify?.(
          `Clause ${activeRequirement.requirement_code || activeRequirement.code} updated successfully.`,
          'success'
        );
        if (advance && currentIndex < requirements.length - 1) {
          setActiveRequirement(requirements[currentIndex + 1]);
        }
      } else {
        onNotify?.('Error updating requirement on backend.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Derive display values for active requirement
  const clauseCode = activeRequirement?.requirement_code || activeRequirement?.code || 'R002';
  const clauseRef = activeRequirement?.section_title?.includes('Clause REF:') 
    ? activeRequirement.section_title 
    : `Clause REF: RFP-SEC-2026-4.1.2`;
  const pillarName = activeRequirement?.iqsec_pillar || activeRequirement?.pillar || 'INCIDENT_RESPONSE';
  const confidenceScore = Math.round((activeRequirement?.confidence_score ?? activeRequirement?.confidence ?? 0.84) * 100);
  const primaryCitation = activeRequirement?.exact_citations?.[0] || activeRequirement?.citations?.[0] || {
    doc: 'Tender.pdf',
    page: 18,
    quote: 'Section 4.1.2: Automatic containment must execute across all critical network segments without manual operator intervention for Sev-1 incidents.',
    score: 0.968
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-900 overflow-y-auto">
      {/* 1. TOP PROGRESS BAR BANNER */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between gap-6 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 w-full max-w-xl">
          <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {t('req.progressLabel')}:
          </div>
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs font-semibold text-slate-700 shrink-0">
            <span className="font-bold text-slate-950">{validatedCount}</span> / {totalClauses} {t('req.validated')} ({progressPercent}%)
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} weight="bold" />
            Active Session: Presales HITL
          </span>
        </div>
      </div>

      {/* 2. SUBHEADER: REQUIREMENT SELECTOR & TABS */}
      <div className="bg-white border-b border-slate-200 px-8 pt-4 pb-0 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          {/* Requirement Prev / Current / Next & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 cursor-pointer"
                title="Previous Clause"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <div className="px-3 py-1 font-mono font-bold text-sm text-slate-900 border-x border-slate-200">
                {clauseCode}
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex >= requirements.length - 1}
                className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 cursor-pointer"
                title="Next Clause"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              {t('req.ofClauses', `of ${totalClauses} clauses`).replace('{total}', String(totalClauses))}
            </span>

            {/* Status Pill */}
            {activeRequirement?.human_approved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {t('req.approved')}
              </span>
            ) : confidenceScore < 85 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {t('req.needsReview')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {t('req.fullCompliance')}
              </span>
            )}
          </div>

          {/* Proposal Meta Breadcrumb */}
          <div className="text-xs text-slate-500 font-mono">
            {activeProposal.title} • <span className="font-semibold text-slate-700">{activeProposal.tender_number}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('req.tabOverview')}
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'detail'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('req.tabDetail')}
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('req.tabComplianceMatrix')}
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('req.tabEvidenceLocker')}
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: TWO COLUMNS (Content vs Clause Navigator) */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl w-full mx-auto">
        {/* LEFT COLUMN: DETAIL CONTENT (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Requirement Specification */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {clauseRef}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium font-mono">
                {pillarName}
              </span>
            </div>
            <p className="text-sm text-slate-900 leading-relaxed font-normal">
              {activeRequirement?.effective_text || activeRequirement?.original_text}
            </p>
          </div>

          {/* Card 2: AI Result & Triage */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Sparkle size={14} weight="fill" className="text-amber-600" />
                  PARTIAL COMPLIANCE ({confidenceScore}%)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Lightning size={14} weight="fill" className="text-amber-500" />
                  180ms {t('req.latency')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-medium">Model: Claude 3.5 Sonnet + RAG</span>
              </div>
            </div>

            {/* Product Mapping & Manufacturer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t('req.productMapping')}
                </div>
                <div className="text-xs font-bold text-blue-700 flex items-center justify-between">
                  <span>Product ABC (OT Security Suite)</span>
                  <ArrowSquareOut size={14} />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t('req.manufacturer')}
                </div>
                <div className="text-xs font-bold text-slate-900">
                  XYZ Technologies / IQSEC Solutions
                </div>
              </div>
            </div>

            {/* AI Response / Rationale Textarea */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t('req.aiResponse')}
              </label>
              <textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                rows={4}
                className="w-full text-xs text-slate-900 bg-slate-50/50 rounded-lg border border-slate-200 p-3 leading-relaxed focus:bg-white focus:border-blue-600 focus:outline-none transition-all resize-y font-sans"
              />
            </div>

            {/* Evidence Source & Grounding */}
            <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {primaryCitation.doc} (Page {primaryCitation.page})
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700">
                    SHA-256: e9b4f2c0
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{primaryCitation.quote}"
                </p>
              </div>

              <button
                onClick={() => onOpenEvidenceDrawer?.(primaryCitation)}
                className="px-3 py-1.5 rounded-md bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors"
              >
                {t('req.viewEvidence')}
              </button>
            </div>
          </div>

          {/* Card 3: Human Review & Presales Rationale */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
              {t('req.humanReviewActions')}
            </h3>

            {/* 3 Review Toggle Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setReviewDecision('approve')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  reviewDecision === 'approve'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle size={18} weight={reviewDecision === 'approve' ? 'fill' : 'regular'} className="text-emerald-600" />
                <span>{t('req.approve')}</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecision('reject')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  reviewDecision === 'reject'
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-2xs ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle size={18} weight={reviewDecision === 'reject' ? 'fill' : 'regular'} className="text-red-600" />
                <span>{t('req.reject')}</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewDecision('edit')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  reviewDecision === 'edit'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Flag size={18} weight={reviewDecision === 'edit' ? 'fill' : 'regular'} className="text-amber-600" />
                <span>{t('req.editFlag')}</span>
              </button>
            </div>

            {/* Presales Comment Textarea */}
            <div className="mb-5">
              <textarea
                value={presalesComment}
                onChange={(e) => setPresalesComment(e.target.value)}
                placeholder={t('req.presalesPlaceholder')}
                rows={3}
                className="w-full text-xs text-slate-900 bg-white rounded-lg border border-slate-200 p-3 leading-relaxed focus:border-blue-600 focus:outline-none transition-all resize-y font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <FloppyDisk size={16} />
                <span>{t('req.saveDraft')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>{t('req.saveAndNext')}</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLAUSE NAVIGATOR & TENDER SPECS (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Clause Navigator Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              {t('req.clauseNavigator')}
            </h4>

            {/* Search Input */}
            <div className="relative mb-3">
              <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('req.searchClauses')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 mb-4">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('req.filterAll')} ({requirements.length})
              </button>
              <button
                onClick={() => setFilterMode('flagged')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  filterMode === 'flagged'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('req.filterFlagged')} ({requirements.filter(r => !r.human_approved).length})
              </button>
              <button
                onClick={() => setFilterMode('validated')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  filterMode === 'validated'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('req.filterValidated')} ({requirements.filter(r => r.human_approved).length})
              </button>
            </div>

            {/* Clause Items List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredRequirements.map((r) => {
                const code = r.requirement_code || r.code || r.id;
                const isSelected = activeRequirement?.id === r.id;
                const isApproved = r.human_approved;
                const titleText = r.section_title || r.title || 'Technical Clause';

                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRequirement(r)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {code}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                          {titleText}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Review
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tender Specifications Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              {t('req.tenderSpecs')}
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building size={14} className="text-slate-400" />
                  {t('req.issuingAuthority')}
                </span>
                <span className="font-semibold text-slate-900 text-right">
                  {activeProposal.customer_id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CalendarBlank size={14} className="text-slate-400" />
                  {t('req.deadline')}
                </span>
                <span className="font-semibold text-slate-900">
                  Oct 28, 2026
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  {t('req.leadArchitect')}
                </span>
                <span className="font-semibold text-slate-900">
                  Alejandro Ruiz
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CurrencyDollar size={14} className="text-slate-400" />
                  {t('req.valueTarget')}
                </span>
                <span className="font-semibold text-emerald-700 font-mono">
                  $4.2M USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
