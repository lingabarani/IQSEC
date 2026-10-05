import React, { useState, useRef, useEffect } from 'react';
import { CaretRight, User, Globe, CaretDown, Check, SignOut, ShieldCheck, UserSwitch, Plus, FolderOpen, MagnifyingGlass } from '@phosphor-icons/react';
import { useI18n } from '../context/I18nContext';
import { useProposal } from '../context/ProposalContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

interface TopHeaderProps {
  onSaveDraft?: () => void;
  onCancel?: () => void;
  onNewProposal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSaveDraft,
  onCancel,
  onNewProposal
}) => {
  const { locale, setLocale, t } = useI18n();
  const { proposals, activeProposal, setActiveProposal } = useProposal();
  const { currentUser, logout, switchUser } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isProposalMenuOpen, setIsProposalMenuOpen] = useState<boolean>(false);
  const [proposalSearch, setProposalSearch] = useState<string>('');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const proposalMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (proposalMenuRef.current && !proposalMenuRef.current.contains(event.target as Node)) {
        setIsProposalMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProposals = proposals.filter(p =>
    p.title.toLowerCase().includes(proposalSearch.toLowerCase()) ||
    p.tender_number.toLowerCase().includes(proposalSearch.toLowerCase()) ||
    p.customer_id.toLowerCase().includes(proposalSearch.toLowerCase())
  );

  return (
    <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* 1. LEFT: Breadcrumb & Custom Interactive Proposal Selector */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={proposalMenuRef}>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span>{t('header.proposals')}</span>
            <CaretRight size={12} className="text-slate-400" />
            <span className="text-slate-900 font-semibold">{t('brand.subtitle')}</span>
          </div>

          {/* Interactive Proposal Trigger */}
          <button
            onClick={() => setIsProposalMenuOpen(!isProposalMenuOpen)}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-hidden"
          >
            <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors max-w-md truncate">
              {activeProposal ? `${activeProposal.title} (${activeProposal.tender_number})` : t('header.selectProposal')}
            </span>
            <CaretDown size={14} className="text-slate-400 group-hover:text-blue-600 transition-transform duration-150" />
          </button>

          {/* Rich Enterprise Proposal Selector Dropdown */}
          {isProposalMenuOpen && (
            <div className="absolute left-0 mt-2 w-96 max-w-[90vw] rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('header.allTenders')}
                </div>
                {/* Search Box */}
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={proposalSearch}
                    onChange={(e) => setProposalSearch(e.target.value)}
                    placeholder={t('global.search')}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Proposal List */}
              <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                {filteredProposals.map((p) => {
                  const isSelected = activeProposal?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProposal(p);
                        setIsProposalMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border border-blue-200/80'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.tender_number}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 truncate">
                            {p.customer_id}
                          </span>
                        </div>
                        <div className={`font-bold leading-snug truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {p.title}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          <span>{p.total_requirements || 30} clauses</span>
                          <span className="text-emerald-600 font-bold">{p.overall_compliance_rate || 93}% compliant</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check size={12} weight="bold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* + Create New Proposal CTA */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
                <button
                  onClick={() => {
                    setIsProposalMenuOpen(false);
                    onNewProposal?.();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Plus size={14} weight="bold" />
                  <span>{t('header.createNewProposal')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT BAR: Language Toggle, Status Badges, Save Draft, and FAR RIGHT User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Language Toggle: ES / EN */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 shadow-2xs" title="Select Platform Language">
          <button
            onClick={() => setLocale('es')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              locale === 'es'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              locale === 'en'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
        </div>

        {/* Status Badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
            {activeProposal?.tender_number || 'ABC-2026-001'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>{t('global.humanReview')}</span>
          </span>
        </div>

        {/* Action Button: Save Draft */}
        <button
          onClick={onSaveDraft}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <span>{t('header.saveDraft')}</span>
        </button>

        {/* FAR RIGHT: User Profile with Dropdown Menu */}
        <div className="relative pl-3 border-l border-slate-200" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
            title="User Profile & Active Role"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs group-hover:ring-2 group-hover:ring-blue-500/40 transition-all">
              {currentUser?.avatarInitials || 'AR'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{currentUser?.name || 'Alejandro Ruiz'}</span>
                <CaretDown size={12} className="text-slate-400 group-hover:text-slate-700" />
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser?.role || 'Presales Lead'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">
                  {currentUser?.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email}
                </div>
                <div className="mt-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Quick Switch Role Persona */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Switch Active Persona
                </div>
                <div className="space-y-1.5">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        currentUser?.id === u.id
                          ? 'bg-blue-50 font-bold text-blue-900 border border-blue-200/60'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          {u.avatarInitials}
                        </span>
                        <div className="truncate">
                          <div className="truncate leading-tight">{u.name}</div>
                          <div className="text-[9px] text-slate-400 font-normal">{u.role}</div>
                        </div>
                      </div>
                      {currentUser?.id === u.id && (
                        <Check size={14} className="text-blue-600 shrink-0" weight="bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <SignOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
