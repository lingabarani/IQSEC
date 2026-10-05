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
  Check
} from '@phosphor-icons/react';
import { useI18n } from '../context/I18nContext';

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

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <SquaresFour size={20} /> },
    { id: 'requirements', label: t('nav.requirements'), icon: <ClipboardText size={20} /> },
    { id: 'compliance', label: t('nav.compliance'), icon: <CheckSquare size={20} /> },
    { id: 'evidence', label: t('nav.evidence'), icon: <Shield size={20} /> },
    { id: 'products', label: t('nav.products'), icon: <Package size={20} /> },
    { id: 'clarifications', label: t('nav.clarifications'), icon: <Question size={20} /> },
    { id: 'validation', label: t('nav.validation'), icon: <SealCheck size={20} />, badge: 30 },
    { id: 'outputs', label: t('nav.outputs'), icon: <DownloadSimple size={20} /> },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Tab Handle */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-500 hover:bg-slate-700 text-white rounded-r-md flex items-center justify-center cursor-pointer shadow-md transition-colors z-30"
      >
        <CaretLeft size={14} weight="bold" className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Top Section */}
      <div className="p-4">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 px-1">
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
          className="w-full py-2.5 px-3 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all mb-6 active:scale-[0.99]"
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
                    ? 'bg-slate-100 text-slate-950 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-slate-950' : 'text-slate-500'}`}>
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
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                AI Pipeline Status
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-slate-800 mb-0.5 flex items-center gap-1">
              <span>AgentCore Multi-Agent</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              FastAPI + SQLite + AWS RAG
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="AgentCore Online" />
          </div>
        )}
      </div>
    </aside>
  );
};
