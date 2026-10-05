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
  EyeSlash,
  IdentificationCard,
  Cpu,
  Fingerprint,
  Buildings,
  Check
} from '@phosphor-icons/react';

interface LoginSignupViewProps {
  onSuccess?: () => void;
}

export const LoginSignupView: React.FC<LoginSignupViewProps> = ({ onSuccess }) => {
  const { t, locale, setLocale } = useI18n();
  const { login, signup, switchUser } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'credentials' | 'sso' | 'smartcard'>('credentials');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState<string>('alejandro.ruiz@iqsec.com');
  const [signInPassword, setSignInPassword] = useState<string>('••••••••••••');
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpRole, setSignUpRole] = useState<UserProfile['role']>('Presales Lead');
  const [signUpPassword, setSignUpPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      setErrorMsg(locale === 'es' ? 'Ingrese su correo electrónico corporativo.' : 'Please enter your corporate email address.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const ok = login(signInEmail, signInPassword);
      setIsSubmitting(false);
      if (ok) {
        onSuccess?.();
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) {
      setErrorMsg(locale === 'es' ? 'Ingrese su nombre completo y correo corporativo.' : 'Please enter your full name and work email.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const ok = signup(signUpName, signUpEmail, signUpRole, signUpPassword);
      setIsSubmitting(false);
      if (ok) {
        onSuccess?.();
      }
    }, 400);
  };

  const handleQuickDemoUser = (user: UserProfile) => {
    switchUser(user);
    onSuccess?.();
  };

  return (
    <div className="min-h-screen w-full flex bg-[#060a12] text-slate-100 font-sans antialiased overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. LEFT HERO: TIER-1 ENTERPRISE CYBERSECURITY PLATFORM SHOWCASE */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#080e1e] via-[#091326] to-[#040711] text-white flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
        {/* Ambient Holographic Radial Glows */}
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Cyber Grid Mesh Backdrop */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header: Brand Identity */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-extrabold text-base shadow-[0_0_25px_-4px_rgba(59,130,246,0.6)] border border-blue-400/40">
              IQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">IQSEC</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ENTERPRISE v2.4
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {t('brand.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Center Presentation: Multi-Agent Capabilities */}
        <div className="relative z-10 max-w-xl space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Sparkle size={14} weight="fill" className="text-cyan-400 animate-pulse" />
            <span>Autonomous Tender Ingestion & Governance</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Accelerate Government & Enterprise RFPs with Verified AI Accuracy.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            From multi-thousand page tender specifications and Junta de Aclaraciones addendums to color-coded Sábana matrices, formal Word proposals, and executive slide decks.
          </p>

          {/* Pillars List */}
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle size={16} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">
                  2-Stage Human-in-the-Loop Governance
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Stage 1 Pre-Sales technical audit followed by Stage 2 formal executive sign-off and release authority.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <ShieldCheck size={16} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">
                  OpenSearch Hybrid RAG Grounding
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Every response grounded in immutable, page-verified citations with cosine distance confidence scoring.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <LockKey size={16} weight="bold" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">
                  Tamper-Evident SHA-256 Ledger
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Cryptographic integrity manifests locking all exported Excel Sábana, Word (.docx), and PowerPoint deliverables.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Compliance Accreditations */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ISO/IEC 27001:2022 Certified</span>
          </div>
          <div>CMMI-SVC v2.0 Level 3</div>
          <div>CFE & PEMEX Public Sector Ready</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT PANEL: ENTERPRISE AUTHENTICATION & LOGIN FORM */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto bg-[#0a0f1d] relative">
        {/* Top Header: Security Indicator & Language Switcher */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <LockKey size={13} weight="bold" />
            <span>TLS 1.3 256-BIT ENCRYPTED</span>
          </div>

          {/* Bilingual Language Switcher: ES / EN */}
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1 shadow-2xs">
            <button
              onClick={() => setLocale('es')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                locale === 'es'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                locale === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Center Card Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {mode === 'signin' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
            </p>
          </div>

          {/* Mode Switch Tabs: Sign In vs Create Account */}
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white/10 text-white shadow-xs font-bold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
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
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white/10 text-white shadow-xs font-bold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick 1-Click Demo Personas (Executive Badges) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>{t('auth.quickDemoProfiles')}</span>
              <span className="text-blue-400 font-mono">1-CLICK LOGIN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoUser(user)}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500/50 text-left transition-all cursor-pointer shadow-xs group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {user.avatarInitials}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {user.name.split(' ')[0]} {user.name.split(' ')[1]?.[0] || ''}.
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.role}
                  </div>
                  <div className="text-[9px] text-blue-400 font-mono mt-1 font-semibold flex items-center gap-1">
                    <span>Activate →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Method Sub-Tabs */}
          {mode === 'signin' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-1 border-b border-white/10 pb-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMethod('credentials')}
                  className={`pb-1 px-2 border-b-2 transition-all cursor-pointer ${
                    authMethod === 'credentials'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {t('auth.tabCredentials')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('sso')}
                  className={`pb-1 px-2 border-b-2 transition-all cursor-pointer ${
                    authMethod === 'sso'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {t('auth.tabSSO')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('smartcard')}
                  className={`pb-1 px-2 border-b-2 transition-all cursor-pointer ${
                    authMethod === 'smartcard'
                      ? 'border-blue-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {t('auth.tabSmartCard')}
                </button>
              </div>

              {/* SSO Tab Buttons */}
              {authMethod === 'sso' && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      switchUser(DEMO_USERS[0]);
                      onSuccess?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center font-bold text-[10px]">O</span>
                      <span>{t('auth.ssoOkta')}</span>
                    </span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchUser(DEMO_USERS[1]);
                      onSuccess?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-cyan-600 flex items-center justify-center font-bold text-[10px]">M</span>
                      <span>{t('auth.ssoAzure')}</span>
                    </span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchUser(DEMO_USERS[2]);
                      onSuccess?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center font-bold text-[10px]">G</span>
                      <span>{t('auth.ssoGoogle')}</span>
                    </span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                </div>
              )}

              {/* SmartCard Tab */}
              {authMethod === 'smartcard' && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center mx-auto">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">CAC / PIV / FIDO2 Token Detected</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Insert your YubiKey or Government SmartCard reader to sign certificate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      switchUser(DEMO_USERS[0]);
                      onSuccess?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
                  >
                    Authenticate with FIDO2 Passkey
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form: Credentials Authentication */}
          {(mode === 'signup' || authMethod === 'credentials') && (
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <span>{errorMsg}</span>
                </div>
              )}

              {mode === 'signup' && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {t('auth.fullNameLabel')}
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Lic. María Peralta"
                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white/[0.08] transition-all"
                      />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {t('auth.roleLabel')}
                    </label>
                    <div className="relative">
                      <IdentificationCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={signUpRole}
                        onChange={(e) => setSignUpRole(e.target.value as any)}
                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-blue-500 transition-all font-sans cursor-pointer"
                      >
                        <option value="Presales Lead" className="bg-slate-900 text-white">Presales Lead — Technical Audit & Sábana</option>
                        <option value="Proposal Director" className="bg-slate-900 text-white">Proposal Director — Final Release & Sign-off</option>
                        <option value="Compliance Lead" className="bg-slate-900 text-white">Compliance Lead — RAG Grounding & Clause Triage</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Corporate Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={mode === 'signin' ? signInEmail : signUpEmail}
                    onChange={(e) => mode === 'signin' ? setSignInEmail(e.target.value) : setSignUpEmail(e.target.value)}
                    placeholder="name@iqsec.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {/* Security Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    {t('auth.passwordLabel')}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => alert(locale === 'es' ? 'Contacte al administrador de seguridad IQSEC (secops@iqsec.com)' : 'Contact IQSEC Security Operations (secops@iqsec.com)')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <LockKey size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={mode === 'signin' ? signInPassword : signUpPassword}
                    onChange={(e) => mode === 'signin' ? setSignInPassword(e.target.value) : setSignUpPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white/[0.08] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                  <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                  <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                  <div className="h-1 flex-1 bg-blue-500 rounded-full" />
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold ml-1">STRONG</span>
                </div>
              </div>

              {/* Remember Workstation Checkbox */}
              {mode === 'signin' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember_station"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-white/20 bg-white/5 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="remember_station" className="text-xs text-slate-400 cursor-pointer select-none">
                    {t('auth.rememberWorkstation')}
                  </label>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)] transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating Session...' : (mode === 'signin' ? t('auth.signInButton') : t('auth.signUpButton'))}</span>
              </button>
            </form>
          )}

          {/* Institutional Trust Disclaimer */}
          <div className="pt-4 text-center">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              Enterprise Security Enforced · 256-bit TLS Encryption · IQSEC Cybersecurity 2026
            </p>
          </div>
        </div>

        {/* Empty bottom spacer for balance */}
        <div className="hidden lg:block text-transparent text-[1px] select-none">
          IQSEC
        </div>
      </div>
    </div>
  );
};
