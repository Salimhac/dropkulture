import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  Sparkles,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Layers,
  Store,
  BarChart3,
  Image as ImageIcon,
  Lock,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/supabaseService';
import { Creator, Product, Collection, CreatorStatus, CategoryType } from '../types';
import { ImageUploadInput } from '../components/ImageUploadInput';

export const CreatorDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    formatPrice, 
    navigateTo, 
    showToast, 
    openAuthModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'store' | 'products' | 'collections'>('dashboard');
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [creatorOrders, setCreatorOrders] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState({ totalSales: 0, totalOrders: 0, revenue: 0 });
  const [showVerificationNoticeModal, setShowVerificationNoticeModal] = useState(false);

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'HOODIES' | 'TEES' | 'CAPS' | 'JERSEYS' | 'ACCESSORIES' | 'POSTERS'>('HOODIES');
  const [prodPrice, setProdPrice] = useState(4500);
  const [prodStock, setProdStock] = useState(50);
  const [prodSizes, setProdSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [prodImageUrl, setProdImageUrl] = useState('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80');
  const [prodDescription, setProdDescription] = useState('Heavyweight 450gsm custom-washed hoodie.');
  const [prodIsLimited, setProdIsLimited] = useState(true);

  // Add Collection Modal state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [colName, setColName] = useState('');
  const [colDescription, setColDescription] = useState('');
  const [colCoverImage, setColCoverImage] = useState('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80');
  const [colProductIds, setColProductIds] = useState<string[]>([]);

  // Store profile edit form
  const [storeName, setStoreName] = useState('');
  const [storeBio, setStoreBio] = useState('');
  const [storeAvatar, setStoreAvatar] = useState('');
  const [storeBanner, setStoreBanner] = useState('');
  const [storeInstagram, setStoreInstagram] = useState('');
  const [storeTiktok, setStoreTiktok] = useState('');
  const [storeYoutube, setStoreYoutube] = useState('');
  const [storeX, setStoreX] = useState('');
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Verification status: Creator must be approved by admin before publishing merchandise
  const isVerifiedAndApproved = Boolean(
    currentCreator && 
    (currentCreator.status === 'approved' || currentCreator.verified)
  );

  // Load creator data
  useEffect(() => {
    async function loadCreatorData() {
      let creator: Creator | null = null;

      if (currentUser?.user_id) {
        creator = await dbService.getCreatorByUserId(currentUser.user_id, currentUser.email);
      }
      if (!creator && currentUser?.id) {
        creator = await dbService.getCreatorByUserId(currentUser.id, currentUser.email);
      }
      if (!creator && currentUser?.email) {
        const all = await dbService.getAllCreatorsForAdmin();
        creator = all.find(c => 
          c.user_id === currentUser.user_id || 
          c.id === currentUser.id ||
          c.name.toLowerCase() === (currentUser.full_name || '').toLowerCase()
        ) || null;
      }
      
      // If user registered as creator and no record exists yet, synthesize pending creator profile
      if (!creator && currentUser?.role === 'creator') {
        const baseSlug = (currentUser.full_name || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        creator = {
          id: currentUser.id || 'creator-temp-id',
          user_id: currentUser.user_id || currentUser.id,
          name: currentUser.full_name || 'New Creator Brand',
          creator_name: currentUser.full_name || 'New Creator Brand',
          slug: `${baseSlug}`,
          bio: 'Official Creator Brand Storefront pending administrator verification.',
          category: 'FASHION',
          country: currentUser.country || 'Kenya',
          countryCode: 'KE',
          flag: '🇰🇪',
          avatarUrl: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          profile_image: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
          cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
          tagline: 'Pending Admin Verification',
          verified: false,
          status: 'pending',
          followerCount: '0',
          productCount: 0,
          socialLinks: {},
          created_at: currentUser.created_at || new Date().toISOString(),
        };
      }

      if (creator) {
        setCurrentCreator(creator);
        setStoreName(creator.name);
        setStoreBio(creator.bio);
        setStoreAvatar(creator.avatarUrl);
        setStoreBanner(creator.bannerUrl);
        setStoreInstagram(creator.socialLinks.instagram || '');
        setStoreTiktok(creator.socialLinks.tiktok || '');
        setStoreYoutube(creator.socialLinks.youtube || '');
        setStoreX(creator.socialLinks.x || creator.socialLinks.twitter || '');

        const prods = await dbService.getProductsByCreatorId(creator.id);
        setProducts(prods);

        const cols = await dbService.getCollectionsByCreatorId(creator.id);
        setCollections(cols);

        const { orders, totalSalesKES } = await dbService.getOrdersForCreator(creator.id);
        setCreatorOrders(orders);
        setSalesStats({
          totalSales: totalSalesKES,
          totalOrders: orders.length,
          revenue: Math.round(totalSalesKES * 0.30), // 30% creator royalty share (70% platform operations/production)
        });
      }
    }

    loadCreatorData();

    // Listen to real-time creator updates (e.g. admin approves creator in another tab)
    const handleRemoteChange = (e: any) => {
      loadCreatorData();
    };
    window.addEventListener('dropkulture_creators_changed', handleRemoteChange);
    return () => window.removeEventListener('dropkulture_creators_changed', handleRemoteChange);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-[#1A1A1A] border border-[#2B2B2B] shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-[#C0C0C0]/40 flex items-center justify-center mx-auto text-white">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Creator Portal Sign In</h2>
          <p className="text-sm text-[#8E8E93]">
            Sign in with your creator account to manage your store, upload apparel products, and track sales royalties.
          </p>
          <button
            onClick={() => openAuthModal('creator', 'login')}
            id="btn-creator-signin"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-semibold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Sign In as Creator
          </button>
        </div>
      </div>
    );
  }

  // Handle Save Store Profile
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCreator) return;
    setIsSavingStore(true);
    try {
      const updated = await dbService.updateCreator(currentCreator.id, {
        name: storeName,
        bio: storeBio,
        avatarUrl: storeAvatar,
        bannerUrl: storeBanner,
        socialLinks: {
          instagram: storeInstagram,
          tiktok: storeTiktok,
          youtube: storeYoutube,
          x: storeX,
          twitter: storeX,
        },
      });
      setCurrentCreator(updated);
      showToast('Storefront profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update store', 'warn');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Handle Open Product Modal
  const handleOpenAddProduct = () => {
    if (!isVerifiedAndApproved) {
      setShowVerificationNoticeModal(true);
      return;
    }
    setEditingProduct(null);
    setProdName('');
    setProdCategory('HOODIES');
    setProdPrice(4500);
    setProdStock(50);
    setProdSizes(['S', 'M', 'L', 'XL']);
    setProdImageUrl('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80');
    setProdDescription('Heavyweight 450gsm custom-washed hoodie.');
    setProdIsLimited(true);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.priceKES || prod.price || 4500);
    setProdStock(prod.stockCount || prod.stock || 50);
    setProdSizes(prod.sizes || ['S', 'M', 'L', 'XL']);
    setProdImageUrl(prod.images[0] || '');
    setProdDescription(prod.description);
    setProdIsLimited(prod.isLimitedEdition);
    setIsProductModalOpen(true);
  };

  // Handle Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCreator || !prodName) return;

    if (!isVerifiedAndApproved) {
      showToast('Merchandise upload locked: Admin verification required before publishing products.', 'warn');
      setShowVerificationNoticeModal(true);
      return;
    }

    try {
      if (editingProduct) {
        const updated = await dbService.updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory,
          priceKES: Number(prodPrice),
          price: Number(prodPrice),
          stockCount: Number(prodStock),
          stock: Number(prodStock),
          sizes: prodSizes,
          images: [prodImageUrl],
          description: prodDescription,
          isLimitedEdition: prodIsLimited,
          is_limited_edition: prodIsLimited,
        });
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Product updated successfully', 'success');
      } else {
        const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const created = await dbService.addProduct({
          creatorId: currentCreator.id,
          creator_id: currentCreator.id,
          creatorName: currentCreator.name,
          creatorSlug: currentCreator.slug,
          creatorAvatar: currentCreator.avatarUrl,
          creatorCategory: currentCreator.category,
          name: prodName,
          slug,
          category: prodCategory,
          priceKES: Number(prodPrice),
          price: Number(prodPrice),
          stockCount: Number(prodStock),
          stock: Number(prodStock),
          sizes: prodSizes,
          images: [prodImageUrl],
          description: prodDescription,
          materials: '100% Combed Heavyweight Cotton',
          fit: 'Relaxed Streetwear Fit',
          shippingInfo: 'Dispatched within 24h from Nairobi HQ',
          inStock: Number(prodStock) > 0,
          isLimitedEdition: prodIsLimited,
          is_limited_edition: prodIsLimited,
          rating: 5.0,
          reviewsCount: 1,
          status: 'active',
        });
        setProducts(prev => [created, ...prev]);
        showToast('Product created and listed successfully', 'success');
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'warn');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await dbService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Product deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'warn');
    }
  };

  // Handle Save Collection
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCreator || !colName) return;

    try {
      const slug = colName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCol = await dbService.addCollection({
        creator_id: currentCreator.id,
        name: colName,
        slug,
        description: colDescription,
        cover_image: colCoverImage,
        release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'live',
        product_ids: colProductIds,
      });
      setCollections(prev => [newCol, ...prev]);
      showToast(`Collection "${colName}" created`, 'success');
      setIsCollectionModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to create collection', 'warn');
    }
  };

  const status: CreatorStatus = currentCreator?.status || 'pending';

  return (
    <div className="w-full min-h-screen pb-24 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-white bg-black">
      
      {/* Suspended status notification banner */}
      {status === 'suspended' && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Creator Account Status: SUSPENDED</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-red-500 text-white font-extrabold uppercase">
                Restricted
              </span>
            </h4>
            <p className="text-xs text-red-200/90 leading-relaxed">
              Your creator storefront and product catalog have been suspended by the platform administrator. Your public store page is temporarily restricted from customer checkout. Please contact the platform admin or DROPKULTURE support to appeal or resolve this hold.
            </p>
          </div>
        </div>
      )}

      {/* Pending status notification banner */}
      {!isVerifiedAndApproved && status !== 'suspended' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1A1813] border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Account Verification Required</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-amber-500 text-black font-extrabold uppercase">
                  Pending Admin Approval
                </span>
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
                Your creator account has been submitted and is awaiting administrative clearance. To protect brand authenticity and exclusivity, adding new merchandise is locked until an administrator reviews and verifies your profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowVerificationNoticeModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono-tech uppercase font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Verification Status</span>
          </button>
        </div>
      )}

      {/* Header and Storefront Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>CREATOR COMMERCE OPERATING SYSTEM</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase mt-1">
            {currentCreator ? currentCreator.name : 'CREATOR'} PORTAL
          </h1>
          <p className="text-xs text-[#8E8E93]">
            Manage your branded storefront, product catalog, drops, and automated payouts.
          </p>
        </div>

        {currentCreator && (
          <div className="flex items-center gap-3">
            {isVerifiedAndApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-tech uppercase font-bold bg-white text-black shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>Verified Creator</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowVerificationNoticeModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-tech uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Verification</span>
              </button>
            )}
            <button
              onClick={() => navigateTo('creator', { creatorSlug: currentCreator.slug })}
              className="px-4 py-2 rounded-xl bg-black border border-[#C0C0C0]/50 hover:border-white text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs (Metallic highlights) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1F1F1F]">
        <button
          onClick={() => setActiveTab('dashboard')}
          id="tab-cr-dashboard"
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          id="tab-cr-store"
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'store'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>My Store</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          id="tab-cr-products"
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          id="tab-cr-collections"
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'collections'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
              : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Collections / Drops ({collections.length})</span>
        </button>
      </div>

      {/* ----------------- 1. DASHBOARD TAB (Dark graphite panels, thin silver borders, white text, metallic highlights) ----------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 space-y-2 transition-all">
              <div className="flex items-center justify-between text-xs text-[#C0C0C0] font-mono-tech uppercase">
                <span>Total Sales</span>
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="font-mono-tech font-black text-xl sm:text-2xl text-white">
                {formatPrice(salesStats.totalSales)}
              </p>
              <span className="text-[11px] font-mono-tech text-[#D9D9D9] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-white" /> Real-time M-Pesa sales
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 space-y-2 transition-all">
              <div className="flex items-center justify-between text-xs text-[#C0C0C0] font-mono-tech uppercase">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <p className="font-mono-tech font-black text-xl sm:text-2xl text-white">
                {salesStats.totalOrders}
              </p>
              <span className="text-[11px] text-[#8E8E93] font-mono-tech">
                Across East & West Africa
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 space-y-2 transition-all">
              <div className="flex items-center justify-between text-xs text-[#C0C0C0] font-mono-tech uppercase">
                <span>Active Products</span>
                <Package className="w-4 h-4 text-white" />
              </div>
              <p className="font-mono-tech font-black text-xl sm:text-2xl text-white">
                {products.length}
              </p>
              <span className="text-[11px] text-[#D9D9D9] font-mono-tech">
                {products.filter(p => p.isLimitedEdition).length} Limited Edition
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 space-y-2 transition-all">
              <div className="flex items-center justify-between text-xs text-[#C0C0C0] font-mono-tech uppercase">
                <span>Net Royalty Revenue (30%)</span>
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="font-mono-tech font-black text-xl sm:text-2xl text-white">
                {formatPrice(salesStats.revenue)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#8E8E93] font-mono-tech">
                <span>Weekly automated payout</span>
                <span className="text-white">30% split</span>
              </div>
            </div>
          </div>

          {/* Best-Selling Product spotlight & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Best Seller */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  Best-Selling Piece
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech uppercase bg-white text-black font-bold">
                  TOP DROP
                </span>
              </div>

              {products[0] ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-black border border-[#2B2B2B]">
                  <img
                    src={products[0].images[0]}
                    alt={products[0].name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover rounded-lg bg-[#111111]"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{products[0].name}</h4>
                    <p className="text-xs font-mono-tech text-white font-bold">
                      {formatPrice(products[0].priceKES)}
                    </p>
                    <p className="text-[11px] text-[#8E8E93] font-mono-tech">
                      Stock: {products[0].stockCount} pcs remaining
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8E8E93]">No products uploaded yet.</p>
              )}

              <div className="pt-2 text-xs text-[#8E8E93] space-y-2 font-mono-tech">
                <div className="flex justify-between">
                  <span>Manufacturing partner:</span>
                  <span className="text-white">DROPKULTURE Nairobi Hub</span>
                </div>
                <div className="flex justify-between">
                  <span>Average delivery time:</span>
                  <span className="text-white">24-48 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <span className="text-white">Encrypted NFC Chips</span>
                </div>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] space-y-4">
              <h3 className="font-display font-bold text-lg text-white uppercase">
                Recent Customer Orders
              </h3>

              {creatorOrders.length > 0 ? (
                <div className="space-y-3">
                  {creatorOrders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl bg-black border border-[#262626] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{order.customer_name || 'Collector'}</p>
                        <p className="text-[11px] text-[#8E8E93] font-mono-tech">
                          {order.town}, {order.county} · {order.payment_method?.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-tech font-bold text-white">{formatPrice(order.total_amount)}</p>
                        <span className="text-[10px] font-mono-tech text-[#C0C0C0]">
                          {order.status?.toUpperCase() || 'PAID'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-black rounded-xl border border-[#222222]">
                  <p className="text-xs text-[#8E8E93]">No customer orders recorded yet.</p>
                  <p className="text-[11px] text-[#666666] mt-1">Orders will appear here immediately upon customer M-Pesa or card checkout.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- 2. MY STORE TAB ----------------- */}
      {activeTab === 'store' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] max-w-4xl space-y-6">
          <div>
            <h2 className="font-display font-bold text-xl text-white uppercase">
              Brand Identity & Social Profiles
            </h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Customize how your official storefront looks to visitors across the globe.
            </p>
          </div>

          <form onSubmit={handleSaveStore} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Creator / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadInput
                  id="creator-store-avatar"
                  label="Profile Photo / Brand Avatar"
                  sublabel="Upload directly from your phone camera or photo gallery"
                  value={storeAvatar}
                  onChange={(val) => setStoreAvatar(val)}
                  aspect="square"
                />
              </div>
            </div>

            <div>
              <ImageUploadInput
                id="creator-store-banner"
                label="Storefront Hero Banner"
                sublabel="Wide high-resolution banner for the top of your official store"
                value={storeBanner}
                onChange={(val) => setStoreBanner(val)}
                aspect="banner"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                Biography / Brand Manifesto
              </label>
              <textarea
                rows={3}
                value={storeBio}
                onChange={(e) => setStoreBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
              />
            </div>

            {/* Social channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={storeInstagram}
                  onChange={(e) => setStoreInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  TikTok URL
                </label>
                <input
                  type="text"
                  value={storeTiktok}
                  onChange={(e) => setStoreTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={storeYoutube}
                  onChange={(e) => setStoreYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  X / Twitter Handle
                </label>
                <input
                  type="text"
                  value={storeX}
                  onChange={(e) => setStoreX(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2B2B2B]">
              <button
                type="submit"
                disabled={isSavingStore}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {isSavingStore ? 'Saving Changes...' : 'Save Store Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------- 3. PRODUCTS TAB ----------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white uppercase">
                Catalog & Apparel
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Add hoodies, oversized tees, caps, and accessories with custom sizing.
              </p>
            </div>

            {isVerifiedAndApproved ? (
              <button
                onClick={handleOpenAddProduct}
                id="btn-add-product"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Add New Product</span>
              </button>
            ) : (
              <button
                onClick={() => setShowVerificationNoticeModal(true)}
                id="btn-add-product-locked"
                className="px-4 py-2.5 rounded-xl bg-[#1A1813] border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Merchandise upload locked until admin verifies account"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Add Product (Locked)</span>
              </button>
            )}
          </div>

          {/* Empty state when no products */}
          {products.length === 0 && (
            <div className="p-8 sm:p-12 rounded-2xl bg-[#121212] border border-[#2B2B2B] text-center space-y-4 max-w-lg mx-auto my-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                !isVerifiedAndApproved 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                  : 'bg-white/10 border border-white/20 text-white'
              }`}>
                {!isVerifiedAndApproved ? <Lock className="w-7 h-7" /> : <ShoppingBag className="w-7 h-7" />}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-lg text-white">
                  {!isVerifiedAndApproved ? 'Merchandise Uploading Locked' : 'No Products Added Yet'}
                </h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  {!isVerifiedAndApproved 
                    ? 'Your creator account is under review by DROPKULTURE administrators. Once your brand profile is verified, you will be unlocked to upload custom heavyweight hoodies, caps, tees, and launch scheduled batch drops.'
                    : 'Get started by creating your first official garment drop. Upload photos, configure size scales (S–XXL), and set prices.'
                  }
                </p>
              </div>
              {!isVerifiedAndApproved ? (
                <button
                  type="button"
                  onClick={() => setShowVerificationNoticeModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer"
                >
                  View Verification Status
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#D9D9D9] text-black font-bold text-xs uppercase transition-all cursor-pointer"
                >
                  Create First Product
                </button>
              )}
            </div>
          )}

          {/* Product List Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover rounded-lg bg-black border border-[#2B2B2B]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono-tech uppercase text-[#C0C0C0] block">
                      {prod.category}
                    </span>
                    <h4 className="font-bold text-white text-sm truncate">{prod.name}</h4>
                    <p className="font-mono-tech font-bold text-white text-sm mt-1">
                      {formatPrice(prod.priceKES)}
                    </p>
                    <p className="text-[11px] text-[#8E8E93] font-mono-tech">
                      Stock: {prod.stockCount} left
                    </p>
                    {prod.isLimitedEdition && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono-tech font-bold uppercase bg-white text-black">
                        Limited Drop
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="text-xs text-[#D9D9D9] hover:text-white flex items-center gap-1 font-medium transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- 4. COLLECTIONS TAB ----------------- */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white uppercase">
                Capsule Collections & Drops
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Group items into high-demand thematic releases and scheduled drops.
              </p>
            </div>

            {isVerifiedAndApproved ? (
              <button
                onClick={() => setIsCollectionModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Create Collection</span>
              </button>
            ) : (
              <button
                onClick={() => setShowVerificationNoticeModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1813] border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Create Drop (Locked)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-5 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#C0C0C0]/50 space-y-3 transition-all"
              >
                <div className="aspect-[21/9] rounded-xl overflow-hidden bg-black border border-[#2B2B2B]">
                  <img
                    src={col.cover_image}
                    alt={col.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-white uppercase">{col.name}</h3>
                  <span className="text-[10px] font-mono-tech uppercase px-2 py-0.5 rounded bg-white text-black font-bold">
                    {col.status}
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93] line-clamp-2">{col.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PRODUCT
          ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-black border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
              <h3 className="font-display font-bold text-base text-white uppercase">
                {editingProduct ? 'Edit Product' : 'Add New Apparel Piece'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-[#8E8E93] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-black">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Signature Heavyweight Tour Hoodie"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                  >
                    <option value="HOODIES">Hoodies</option>
                    <option value="TEES">Tees</option>
                    <option value="CAPS">Caps</option>
                    <option value="JERSEYS">Jerseys</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="POSTERS">Posters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                    Limited Edition Drop?
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is-limited-check"
                      checked={prodIsLimited}
                      onChange={(e) => setProdIsLimited(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <label htmlFor="is-limited-check" className="text-xs text-[#D9D9D9] cursor-pointer">
                      Mark as Limited Run
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <ImageUploadInput
                  id="prod-upload-image"
                  label="Garment / Product Photo *"
                  sublabel="Take a photo with your phone or pick from your camera roll"
                  value={prodImageUrl}
                  onChange={(val) => setProdImageUrl(val)}
                  aspect="product"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#222222] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#8E8E93] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE COLLECTION
          ========================================================================= */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-black border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
              <h3 className="font-display font-bold text-base text-white uppercase">
                Create Capsule Collection
              </h3>
              <button
                onClick={() => setIsCollectionModalOpen(false)}
                className="p-1 rounded-full text-[#8E8E93] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4 bg-black">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="e.g. Chapter 01: Nairobi Nights"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <ImageUploadInput
                  id="col-upload-image"
                  label="Capsule Collection Cover Image"
                  sublabel="Upload a lookbook or campaign banner from your phone"
                  value={colCoverImage}
                  onChange={(val) => setColCoverImage(val)}
                  aspect="banner"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                  Collection Story / Theme
                </label>
                <textarea
                  rows={3}
                  value={colDescription}
                  onChange={(e) => setColDescription(e.target.value)}
                  placeholder="Describe the inspiration behind this drop..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#222222] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#8E8E93] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  Launch Capsule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATOR VERIFICATION STATUS NOTICE
          ========================================================================= */}
      {showVerificationNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111111] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white uppercase">
                    Creator Account Verification
                  </h3>
                  <span className="text-[10px] font-mono-tech text-amber-400 uppercase font-bold">
                    Admin Approval Required
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationNoticeModal(false)}
                className="p-1.5 rounded-full text-[#8E8E93] hover:text-white hover:bg-[#222222] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-base font-display font-bold text-white uppercase">
                  Why is product publishing locked?
                </h4>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  DROPKULTURE operates an exclusive creator ecosystem. To protect your brand from counterfeit imitation and maintain our luxury 380–450 GSM French Terry manufacturing standards, every registered creator account is vetted by platform administrators before merchandise can be added or published.
                </p>
              </div>

              {/* 3 Step Visual Pipeline */}
              <div className="space-y-3 p-4 rounded-xl bg-black border border-[#222222]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono-tech">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Step 1: Account Created</span>
                    <span className="text-[11px] text-[#8E8E93]">Authenticated profile & storefront initialized</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold font-mono-tech animate-pulse">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Step 2: Admin Verification (Current)</span>
                    <span className="text-[11px] text-[#8E8E93]">Platform administrators review brand profile in Admin Dashboard</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#666666] flex items-center justify-center text-xs font-bold font-mono-tech">
                    <Lock className="w-3 h-3 text-[#666666]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#8E8E93] block">Step 3: Merchandise Publishing Enabled</span>
                    <span className="text-[11px] text-[#666666]">Add hoodies, caps, tees & start collecting 30% sales royalties</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#A6ACB4] space-y-1">
                <span className="font-bold text-white font-mono-tech block">Need Fast-Track Clearance?</span>
                <p className="text-[11px] leading-relaxed">
                  Admins clear queues continuously. If you have a drop launching this week, contact our partnership team at <span className="text-white font-mono">admin@dropkulture.africa</span> or via WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowVerificationNoticeModal(false)}
                className="w-full py-3 rounded-xl bg-white hover:bg-[#D9D9D9] text-black font-bold text-xs uppercase font-mono-tech transition-all cursor-pointer"
              >
                Return to Creator Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
