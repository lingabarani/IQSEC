import React, { useState } from 'react';
import { useAuth, DEMO_USERS, UserProfile } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import {
  ShieldCheck,
  LockKey,
  Envelope,
  User,
  ArrowRight,
  Sparkle,
  CheckCircle,
  FileText,
  Key,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';

interface LoginSignupViewProps {
  onSuccess?: () => void;
}

export const LoginSignupView: React.FC<LoginSignupViewProps> = ({ onSuccess }) => {
  const { t, locale, setLocale } = useI18n();
  const { login, signup, switchUser } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState<string>('alejandro.ruiz@iqsec.com');
  const [signInPassword, setSignInPassword] = useState<string>('••••••••••••');

  // Sign Up State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpRole, setSignUpRole] = useState<UserProfile['role']>('Presales Lead');
  const [signUpPassword, setSignUpPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      setErrorMsg('Please enter your corporate email address.');
      return;
    }
    const ok = login(signInEmail, signInPassword);
    if (ok) {
      onSuccess?.();
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) {
      setErrorMsg('Please enter your full name and work email.');
      return;
    }
    const ok = signup(signUpName, signUpEmail, signUpRole, signUpPassword);
    if (ok) {
      onSuccess?.();
    }
  };

  const handleQuickDemoUser = (user: UserProfile) => {
    switchUser(user);
    onSuccess?.();
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* 1. LEFT FEATURE / BRAND HERO PANEL (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              IQ
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                IQSEC
              </h1>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                AI PROPOSAL AUTOMATION PLATFORM
              </p>
            </div>
          </div>
        </div>

        {/* Center Presentation */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
            <Sparkle size={14} weight="fill" />
            <span>Autonomous Tender Ingestion & Governance</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Accelerate RFP responses with verified AI precision.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            From multi-thousand page tender specifications and Junta de Aclaraciones addendums to color-coded Sábana matrices, formal Word proposals, and executive slide decks.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-white">2-Stage Human-in-the-Loop Governance:</span>
                <span className="text-slate-400 ml-1">Pre-Sales technical audit followed by executive sign-off authority.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-white">OpenSearch Hybrid RAG Grounding:</span>
                <span className="text-slate-400 ml-1">Every requirement response grounded in immutable, page-verified citations.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-white">Tamper-Evident SHA-256 Ledger:</span>
                <span className="text-slate-400 ml-1">Cryptographic integrity manifests locking all exported deliverables.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Standards Note */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between pt-6 border-t border-slate-800">
          <span>ISO/IEC 27001:2022 Certified</span>
          <span>CMMI-SVC v2.0 Level 3</span>
          <span>CFE & Public Sector Ready</span>
        </div>
      </div>

      {/* 2. RIGHT LOGIN / SIGNUP CARD */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 overflow-y-auto">
        {/* Header Controls: Language Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              IQ
            </div>
            <span className="font-bold text-slate-900 text-sm">IQSEC</span>
          </div>

          <div className="ml-auto inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 shadow-2xs">
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
        </div>

        {/* Center Authentication Card Form */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'signin' ? 'Sign in to IQSEC' : 'Create Enterprise Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Access the AI Proposal Generator & Governance Workspace'
                : 'Register as an authorized presales engineer or proposal director'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick 1-Click Demo Profiles */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick 1-Click Demo Profiles:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoUser(user)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-left transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                      {user.avatarInitials}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900 truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium truncate">
                    {user.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    placeholder="name@iqsec.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo access: Click any quick-access profile above to sign in immediately.')}
                    className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Remember this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
              >
                <span>Sign In to Platform</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    placeholder="e.g. Alejandro Ruiz"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    placeholder="name@iqsec.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Platform Role
                </label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans cursor-pointer"
                >
                  <option value="Presales Lead">Presales Lead — Technical Verification & Sábana</option>
                  <option value="Proposal Director">Proposal Director — Final Sign-off Authority</option>
                  <option value="Compliance Lead">Compliance Lead — ISO 27001 & Regulatory</option>
                  <option value="Solution Architect">Solution Architect — Cloud & SCADA OEM</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    placeholder="Create secure password"
                    className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors shadow-2xs font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
              >
                <span>Register & Enter Workspace</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-6">
          Enterprise Security Enforced • 256-bit TLS Encryption • IQSEC Cybersecurity 2026
        </div>
      </div>
    </div>
  );
};
