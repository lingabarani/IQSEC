import React, { useState } from 'react';
import { UploadSimple, FileText, Books, CheckCircle } from '@phosphor-icons/react';

interface IngestionPanelProps {
  onNotify: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({ onNotify }) => {
  const [rfpDrag, setRfpDrag] = useState(false);
  const [kbDrag, setKbDrag] = useState(false);
  const [rfpName, setRfpName] = useState<string | null>(null);
  const [kbCount, setKbCount] = useState<number>(3);

  const handleRfpFile = (file: File) => {
    setRfpName(file.name);
    onNotify(`Pliego RFP "${file.name}" cargado exitosamente. Extrayendo requerimientos...`, 'success');
  };

  const handleKbFile = (file: File) => {
    setKbCount(prev => prev + 1);
    onNotify(`Documento de Conocimiento "${file.name}" vectorizado e indexado en OpenSearch.`, 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* RFP Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setRfpDrag(true); }}
        onDragLeave={() => setRfpDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setRfpDrag(false);
          if (e.dataTransfer.files?.[0]) handleRfpFile(e.dataTransfer.files[0]);
        }}
        className={`p-6 rounded-2xl border transition-all duration-200 glass-panel flex flex-col items-center justify-center text-center cursor-pointer ${
          rfpDrag ? 'border-cyan-400 bg-cyan-950/20 glow-cyan' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.docx,.xlsx';
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleRfpFile(f);
          };
          input.click();
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
          <FileText size={24} weight="duotone" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          {rfpName ? `RFP: ${rfpName}` : 'Ingestar Pliego Licitatorio (RFP)'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-2">
          Arrastra aquí el anexo técnico o bases de licitación (PDF, DOCX o XLSX)
        </p>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
          Extracción Multi-Modal con Claude 3.5 Sonnet
        </span>
      </div>

      {/* Knowledge Base Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setKbDrag(true); }}
        onDragLeave={() => setKbDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setKbDrag(false);
          if (e.dataTransfer.files?.[0]) handleKbFile(e.dataTransfer.files[0]);
        }}
        className={`p-6 rounded-2xl border transition-all duration-200 glass-panel flex flex-col items-center justify-center text-center cursor-pointer ${
          kbDrag ? 'border-emerald-400 bg-emerald-950/20 glow-emerald' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.docx';
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleKbFile(f);
          };
          input.click();
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
          <Books size={24} weight="duotone" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          Base de Conocimiento Corporativo IQSEC
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-2">
          {kbCount} Whitepapers y certificaciones indexadas con Scoped Hybrid RAG
        </p>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
          Embeddings Amazon Titan v2 • Particionado Semántico
        </span>
      </div>
    </div>
  );
};
