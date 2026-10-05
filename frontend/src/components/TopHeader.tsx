import React, { useState, useRef, useEffect } from 'react';
import { CaretRight, User, Globe, CaretDown, Check, SignOut, ShieldCheck, UserSwitch } from '@phosphor-icons/react';
import { useI18n } from '../context/I18nContext';
import { useProposal } from '../context/ProposalContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

interface TopHeaderProps {
  onSaveDraft?: () => void;
  onCancel?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSaveDraft,
  onCancel
}) => {
  const { locale, setLocale, t } = useI18n();
  const { proposals, activeProposal, setActiveProposal } = useProposal();
  const { currentUser, logout, switchUser } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
      {/* Title & Proposal Selector */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span>{t('header.proposals')}</span>
            <CaretRight size={12} className="text-slate-400" />
            <span className="text-slate-900 font-semibold">{t('brand.subtitle')}</span>
          </div>

          {/* Proposal Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={activeProposal?.id || ''}
              onChange={(e) => {
                const found = proposals.find(p => p.id === e.target.value);
                if (found) setActiveProposal(found);
              }}
              className="text-sm font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 pr-6 cursor-pointer font-sans"
            >
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.tender_number})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls: Language Switcher, Badges, Profile & Actions */}
      <div className="flex items-center gap-4">
        {/* Language Toggle: EN / ES */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shadow-2xs">
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
        </div>

        {/* Status Badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
            {activeProposal?.tender_number || 'ABC-2026'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            {t('global.humanReview')}
          </span>
        </div>

        {/* User Profile with Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-200" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs group-hover:ring-2 group-hover:ring-blue-500/30 transition-all">
              {currentUser?.avatarInitials || 'AR'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{currentUser?.name || 'Alejandro Ruiz'}</span>
                <CaretDown size={12} className="text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500">
                {currentUser?.role || 'Presales Lead'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">
                  {currentUser?.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Quick Switch Role */}
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Switch Active Persona
                </div>
                <div className="space-y-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        currentUser?.id === u.id
                          ? 'bg-slate-100 font-bold text-slate-900'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.role.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="px-2 pt-1.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <SignOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDraft}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            {t('global.saveDraft')}
          </button>
        </div>
      </div>
    </header>
  );
};
