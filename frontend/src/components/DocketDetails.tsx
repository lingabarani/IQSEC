import React from 'react';
import { Buildings, User, CaretDown } from '@phosphor-icons/react';

interface DocketDetailsProps {
  proposalName: string;
  setProposalName: (val: string) => void;
  tenderNo: string;
  setTenderNo: (val: string) => void;
  clientOrg: string;
  setClientOrg: (val: string) => void;
  presalesLead: string;
  setPresalesLead: (val: string) => void;
}

export const DocketDetails: React.FC<DocketDetailsProps> = ({
  proposalName,
  setProposalName,
  tenderNo,
  setTenderNo,
  clientOrg,
  setClientOrg,
  presalesLead,
  setPresalesLead
}) => {
  return (
    <div className="white-card rounded-2xl p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold flex items-center justify-center font-mono">
            1
          </span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Proposal Docket Details
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          REQUIRED SPECIFICATIONS
        </span>
      </div>

      {/* 2x2 Grid of Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Proposal Name */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            PROPOSAL NAME <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={proposalName}
            onChange={(e) => setProposalName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            placeholder="e.g. Tender ABC 2026"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Formal proposal reference used across executive reports.
          </p>
        </div>

        {/* Tender / Reference No. */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            TENDER / REFERENCE NO. <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={tenderNo}
            onChange={(e) => setTenderNo(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
            placeholder="e.g. ABC-2026-001"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Contracting authority official gazette or folio code.
          </p>
        </div>

        {/* Client Organization */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            CLIENT / CONTRACTING ORGANIZATION
          </label>
          <div className="relative">
            <Buildings size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={clientOrg}
              onChange={(e) => setClientOrg(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              placeholder="e.g. National Utility Authority / CFE"
            />
          </div>
        </div>

        {/* Assigned Presales Lead */}
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            ASSIGNED PRESALES LEAD
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={presalesLead}
              onChange={(e) => setPresalesLead(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer shadow-2xs"
            >
              <option value="Alejandro Ruiz (Presales Lead - Cybersecurity)">
                Alejandro Ruiz (Presales Lead - Cybersecurity)
              </option>
              <option value="Mariana Gomez (Principal Solution Architect)">
                Mariana Gomez (Principal Solution Architect)
              </option>
              <option value="Carlos Mendez (Cloud Security Specialist)">
                Carlos Mendez (Cloud Security Specialist)
              </option>
            </select>
            <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
