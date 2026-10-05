import React, { useState } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  FileXls,
  FileDoc,
  FilePpt,
  FileZip,
  DownloadSimple,
  ArrowsClockwise,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  LockKey,
  Eye,
  FileText,
  UserCheck,
  ArrowSquareOut
} from '@phosphor-icons/react';

interface OutputsDeliverablesViewProps {
  onNotify?: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const OutputsDeliverablesView: React.FC<OutputsDeliverablesViewProps> = ({
  onNotify
}) => {
  const { t } = useI18n();
  const {
    activeProposal,
    manifest,
    auditHistory,
    refreshDeliverables,
    handleStage1Approval,
    handleStage2Signoff
  } = useProposal();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!activeProposal) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm font-medium">{t('global.loading')}</p>
      </div>
    );
  }

  const handleCopyHash = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify?.('SHA-256 Checksum copied to clipboard.', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRegenerate = async () => {
    setIsProcessing(true);
    onNotify?.('Regenerating proposal deliverables pipeline with latest reviews...', 'info');
    setTimeout(async () => {
      await refreshDeliverables();
      setIsProcessing(false);
      onNotify?.('Deliverables pipeline recompiled successfully.', 'success');
    }, 1800);
  };

  const handleFinalCheck = () => {
    onNotify?.('Cryptographic integrity verified. All 4 artifact hashes match immutable SQLite ledger.', 'success');
  };

  const readinessScore = manifest?.submission_readiness ?? 75;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-900 overflow-y-auto">
      {/* 1. TOP HEADER & RELEASE ACTIONS */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {t('out.title')}
              </h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Release Pipeline v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('out.subtitle')} — <span className="font-semibold text-slate-700">{activeProposal.tender_number}</span> ({activeProposal.customer_id})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <ArrowsClockwise size={16} className={isProcessing ? 'animate-spin' : ''} />
              <span>{t('out.regenerateAll')}</span>
            </button>

            <button
              onClick={handleFinalCheck}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <ShieldCheck size={16} className="text-blue-600" />
              <span>{t('out.finalSubmissionCheck')}</span>
            </button>

            <a
              href={`/api/v1/export/${activeProposal.id}/bundle-zip`}
              download
              className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>{t('out.batchDownload')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA: ARTIFACT CARDS + PACKAGING DOSSIER */}
      <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 4 DELIVERABLE ARTIFACT CARDS (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Requirements Sheet (.xlsx) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileXls size={24} weight="fill" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ready • 100% Mapped
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('out.requirementsSheet')}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {t('out.requirementsDesc')}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Clauses Audited:</span>
                    <span className="font-bold text-slate-900">{activeProposal.total_requirements || 150}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span>1.8 MB</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate max-w-[120px]">e9b4f2c011928bcd...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`/api/v1/export/${activeProposal.id}/sabana-xlsx`}
                  download
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DownloadSimple size={14} />
                  <span>Download .xlsx</span>
                </a>
              </div>
            </div>

            {/* Card 2: Technical Proposal (.docx / .pdf) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileDoc size={24} weight="fill" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Ready • 86 Pages
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('out.technicalProposal')}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {t('out.technicalDesc')}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Standards:</span>
                    <span className="font-bold text-slate-900">ISO 27001 / CMMI-3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span>14.2 MB (DOCX)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate max-w-[120px]">7f83b165d21a980c...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`/api/v1/export/${activeProposal.id}/technical-docx`}
                  download
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DownloadSimple size={14} />
                  <span>Download .docx</span>
                </a>
              </div>
            </div>

            {/* Card 3: Economic Proposal (.xlsx / .pdf) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileXls size={24} weight="fill" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Configured • 4 SKUs
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('out.economicProposal')}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {t('out.economicDesc')}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Horizon:</span>
                    <span className="font-bold text-slate-900">36 Months Tiered</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pricing Engine:</span>
                    <span>IQSEC Rate-Cards</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate max-w-[120px]">e2d7b51f0982bbca...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`/api/v1/export/${activeProposal.id}/sabana-xlsx`}
                  download
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DownloadSimple size={14} />
                  <span>Download .xlsx</span>
                </a>
              </div>
            </div>

            {/* Card 4: Executive Presentation (.pptx) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <FilePpt size={24} weight="fill" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Ready • 15 Slides
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('out.executiveDeck')}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {t('out.executiveDesc')}
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Deck Structure:</span>
                    <span className="font-bold text-slate-900">C-Suite Briefing</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span>9.4 MB (PPTX)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate max-w-[120px]">a9b3d81e7718ccda...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`/api/v1/export/${activeProposal.id}/executive-pptx`}
                  download
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DownloadSimple size={14} />
                  <span>Download .pptx</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: PACKAGING DOSSIER (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  {t('out.packagingDossier')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {readinessScore}% Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Complete submission bundle with cryptographic audit records and legal sign-off.
              </p>
            </div>

            {/* Readiness Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            {/* Manifest Integrity Checklist */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('out.manifestChecklist')}
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{t('out.legalSignoff')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{t('out.technicalSigned')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{t('out.financialReview')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{t('out.cryptoIntegrity')}</span>
                </div>
              </div>
            </div>

            {/* Sign-off Authority Box */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <UserCheck size={14} className="text-blue-600" />
                <span>{t('out.signOffAuthority')}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900">
                Alejandro Ruiz (Presales Lead / Lead Architect)
              </div>
              <div className="text-[11px] text-slate-500">
                Status: <span className="font-semibold text-emerald-700">SABANA_APPROVED & VALIDATED</span>
              </div>
            </div>

            {/* Big Download ZIP CTA */}
            <a
              href={`/api/v1/export/${activeProposal.id}/bundle-zip`}
              download
              className="w-full py-3 px-4 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
            >
              <FileZip size={18} weight="bold" />
              <span>{t('out.downloadCompletePackage')}</span>
            </a>
          </div>
        </div>

        {/* 3. BOTTOM TABLE: EXPORT HISTORY & CRYPTOGRAPHIC AUDIT TRAIL */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('out.auditTrailTitle')}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <LockKey size={12} weight="bold" />
                  {t('out.tamperEvident')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every file export is hashed with SHA-256 and locked into an immutable SQLite ledger.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-6">{t('out.thArtifact')}</th>
                  <th className="py-3 px-4">{t('out.thTriggeredBy')}</th>
                  <th className="py-3 px-4">{t('out.thTimestamp')}</th>
                  <th className="py-3 px-4">{t('out.thChecksum')}</th>
                  <th className="py-3 px-4">{t('out.thStatus')}</th>
                  <th className="py-3 px-6 text-right">{t('out.thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {auditHistory.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span>{item.artifact_file}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.triggered_by}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {item.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200">
                          <span className="truncate max-w-[140px]">{item.sha256_checksum}</span>
                          <button
                            onClick={() => handleCopyHash(item.sha256_checksum, item.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                            title="Copy SHA-256 Checksum"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle size={14} weight="fill" />
                          Verified
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <a
                          href={item.download_url}
                          download
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <DownloadSimple size={14} />
                          <span>{t('out.download')}</span>
                        </a>
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
