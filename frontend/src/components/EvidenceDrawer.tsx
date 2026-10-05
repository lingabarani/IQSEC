import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Warning, BookOpen, UserCheck, ShieldCheck, Quotes } from '@phosphor-icons/react';
import { Requirement } from '../types';

interface EvidenceDrawerProps {
  selectedReq: Requirement | null;
  onClose: () => void;
  onToggleApproval: (id: string) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  selectedReq,
  onClose,
  onToggleApproval
}) => {
  return (
    <AnimatePresence>
      {selectedReq && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sliding Inspection Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-slate-900 border-l border-white/10 z-50 shadow-2xl flex flex-col glass-panel-elevated"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-cyan-400">
                  {selectedReq.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • PÁG. {selectedReq.page}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                  {selectedReq.pillar}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Title & Status */}
              <div>
                <h2 className="text-base font-bold text-white mb-2">
                  {selectedReq.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full font-mono text-[11px] font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    DICTAMEN: {selectedReq.status}
                  </span>
                  <span className="text-slate-400 font-mono">
                    CONFIANZA: {Math.round((selectedReq.confidence ?? selectedReq.confidence_score ?? 0.8) * 100)}%
                  </span>
                </div>
              </div>

              {/* Effective Clause */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5">
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-bold tracking-wider">
                  Texto Efectivo Licitatorio (Post-Aclaraciones)
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {selectedReq.effective_text}
                </p>
              </div>

              {/* Formulated Technical Proposal */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-cyan-400 mb-1.5 font-bold tracking-wider">
                  <ShieldCheck size={14} weight="bold" />
                  <span>Respuesta Técnica Propuesta para Licitación</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {selectedReq.response_text || selectedReq.technical_response}
                </p>
              </div>

              {/* Citations & Evidence Grounding */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-slate-400 mb-3 font-bold tracking-wider">
                  <BookOpen size={14} />
                  <span>Evidencia y Citas Scoped RAG ({(selectedReq.citations || selectedReq.exact_citations || []).length})</span>
                </div>
                <div className="space-y-3">
                  {(selectedReq.citations || selectedReq.exact_citations || []).map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                        <span className="font-semibold">{c.doc}</span>
                        <span>PÁG. {c.page}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-300 italic">
                        <Quotes size={16} className="text-slate-500 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">"{c.quote}"</p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Score de Relevancia Vectorial: {(c.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <UserCheck size={16} />
                <span>
                  {selectedReq.human_approved
                    ? `Aprobado por ${selectedReq.reviewed_by || 'Ingeniero Senior'}`
                    : 'Pendiente de aprobación'}
                </span>
              </div>
              <button
                onClick={() => onToggleApproval(selectedReq.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedReq.human_approved
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-400 hover:bg-rose-900/60'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 glow-emerald font-bold'
                }`}
              >
                <CheckCircle size={16} weight="bold" />
                <span>
                  {selectedReq.human_approved ? 'Revocar Aprobación' : 'Aprobar Requerimiento'}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
