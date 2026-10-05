import React from 'react';
import {
  Sparkle,
  Clock,
  ArrowRight,
  ShieldCheck,
  LockKey
} from '@phosphor-icons/react';

interface PipelineStepperProps {
  currentStage: number;
  isProcessing: boolean;
  onStartProcessing: () => void;
  onCancel: () => void;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStage,
  isProcessing,
  onStartProcessing,
  onCancel
}) => {
  const stages = [
    {
      step: '01',
      title: 'Document Upload',
      desc: '3 Files Queued'
    },
    {
      step: '02',
      title: 'OCR & Extraction',
      desc: 'Multi-column layout'
    },
    {
      step: '03',
      title: 'Requirements',
      desc: 'Clause parsing'
    },
    {
      step: '04',
      title: 'Product Mapping',
      desc: 'IQSEC catalog matching'
    },
    {
      step: '05',
      title: 'Compliance Audit',
      desc: 'Risk & gap scoring'
    },
    {
      step: '06',
      title: 'Human Review',
      desc: 'Interactive matrix'
    }
  ];

  return (
    <div className="mb-6">
      {/* Main Pipeline Card */}
      <div className="white-card rounded-2xl p-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkle size={14} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              AI Ingestion & Generation Pipeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Estimated runtime: ~45s
          </span>
        </div>

        {/* 6 Stage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {stages.map((stage, idx) => {
            const isActive = currentStage === idx + 1;
            const isCompleted = currentStage > idx + 1;

            return (
              <div
                key={stage.step}
                className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'border-blue-300 bg-blue-50/70 shadow-2xs'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    {stage.step}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-blue-600 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight mb-0.5">
                  {stage.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trigger Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock size={16} className="text-blue-600 shrink-0" />
            <span>
              Estimated extraction time: <strong className="text-slate-900">~45 seconds</strong> across 3 documents.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onStartProcessing}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-black hover:bg-slate-800'
              }`}
            >
              <span>{isProcessing ? 'Processing Pipeline...' : 'Start Processing'}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Security & Enclave Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-2 font-medium">
        <div>
          AI Ingestion Engine: <span className="font-mono text-slate-700">v4.2-enterprise</span> • Document Enclave: <span className="text-slate-700">Zero-Retention Isolation Mode</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[10px]">
          <LockKey size={12} weight="bold" />
          <span>AES-256 Encrypted In-Flight</span>
        </div>
      </div>
    </div>
  );
};
