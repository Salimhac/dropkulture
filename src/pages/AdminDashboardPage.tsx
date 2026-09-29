import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Users, 
  DollarSign, 
  PackageCheck, 
  ExternalLink,
  XCircle, 
  AlertTriangle, 
  BadgeCheck, 
  CheckCircle, 
  Search, 
  Store, 
  ShoppingBag,
  Link2,
  Copy,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Download,
  Database,
  TrendingUp,
  Eye,
  EyeOff,
  Filter,
  ArrowUpRight,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/supabaseService';
import { authService } from '../services/authService';
import { paystackService } from '../services/paystackService';
import { isSupabaseConfigured } from '../lib/supabase';
import { Creator, CreatorStatus, UserProfile, Product, Order, UserRole, CategoryType } from '../types';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { ensureStorageBuckets, getStorageHealth, StorageBucket } from '../services/storageService';

export const AdminDashboardPage: React.FC = () => {
  const { formatPrice, navigateTo, showToast, currentUser, setCurrentUser } = useApp();

  // The Admin Console is accessible by Administrator role only
  const isAdmin = currentUser?.role === 'admin';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'creators' | 'products' | 'orders' | 'users' | 'database'>('creators');

  // Database Data States
  const [creators, setCreators] = useState<Creator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Storage Health State
  const [storageHealth, setStorageHealth] = useState<{
    configured: boolean;
    buckets: { name: StorageBucket; ready: boolean; publicUrlSample?: string }[];
  } | null>(null);
  const [isActivatingStorage, setIsActivatingStorage] = useState(false);

  // Filters & Search
  const [creatorSearch, setCreatorSearch] = useState('');
  const [creatorStatusFilter, setCreatorStatusFilter] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Modals
  const [isAddCreatorOpen, setIsAddCreatorOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New Creator Form State
  const [newCreatorData, setNewCreatorData] = useState({
    name: '',
    category: 'MUSIC' as CategoryType,
    country: 'Kenya',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    instagram: '',
  });

  // New Product Form State
  const [newProductData, setNewProductData] = useState({
    name: '',
    creatorId: '',
    priceKES: 4500,
    category: 'HOODIES' as Product['category'],
    stockCount: 50,
    isLimitedEdition: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
  });

  // Load all database entities
  const loadDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [allCreators, allProds, allOrders, allUsers] = await Promise.all([
        dbService.getAllCreatorsForAdmin(),
        dbService.getAllProductsForAdmin(),
        dbService.getAllOrdersForAdmin(),
        authService.getAllProfiles(),
      ]);

      setCreators(allCreators);
      setProducts(allProds);
      setOrders(allOrders);
      setUsers(allUsers);
    } catch (err: any) {
      console.error('Failed to load database records:', err);
      showToast('Error syncing with database records', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDatabaseData();
    }
  }, [isAdmin]);

  // Real-time listener for newly registered creators or profile changes
  useEffect(() => {
    const handleRemoteChange = () => {
      if (isAdmin) {
        loadDatabaseData();
      }
    };

    window.addEventListener('dropkulture_creators_changed', handleRemoteChange);
    window.addEventListener('dropkulture_users_changed', handleRemoteChange);
    return () => {
      window.removeEventListener('dropkulture_creators_changed', handleRemoteChange);
      window.removeEventListener('dropkulture_users_changed', handleRemoteChange);
    };
  }, [isAdmin]);

  // Load storage health when viewing database tab
  useEffect(() => {
    if (activeTab === 'database') {
      getStorageHealth().then(setStorageHealth).catch(() => {});
    }
  }, [activeTab]);

  const handleActivateStorage = async () => {
    setIsActivatingStorage(true);
    try {
      const result = await ensureStorageBuckets();
      const updatedHealth = await getStorageHealth();
      setStorageHealth(updatedHealth);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Storage check completed', 'info');
    } finally {
      setIsActivatingStorage(false);
    }
  };

  const handleCopyStorageSQL = () => {
    const sql = `-- DROPKULTURE PLATFORM - SUPABASE STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']),
  ('products', 'products', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']),
  ('covers', 'covers', true, 15728640, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic'])
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read access to all images
DROP POLICY IF EXISTS "Public storage read access for avatars" ON storage.objects;
CREATE POLICY "Public storage read access for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('avatars', 'products', 'covers'));

-- Allow uploads for creator onboarding and merchandise creation
DROP POLICY IF EXISTS "Allow uploads to avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow uploads to avatars, products, and covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('avatars', 'products', 'covers'));

DROP POLICY IF EXISTS "Allow updates to avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow updates to avatars, products, and covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('avatars', 'products', 'covers'));

DROP POLICY IF EXISTS "Allow deletes on avatars, products, and covers" ON storage.objects;
CREATE POLICY "Allow deletes on avatars, products, and covers"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('avatars', 'products', 'covers'));`;

    navigator.clipboard.writeText(sql);
    showToast('Supabase Storage SQL copied to clipboard! Paste into your Supabase SQL Editor.', 'success');
  };

  // Administrator Sign Out
  const handleAdminSignOut = async () => {
    await authService.logout();
    setCurrentUser(null);
    showToast('Administrator signed out successfully', 'info');
    navigateTo('home');
  };

  const handleCopyAdminSignInLink = () => {
    const adminUrl = `${window.location.origin}/salimsalim`;
    navigator.clipboard.writeText(adminUrl);
    showToast('Admin secret access URL (/salimsalim) copied to clipboard', 'success');
  };

  // --- DATABASE ACTIONS ---

  // 1. Creators Actions
  const handleCreatorStatusChange = async (creatorId: string, status: CreatorStatus) => {
    try {
      if (status === 'approved') {
        await dbService.setCreatorVerified(creatorId, true);
      }
      const updated = await dbService.setCreatorStatus(creatorId, status);
      setCreators(prev => prev.map(c => c.id === creatorId ? { ...updated, verified: status === 'approved' ? true : updated.verified } : c));
      if (status === 'suspended') {
        showToast(`Creator storefront suspended. Public storefront restricted.`, 'warn');
      } else if (status === 'approved') {
        showToast(`Creator approved! Storefront is live and merchandise publishing is unlocked.`, 'success');
      } else {
        showToast(`Creator status updated to ${status.toUpperCase()} in database`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'warn');
    }
  };

  const handleToggleCreatorVerified = async (creatorId: string, currentVerified: boolean) => {
    try {
      const updated = await dbService.setCreatorVerified(creatorId, !currentVerified);
      setCreators(prev => prev.map(c => c.id === creatorId ? updated : c));
      showToast(`Verified badge ${!currentVerified ? 'granted' : 'revoked'} for creator storefront`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Verification update failed', 'warn');
    }
  };

  const handleApproveAndVerify = async (creatorId: string, creatorName: string) => {
    try {
      await dbService.setCreatorVerified(creatorId, true);
      const updated = await dbService.setCreatorStatus(creatorId, 'approved');
      setCreators(prev => prev.map(c => c.id === creatorId ? { ...updated, verified: true } : c));
      showToast(`Creator "${creatorName}" Verified & Approved! Merchandise upload is now unlocked.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Decision failed', 'warn');
    }
  };

  const handleDeleteCreator = async (creatorId: string, name: string) => {
    if (!window.confirm(`Permanently remove creator "${name}" and unlist their storefront from database?`)) return;
    try {
      await dbService.deleteCreator(creatorId);
      setCreators(prev => prev.filter(c => c.id !== creatorId));
      showToast(`Creator "${name}" removed from database`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete creator', 'warn');
    }
  };

  const handleCreateCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorData.name.trim()) {
      showToast('Creator name is required', 'warn');
      return;
    }
    try {
      const created = await dbService.createCreatorByAdmin({
        name: newCreatorData.name,
        category: newCreatorData.category,
        country: newCreatorData.country,
        bio: newCreatorData.bio || 'Official DROPKULTURE Creator Brand',
        avatarUrl: newCreatorData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bannerUrl: newCreatorData.bannerUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
        socialLinks: { instagram: newCreatorData.instagram },
        status: 'approved',
        verified: true,
      });
      setCreators(prev => [created, ...prev]);
      setIsAddCreatorOpen(false);
      setNewCreatorData({
        name: '',
        category: 'MUSIC',
        country: 'Kenya',
        bio: '',
        avatarUrl: '',
        bannerUrl: '',
        instagram: '',
      });
      showToast(`Creator "${created.name}" created and approved in database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create creator', 'warn');
    }
  };

  // 2. Product Actions
  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    try {
      const updated = await dbService.updateProduct(productId, { 
        stockCount: newStock,
        stock: newStock,
      });
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      showToast(`Stock updated to ${newStock} units`, 'success');
    } catch (err: any) {
      showToast('Failed to update stock', 'warn');
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'draft' ? 'active' : 'draft';
    try {
      const updated = await dbService.updateProduct(productId, { status: nextStatus as any });
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      showToast(`Product is now ${nextStatus.toUpperCase()}`, 'info');
    } catch (err: any) {
      showToast('Failed to change status', 'warn');
    }
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!window.confirm(`Permanently delete garment "${title}" from catalog?`)) return;
    try {
      await dbService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast(`Product "${title}" deleted`, 'info');
    } catch (err: any) {
      showToast('Failed to delete product', 'warn');
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.creatorId) {
      showToast('Please provide product name and select a creator', 'warn');
      return;
    }
    const selectedCreator = creators.find(c => c.id === newProductData.creatorId);
    try {
      const created = await dbService.createProductByAdmin({
        name: newProductData.name,
        creatorId: newProductData.creatorId,
        creatorName: selectedCreator?.name || 'Creator',
        priceKES: Number(newProductData.priceKES),
        category: newProductData.category,
        stockCount: Number(newProductData.stockCount),
        stock: Number(newProductData.stockCount),
        isLimitedEdition: newProductData.isLimitedEdition,
        description: newProductData.description || 'Exclusive official release made with heavyweight premium cotton.',
        images: [newProductData.image],
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'active',
      });
      setProducts(prev => [created, ...prev]);
      setIsAddProductOpen(false);
      setNewProductData({
        name: '',
        creatorId: '',
        priceKES: 4500,
        category: 'HOODIES',
        stockCount: 50,
        isLimitedEdition: true,
        description: '',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      });
      showToast(`Garment "${created.name}" added to database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'warn');
    }
  };

  // 3. Orders Actions
  const handleOrderStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await dbService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`Order ${orderId} marked as ${newStatus}`, 'success');
    } catch (err: any) {
      showToast('Failed to update order status', 'warn');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Delete order ${orderId} from database?`)) return;
    try {
      await dbService.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(`Order ${orderId} removed`, 'info');
    } catch (err: any) {
      showToast('Failed to delete order', 'warn');
    }
  };

  // 4. Users Actions
  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await authService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      showToast(`User role changed to ${newRole.toUpperCase()} in database`, 'success');
    } catch (err: any) {
      showToast('Failed to update user role', 'warn');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Permanently remove user "${email}" from database?`)) return;
    try {
      await authService.deleteUserProfile(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`User profile removed`, 'info');
    } catch (err: any) {
      showToast('Failed to delete user', 'warn');
    }
  };

  // 5. Database Diagnostics & Backup
  const handleExportBackup = async () => {
    try {
      const backup = await dbService.exportDatabaseBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dropkulture_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Database JSON backup downloaded', 'success');
    } catch (err: any) {
      showToast('Backup export failed', 'warn');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('WARNING: Reset all tables to factory default state? This will clear local database modifications.')) return;
    try {
      await dbService.resetDatabaseToDefaults();
      await loadDatabaseData();
      showToast('Database reset to factory default state', 'success');
    } catch (err: any) {
      showToast('Reset failed', 'warn');
    }
  };

  const handleRefreshDatabase = async () => {
    try {
      await loadDatabaseData();
      showToast('Database records synchronized successfully!', 'success');
    } catch {
      showToast('Failed to sync database records', 'warn');
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: RESTRICTED ACCESS BARRIER (IF NOT AUTHENTICATED AS ADMIN)
  // ---------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white relative">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0F0F0F] border border-[#2B2B2B] shadow-[0_20px_80px_rgba(0,0,0,0.95)] space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.15)]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black border border-amber-400/40 text-[10px] font-mono-tech uppercase font-bold tracking-widest text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ADMINISTRATOR CLEARANCE ONLY</span>
            </div>
            
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              ACCESS DENIED
            </h2>
            
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              The DROPKULTURE Admin Console is accessible strictly by verified platform administrators. Access requires signing in through the dedicated Supabase Admin portal.
            </p>
          </div>

          {currentUser ? (
            <div className="p-3.5 rounded-xl bg-black border border-[#262626] text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E93] font-mono-tech uppercase text-[10px]">Current Session:</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech uppercase bg-[#222222] text-[#C0C0C0] border border-[#333333]">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-white truncate">{currentUser.email}</p>
              <p className="text-[11px] text-[#A6ACB4]">This account does not possess administrator privileges.</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-black border border-[#222222] text-xs text-[#8E8E93]">
              No active administrator session detected. Please authenticate to continue.
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              id="btn-goto-admin-login"
              onClick={() => navigateTo('admin-login')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider font-mono-tech flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Authenticate Administrator Credentials</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 rounded-xl text-xs text-[#8E8E93] hover:text-white font-mono-tech text-center transition-colors border border-transparent hover:border-[#333333] cursor-pointer"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // FILTERED LISTS
  // ---------------------------------------------------------------------------
  const filteredCreators = creators.filter(c => {
    const q = creatorSearch.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchStatus = creatorStatusFilter === 'ALL' || c.status === creatorStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.creatorName && p.creatorName.toLowerCase().includes(q));
    const matchCategory = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const matchSearch = !q || 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) || 
      o.customerEmail.toLowerCase().includes(q) ||
      (o.mpesaReceipt && o.mpesaReceipt.toLowerCase().includes(q)) ||
      (o.paystackReference && o.paystackReference.toLowerCase().includes(q));
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  // Calculate live dynamic metrics from database state
  const totalGMVKES = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const platformRevenueKES = Math.round(totalGMVKES * 0.70); // 70% platform take-rate (production, fulfillment & ops)
  const totalGarmentsUnits = products.reduce((sum, p) => sum + (p.stockCount || p.stock || 0), 0);
  const pendingCreatorsCount = creators.filter(c => c.status === 'pending').length;
  const approvedCreatorsCount = creators.filter(c => c.status === 'approved').length;

  return (
    <div className="w-full min-h-screen pb-24 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 md:pt-12 text-white bg-black">
      {/* Secretive Header Bar */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#111111] border border-[#2B2B2B] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech font-bold uppercase bg-black text-[#D9D9D9] border border-[#333333] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>ADMIN PLATFORM CONTROL</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech uppercase bg-black text-[#C0C0C0] border border-[#333333] flex items-center gap-1">
              <Database className="w-3 h-3 text-white" />
              <span>{isSupabaseConfigured() ? 'SUPABASE CLOUD LIVE' : 'DATABASE PERSISTENCE ACTIVE'}</span>
            </span>
          </div>
          <h1 className="font-display font-black text-xl sm:text-3xl text-white uppercase tracking-tight">
            DROPKULTURE COMMERCE OS
          </h1>
          <p className="text-xs text-[#8E8E93]">
            Real-time database administration: creator approvals, garment inventory, customer orders fulfillment, and user permissions.
          </p>
        </div>

        {/* Actions: Admin Identity, Copy Admin Link, Refresh, Sign Out */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-[#2B2B2B] text-xs font-mono-tech">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[#A6ACB4]">{currentUser.email}</span>
            </div>
          )}

          <button
            onClick={handleCopyAdminSignInLink}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-black hover:bg-[#1A1A1A] text-white text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#333333] cursor-pointer"
            title="Copy Admin Portal URL"
          >
            <Link2 className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Admin URL</span>
          </button>

          <button
            onClick={loadDatabaseData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-black hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white transition-colors border border-[#333333] cursor-pointer"
            title="Refresh Database Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-white' : ''}`} />
          </button>

          <button
            onClick={handleAdminSignOut}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-300 hover:text-red-200 text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5 transition-colors border border-red-500/30 cursor-pointer"
            title="Sign out of Administrator Session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Dynamic Database Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111111] border border-[#262626] space-y-1">
          <span className="text-[10px] sm:text-xs text-[#8E8E93] font-mono-tech uppercase">Total Platform GMV</span>
          <p className="font-mono-tech font-black text-base sm:text-2xl text-white">
            {formatPrice(totalGMVKES)}
          </p>
          <span className="text-[9px] sm:text-[11px] text-[#C0C0C0] font-mono-tech block">
            70% Platform Share: {formatPrice(platformRevenueKES)}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111111] border border-[#262626] space-y-1">
          <span className="text-[10px] sm:text-xs text-[#8E8E93] font-mono-tech uppercase">Creator Network</span>
          <p className="font-mono-tech font-black text-base sm:text-2xl text-white">
            {approvedCreatorsCount} <span className="text-xs text-[#666666] font-normal">/ {creators.length}</span>
          </p>
          <span className="text-[9px] sm:text-[11px] text-[#D9D9D9] font-mono-tech block">
            {pendingCreatorsCount} Pending
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111111] border border-[#262626] space-y-1">
          <span className="text-[10px] sm:text-xs text-[#8E8E93] font-mono-tech uppercase">Garments In Catalog</span>
          <p className="font-mono-tech font-black text-base sm:text-2xl text-white">
            {products.length}
          </p>
          <span className="text-[9px] sm:text-[11px] text-[#8E8E93] font-mono-tech block">
            {totalGarmentsUnits} In Stock
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#111111] border border-[#262626] space-y-1">
          <span className="text-[10px] sm:text-xs text-[#8E8E93] font-mono-tech uppercase">Orders Processed</span>
          <p className="font-mono-tech font-black text-base sm:text-2xl text-white">
            {orders.length}
          </p>
          <span className="text-[9px] sm:text-[11px] text-[#C0C0C0] font-mono-tech block">
            {users.length} Accounts
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222222] scrollbar-none">
        <button
          onClick={() => setActiveTab('creators')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'creators'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
              : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Creators ({creators.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
              : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Products Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
              : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Orders Pipeline ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
              : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'database'
              ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
              : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & Backup</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CREATORS & MODERATION PIPELINE */}
      {/* ===================================================================== */}
      {activeTab === 'creators' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          {(() => {
            const pendingList = creators.filter(c => c.status === 'pending');
            const approvedList = creators.filter(c => c.status === 'approved' || !c.status);
            const suspendedList = creators.filter(c => c.status === 'suspended');
            const verifiedList = creators.filter(c => c.verified);

            return (
              <div className="space-y-3">
                {/* Pending Decision Callout Banner */}
                {pendingList.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{pendingList.length} New Creator Account{pendingList.length > 1 ? 's' : ''} Awaiting Admin Decision</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-amber-500 text-black font-extrabold uppercase">
                            Action Required
                          </span>
                        </h4>
                        <p className="text-xs text-amber-200/80">
                          These creators just registered and were published to the database table. Review each storefront to decide if it should be awarded the official Verified badge or Suspended.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCreatorStatusFilter('pending')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono-tech uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
                    >
                      <span>Filter Pending ({pendingList.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Filter & Metric Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreatorStatusFilter('ALL')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      creatorStatusFilter === 'ALL'
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-[#111111] border-[#222222] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-mono-tech uppercase text-[#8E8E93]">All Accounts</span>
                    <span className="text-lg font-bold text-white font-mono-tech">{creators.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreatorStatusFilter('pending')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      creatorStatusFilter === 'pending'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-[#111111] border-[#222222] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-mono-tech uppercase text-amber-400">Pending Review</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-white font-mono-tech">{pendingList.length}</span>
                      {pendingList.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreatorStatusFilter('approved')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      creatorStatusFilter === 'approved'
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-[#111111] border-[#222222] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-mono-tech uppercase text-[#C0C0C0]">Approved / Active</span>
                    <span className="text-lg font-bold text-white font-mono-tech">{approvedList.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreatorStatusFilter('suspended')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      creatorStatusFilter === 'suspended'
                        ? 'bg-red-500/20 border-red-400 text-white'
                        : 'bg-[#111111] border-[#222222] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-mono-tech uppercase text-red-400">Suspended</span>
                    <span className="text-lg font-bold text-white font-mono-tech">{suspendedList.length}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#111111] border border-[#262626]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="text"
                  placeholder="Search creators by name, country, category..."
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <select
                value={creatorStatusFilter}
                onChange={(e) => setCreatorStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white focus:outline-none focus:border-[#C0C0C0]"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRefreshDatabase}
                className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-mono-tech flex items-center justify-center gap-1.5 transition-colors"
                title="Fetch latest creators from database table"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C0C0C0]" />
                <span className="hidden sm:inline">Sync Table</span>
              </button>

              <button
                onClick={() => setIsAddCreatorOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black text-xs font-bold font-mono-tech flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>Provision Creator</span>
              </button>
            </div>
          </div>

          {/* Creators Table/Cards */}
          <div className="space-y-3">
            {filteredCreators.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
                <Store className="w-10 h-10 text-[#666666] mx-auto" />
                <p className="text-sm font-semibold text-white">No creators matching current filters</p>
                <p className="text-xs text-[#8E8E93]">Try switching filters or register a new creator account.</p>
                <button
                  type="button"
                  onClick={() => { setCreatorStatusFilter('ALL'); setCreatorSearch(''); }}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredCreators.map((creator) => {
                const status: CreatorStatus = creator.status || 'approved';
                const isPending = status === 'pending';
                const isSuspended = status === 'suspended';

                return (
                  <div
                    key={creator.id}
                    className={`p-5 rounded-2xl bg-[#111111] border transition-all ${
                      isPending
                        ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)] bg-gradient-to-r from-[#14120B] to-[#111111]'
                        : isSuspended
                        ? 'border-red-500/30 bg-[#140D0D]'
                        : 'border-[#262626]'
                    } flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={creator.avatarUrl || creator.profile_image}
                          alt={creator.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover bg-black flex-shrink-0 border border-[#333333]"
                        />
                        {creator.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-0.5 shadow">
                            <BadgeCheck className="w-4 h-4 fill-black text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg text-white">
                            {creator.name}
                          </h3>
                          {creator.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase bg-white text-black font-extrabold shadow-sm">
                              <BadgeCheck className="w-3 h-3 text-black" />
                              <span>Verified Partner</span>
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase bg-black border border-[#333333] text-[#D9D9D9]">
                            {creator.category}
                          </span>
                          <span className="text-xs font-mono-tech text-[#8E8E93]">
                            {creator.country} {creator.flag}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8E93] font-mono-tech">
                          Slug: /{creator.slug} {creator.socialLinks?.instagram && `· IG: ${creator.socialLinks.instagram}`}
                          {creator.created_at && ` · Registered: ${new Date(creator.created_at).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-[#D9D9D9] line-clamp-1 italic">
                          "{creator.bio || creator.tagline}"
                        </p>
                      </div>
                    </div>

                    {/* Actions & Status Controls */}
                    <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#222222]">
                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono-tech uppercase font-bold mr-1 ${
                        status === 'approved' ? 'bg-white/10 text-white border border-white/20' :
                        status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                        status === 'suspended' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {status === 'pending' ? 'Pending Review' : status}
                      </span>

                      {/* --- DECISION OPTIONS FOR PENDING CREATORS --- */}
                      {isPending && (
                        <>
                          {/* Option 1: Verify & Approve in one click */}
                          <button
                            type="button"
                            onClick={() => handleApproveAndVerify(creator.id, creator.name)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black text-xs font-extrabold font-mono-tech uppercase transition-all flex items-center gap-1 shadow-sm"
                            title="Award official verified badge and approve storefront for marketplace"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                            <span>Verify & Approve</span>
                          </button>

                          {/* Option 2: Standard Approve */}
                          <button
                            type="button"
                            onClick={() => handleCreatorStatusChange(creator.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono-tech transition-colors flex items-center gap-1 border border-white/20"
                            title="Approve storefront without verified badge"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {/* Option 3: Suspend */}
                          <button
                            type="button"
                            onClick={() => handleCreatorStatusChange(creator.id, 'suspended')}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold font-mono-tech transition-colors flex items-center gap-1"
                            title="Suspend this creator account"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>Suspend</span>
                          </button>
                        </>
                      )}

                      {/* --- CONTROLS FOR APPROVED CREATORS --- */}
                      {status === 'approved' && (
                        <>
                          {/* Toggle Verified Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleCreatorVerified(creator.id, creator.verified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech border transition-colors flex items-center gap-1 ${
                              creator.verified 
                                ? 'bg-white text-black font-bold border-white' 
                                : 'bg-black border-[#333333] text-[#8E8E93] hover:text-white'
                            }`}
                            title={creator.verified ? 'Revoke verified badge' : 'Grant official verified badge'}
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>{creator.verified ? 'Verified ✓' : 'Verify'}</span>
                          </button>

                          {/* Suspend Creator */}
                          <button
                            type="button"
                            onClick={() => handleCreatorStatusChange(creator.id, 'suspended')}
                            className="px-3 py-1.5 rounded-lg bg-black hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-red-400 border border-[#333333] hover:border-red-500/40 text-xs font-bold font-mono-tech transition-colors flex items-center gap-1"
                            title="Suspend storefront"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>Suspend</span>
                          </button>
                        </>
                      )}

                      {/* --- CONTROLS FOR SUSPENDED CREATORS --- */}
                      {isSuspended && (
                        <>
                          {/* Reactivate / Approve button */}
                          <button
                            type="button"
                            onClick={() => handleCreatorStatusChange(creator.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono-tech transition-colors flex items-center gap-1 border border-white/20"
                            title="Lift suspension and approve storefront"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Reactivate / Approve</span>
                          </button>

                          {/* Toggle Verified */}
                          <button
                            type="button"
                            onClick={() => handleToggleCreatorVerified(creator.id, creator.verified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech border transition-colors flex items-center gap-1 ${
                              creator.verified 
                                ? 'bg-white text-black font-bold border-white' 
                                : 'bg-black border-[#333333] text-[#8E8E93] hover:text-white'
                            }`}
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>{creator.verified ? 'Verified ✓' : 'Verify'}</span>
                          </button>
                        </>
                      )}

                      {/* View storefront */}
                      <button
                        type="button"
                        onClick={() => navigateTo('creator', { creatorSlug: creator.slug })}
                        className="p-2 rounded-lg bg-black hover:bg-[#1A1A1A] border border-[#333333] text-[#8E8E93] hover:text-white transition-colors"
                        title="View Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* Delete creator */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCreator(creator.id, creator.name)}
                        className="p-2 rounded-lg bg-black hover:bg-red-500/20 border border-[#333333] text-[#8E8E93] hover:text-red-400 transition-colors"
                        title="Delete Creator from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PRODUCTS CATALOG & STOCK/PRICE EDITOR */}
      {/* ===================================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#111111] border border-[#262626]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <input
                  type="text"
                  placeholder="Search products by title, creator..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white focus:outline-none focus:border-[#C0C0C0]"
              >
                <option value="ALL">All Categories</option>
                <option value="HOODIES">Hoodies</option>
                <option value="TEES">Tees</option>
                <option value="CAPS">Caps</option>
                <option value="JERSEYS">Jerseys</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black text-xs font-bold font-mono-tech flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Add Garment Product</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const currentStock = p.stockCount || p.stock || 0;
              const isLive = p.status === 'active' || !p.status;

              return (
                <div key={p.id} className="p-4 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover rounded-xl bg-black flex-shrink-0 border border-[#333333]"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-tech uppercase text-[#C0C0C0] truncate">
                          {p.creatorName}
                        </span>
                        <span className={`text-[9px] font-mono-tech uppercase px-1.5 py-0.5 rounded ${
                          isLive ? 'bg-white/10 text-white border border-white/20' : 'bg-black text-[#666666] border border-[#222222]'
                        }`}>
                          {isLive ? 'LIVE' : 'DRAFT'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate">{p.name}</h4>
                      <p className="text-xs font-mono-tech text-white font-bold">{formatPrice(p.priceKES)}</p>
                      <p className="text-[11px] text-[#8E8E93] font-mono-tech">
                        Stock: <span className={currentStock < 10 ? 'text-white font-bold underline' : 'text-[#D9D9D9]'}>{currentStock} units</span>
                      </p>
                    </div>
                  </div>

                  {/* In-Place Stock & Price Controls */}
                  <div className="pt-2 border-t border-[#222222] space-y-2 text-xs font-mono-tech">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#8E8E93] text-[11px]">Stock Count:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateProductStock(p.id, Math.max(0, currentStock - 5))}
                          className="w-6 h-6 rounded bg-black hover:bg-[#1A1A1A] border border-[#333333] text-white flex items-center justify-center font-bold"
                        >
                          -5
                        </button>
                        <span className="w-10 text-center font-bold text-white">{currentStock}</span>
                        <button
                          onClick={() => handleUpdateProductStock(p.id, currentStock + 10)}
                          className="w-6 h-6 rounded bg-black hover:bg-[#1A1A1A] border border-[#333333] text-white flex items-center justify-center font-bold"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleToggleProductStatus(p.id, p.status)}
                        className="text-[11px] text-[#8E8E93] hover:text-white underline"
                      >
                        {isLive ? 'Unpublish (Draft)' : 'Publish to Store'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateTo('product', { productId: p.id })}
                          className="p-1.5 rounded bg-black hover:bg-[#1A1A1A] border border-[#333333] text-[#8E8E93] hover:text-white"
                          title="View Product Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded bg-black hover:bg-red-500/20 border border-[#333333] text-[#8E8E93] hover:text-red-400"
                          title="Delete from Database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CUSTOMER ORDERS & FULFILLMENT PIPELINE */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Paystack Gateway Integration Status Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#111111] to-[#0A0A0A] border border-[#00C3F7]/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00C3F7]/10 border border-[#00C3F7]/30 text-[#00C3F7] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-white text-sm">Paystack Payment Gateway</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono-tech font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active · Kenya Rails
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">
                  Processing M-PESA STK Push, Card 3D-Secure, and Apple Pay in KES.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tech">
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-[#333333] text-[#D9D9D9]">
                <span className="text-[#8E8E93] text-[10px] block">Public Key:</span>
                <span className="font-semibold text-white">
                  {paystackService.getPublicKey().slice(0, 10)}...{paystackService.getPublicKey().slice(-4)}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                paystackService.isLiveKey() 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {paystackService.isLiveKey() ? 'Live Mode' : 'Test Sandbox'}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#111111] border border-[#262626]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search by customer, Paystack ref, M-Pesa..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C0C0C0]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono-tech text-[#8E8E93]">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white focus:outline-none focus:border-[#C0C0C0]"
              >
                <option value="ALL">All Orders</option>
                <option value="PAID">Paid / Awaiting Processing</option>
                <option value="PROCESSING">Processing In Warehouse</option>
                <option value="SHIPPED">Dispatched / Shipped</option>
                <option value="DELIVERED">Delivered to Customer</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              return (
                <div key={order.id} className="p-5 rounded-2xl bg-[#111111] border border-[#262626] space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222222] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-tech font-bold text-sm text-white">
                          #{order.id}
                        </span>
                        <span className="text-xs text-[#8E8E93] font-mono-tech">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {order.paystackReference && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-[#00C3F7]/15 text-[#00C3F7] border border-[#00C3F7]/30">
                            PAYSTACK: {order.paystackReference}
                          </span>
                        )}
                        {!order.paystackReference && order.mpesaReceipt && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-black text-white border border-[#333333]">
                            M-PESA: {order.mpesaReceipt}
                          </span>
                        )}
                        {order.paystackChannel && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech text-[#D9D9D9] bg-black border border-[#333333]">
                            {order.paystackChannel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white">
                        {order.customerName} · <span className="text-xs font-normal text-[#8E8E93]">{order.customerEmail} · {order.customerPhone}</span>
                      </p>
                      <p className="text-xs text-[#8E8E93] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        {order.deliveryAddress}, {order.town}, {order.county}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono-tech font-bold text-base text-white">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[11px] text-[#8E8E93] font-mono-tech">
                          Includes shipping {formatPrice(order.shippingFee)}
                        </p>
                      </div>

                      {/* Status Selector Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold uppercase border border-[#333333] bg-[#1A1A1A] text-white focus:outline-none"
                      >
                        <option value="PAID">PAID</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 rounded-lg bg-black hover:bg-red-500/20 border border-[#333333] text-[#8E8E93] hover:text-red-400 transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tech">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-black border border-[#2B2B2B]">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 object-cover rounded-lg bg-zinc-900 border border-[#333333]"
                        />
                        <div>
                          <p className="font-bold text-white max-w-[160px] truncate">{item.product.name}</p>
                          <p className="text-[#8E8E93] text-[11px]">
                            Size: <span className="text-white font-bold">{item.selectedSize}</span> · Qty: <span className="text-white font-bold">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: USERS & PERMISSIONS */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#111111] border border-[#262626]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#C0C0C0]"
              />
            </div>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              {filteredUsers.length} Registered Accounts
            </span>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-[#111111] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(user.email)}`}
                      alt={user.full_name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full bg-black object-cover border border-[#333333]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{user.full_name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold bg-black border border-[#333333] text-[#D9D9D9]">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E93] font-mono-tech">{user.email} · {user.country || 'Kenya'}</p>
                    </div>
                  </div>

                  {/* Role Assignment Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono-tech text-[#8E8E93]">Role:</span>
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs text-white focus:outline-none focus:border-[#C0C0C0]"
                    >
                      <option value="customer">Collector (Customer)</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Platform Admin</option>
                    </select>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="p-1.5 rounded-lg bg-black hover:bg-red-500/20 border border-[#333333] text-[#8E8E93] hover:text-red-400"
                      title="Delete User Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: DATABASE DIAGNOSTICS & SYSTEM BACKUP */}
      {/* ===================================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#111111] border border-[#262626] space-y-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-white">
                DATABASE ARCHITECTURE & STATE
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Connected persistence layer ensuring full state synchronization across storefront, creator portal, and admin consoles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black border border-[#2B2B2B] space-y-1">
                <span className="text-[11px] font-mono-tech text-[#8E8E93]">Backend Provider</span>
                <p className="font-mono-tech font-bold text-white text-base">
                  {isSupabaseConfigured() ? 'Supabase Cloud PostgreSQL' : 'Local Persistence Engine'}
                </p>
                <p className="text-[10px] text-[#C0C0C0] font-mono-tech">
                  {isSupabaseConfigured() ? 'Live Cloud Sync' : 'Persistence active in browser'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-[#2B2B2B] space-y-1">
                <span className="text-[11px] font-mono-tech text-[#8E8E93]">Active Tables</span>
                <p className="font-mono-tech font-bold text-white text-base">
                  creators, products, collections, orders, profiles
                </p>
                <p className="text-[10px] text-[#8E8E93] font-mono-tech">
                  5 primary collections integrated
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-[#2B2B2B] space-y-1">
                <span className="text-[11px] font-mono-tech text-[#8E8E93]">Terminal Route Status</span>
                <p className="font-mono-tech font-bold text-white text-base">
                  Passkey Gate Active
                </p>
                <p className="text-[10px] text-[#8E8E93] font-mono-tech">
                  Direct: ?admin=access or footer link
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#222222]">
              <button
                type="button"
                onClick={handleRefreshDatabase}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black hover:brightness-110 text-xs font-mono-tech font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4 text-black" />
                <span>Sync Database Records</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-white hover:text-white text-xs font-mono-tech font-bold flex items-center gap-2 transition-all border border-[#333333]"
              >
                <Download className="w-4 h-4 text-[#C0C0C0]" />
                <span>Export Full Database Backup (JSON)</span>
              </button>

              <button
                onClick={handleResetDatabase}
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white text-xs font-mono-tech font-bold flex items-center gap-2 transition-colors border border-[#333333]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Tables to Factory Defaults</span>
              </button>
            </div>

            {/* Supabase PostgreSQL Status Box */}
            <div className="p-5 rounded-2xl bg-black border border-[#2B2B2B] space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C0C0C0]" />
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wide">
                  Live Supabase PostgreSQL Database Connected
                </h4>
              </div>
              <p className="text-xs text-[#A8ACB4] leading-relaxed">
                The application is configured to fetch live records directly from your Supabase PostgreSQL database tables (<code className="text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">creators</code>, <code className="text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">products</code>, <code className="text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">collections</code>, <code className="text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">orders</code>, and <code className="text-white bg-[#1A1A1A] px-1.5 py-0.5 rounded">profiles</code>). Any new garments or creators added via this console or the creator portal are persisted immediately in Supabase.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tech pt-1">
                <div className="p-3 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="text-white font-bold block mb-1">Live Database Active</span>
                  <p className="text-[#8E8E93] text-[11px]">All storefront views and queries are bound to PostgreSQL tables.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="text-white font-bold block mb-1">Real-time Order Processing</span>
                  <p className="text-[#8E8E93] text-[11px]">M-Pesa and card orders insert directly into the orders table.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="text-white font-bold block mb-1">Instant Synchronisation</span>
                  <p className="text-[#8E8E93] text-[11px]">Click "Sync Database Records" at any time to re-query the cloud database.</p>
                </div>
              </div>
            </div>

            {/* Supabase Storage (CDN & Asset Media) Activation Box */}
            <div className="p-5 rounded-2xl bg-black border border-[#2B2B2B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h4 className="font-display font-bold text-sm text-white uppercase tracking-wide">
                    Supabase Storage (CDN Media Delivery)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleActivateStorage}
                    disabled={isActivatingStorage}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black hover:brightness-110 text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isActivatingStorage ? 'animate-spin' : ''}`} />
                    <span>{isActivatingStorage ? 'Verifying Buckets...' : 'Activate & Verify Buckets'}</span>
                  </button>
                  <button
                    onClick={handleCopyStorageSQL}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#C0C0C0] hover:text-white text-xs font-mono-tech font-bold flex items-center gap-1.5 border border-[#333333] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Storage SQL</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#A8ACB4] leading-relaxed">
                Production storage engine directly hosting high-resolution images for creator profile pictures, merchandise drops, and brand storefront hero banners. Uploaded media is served via Supabase's global high-speed public CDN.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tech pt-1">
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Bucket: avatars</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">
                      {storageHealth?.buckets.find(b => b.name === 'avatars')?.ready ? 'LIVE & ACTIVE' : 'ACTIVE / READY'}
                    </span>
                  </div>
                  <p className="text-[#8E8E93] text-[11px]">
                    Stores creator portraits, brand logos, and collector profile photos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Bucket: products</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">
                      {storageHealth?.buckets.find(b => b.name === 'products')?.ready ? 'LIVE & ACTIVE' : 'ACTIVE / READY'}
                    </span>
                  </div>
                  <p className="text-[#8E8E93] text-[11px]">
                    Stores apparel merchandise photos, drop catalog images, and limited items.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Bucket: covers</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">
                      {storageHealth?.buckets.find(b => b.name === 'covers')?.ready ? 'LIVE & ACTIVE' : 'ACTIVE / READY'}
                    </span>
                  </div>
                  <p className="text-[#8E8E93] text-[11px]">
                    Stores creator storefront hero banners and capsule collection lookbooks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PROVISION NEW CREATOR */}
      {/* ===================================================================== */}
      {isAddCreatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#2B2B2B] text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="font-display font-black text-xl text-white uppercase">
                Provision New Creator
              </h3>
              <button
                onClick={() => setIsAddCreatorOpen(false)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCreatorSubmit} className="space-y-4 text-xs font-mono-tech">
              <div className="space-y-1">
                <label className="text-[#C0C0C0]">Creator / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sauti Sol, Victony, Focalistic"
                  value={newCreatorData.name}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#C0C0C0]">Category</label>
                  <select
                    value={newCreatorData.category}
                    onChange={(e) => setNewCreatorData({ ...newCreatorData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                  >
                    <option value="MUSIC">Music</option>
                    <option value="COMEDY">Comedy</option>
                    <option value="STREETWEAR">Streetwear</option>
                    <option value="PODCAST">Podcast</option>
                    <option value="SPORTS">Sports</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#C0C0C0]">Country</label>
                  <select
                    value={newCreatorData.country}
                    onChange={(e) => setNewCreatorData({ ...newCreatorData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                  >
                    <option value="Kenya">Kenya (Nairobi)</option>
                    <option value="Nigeria">Nigeria (Lagos)</option>
                    <option value="South Africa">South Africa (Joburg)</option>
                    <option value="Ghana">Ghana (Accra)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#C0C0C0]">Bio & Brand Vision</label>
                <textarea
                  rows={3}
                  placeholder="Official streetwear line representing the culture..."
                  value={newCreatorData.bio}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#C0C0C0]">Instagram Handle (optional)</label>
                <input
                  type="text"
                  placeholder="@creator_official"
                  value={newCreatorData.instagram}
                  onChange={(e) => setNewCreatorData({ ...newCreatorData, instagram: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <div className="space-y-3 pt-1">
                <ImageUploadInput
                  id="admin-new-cr-avatar"
                  label="Profile Picture / Brand Avatar"
                  sublabel="Upload directly to Supabase storage (avatars bucket)"
                  value={newCreatorData.avatarUrl}
                  onChange={(val) => setNewCreatorData({ ...newCreatorData, avatarUrl: val })}
                  aspect="square"
                  storageBucket="avatars"
                  folder="avatars"
                />

                <ImageUploadInput
                  id="admin-new-cr-banner"
                  label="Storefront Hero Banner Image"
                  sublabel="Upload wide storefront banner to Supabase storage (covers bucket)"
                  value={newCreatorData.bannerUrl}
                  onChange={(val) => setNewCreatorData({ ...newCreatorData, bannerUrl: val })}
                  aspect="banner"
                  storageBucket="covers"
                  folder="covers"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsAddCreatorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black border border-[#333333] text-[#8E8E93] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold transition-all"
                >
                  Create & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD GARMENT PRODUCT */}
      {/* ===================================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#2B2B2B] text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <h3 className="font-display font-black text-xl text-white uppercase">
                Add Garment Product
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-mono-tech">
              <div className="space-y-1">
                <label className="text-[#C0C0C0]">Garment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 'Nairobi Heavy' Boxy Cut Hoodie"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#C0C0C0]">Assigned Creator *</label>
                <select
                  required
                  value={newProductData.creatorId}
                  onChange={(e) => setNewProductData({ ...newProductData, creatorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                >
                  <option value="">Select a creator...</option>
                  {creators.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#C0C0C0]">Price (KES)</label>
                  <input
                    type="number"
                    required
                    value={newProductData.priceKES}
                    onChange={(e) => setNewProductData({ ...newProductData, priceKES: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#C0C0C0]">Category</label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                  >
                    <option value="HOODIES">Hoodies</option>
                    <option value="TEES">Tees</option>
                    <option value="CAPS">Caps</option>
                    <option value="JERSEYS">Jerseys</option>
                    <option value="ACCESSORIES">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#C0C0C0]">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProductData.stockCount}
                    onChange={(e) => setNewProductData({ ...newProductData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              <div>
                <ImageUploadInput
                  id="admin-new-product-img"
                  label="Garment Image"
                  sublabel="Upload photo directly from your device or camera"
                  value={newProductData.image}
                  onChange={(val) => setNewProductData({ ...newProductData, image: val })}
                  aspect="product"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-limited"
                  checked={newProductData.isLimitedEdition}
                  onChange={(e) => setNewProductData({ ...newProductData, isLimitedEdition: e.target.checked })}
                  className="accent-white"
                />
                <label htmlFor="chk-limited" className="text-[#D9D9D9]">
                  Mark as Limited Edition numbered drop
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black border border-[#333333] text-[#8E8E93] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold transition-all"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
