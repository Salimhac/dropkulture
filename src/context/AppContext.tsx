import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Creator, Product, Drop, Collection, CategoryType, CurrencyType, CartItem, Order, CreatorApplication, UserProfile } from '../types';
import { CURRENCY_RATES } from '../data/categories';
import { authService } from '../services/authService';
import { dbService } from '../services/supabaseService';

export type RouteType = 
  | 'home' 
  | 'explore' 
  | 'creator' 
  | 'product' 
  | 'drops' 
  | 'categories' 
  | 'become-a-creator' 
  | 'about' 
  | 'terms'
  | 'search' 
  | 'creator-dashboard' 
  | 'admin-dashboard'
  | 'admin-login'
  | 'account'
  | 'customer-account'
  | 'login'
  | 'auth';

interface NavigationParams {
  creatorSlug?: string;
  productId?: string;
  dropId?: string;
  category?: CategoryType;
  query?: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

interface AppContextType {
  // Navigation
  currentRoute: RouteType;
  activeCreatorSlug: string | null;
  activeProductId: string | null;
  activeDropId: string | null;
  selectedCategory: CategoryType | 'ALL';
  searchQuery: string;
  navigateTo: (route: RouteType, params?: NavigationParams) => void;

  // Currency
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (amountInKES: number) => string;

  // Live Database State
  creators: Creator[];
  products: Product[];
  drops: Collection[];
  isLoadingData: boolean;
  refreshDatabase: () => Promise<void>;

  // Modals & Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  notifyDrop: Drop | null;
  setNotifyDrop: (drop: Drop | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  cartTotalKES: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Checkout
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => Promise<Order>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Followed Creators
  followedCreators: string[];
  toggleFollowCreator: (creatorSlug: string) => void;
  isFollowingCreator: (creatorSlug: string) => boolean;

  // Drop Notifications
  notifiedDrops: string[];
  toggleDropNotification: (dropId: string, contact?: string) => void;
  isDropNotified: (dropId: string) => boolean;

  // Creator Applications
  applications: CreatorApplication[];
  creatorApplications: CreatorApplication[];
  submitApplication: (appData: Omit<CreatorApplication, 'id' | 'status' | 'submittedAt'>) => Promise<CreatorApplication>;
  submitCreatorApplication: (appData: any) => Promise<CreatorApplication>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'warn') => void;
  removeToast: (id: string) => void;

  // Helper getters
  getCreatorBySlug: (slug: string) => Creator | undefined;
  getProductById: (id: string) => Product | undefined;
  getDropById: (id: string) => Collection | undefined;

