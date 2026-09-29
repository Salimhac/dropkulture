import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { NotifyDropModal } from './components/NotifyDropModal';
import { ToastContainer } from './components/ToastContainer';
import { SEOHead } from './components/SEOHead';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DropsPage } from './pages/DropsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BecomeCreatorPage } from './pages/BecomeCreatorPage';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { AuthPage } from './pages/AuthPage';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { currentRoute, setIsSearchOpen, navigateTo, showToast, currentUser } = useApp();

  // Secret admin route detection: ONLY /salimsalim triggers admin access
  useEffect(() => {
    const checkSecretSalimRoute = () => {
      try {
        const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
        const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');
        const params = new URLSearchParams(window.location.search);

        const isSalimSalim = 
          path === '/salimsalim' || 
          path.endsWith('/salimsalim') ||
          hash === '#/salimsalim' || 
          hash === '#salimsalim' ||
          params.has('salimsalim') ||
          params.get('route') === 'salimsalim';

        if (isSalimSalim) {
          if (currentUser?.role === 'admin') {
            if (currentRoute !== 'admin-dashboard') {
              navigateTo('admin-dashboard');
            }
          } else {
            if (currentRoute !== 'admin-login') {
              navigateTo('admin-login');
            }
          }
          return;
        }

        // Block all unauthorized direct access to admin views without /salimsalim in the URL
        if (currentRoute === 'admin-dashboard' || currentRoute === 'admin-login') {
          navigateTo('home');
          return;
        }

        if (params.has('login') || params.has('auth') || hash === '#login' || hash === '#auth') {
          navigateTo('login');
        }
      } catch (err) {
        console.error('URL parse error', err);
      }
    };

    checkSecretSalimRoute();
    window.addEventListener('popstate', checkSecretSalimRoute);
    window.addEventListener('hashchange', checkSecretSalimRoute);
    return () => {
      window.removeEventListener('popstate', checkSecretSalimRoute);
      window.removeEventListener('hashchange', checkSecretSalimRoute);
    };
  }, [navigateTo, currentUser, currentRoute]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  // Global keyboard shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K -> Search
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // View switch based on currentRoute
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExplorePage />;
      case 'creator':
        return <CreatorProfilePage />;
      case 'product':
        return <ProductDetailPage />;
      case 'drops':
        return <DropsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'become-a-creator':
        return <BecomeCreatorPage />;
      case 'about':
        return <AboutPage />;
      case 'terms':
        return <TermsPage />;
      case 'creator-dashboard':
        return <CreatorDashboardPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'account':
        return <CustomerAccountPage />;
      case 'login':
      case 'auth':
        return <AuthPage />;
      default:
        return <HomePage />;
    }
  };

  // If in dedicated admin sign in portal, render clean isolated layout
  if (currentRoute === 'admin-login') {
    return (
      <div className="min-h-screen bg-black text-white">
        <SEOHead />
        <AdminLoginPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-[#C0C0C0] selection:text-black">
      {/* Dynamic SEO & Metadata Engine */}
      <SEOHead />

      {/* Top Banner Marquee */}
      <div className="bg-[#111111] border-b border-[#262626] py-1.5 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 text-[11px] font-mono-tech tracking-wider uppercase text-[#D9D9D9]">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 flex-shrink-0">
              <span className="flex items-center gap-2">
                <span className="text-white font-bold tracking-tight">DROPKULTURE</span>
                <span className="text-[#8E8E93]">·</span>
                <span className="text-[#C0C0C0]">PREMIUM CREATOR COMMERCE</span>
                <span className="text-[#8E8E93]">·</span>
                <span className="text-[#D9D9D9]">CULTURE-FOCUSED</span>
              </span>
              <span className="text-[#C0C0C0] text-xs">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <Navbar />

      {/* Primary Page Canvas */}
      <main className="flex-1 w-full pb-20 lg:pb-0">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Interactive Modals & Drawers */}
      <SearchModal />
      <CartDrawer />
      <CheckoutModal />
      <QuickViewModal />
      <NotifyDropModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
