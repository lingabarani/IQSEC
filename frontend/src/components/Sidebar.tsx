import React from 'react';
import {
  SquaresFour,
  ClipboardText,
  CheckSquare,
  Shield,
  Package,
  Question,
  SealCheck,
  DownloadSimple,
  Plus,
  CaretLeft,
  Sparkle,
  Check,
  Scales,
  Cpu,
  LockKey
} from '@phosphor-icons/react';
import { useI18n } from '../context/I18nContext';
import { useProposal } from '../context/ProposalContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewProposal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewProposal,
  isCollapsed,
  onToggleCollapse
}) => {
  const { t } = useI18n();
  const { activeProposal, requirements } = useProposal();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <SquaresFour size={20} /> },
    { id: 'requirements', label: t('nav.requirements'), icon: <ClipboardText size={20} /> },
    { id: 'compliance', label: t('nav.compliance'), icon: <CheckSquare size={20} /> },
    { id: 'evidence', label: t('nav.evidence'), icon: <Shield size={20} /> },
    { id: 'products', label: t('nav.products'), icon: <Package size={20} /> },
    { id: 'clarifications', label: t('nav.clarifications'), icon: <Question size={20} /> },
    { id: 'validation', label: t('nav.validation'), icon: <SealCheck size={20} />, badge: requirements.length || 30 },
    { id: 'benchmark', label: t('nav.benchmark'), icon: <Scales size={20} /> },
    { id: 'outputs', label: t('nav.outputs'), icon: <DownloadSimple size={20} /> },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-20 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Collapse Tab Handle */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-600 hover:bg-slate-800 text-white rounded-r-md flex items-center justify-center cursor-pointer shadow-md transition-colors z-30"
      >
        <CaretLeft size={14} weight="bold" className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Top Navigation & Brand Section */}
      <div className="p-4 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            IQ
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                {t('brand.title')}
              </h1>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {t('brand.subtitle')}
              </p>
            </div>
          )}
        </div>

        {/* + New Proposal CTA Button */}
        <button
          onClick={onNewProposal}
          className="w-full py-2.5 px-3 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all mb-5 active:scale-[0.99]"
        >
          <Plus size={16} weight="bold" />
          {!isCollapsed && <span>{t('nav.newProposal')}</span>}
        </button>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Docket Card (Eliminates Blank Space in Sidebar) */}
        {!isCollapsed && activeProposal && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {t('sidebar.activeDocket')}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {activeProposal.tender_number}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
              <div>
                <div className="text-xs font-bold text-slate-900 leading-snug truncate" title={activeProposal.title}>
                  {activeProposal.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activeProposal.customer_id}
                </div>
              </div>

              {/* Compliance Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">{t('sidebar.complianceScore')}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {activeProposal.overall_compliance_rate || 93.3}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${activeProposal.overall_compliance_rate || 93.3}%` }}
                  />
                </div>
              </div>

              {/* Governance & Stage Status */}
              <div className="pt-0.5 space-y-1 text-[10px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check size={12} weight="bold" />
                  <span>{t('sidebar.sabanaSigned')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Sparkle size={12} weight="fill" />
                  <span>{t('sidebar.stage2Ready')}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectTab('compliance')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>2 {t('req.filterFlagged')}</span>
              </button>
              <button
                onClick={() => onSelectTab('outputs')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <DownloadSimple size={12} weight="bold" />
                <span>{t('nav.outputs')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry & Status Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                <Cpu size={12} className="text-blue-600" />
                <span>{t('sidebar.agentStatus')}</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-600">
              <div className="flex items-center justify-between">
                <span>Claude 3.5 Sonnet</span>
                <span className="text-slate-400">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>OpenSearch RAG</span>
                <span className="text-slate-400">1,420 chk</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-semibold pt-0.5 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <LockKey size={10} className="text-emerald-600" />
                  <span>SHA-256 Ledger</span>
                </span>
                <span className="text-emerald-600">LOCKED</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" title="All Multi-Agents Live & Grounded" />
            <span title="Cryptographic Ledger Active"><LockKey size={14} className="text-slate-400" /></span>
          </div>
        )}
      </div>
    </aside>
  );
};

