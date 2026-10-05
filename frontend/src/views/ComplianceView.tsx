import React from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import {
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  XCircle,
  ChartPie,
  TreeStructure,
  LockKey,
  Cloud,
  Terminal,
  Certificate
} from '@phosphor-icons/react';

interface ComplianceViewProps {
  onSelectRequirement: (reqId: string) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ onSelectRequirement }) => {
  const { t } = useI18n();
  const { activeProposal, requirements } = useProposal();

  if (!activeProposal) {
    return <div className="p-8 text-center text-slate-500">{t('global.loading')}</div>;
  }

  // Group requirements by pillar
  const pillars = [
    {
      id: 'SOC_SIEM',
      name: 'SOC & SIEM Operations',
      icon: <Terminal size={20} className="text-blue-600" />,
      desc: '24/7 continuous monitoring, SLA response, and multicloud telemetry ingestion.'
    },
    {
      id: 'THREAT_INTEL',
      name: 'Cyber Threat Intelligence (CTI)',
      icon: <LockKey size={20} className="text-purple-600" />,
      desc: 'Commercial feeds, STIX/TAXII automated ingestion, and MITRE correlation.'
    },
    {
      id: 'CLOUD_SECURITY',
      name: 'Cloud Security (CSPM / CWPP)',
      icon: <Cloud size={20} className="text-sky-600" />,
      desc: 'Multicloud posture management, container security, and KMS-encrypted logs.'
    },
    {
      id: 'INCIDENT_RESPONSE',
      name: 'Incident Response & SOAR',
      icon: <ShieldCheck size={20} className="text-emerald-600" />,
      desc: 'Automated containment playbooks, host isolation, and SCADA protection.'
    },
    {
      id: 'GOVERNANCE_RISK_COMPLIANCE',
      name: 'Governance, Risk & Compliance',
      icon: <Certificate size={20} className="text-amber-600" />,
      desc: 'ISO 27001, CMMI-3, and regulatory compliance evidence validation.'
    },
    {
      id: 'IDENTITY_ACCESS',
      name: 'Privileged Access Management (PAM)',
      icon: <TreeStructure size={20} className="text-indigo-600" />,
      desc: 'Vaulted credential management, RDP/SSH session recording, and WORM storage.'
    }
  ];

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('nav.compliance')} Matrix & Gap Analysis
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {activeProposal.overall_compliance_rate || 82}% Overall Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pillar-by-pillar audit and technological gap assessment for {activeProposal.title}.
          </p>
        </div>
      </div>

      {/* Pillar Breakdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((p) => {
          const pillarReqs = requirements.filter(r => (r.iqsec_pillar || r.pillar) === p.id);
          const totalP = pillarReqs.length || 1;
          const compliesP = pillarReqs.filter(r => r.status === 'CUMPLE' || r.compliance_status === 'CUMPLE').length;
          const percentP = Math.round((compliesP / totalP) * 100);

          return (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {p.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    percentP >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {percentP}% Compliance
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {p.desc}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentP >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percentP}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 mb-4">
                  <span>{compliesP} of {totalP} clauses compliant</span>
                  <span className="font-semibold text-slate-700">{totalP - compliesP} gaps</span>
                </div>
              </div>

              {/* Sample Clause preview */}
              {pillarReqs.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectRequirement(pillarReqs[0].id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-[11px] text-blue-700">
                      {pillarReqs[0].requirement_code || pillarReqs[0].code}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {pillarReqs[0].section_title || pillarReqs[0].title}
                    </span>
                    <span className="text-xs text-blue-600 font-bold">→</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
