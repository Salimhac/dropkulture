import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Globe, 
  CheckCircle2, 
  BadgeCheck, 
  Info, 
  Check, 
  Upload,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService, CustomerRegisterData, CreatorRegisterData } from '../services/authService';
import { CategoryType } from '../types';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { BrandLogo } from '../components/BrandLogo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CATEGORIES: CategoryType[] = [
  'MUSIC',
  'COMEDY',
  'SPORTS',
  'GAMING',
  'CONTENT CREATORS',
  'FASHION',
  'ART & CULTURE',
];

export const AuthPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    authRole, 
    authMode: initialAuthMode, 
    navigateTo, 
    showToast,
    refreshDatabase
  } = useApp();

  // Mode: 'login' or 'register' or 'forgot' or 'update-password'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'update-password'>(initialAuthMode || 'login');
  
  // Role for register: 'customer' or 'creator'
  const [signupRole, setSignupRole] = useState<'customer' | 'creator'>(authRole || 'customer');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [showCrPassword, setShowCrPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // If already logged in, show user panel
  useEffect(() => {
    // Check URL parameters for direct deep-linking or password recovery callback
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const urlMode = params.get('mode');
      const urlRole = params.get('role');
      if (urlMode === 'register' || urlMode === 'signup') setMode('register');
      if (urlRole === 'creator') setSignupRole('creator');
      if (urlRole === 'customer') setSignupRole('customer');

      // Check if user came from a Supabase password reset email
      if (
        hash.includes('type=recovery') || 
        params.get('type') === 'recovery' || 
        hash.includes('mode=reset') ||
        params.get('mode') === 'reset'
      ) {
        setMode('update-password');
      }
    } catch {
      // ignore
    }

    // Supabase Auth listener for password recovery event
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('update-password');
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Shared / Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer register state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCountry, setCustCountry] = useState('Kenya');

  // Creator register state
  const [crFullName, setCrFullName] = useState('');
  const [crBrandName, setCrBrandName] = useState('');
  const [crEmail, setCrEmail] = useState('');
  const [crPassword, setCrPassword] = useState('');
  const [crPhone, setCrPhone] = useState('');
  const [crCountry, setCrCountry] = useState('Kenya');
  const [crCategory, setCrCategory] = useState<CategoryType>('MUSIC');
  const [crInstagram, setCrInstagram] = useState('');
  const [crTiktok, setCrTiktok] = useState('');
  const [crYoutube, setCrYoutube] = useState('');
  const [crX, setCrX] = useState('');
  const [crProfileImage, setCrProfileImage] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [crBio, setCrBio] = useState('');

  // 1. Unified Login (Identical for Creators, Customers & Admins)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email address', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(loginEmail.trim(), loginPassword);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.full_name}!`, 'success');

      // Smart routing according to role
      if (user.role === 'creator') {
        navigateTo('creator-dashboard');
      } else {
        navigateTo('account');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials or login failed', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Customer Registration
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim() || !custPassword.trim()) {
      showToast('Please fill in your name, email, and password', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      const data: CustomerRegisterData = {
        fullName: custName.trim(),
        email: custEmail.trim(),
        password: custPassword,
        phone: custPhone.trim(),
        country: custCountry,
      };

      const user = await authService.registerCustomer(data);
      setCurrentUser(user);
      showToast(`Welcome to DROPKULTURE, ${user.full_name}!`, 'success');
      navigateTo('account');
    } catch (err: any) {
      showToast(err.message || 'Collector registration failed', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Creator Registration (Publishes directly to database creators table)
  const handleCreatorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crBrandName.trim() || !crEmail.trim() || !crPassword.trim() || !crBio.trim()) {
      showToast('Please fill in Creator/Brand name, email, password, and biography', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      const data: CreatorRegisterData = {
        fullName: crFullName.trim() || crBrandName.trim(),
        creatorName: crBrandName.trim(),
        email: crEmail.trim(),
        password: crPassword,
        phone: crPhone.trim(),
        country: crCountry,
        category: crCategory,
        instagram: crInstagram.trim(),
        tiktok: crTiktok.trim(),
        youtube: crYoutube.trim(),
        x: crX.trim(),
        profileImage: crProfileImage,
        bio: crBio.trim(),
      };

      const { user, creator } = await authService.registerCreator(data);
      setCurrentUser(user);
      await refreshDatabase();

      showToast(
        `Creator account created! Storefront for "${creator.name}" published to database table (Status: Pending Review).`,
        'success'
      );

      navigateTo('creator-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Creator registration failed', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Password Reset Form Handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email address to reset password', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(loginEmail.trim());
      showToast(`Password recovery link successfully sent to ${loginEmail.trim()}`, 'success');
      setMode('login');
    } catch (err: any) {
      showToast(err.message || 'Failed to send password recovery link', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Update Password Handler (After clicking recovery link)
  const handleUpdateNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warn');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      await authService.updatePassword(newPassword);
      showToast('Your password has been successfully updated! You can now sign in.', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Back button */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>

        <span className="text-[11px] font-mono-tech text-[#666666]">
          DROPKULTURE AUTH GATE
        </span>
      </div>

      <div className="w-full max-w-xl rounded-3xl bg-[#111111] border border-[#2B2B2B] shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-6 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <BrandLogo size="md" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-[#2B2B2B] text-white text-[11px] font-mono-tech uppercase">
            <Sparkles className="w-3 h-3 text-white" />
            <span>MEMBER & CREATOR GATEWAY</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
            {mode === 'login'
              ? 'Sign in to DROPKULTURE'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : signupRole === 'creator'
              ? 'Creator Account Onboarding'
              : 'Create Collector Account'}
          </h1>

          <p className="text-xs text-[#8E8E93] max-w-md mx-auto leading-relaxed">
            {mode === 'login'
              ? 'Similar sign in for both creators and collectors. Enter your credentials to access your dashboard.'
              : signupRole === 'creator'
              ? 'Publish your creator profile to the platform table. The admin console will review, verify, or manage storefront status.'
              : 'Join as a collector to secure limited edition apparel drops, follow your favorite creators, and track orders.'}
          </p>
        </div>

        {/* Top Toggle: Sign In vs Create Account */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black border border-[#222222] mb-6">
            <button
              type="button"
              id="auth-toggle-signin"
              onClick={() => setMode('login')}
              className={`py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono-tech transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md font-bold'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Sign In (All Users)
            </button>
            <button
              type="button"
              id="auth-toggle-signup"
              onClick={() => setMode('register')}
              className={`py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono-tech transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md font-bold'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 1: UNIFIED LOGIN PAGE (SIMILAR FOR CREATORS & CUSTOMERS)      */}
        {/* =================================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-black border border-[#222222] text-xs text-[#8E8E93] flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#C0C0C0] flex-shrink-0" />
              <span>
                Creators, Collectors, and Admins can sign in using their registered email and password.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5 font-bold">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="email"
                  id="page-input-login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. collector@brand.com or creator@brand.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-tech text-[#C0C0C0] uppercase font-bold">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#D9D9D9] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="page-input-login-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="page-btn-submit-login"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-[#8E8E93] hover:text-white"
              >
                Don't have an account yet? <span className="text-white underline">Register here</span>
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: DIFFERENT SIGN UP (CUSTOMER VS CREATOR)                    */}
        {/* =================================================================== */}
        {mode === 'register' && (
          <div className="space-y-5">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-black border border-[#222222]">
              <button
                type="button"
                id="signup-role-customer"
                onClick={() => setSignupRole('customer')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                  signupRole === 'customer'
                    ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Collector Sign Up</span>
              </button>

              <button
                type="button"
                id="signup-role-creator"
                onClick={() => setSignupRole('creator')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono-tech uppercase tracking-wider transition-all ${
                  signupRole === 'creator'
                    ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold shadow-md'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Creator Sign Up</span>
              </button>
            </div>

            {/* --- CUSTOMER SIGN UP FORM --- */}
            {signupRole === 'customer' && (
              <form onSubmit={handleCustomerRegister} className="space-y-4">
                <div className="p-3 rounded-xl bg-black border border-[#222222] text-xs text-[#8E8E93]">
                  Join Africa's premier creator apparel community. Track your orders, save items to your wishlist, and unlock VIP early drop access.
                </div>

                <div>
                  <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="page-input-cust-name"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Amina Kimani"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="page-input-cust-email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="amina@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCustPassword ? 'text' : 'password'}
                        id="page-input-cust-password"
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustPassword(!showCustPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white cursor-pointer"
                        aria-label="Toggle customer password visibility"
                      >
                        {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Phone (M-Pesa / SMS)
                    </label>
                    <input
                      type="tel"
                      id="page-input-cust-phone"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="+254 712 345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Country
                    </label>
                    <select
                      id="page-select-cust-country"
                      value={custCountry}
                      onChange={(e) => setCustCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                    >
                      <option value="Kenya">Kenya (🇰🇪)</option>
                      <option value="Nigeria">Nigeria (🇳🇬)</option>
                      <option value="South Africa">South Africa (🇿🇦)</option>
                      <option value="Ghana">Ghana (🇬🇭)</option>
                      <option value="Uganda">Uganda (🇺🇬)</option>
                      <option value="Tanzania">Tanzania (🇹🇿)</option>
                      <option value="Rwanda">Rwanda (🇷🇼)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  id="page-btn-submit-cust-register"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Creating Collector Account...' : 'Complete Collector Sign Up'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* --- CREATOR SIGN UP FORM --- */}
            {signupRole === 'creator' && (
              <form onSubmit={handleCreatorRegister} className="space-y-4">
                {/* Publish to table callout */}
                <div className="p-3.5 rounded-xl bg-black border border-[#2B2B2B] space-y-1">
                  <div className="flex items-center gap-2 text-white text-xs font-bold font-mono-tech uppercase">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Published to Platform Creators Table</span>
                  </div>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    When you sign up, your brand storefront is published directly to the database creators table. The Admin Console will fetch it to decide whether your storefront should be verified (awarded the verified badge) or suspended.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Legal / Manager Name *
                    </label>
                    <input
                      type="text"
                      id="page-input-cr-fullname"
                      value={crFullName}
                      onChange={(e) => setCrFullName(e.target.value)}
                      placeholder="e.g. Kennedy Odhiambo"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Creator / Brand Name *
                    </label>
                    <input
                      type="text"
                      id="page-input-cr-brandname"
                      value={crBrandName}
                      onChange={(e) => setCrBrandName(e.target.value)}
                      placeholder="e.g. Crazy Kennar"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Creator Email *
                    </label>
                    <input
                      type="email"
                      id="page-input-cr-email"
                      value={crEmail}
                      onChange={(e) => setCrEmail(e.target.value)}
                      placeholder="creator@brand.com"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCrPassword ? 'text' : 'password'}
                        id="page-input-cr-password"
                        value={crPassword}
                        onChange={(e) => setCrPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCrPassword(!showCrPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white cursor-pointer"
                        aria-label="Toggle creator password visibility"
                      >
                        {showCrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Creative Category *
                    </label>
                    <select
                      id="page-select-cr-category"
                      value={crCategory}
                      onChange={(e) => setCrCategory(e.target.value as CategoryType)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Primary Country
                    </label>
                    <select
                      id="page-select-cr-country"
                      value={crCountry}
                      onChange={(e) => setCrCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                    >
                      <option value="Kenya">Kenya (🇰🇪)</option>
                      <option value="Nigeria">Nigeria (🇳🇬)</option>
                      <option value="South Africa">South Africa (🇿🇦)</option>
                      <option value="Ghana">Ghana (🇬🇭)</option>
                      <option value="Uganda">Uganda (🇺🇬)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                      Phone (Payouts)
                    </label>
                    <input
                      type="tel"
                      id="page-input-cr-phone"
                      value={crPhone}
                      onChange={(e) => setCrPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Social media presence */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase font-bold">
                    Social Media Handles
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Instagram @handle"
                      value={crInstagram}
                      onChange={(e) => setCrInstagram(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="TikTok @handle"
                      value={crTiktok}
                      onChange={(e) => setCrTiktok(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="YouTube channel"
                      value={crYoutube}
                      onChange={(e) => setCrYoutube(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="X / Twitter handle"
                      value={crX}
                      onChange={(e) => setCrX(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                    />
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <ImageUploadInput
                  id="page-cr-avatar-upload"
                  label="Creator Profile Photo / Logo"
                  sublabel="Upload photo directly from phone camera or gallery"
                  value={crProfileImage}
                  onChange={(val) => setCrProfileImage(val)}
                  aspect="square"
                />

                {/* Brand Vision / Bio */}
                <div>
                  <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                    Short Biography & Merch Concept *
                  </label>
                  <textarea
                    id="page-input-cr-bio"
                    rows={2}
                    value={crBio}
                    onChange={(e) => setCrBio(e.target.value)}
                    placeholder="Describe your audience reach and merchandise concept (e.g. signature catchphrase hoodies, concert drops)..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-xs focus:outline-none"
                  />
                </div>

                {/* Commercial Split Agreement */}
                <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2B2B2B] text-xs text-[#A6ACB4] space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-mono-tech font-bold uppercase text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Commercial Revenue Partnership Agreement</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    By registering your creator account, you agree to the <strong className="text-white">30% Creator Net Royalty / 70% Platform Operations & Production Split</strong>. DROPKULTURE covers 100% of upfront fabric manufacturing, inventory warehousing, domestic & global fulfillment, and payment gateway costs. Review our full{' '}
                    <button
                      type="button"
                      onClick={() => navigateTo('terms')}
                      className="text-white underline hover:text-[#C0C0C0] font-semibold cursor-pointer"
                    >
                      Terms & Conditions
                    </button>.
                  </p>
                </div>

                <button
                  type="submit"
                  id="page-btn-submit-cr-register"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Publishing Creator Account...' : 'Create Creator Account & Publish'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#8E8E93] hover:text-white"
              >
                Already have an account? <span className="text-white underline">Sign In here</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: PASSWORD RESET (REQUEST EMAIL)                             */}
        {/* =================================================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-xs text-[#8E8E93]">
              Enter your registered email address and we will send a password reset link to your inbox.
            </p>
            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                Account Email *
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#8E8E93] hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VIEW 4: UPDATE PASSWORD (RECOVERY LINK LANDING)                    */}
        {/* =================================================================== */}
        {mode === 'update-password' && (
          <form onSubmit={handleUpdateNewPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-black border border-[#2B2B2B] space-y-1">
              <span className="text-xs font-bold font-mono-tech uppercase text-white">
                Create New Password
              </span>
              <p className="text-xs text-[#8E8E93]">
                Your account was verified via security recovery link. Set a new password below.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                New Password * (Min. 6 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1 font-bold">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
