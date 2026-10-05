import React, { useState } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  SealCheck,
  UserCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  WarningCircle,
  FileText
} from '@phosphor-icons/react';

interface ValidationQueueViewProps {
  onNotify?: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ValidationQueueView: React.FC<ValidationQueueViewProps> = ({ onNotify }) => {
  const { t } = useI18n();
  const {
    activeProposal,
    requirements,
    handleStage1Approval,
    handleStage2Signoff
  } = useProposal();

  const [stage1Notes, setStage1Notes] = useState<string>('Sábana de cumplimiento revisada minuciosamente. SLAs y partidas validadas.');
  const [stage2Notes, setStage2Notes] = useState<string>('Autorizada formalmente para entrega comercial y licitación formal.');
  const [isSubmittingStage1, setIsSubmittingStage1] = useState<boolean>(false);
  const [isSubmittingStage2, setIsSubmittingStage2] = useState<boolean>(false);

  if (!activeProposal) {
    return <div className="p-8 text-center text-slate-500">{t('global.loading')}</div>;
  }

  const isStage1Approved = activeProposal.sabana_status === 'SABANA_APPROVED';
  const isStage2Approved = activeProposal.lifecycle_status === 'FINAL_SIGN_OFF' || activeProposal.status === 'APPROVED_AND_RELEASED';

  const onApproveStage1 = async () => {
    setIsSubmittingStage1(true);
    try {
      await handleStage1Approval(stage1Notes);
      onNotify?.('Stage 1 (Humano 1 Sábana Approval) submitted and persisted successfully.', 'success');
    } catch (e: any) {
      onNotify?.(e.message || 'Stage 1 approval failed', 'error');
    } finally {
      setIsSubmittingStage1(false);
    }
  };

  const onSignOffStage2 = async () => {
    setIsSubmittingStage2(true);
    try {
      await handleStage2Signoff(stage2Notes);
      onNotify?.('Stage 2 (Humano 2 Final Proposal Sign-Off) completed successfully. Proposal released.', 'success');
    } catch (e: any) {
      onNotify?.(e.message || 'Stage 2 sign-off failed', 'error');
    } finally {
      setIsSubmittingStage2(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('val.title')}
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              2-Stage Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('val.subtitle')} for compliance and release authorization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stage 1: Pre-Sales Technical Sábana Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stage 1 / Humano 1
              </span>
              {isStage1Approved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle size={14} weight="fill" />
                  Approved & Locked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock size={14} />
                  Pending Approval
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {t('val.stage1')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Lead Pre-Sales Engineer verifies citations, approves technical responses, and marks the Sábana matrix as ready for final sign-off.
            </p>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reviewer:</span>
                <span className="font-semibold text-slate-900">Alejandro Ruiz (Presales Lead)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audited Clauses:</span>
                <span className="font-semibold text-slate-900">{requirements.length} Clauses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-mono font-bold text-emerald-700">{activeProposal.sabana_status || 'SABANA_APPROVED'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Pre-Sales Review Notes
              </label>
              <textarea
                value={stage1Notes}
                onChange={(e) => setStage1Notes(e.target.value)}
                rows={3}
                disabled={isStage1Approved}
                className="w-full text-xs text-slate-900 bg-white rounded-lg border border-slate-200 p-3 focus:border-blue-600 focus:outline-none transition-all resize-y disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <button
            onClick={onApproveStage1}
            disabled={isSubmittingStage1 || isStage1Approved}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all ${
              isStage1Approved
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-black hover:bg-slate-800 text-white active:scale-[0.99]'
            }`}
          >
            <SealCheck size={16} weight="bold" />
            <span>{isStage1Approved ? 'Stage 1 Sábana Approved' : 'Formally Approve Sábana (Humano 1)'}</span>
          </button>
        </div>

        {/* Stage 2: Final Proposal Executive Sign-off */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stage 2 / Humano 2
              </span>
              {isStage2Approved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle size={14} weight="fill" />
                  Proposal Authorized & Released
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock size={14} />
                  Awaiting Executive Sign-Off
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {t('val.stage2')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Proposal Director or VP of Engineering conducts the final executive review, certifying legal, economic, and technical integrity.
            </p>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Signer:</span>
                <span className="font-semibold text-slate-900">Lic. M. Peralta (Director de Propuestas)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dossier Readiness:</span>
                <span className="font-semibold text-slate-900">75% Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorization:</span>
                <span className="font-mono font-bold text-blue-700">{activeProposal.lifecycle_status || 'PROPOSAL_IN_REVIEW'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Executive Authorization Notes
              </label>
              <textarea
                value={stage2Notes}
                onChange={(e) => setStage2Notes(e.target.value)}
                rows={3}
                disabled={!isStage1Approved || isStage2Approved}
                className="w-full text-xs text-slate-900 bg-white rounded-lg border border-slate-200 p-3 focus:border-blue-600 focus:outline-none transition-all resize-y disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <button
            onClick={onSignOffStage2}
            disabled={!isStage1Approved || isSubmittingStage2 || isStage2Approved}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all ${
              isStage2Approved
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : !isStage1Approved
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99]'
            }`}
          >
            <ShieldCheck size={16} weight="bold" />
            <span>{isStage2Approved ? 'Proposal Signed Off & Released' : 'Authorize & Sign-Off Proposal (Humano 2)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
