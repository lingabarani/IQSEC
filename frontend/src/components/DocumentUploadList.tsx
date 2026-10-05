import React, { useState } from 'react';
import {
  CloudArrowUp,
  FilePdf,
  CheckCircle,
  Info,
  Eye,
  Trash,
  Plus
} from '@phosphor-icons/react';

interface UploadedDoc {
  id: string;
  name: string;
  badge: { text: string; type: 'verified' | 'clarification' };
  pages: number;
  size: string;
  status: string;
}

interface DocumentUploadListProps {
  onNotify: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onSelectDocForInspection?: (docName: string) => void;
}

export const DocumentUploadList: React.FC<DocumentUploadListProps> = ({
  onNotify,
  onSelectDocForInspection
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>([
    {
      id: 'doc-1',
      name: 'Tender.pdf',
      badge: { text: 'Verified Structure', type: 'verified' },
      pages: 38,
      size: '14.2 MB',
      status: 'Ready for Extraction'
    },
    {
      id: 'doc-2',
      name: 'Technical_Annex.pdf',
      badge: { text: 'Verified Structure', type: 'verified' },
      pages: 64,
      size: '28.5 MB',
      status: 'Ready for Extraction'
    },
    {
      id: 'doc-3',
      name: 'Clarifications.pdf',
      badge: { text: 'Junta de Aclaraciones', type: 'clarification' },
      pages: 12,
      size: '4.1 MB',
      status: 'Ready for Extraction'
    }
  ]);

  const handleFileUpload = (fileName: string) => {
    const newDoc: UploadedDoc = {
      id: `doc-${Date.now()}`,
      name: fileName,
      badge: { text: 'Verified Structure', type: 'verified' },
      pages: Math.floor(Math.random() * 40) + 10,
      size: `${(Math.random() * 15 + 2).toFixed(1)} MB`,
      status: 'Ready for Extraction'
    };
    setDocs(prev => [...prev, newDoc]);
    onNotify(`Documento "${fileName}" cargado y pre-procesado con OCR exitosamente.`, 'success');
  };

  const handleDelete = (id: string, name: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    onNotify(`Documento "${name}" eliminado del pliego licitatorio.`, 'info');
  };

  return (
    <div className="white-card rounded-2xl p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono">
            2
          </span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Upload Documents
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Info size={14} weight="fill" />
          <span>Multi-file OCR support enabled</span>
        </div>
      </div>

      {/* Cloud Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileUpload(f.name);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 mb-6 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/60'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.docx,.xlsx';
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleFileUpload(f.name);
          };
          input.click();
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-3">
          <CloudArrowUp size={24} weight="duotone" />
        </div>
        <p className="text-xs font-semibold text-slate-800 mb-1">
          Drag & drop files here, or <span className="text-blue-600 underline">browse files</span>
        </p>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto mb-4">
          Supports PDF, DOCX, XLSX (Technical Annexes, Bases de Licitación, Juntas de Aclaraciones) up to 100MB per file.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>Upload Documents</span>
        </button>
      </div>

      {/* Uploaded Files Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 tracking-wide">
              UPLOADED FILES
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {docs.length} Documents (46.8 MB)
            </span>
          </div>
          <button
            onClick={() => onNotify('Abriendo selector de adendas / juntas de aclaraciones...', 'info')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} weight="bold" />
            <span>Add Additional Addendum / Clarification</span>
          </button>
        </div>

        {/* Files List */}
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-4 transition-colors group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                  <FilePdf size={20} weight="duotone" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {doc.name}
                    </span>
                    {doc.badge.type === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={10} weight="fill" />
                        {doc.badge.text}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Info size={10} weight="fill" />
                        {doc.badge.text}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {doc.pages} pages • {doc.size} • <span className="text-slate-700 font-medium">{doc.status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelectDocForInspection?.(doc.name)}
                  title="Inspect Document & Evidence"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  title="Remove Document"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
