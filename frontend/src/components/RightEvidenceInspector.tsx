import React from 'react';
import {
  FileText,
  CheckCircle,
  ArrowSquareOut,
  DownloadSimple,
  Copy,
  CaretLeft,
  CaretRight,
  ShieldCheck,
  Check,
  X,
  FilePdf
} from '@phosphor-icons/react';

interface RightEvidenceInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RightEvidenceInspector: React.FC<RightEvidenceInspectorProps> = ({
  isOpen,
  onClose,
  onNotify
}) => {
  if (!isOpen) return null;

  const handleCopyQuote = () => {
    navigator.clipboard?.writeText(
      "The solution shall provide continuous monitoring and 15-minute automated incident triage across all operational technology (OT) network segments, with mandatory telemetry preservation for audit compliance."
    );
    onNotify('Texto de evidencia copiado al portapapeles.', 'success');
  };

  return (
    <aside className="w-96 shrink-0 bg-white border-l border-slate-200 h-full flex flex-col justify-between z-20 shadow-xs overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                R002 Evidence
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check size={10} weight="bold" />
                Human Verified
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Traceability & Extraction Inspector
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4 text-xs">
        {/* DOCUMENT Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            <span>DOCUMENT</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold border border-blue-100">
              PAGE 18
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <FilePdf size={16} weight="duotone" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-slate-900 text-xs truncate">
                Tender.pdf
              </div>
              <div className="text-[10px] text-slate-500">
                14.2 MB • Clause 4.1.2
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNotify('Abriendo visualizador interactivo de documento PDF...', 'info')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <ArrowSquareOut size={13} />
              <span>[ Open Document ]</span>
            </button>
            <button
              onClick={() => onNotify('Descargando archivo Tender.pdf...', 'info')}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
              title="Download Tender.pdf"
            >
              <DownloadSimple size={14} />
            </button>
          </div>
        </div>

        {/* RELEVANT TEXT Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              RELEVANT TEXT
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              96.8% Semantic Match
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 quote-highlight space-y-2">
            <div className="text-[10px] font-mono font-bold text-amber-800">
              Tender.pdf (Clause 4.1.2)
            </div>
            <p className="text-slate-800 italic leading-relaxed text-[11px]">
              "The solution shall provide continuous monitoring..."
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px] font-sans">
              Full context: "...continuous monitoring and 15-minute automated incident triage across all operational technology (OT) network segments, with mandatory telemetry preservation for audit compliance."
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 text-[10px] text-slate-500">
              <button
                onClick={handleCopyQuote}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Copy size={11} />
                <span>Copy Extracted Text</span>
              </button>
              <span className="font-mono text-[9px] text-slate-400">Position: [18:412-588]</span>
            </div>
          </div>
        </div>

        {/* LINKED REQUIREMENT Section */}
        <div>
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mb-2">
            LINKED REQUIREMENT
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono font-bold text-[10px] border border-blue-100">
                R002
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[10px] border border-amber-200">
                Partial Compliance (Gap Closed)
              </span>
            </div>
            <div className="font-bold text-slate-900 text-xs">
              Continuous monitoring & automated 15-min incident triage for OT network
            </div>
            <div className="text-[10px] text-slate-500">
              Category: Cybersecurity / OT Infrastructure (Mandatory)
            </div>
          </div>
        </div>

        {/* LINKED PRODUCT Section */}
        <div>
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mb-2">
            LINKED PRODUCT
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Product ABC</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">v4.2 Enterprise</span>
            </div>
            <div className="text-xs text-slate-700 font-medium">
              IQSEC OT Sentinel & Industrial Threat Defense Suite
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Vendor: IQSEC Technologies</span>
              <span className="font-semibold text-slate-700">Native Integration</span>
            </div>
          </div>
        </div>

        {/* VALIDATION AUDIT Section */}
        <div>
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mb-2">
            VALIDATION AUDIT
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check size={12} weight="bold" />
                <span>Human Verified</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Oct 24, 2026 14:32
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              <strong>Alejandro Ruiz (Presales Lead):</strong> "Verified in RFP Section 3.2.1. Product ABC satisfies the continuous monitoring SLA with manual OT gate exception."
            </p>
            <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="font-mono text-slate-500">Sign-off Hash: #VLD-88192</span>
              <button
                onClick={() => onNotify('Abriendo modal de edición de auditoría...', 'info')}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Edit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs sticky bottom-0">
        <button
          onClick={() => onNotify('Navegando a requerimiento anterior R001...', 'info')}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
        >
          <CaretLeft size={12} weight="bold" />
          <span>Prev (R001: p.12)</span>
        </button>
        <button
          onClick={() => onNotify('Navegando a requerimiento siguiente R003...', 'info')}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
        >
          <span>Next (R003: p.25)</span>
          <CaretRight size={12} weight="bold" />
        </button>
      </div>
    </aside>
  );
};
