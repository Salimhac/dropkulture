import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Terminal,
  KeyRound,
  LogOut,
  UserCheck,
  UserPlus,
  Copy,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';
import { BrandLogo } from '../components/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const { currentUser, setCurrentUser, navigateTo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'create-admin'>('signin');
  
  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Create Admin state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  // If already logged in as admin, provide quick jump to console
  const isAlreadyAdmin = currentUser?.role === 'admin';

  // 1. Authenticate existing admin
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate via Supabase Auth
      const adminProfile = await authService.adminLogin(email, password);
      
      setCurrentUser(adminProfile);
      showToast(`Welcome back, ${adminProfile.full_name}! Administrator clearance verified.`, 'success');
      navigateTo('admin-dashboard');
    } catch (err: any) {
      const msg = err.message || 'Supabase authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      showToast(msg, 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Create new Admin from Supabase
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newName.trim()) {
      setErrorMessage('Please enter administrator full name.');
      return;
    }
    if (!newEmail.trim()) {
      setErrorMessage('Please enter administrator email address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Security password must be at least 6 characters.');
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    try {
      const newAdmin = await authService.registerAdminAccount({
        email: newEmail,
        password: newPassword,
        fullName: newName,
      });

      // Automatically sign in as the newly created admin
      setCurrentUser(newAdmin);
      showToast(`Administrator account created successfully for ${newAdmin.full_name}!`, 'success');
      navigateTo('admin-dashboard');
    } catch (err: any) {
      const msg = err.message || 'Failed to create administrator account in Supabase.';
      setErrorMessage(msg);
      showToast(msg, 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await authService.logout();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    showToast('Previous session cleared. Please sign in with administrator credentials.', 'info');
  };

  const handleCopySql = () => {
    const sql = `-- Promote user to Admin in Supabase SQL Editor:
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = '${email.trim() || 'your-admin@domain.com'}';`;
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    showToast('SQL snippet copied to clipboard', 'success');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-6 px-3 sm:px-6 relative overflow-y-auto">
      {/* Background Ambient Cyber Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Navigation Strip */}
      <div className="w-full max-w-lg mb-4 sm:mb-6 flex items-center justify-between z-10">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Store</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${supabaseReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[10px] sm:text-[11px] font-mono-tech text-[#A6ACB4]">
            {supabaseReady ? 'Supabase Live Connected' : 'Supabase Local Mode'}
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-[#2B2B2B] rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.9)] relative z-10">
        {/* Header with Security Shield */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center mb-2">
            <BrandLogo size="md" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-amber-400/40 text-amber-300 text-[10px] font-mono-tech uppercase font-bold tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>RESTRICTED NODE · /salimsalim</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
            ADMIN CLEARANCE
          </h1>

          <p className="text-xs text-[#8E8E93] leading-relaxed max-w-md mx-auto">
            Authorized administrator access only. Authentication is enforced and verified with Supabase Auth session controls.
          </p>
        </div>

        {/* If Already Logged In Banner */}
        {isAlreadyAdmin ? (
          <div className="p-5 rounded-2xl bg-black border border-emerald-500/40 text-left space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono-tech text-emerald-400 font-bold uppercase">
                  Active Admin Session Detected
                </p>
                <p className="text-sm font-bold text-white">
                  {currentUser?.full_name} ({currentUser?.email})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#8E8E93]">
              You already possess an active Administrator session. Proceed directly to the Admin Console or sign in with another credential.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('admin-dashboard')}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Enter Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="py-2.5 px-4 rounded-xl bg-black border border-[#333333] hover:border-[#666666] text-xs font-mono-tech text-[#C0C0C0] hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Admin</span>
              </button>
            </div>
          </div>
        ) : currentUser ? (
          // If logged in as non-admin
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 mb-6 space-y-3">
            <div className="flex items-start gap-2.5 text-amber-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold font-mono-tech uppercase">
                  Current Session: {currentUser.role.toUpperCase()}
                </p>
                <p className="text-xs text-[#A6ACB4] mt-0.5">
                  You are currently signed in as <strong className="text-white">{currentUser.email}</strong> with role <strong className="text-amber-300 uppercase">{currentUser.role}</strong>. Platform administrator credentials are required to open the Admin Console.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-mono-tech cursor-pointer"
            >
              Sign out of current account to sign in as Administrator →
            </button>
          </div>
        ) : null}

        {/* Tab Switcher: Sign In vs Create Admin */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black rounded-xl border border-[#262626] mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create-admin'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`py-2 px-3 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'create-admin'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-semibold">Authentication Denied:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* TAB 1: DEDICATED ADMIN SIGN-IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Administrator Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="email"
                  id="admin-login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Security Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="admin-login-submit-btn"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(251,191,36,0.3)] disabled:opacity-50 cursor-pointer mt-2"
            >
              <KeyRound className="w-4 h-4 text-black" />
              <span>{isLoading ? 'Verifying with Supabase Auth...' : 'Authenticate via Supabase Auth'}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </form>
        )}

        {/* TAB 2: CREATE ADMIN FROM SUPABASE */}
        {activeTab === 'create-admin' && (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Administrator Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Administrator"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Administrator Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Choose Secure Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newConfirmPassword}
                  onChange={(e) => setNewConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-amber-400 text-white placeholder-[#666666] text-sm focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(251,191,36,0.3)] disabled:opacity-50 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>{isLoading ? 'Creating in Supabase...' : 'Create Admin Account'}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </form>
        )}

        {/* Collapsible Supabase Direct Admin Setup Guide */}
        <div className="mt-6 pt-4 border-t border-[#222222]">
          <button
            type="button"
            onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
            className="w-full flex items-center justify-between text-xs font-mono-tech text-[#8E8E93] hover:text-amber-300 transition-colors cursor-pointer py-1"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Admin via Supabase Dashboard / SQL</span>
            </div>
            {showSupabaseGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSupabaseGuide && (
            <div className="mt-3 p-4 rounded-xl bg-black border border-[#2B2B2B] text-xs space-y-3 font-mono-tech leading-relaxed text-[#A6ACB4]">
              <p className="text-white font-bold">Steps to configure an Admin directly in Supabase:</p>
              
              <ol className="list-decimal list-inside space-y-2 text-[11px] text-[#C0C0C0]">
                <li>
                  Go to your <strong className="text-white">Supabase Dashboard</strong> → <strong className="text-white">Authentication</strong> → <strong className="text-white">Users</strong>.
                </li>
                <li>
                  Click <strong className="text-white">"Add User"</strong> and set your chosen email and custom password.
                </li>
                <li>
                  Go to <strong className="text-white">SQL Editor</strong> and execute the promotion snippet below:
                </li>
              </ol>

              <div className="relative bg-[#141414] p-3 rounded-lg border border-[#333333] text-[11px] text-amber-200 overflow-x-auto">
                <pre>{`UPDATE public.profiles 
SET role = 'admin' 
WHERE email = '${email.trim() || 'your-admin@domain.com'}';`}</pre>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute right-2 top-2 p-1.5 rounded bg-[#222222] hover:bg-[#333333] text-white flex items-center gap-1 text-[10px] cursor-pointer"
                  title="Copy SQL"
                >
                  <Copy className="w-3 h-3" />
                  <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <p className="text-[10px] text-[#8E8E93]">
                Full database migrations and RLS policies are available in <code className="text-amber-300">supabase/schema.sql</code>.
              </p>
            </div>
          )}
        </div>

        {/* Security Disclaimers */}
        <div className="mt-4 p-3 rounded-xl bg-black border border-[#222222] text-[11px] text-[#666666] font-mono-tech leading-relaxed flex items-start gap-2.5">
          <Terminal className="w-4 h-4 text-[#8E8E93] flex-shrink-0 mt-0.5" />
          <div>
            <span>
              Authentication is validated strictly against Supabase session clearance. No preset passwords or backdoors are stored in code.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
