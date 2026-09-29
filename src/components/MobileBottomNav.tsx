import React from 'react';
import { Home, Compass, Search, User, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentRoute, navigateTo, setIsSearchOpen, cartItemCount, setIsCartOpen, currentUser, openAuthModal } = useApp();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-black/95 backdrop-blur-xl border-t border-[#222222] px-2 py-1.5 flex items-center justify-around safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] p-1 transition-colors ${
          currentRoute === 'home' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-wider uppercase font-mono-tech mt-0.5">Home</span>
      </button>

      {/* Explore */}
      <button
        type="button"
        onClick={() => navigateTo('explore')}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] p-1 transition-colors ${
          currentRoute === 'explore' ? 'text-white' : 'text-[#8E8E93] hover:text-white'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-wider uppercase font-mono-tech mt-0.5">Explore</span>
      </button>

      {/* Search (Raised Center Action) */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="flex flex-col items-center justify-center min-w-[48px] p-1 text-[#8E8E93] hover:text-white transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black flex items-center justify-center -mt-4 shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-95 transition-transform">
          <Search className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase font-mono-tech mt-0.5">Search</span>
      </button>

      {/* Account / Portal / Sign In */}
      <button
        type="button"
        onClick={() => {
          if (currentUser) {
            if (currentUser.role === 'creator') {
              navigateTo('creator-dashboard');
            } else {
              navigateTo('account');
            }
          } else {
            openAuthModal('customer', 'login');
          }
        }}
        className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] p-1 transition-colors ${
          (currentRoute === 'account' || currentRoute === 'creator-dashboard') 
            ? 'text-white' 
            : 'text-[#8E8E93] hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-semibold tracking-wider uppercase font-mono-tech mt-0.5">
          {currentUser 
            ? (currentUser.role === 'creator' ? 'Portal' : 'Account') 
            : 'Sign In'}
        </span>
      </button>

      {/* Cart */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] p-1 text-[#8E8E93] hover:text-white transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center shadow-sm">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase font-mono-tech mt-0.5">Bag</span>
      </button>
    </nav>
  );
};
