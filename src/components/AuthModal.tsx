import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  User, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  Check, 
  Upload, 
  Instagram,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService, CustomerRegisterData, CreatorRegisterData } from '../services/authService';
import { CategoryType } from '../types';
import { ImageUploadInput } from './ImageUploadInput';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialRole?: 'customer' | 'creator';
  initialMode?: 'login' | 'register';
}

const CATEGORIES: CategoryType[] = [
  'MUSIC',
  'COMEDY',
  'SPORTS',
  'GAMING',
  'CONTENT CREATORS',
  'FASHION',
  'ART & CULTURE',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  initialMode,
}) => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authRole: globalRole, 
    authMode: globalMode, 
    setCurrentUser, 
    showToast, 
    navigateTo,
    refreshDatabase
  } = useApp();

  const isVisible = isOpen !== undefined ? isOpen : isAuthModalOpen;
  const handleClose = onClose || closeAuthModal;

  const [activeTab, setActiveTab] = useState<'customer' | 'creator'>(initialRole || globalRole || 'customer');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>(initialMode || globalMode || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [showCrPassword, setShowCrPassword] = useState(false);

  useEffect(() => {
    if (initialRole) setActiveTab(initialRole);
    else if (globalRole) setActiveTab(globalRole);

    if (initialMode) setAuthMode(initialMode);
    else if (globalMode) setAuthMode(globalMode);
  }, [initialRole, globalRole, initialMode, globalMode, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, handleClose]);

  // Customer form state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCountry, setCustCountry] = useState('Kenya');

  // Creator form state
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

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Handle Customer Registration
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custEmail || !custPassword || !custName) {
      showToast('Please fill in all required fields', 'warn');
      return;
    }
    setIsLoading(true);
    try {
      const data: CustomerRegisterData = {
        fullName: custName,
        email: custEmail,
        password: custPassword,
        phone: custPhone,
        country: custCountry,
      };
      const user = await authService.registerCustomer(data);
      setCurrentUser(user);
      showToast(`Welcome to DROPKULTURE, ${user.full_name}!`, 'success');
      handleClose();
      navigateTo('account');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Creator Registration
  const handleCreatorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crBrandName || !crEmail || !crPassword || !crBio) {
      showToast('Please fill in creator brand name, email, password, and biography', 'warn');
      return;
    }
    setIsLoading(true);
    try {
      const data: CreatorRegisterData = {
        fullName: crFullName || crBrandName,
        creatorName: crBrandName,
        email: crEmail,
        password: crPassword,
        phone: crPhone,
        country: crCountry,
        category: crCategory,
        instagram: crInstagram,
        tiktok: crTiktok,
        youtube: crYoutube,
        x: crX,
        profileImage: crProfileImage,
        bio: crBio,
      };
      const { user, creator } = await authService.registerCreator(data);
      setCurrentUser(user);
      await refreshDatabase();
      showToast(`Creator account created! Storefront for "${creator.name}" published to database table (Status: Pending Review).`, 'success');
      handleClose();
      navigateTo('creator-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Creator registration failed', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast('Please enter your email', 'warn');
      return;
    }
    setIsLoading(true);
    try {
      const user = await authService.login(loginEmail, loginPassword);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.full_name}!`, 'success');
      handleClose();

      if (user.role === 'creator') {
        navigateTo('creator-dashboard');
      } else {
        navigateTo('account');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      showToast('Please enter your email address to reset password', 'warn');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(loginEmail);
      showToast(`Password recovery link sent to ${loginEmail}`, 'success');
      setAuthMode('login');
    } catch (err: any) {
      showToast(err.message || 'Failed to send recovery link', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        id="auth-modal-dialog"
        className="relative w-full max-w-lg my-auto max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-black border border-[#2B2B2B] shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-4 sm:p-8 text-white"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          id="btn-close-auth-modal"
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1A1A1A] hover:bg-[#252525] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#2B2B2B] text-white text-xs font-mono-tech uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SECURE MEMBER ACCESS</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
            {authMode === 'forgot'
              ? 'Reset Password'
              : authMode === 'login'
              ? 'Sign in to DROPKULTURE'
              : activeTab === 'creator'
              ? 'Creator Application & Account'
              : 'Join as a Collector'}
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1 max-w-sm mx-auto">
            {authMode === 'login'
              ? 'Similar sign in for both creators and collectors. Enter your credentials to access your portal.'
              : activeTab === 'creator'
              ? 'Build your fashion brand, launch limited drops, and publish your storefront to the platform table.'
              : 'Discover creators you love, access VIP drops, and track your merchandise orders.'}
          </p>
        </div>

        {/* Mode Selector (Login vs Register) */}
        {authMode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#111111] border border-[#222222] mb-5">
            <button
              type="button"
              id="btn-switch-login"
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-xl text-xs font-mono-tech uppercase tracking-wider font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Sign In (All Users)
            </button>
            <button
              type="button"
              id="btn-switch-register"
              onClick={() => setAuthMode('register')}
              className={`py-2 rounded-xl text-xs font-mono-tech uppercase tracking-wider font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Role Selector Tabs (Only on Register Mode - Customer vs Creator) */}
        {authMode === 'register' && (
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black border border-[#2B2B2B] mb-5">
            <button
              type="button"
              id="tab-auth-customer"
              onClick={() => setActiveTab('customer')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'customer'
                  ? 'bg-[#222222] text-white border border-[#444444]'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Collector Sign Up</span>
            </button>
            <button
              type="button"
              id="tab-auth-creator"
              onClick={() => setActiveTab('creator')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'creator'
                  ? 'bg-[#222222] text-white border border-[#444444]'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Creator Sign Up</span>
            </button>
          </div>
        )}

        {/* ----------------- LOGIN FORM ----------------- */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="email"
                  id="input-login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. collector@dropkulture.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-tech text-[#C0C0C0] uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-xs text-[#D9D9D9] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-login-password"
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
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ----------------- FORGOT PASSWORD ----------------- */}
        {authMode === 'forgot' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="email"
                  id="input-forgot-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. you@dropkulture.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-forgot"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="w-full text-center text-xs text-[#8E8E93] hover:text-white pt-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ----------------- CUSTOMER REGISTER ----------------- */}
        {authMode === 'register' && activeTab === 'customer' && (
          <form onSubmit={handleCustomerRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="input-cust-name"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="e.g. Amina Kimani"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="input-cust-email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="amina@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showCustPassword ? 'text' : 'password'}
                    id="input-cust-password"
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
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Phone (M-Pesa)
                </label>
                <input
                  type="tel"
                  id="input-cust-phone"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Country
                </label>
                <select
                  id="select-cust-country"
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
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-cust-register"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Collector Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ----------------- CREATOR REGISTER ----------------- */}
        {authMode === 'register' && activeTab === 'creator' && (
          <form onSubmit={handleCreatorRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Status callout */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#2B2B2B] text-xs text-[#D9D9D9] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
              <p>
                Creator applications are created with <strong className="text-white">status = pending</strong>. Platform admins review all storefronts to uphold partner quality standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="input-cr-fullname"
                  value={crFullName}
                  onChange={(e) => setCrFullName(e.target.value)}
                  placeholder="e.g. Kennedy Odhiambo"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Creator / Brand Name *
                </label>
                <input
                  type="text"
                  id="input-cr-brandname"
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
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="input-cr-email"
                  value={crEmail}
                  onChange={(e) => setCrEmail(e.target.value)}
                  placeholder="creator@brand.com"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showCrPassword ? 'text' : 'password'}
                    id="input-cr-password"
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
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Category *
                </label>
                <select
                  id="select-cr-category"
                  value={crCategory}
                  onChange={(e) => setCrCategory(e.target.value as CategoryType)}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Country
                </label>
                <select
                  id="select-cr-country"
                  value={crCountry}
                  onChange={(e) => setCrCountry(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                >
                  <option value="Kenya">Kenya (🇰🇪)</option>
                  <option value="Nigeria">Nigeria (🇳🇬)</option>
                  <option value="South Africa">South Africa (🇿🇦)</option>
                  <option value="Ghana">Ghana (🇬🇭)</option>
                  <option value="Uganda">Uganda (🇺🇬)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                  Phone (Payouts)
                </label>
                <input
                  type="tel"
                  id="input-cr-phone"
                  value={crPhone}
                  onChange={(e) => setCrPhone(e.target.value)}
                  placeholder="+254 7..."
                  className="w-full px-2.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Social channels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-mono-tech text-[#C0C0C0] uppercase mb-0.5">
                  Instagram
                </label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={crInstagram}
                  onChange={(e) => setCrInstagram(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech text-[#C0C0C0] uppercase mb-0.5">
                  TikTok
                </label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={crTiktok}
                  onChange={(e) => setCrTiktok(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech text-[#C0C0C0] uppercase mb-0.5">
                  YouTube
                </label>
                <input
                  type="text"
                  placeholder="Channel"
                  value={crYoutube}
                  onChange={(e) => setCrYoutube(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech text-[#C0C0C0] uppercase mb-0.5">
                  X / Twitter
                </label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={crX}
                  onChange={(e) => setCrX(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                />
              </div>
            </div>

            <ImageUploadInput
              id="input-cr-avatar"
              label="Creator Profile Photo"
              sublabel="Upload directly from your phone camera or gallery"
              value={crProfileImage}
              onChange={(val) => setCrProfileImage(val)}
              aspect="square"
            />

            <div>
              <label className="block text-[11px] font-mono-tech text-[#C0C0C0] uppercase mb-1">
                Short Biography / Brand Vision *
              </label>
              <textarea
                id="input-cr-bio"
                rows={2}
                value={crBio}
                onChange={(e) => setCrBio(e.target.value)}
                placeholder="Tell us about your audience reach and merchandise vision..."
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white placeholder-[#666666] text-xs focus:outline-none"
              />
            </div>

            {/* Commercial Split Agreement */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#2B2B2B] text-[11px] text-[#A6ACB4] space-y-1">
              <div className="flex items-center gap-1.5 text-white font-mono-tech font-bold uppercase text-[10px]">
                <Sparkles className="w-3 h-3 text-white" />
                <span>Creator Revenue Agreement</span>
              </div>
              <p className="leading-relaxed">
                By joining as a creator, you agree to the <strong className="text-white">30% Creator Net Royalty / 70% Platform Operations & Production Split</strong>. Review full{' '}
                <button
                  type="button"
                  onClick={() => { handleClose(); navigateTo('terms'); }}
                  className="text-white underline hover:text-[#C0C0C0] font-semibold cursor-pointer"
                >
                  Terms & Conditions
                </button>.
              </p>
            </div>

            <button
              type="submit"
              id="btn-submit-cr-register"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <span>{isLoading ? 'Submitting Application...' : 'Submit Creator Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