  // Authentication & User Session
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authRole: 'customer' | 'creator';
  setAuthRole: (role: 'customer' | 'creator') => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  openAuthModal: (role?: 'customer' | 'creator', mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<RouteType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');
      const params = new URLSearchParams(window.location.search);
      const isSalim = 
        path === '/salimsalim' || 
        path.endsWith('/salimsalim') || 
        hash === '#/salimsalim' || 
        hash === '#salimsalim' ||
        params.has('salimsalim') ||
        params.get('route') === 'salimsalim';
      if (isSalim) {
        try {
          // Strictly read session from sessionStorage (never persists in localStorage)
          const storedUser = sessionStorage.getItem('dropkulture_auth_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.role === 'admin') return 'admin-dashboard';
          }
        } catch (e) {
          // ignore
        }
        return 'admin-login';
      }
    }
    return 'home';
  });
  const [activeCreatorSlug, setActiveCreatorSlug] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live database entities
  const [creators, setCreators] = useState<Creator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drops, setDrops] = useState<Collection[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'customer' | 'creator'>('customer');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    async function initAuth() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Failed to load initial session:', err);
      }
    }
    initAuth();
  }, []);

  const openAuthModal = (role: 'customer' | 'creator' = 'customer', mode: 'login' | 'register' = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const [currency, setCurrency] = useState<CurrencyType>('KES');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [notifyDrop, setNotifyDrop] = useState<Drop | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dropkulture_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dropkulture_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const isOldSeed = parsed.length === 2 && parsed.includes('prod-kap-01') && parsed.includes('prod-waf-01');
          if (isOldSeed) {
            localStorage.removeItem('dropkulture_wishlist');
            return [];
          }
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Followed creators
  const [followedCreators, setFollowedCreators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dropkulture_followed_creators');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Notified drops
  const [notifiedDrops, setNotifiedDrops] = useState<string[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Applications
  const [applications, setApplications] = useState<CreatorApplication[]>([]);

  // Live Database Fetcher
  const refreshDatabase = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [dbCreators, dbProducts, dbCollections, dbOrders, dbApps] = await Promise.all([
        dbService.getApprovedCreators(),
        dbService.getAllActiveProducts(),
        dbService.getAllCollections(),
        dbService.getAllOrdersForAdmin(),
        dbService.getAllCreatorApplications(),
      ]);
      setCreators(dbCreators);
      setProducts(dbProducts);
      setDrops(dbCollections);
      setOrders(dbOrders);
      setApplications(dbApps);
    } catch (err) {
      console.error('Failed to load live database state:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial mount: load data from live Supabase
  useEffect(() => {
    refreshDatabase();
  }, [refreshDatabase]);

  // Sync followed creators to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dropkulture_followed_creators', JSON.stringify(followedCreators));
    } catch {
      // ignore
    }
  }, [followedCreators]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('dropkulture_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('dropkulture_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const showToast = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (route: RouteType, params?: NavigationParams) => {
    const resolvedRoute = route === 'customer-account' ? 'account' : route;
    setCurrentRoute(resolvedRoute as RouteType);
    if (params?.creatorSlug) setActiveCreatorSlug(params.creatorSlug);
    if (params?.productId) setActiveProductId(params.productId);
    if (params?.dropId) setActiveDropId(params.dropId);
    if (params?.category) setSelectedCategory(params.category);
    if (params?.query !== undefined) setSearchQuery(params.query);
    
    // Sync browser URL for /salimsalim secret route
    if (typeof window !== 'undefined') {
      const isSalimPath = window.location.pathname.endsWith('/salimsalim');
      if ((resolvedRoute === 'admin-dashboard' || resolvedRoute === 'admin-login') && !isSalimPath) {
        window.history.pushState(null, '', '/salimsalim');
      } else if (resolvedRoute !== 'admin-dashboard' && resolvedRoute !== 'admin-login' && isSalimPath) {
        window.history.pushState(null, '', '/');
      }
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (amountInKES: number) => {
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.KES;
    if (currency === 'KES') {
      return `KES ${amountInKES.toLocaleString()}`;
    }
    const converted = amountInKES * config.rateToKES;
    if (currency === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    if (currency === 'NGN') {
      return `₦${Math.round(converted).toLocaleString()}`;
    }
    if (currency === 'ZAR') {
      return `R ${Math.round(converted).toLocaleString()}`;
    }
    return `KES ${amountInKES.toLocaleString()}`;
  };

  const addToCart = (product: Product, size: string, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedSize === size);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, selectedSize: size, quantity }];
    });
    showToast(`Added ${product.name} (${size}) to your bag.`, 'success');
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalKES = cart.reduce((sum, item) => sum + (item.product.priceKES * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from your wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to your wishlist.', 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleFollowCreator = (creatorSlug: string) => {
  // 🔒 Require login
  if (!currentUser) {
    showToast('Please sign in to follow creators.', 'warn');
    openAuthModal('customer', 'login');
    return;
  }

  // 🔒 Block self-follow
  const target = creators.find(c => c.slug === creatorSlug);
  if (target?.user_id && currentUser.user_id && currentUser.user_id === target.user_id) {
    showToast("You can't follow your own storefront.", 'warn');
    return;
  }

  setFollowedCreators(prev => {
    if (prev.includes(creatorSlug)) {
      showToast('Unfollowed creator.', 'info');
      return prev.filter(s => s !== creatorSlug);
    }
    showToast('Now following creator drops!', 'success');
    return [...prev, creatorSlug];
  });
};

  const isFollowingCreator = (creatorSlug: string) => followedCreators.includes(creatorSlug);

  const toggleDropNotification = (dropId: string, contact?: string) => {
    setNotifiedDrops(prev => {
      if (prev.includes(dropId)) {
        showToast('Notification cancelled.', 'info');
        return prev.filter(id => id !== dropId);
      } else {
        showToast(
          contact ? `Notification registered for ${contact}!` : 'You will be notified 1 hour before drop release!',
          'success'
        );
        return [...prev, dropId];
      }
    });
  };

  const isDropNotified = (dropId: string) => notifiedDrops.includes(dropId);

  const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> => {
    const newOrder = await dbService.createOrder(orderData);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const submitApplication = async (appData: Omit<CreatorApplication, 'id' | 'status' | 'submittedAt'>): Promise<CreatorApplication> => {
    const newApp = await dbService.submitCreatorApplication(appData);
    setApplications(prev => [newApp, ...prev]);
    return newApp;
  };

  // Live database getters
  const getCreatorBySlug = (slug: string) => creators.find(c => c.slug === slug);
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getDropById = (id: string) => drops.find(d => d.id === id || d.slug === id);

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        activeCreatorSlug,
        activeProductId,
        activeDropId,
        selectedCategory,
        searchQuery,
        navigateTo,
        currency,
        setCurrency,
        formatPrice,
        creators,
        products,
        drops,
        isLoadingData,
        refreshDatabase,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        notifyDrop,
        setNotifyDrop,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalKES,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orders,
        createOrder,
        wishlist,
        toggleWishlist,
        isWishlisted,
        followedCreators,
        toggleFollowCreator,
        isFollowingCreator,
        notifiedDrops,
        toggleDropNotification,
        isDropNotified,
        applications,
        creatorApplications: applications,
        submitApplication,
        submitCreatorApplication: submitApplication,
        toasts,
        showToast,
        removeToast,
        getCreatorBySlug,
        getProductById,
        getDropById,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authRole,
        setAuthRole,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
