import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Globe, 
  LayoutDashboard, 
  User, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Compass,
  Flame,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp, RouteType } from '../context/AppContext';
import { authService } from '../services/authService';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const { 
    currentRoute, 
    navigateTo, 
    cartItemCount, 
    setIsCartOpen, 
    wishlist, 
    currency, 
    setCurrency,
    currentUser,
    setCurrentUser,
    openAuthModal,
    showToast,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change or screen resize
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsUserMenuOpen(false);
  }, [currentRoute]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileDrawerOpen(false);
    await authService.logout();
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
    navigateTo('home');
  };

  // Dynamically compute navigation links based on user authentication state
  const navLinks: { label: string; route: RouteType }[] = (() => {
    const baseLinks: { label: string; route: RouteType }[] = [
      { label: 'Explore', route: 'explore' },
      { label: 'Drops', route: 'drops' },
      { label: 'Categories', route: 'categories' },
    ];

    if (!currentUser) {
      return [
        ...baseLinks,
        { label: 'Become a Creator', route: 'become-a-creator' },
      ];
    }

    if (currentUser.role === 'creator') {
      return [
        ...baseLinks,
        { label: 'Creator Hub', route: 'creator-dashboard' },
      ];
    }

    if (currentUser.role === 'admin') {
      return baseLinks;
    }

    // Authenticated Customer / Collector
    return [
      ...baseLinks,
      { label: 'My Orders', route: 'account' },
    ];
  })();

  const handleNavClick = (route: RouteType) => {
    setIsMobileDrawerOpen(false);
    navigateTo(route);
  };

  return (
    <>
      {/* Kenya-First Launch & Global Roadmap Top Banner */}
      <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] py-1.5 px-3 text-center text-[10px] sm:text-xs font-mono-tech flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap text-[#C0C0C0] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>🇰🇪 KENYA FOCUS</span>
        </span>
        <span className="text-white font-medium">Nairobi Same-Day Rider Delivery • Dispatch Across All 47 Counties • M-Pesa Native</span>
        <span className="hidden md:inline text-[#444444]">|</span>
        <span className="hidden md:inline-flex items-center gap-1.5 text-[#8E8E93]">
          <span>Worldwide Shipping:</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider">
            Phase 2 Coming Soon
          </span>
        </span>
      </div>

      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-md border-b border-[#262626] shadow-[0_4px_30px_rgba(0,0,0,0.8)]' 
            : 'bg-black/60 backdrop-blur-sm border-b border-[#1A1A1A]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo in Metallic Silver & Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-10 flex-shrink-0 min-w-0">
  <div
    id="brand-logo"
    onClick={() => handleNavClick('home')}
    className="cursor-pointer flex items-center flex-shrink-0"
  >
    <BrandLogo size="md" />
  </div>
            {/* Desktop Navigation Links (White text, Silver hover state) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNavClick(link.route)}
                    className={`text-xs font-semibold uppercase tracking-wider transition-all duration-200 py-1 relative ${
                      isActive 
                        ? 'text-white after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[#C0C0C0] after:to-white' 
                        : 'text-[#D9D9D9] hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions & Utilities */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Currency Switcher */}
            <div className="relative flex items-center text-xs font-mono-tech text-[#D9D9D9] bg-[#111111] hover:bg-[#1A1A1A] border border-[#262626] hover:border-[#C0C0C0]/40 rounded-full pl-2 pr-1 sm:px-2.5 py-1 sm:py-1.5 transition-colors flex-shrink-0">
  <Globe className="w-3 h-3 text-[#C0C0C0] mr-1 flex-shrink-0" />
  <select
    value={currency}
    onChange={(e) => setCurrency(e.target.value as any)}
    className="bg-transparent text-white font-medium cursor-pointer focus:outline-none text-[11px] sm:text-xs appearance-none pr-3 max-w-[54px] sm:max-w-none"
    aria-label="Select Currency"
  >
    <option value="KES" className="bg-[#111111] text-white">KES</option>
    <option value="USD" className="bg-[#111111] text-white">USD</option>
    <option value="NGN" className="bg-[#111111] text-white">NGN</option>
    <option value="ZAR" className="bg-[#111111] text-white">ZAR</option>
  </select>
  <ChevronDown className="w-3 h-3 text-[#8E8E93] pointer-events-none -ml-3" />
</div>

            {/* Wishlist Icon - Hidden on small mobile to avoid crowding since it is in drawer & bottom nav */}
            {currentUser?.role !== 'admin' && (
              <button
                id="nav-wishlist-btn"
                type="button"
                onClick={() => handleNavClick('account')}
                aria-label="Wishlist"
                className="hidden md:flex relative p-2 rounded-full bg-[#111111] border border-[#262626] hover:border-[#C0C0C0]/50 hover:shadow-[0_0_12px_rgba(192,192,192,0.15)] text-[#D9D9D9] hover:text-white transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-white to-[#C0C0C0] text-black text-[9px] font-mono-tech font-bold flex items-center justify-center shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </button>
            )}

            {/* Cart Icon / Bag Button */}
            <button
            id="nav-cart-btn"
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Bag"
            className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 rounded-full bg-black border border-[#C0C0C0]/60 hover:border-white text-white hover:shadow-[0_0_18px_rgba(255,255,255,0.25)] transition-all duration-200 active:scale-95 cursor-pointer min-h-[36px] flex-shrink-0"
            >
         <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C0C0C0]" />
              <span className="hidden md:inline text-xs font-semibold tracking-wider uppercase font-mono-tech">Bag</span>
              {cartItemCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono-tech font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Trigger (Desktop) */}
            {currentUser ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  id="nav-user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-[#111111] border border-[#262626] hover:border-[#C0C0C0]/50 text-white transition-all text-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#999999] via-white to-[#C0C0C0] text-black flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0 shadow-sm">
                    {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
                  </div>
                  <span className="hidden lg:inline font-medium max-w-[80px] xl:max-w-[120px] truncate text-[#D9D9D9]">
                    {currentUser.full_name}
                  </span>

                  {/* Role Pill Badge */}
                  {currentUser.role === 'creator' && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono-tech uppercase bg-white text-black font-extrabold shadow-sm">
                      Creator
                    </span>
                  )}
                  {currentUser.role === 'admin' && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono-tech uppercase bg-amber-400 text-black font-extrabold shadow-sm">
                      Admin
                    </span>
                  )}

                  <ChevronDown className="w-3 h-3 text-[#A8ACB4] hidden sm:block" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl py-2 z-50 text-xs"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#222222]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-white truncate">{currentUser.full_name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech uppercase bg-[#222222] text-[#C0C0C0] border border-[#333333]">
                          {currentUser.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8ACB4] truncate mt-0.5">{currentUser.email}</p>
                    </div>

                    {currentUser.role === 'creator' && (
                      <button
                        onClick={() => handleNavClick('creator-dashboard')}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#1A1A1A] text-white font-medium flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                        <span>Creator Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavClick('account')}
                      className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#D9D9D9] hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#C0C0C0]" />
                      <span>My Account & Orders</span>
                    </button>

                    {currentUser.role === 'customer' && (
                      <button
                        onClick={() => handleNavClick('become-a-creator')}
                        className="w-full text-left px-4 py-2 hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white flex items-center gap-2.5 transition-colors text-[11px]"
                      >
                        <span>Apply to Launch Merch</span>
                      </button>
                    )}

                    <div className="border-t border-[#222222] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-[#D9D9D9] hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#A8ACB4]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                type="button"
                onClick={() => openAuthModal('customer', 'login')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black border border-[#C0C0C0]/60 hover:border-white text-white font-semibold text-xs transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C0C0C0]" />
                <span className="inline text-xs font-semibold">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Drawer Toggle (Touch Target >= 44px) */}
            <button
              type="button"
              id="mobile-drawer-toggle"
              aria-label="Toggle Mobile Menu"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#111111] border border-[#2B2B2B] hover:border-[#C0C0C0]/60 text-white flex items-center justify-center transition-colors active:scale-95 flex-shrink-0">
              {isMobileDrawerOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER OVERLAY (Responsive across every phone & tablet)
          ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#0D0D0D] border-l border-[#2B2B2B] flex flex-col justify-between p-5 overflow-y-auto safe-area-bottom shadow-2xl transition-transform duration-300 translate-x-0">
            {/* Top Brand & Close Bar */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                <div onClick={() => handleNavClick('home')} className="cursor-pointer">
                  <BrandLogo size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#333333] text-[#A8ACB4] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity or Quick Login in Mobile Drawer */}
              <div className="pt-4 pb-2">
                {currentUser ? (
                  <div className="p-3 rounded-2xl bg-[#141414] border border-[#262626] space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#999999] via-white to-[#C0C0C0] text-black flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                        {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-white text-xs truncate">{currentUser.full_name}</p>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech uppercase font-bold bg-[#222222] text-[#C0C0C0] border border-[#333333]">
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8E8E93] truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#222222] flex items-center gap-2">
                      {currentUser.role === 'creator' && (
                        <button
                          onClick={() => handleNavClick('creator-dashboard')}
                          className="flex-1 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-mono-tech font-bold uppercase flex items-center justify-center gap-1"
                        >
                          <LayoutDashboard className="w-3 h-3 text-white" />
                          <span>Hub</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleNavClick('account')}
                        className="flex-1 py-1.5 rounded-lg bg-[#222222] text-white hover:text-white border border-[#333333] text-[11px] font-mono-tech flex items-center justify-center gap-1"
                      >
                        <User className="w-3 h-3 text-[#C0C0C0]" />
                        <span>Account</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg bg-red-950/30 text-red-400 border border-red-500/30 text-[11px] flex items-center justify-center"
                        title="Sign Out"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openAuthModal('customer', 'login');
                      }}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5 text-black" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openAuthModal('customer', 'register');
                      }}
                      className="py-2.5 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] text-white border border-[#333333] font-bold text-xs uppercase tracking-wider flex items-center justify-center"
                    >
                      Join Free
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links Menu */}
              <div className="py-4 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    currentRoute === 'home' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                  }`}
                >
                  <span>Storefront Home</span>
                  <span className="text-[10px] text-[#666666]">01</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('explore')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    currentRoute === 'explore' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#C0C0C0]" />
                    <span>Explore Creators</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">02</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('drops')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    currentRoute === 'drops' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-white" />
                    <span>Limited Drops</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">03</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('categories')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    currentRoute === 'categories' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#C0C0C0]" />
                    <span>Categories & Pillars</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">04</span>
                </button>

                {/* Role Specific / Creator application */}
                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('become-a-creator')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                      currentRoute === 'become-a-creator' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C0C0C0]" />
                      <span>Become a Creator</span>
                    </div>
                    <span className="text-[9px] font-mono-tech text-white uppercase bg-white/10 px-1.5 py-0.5 rounded">Apply</span>
                  </button>
                )}

                {currentUser?.role === 'creator' && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('creator-dashboard')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                      currentRoute === 'creator-dashboard' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                      <span>Creator Hub Portal</span>
                    </div>
                    <span className="text-[9px] font-mono-tech text-white uppercase bg-white/20 px-1.5 py-0.5 rounded">Active</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleNavClick('about')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    currentRoute === 'about' ? 'bg-white/10 text-white border border-white/20' : 'text-[#D9D9D9] hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#C0C0C0]" />
                    <span>Brand Manifesto</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">About</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-4 border-t border-[#222222] space-y-3">
              <div className="p-3 rounded-xl bg-black border border-[#222222] text-[11px] text-[#8E8E93] space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Official African Creator Commerce</span>
                </div>
                <p>NFC Serialized Garments · M-PESA Express Rails</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
