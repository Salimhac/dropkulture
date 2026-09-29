import React, { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  ArrowRight, 
  Check, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { dbService } from '../services/supabaseService';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { Product, Creator, Order } from '../types';

export const CustomerAccountPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    formatPrice, 
    navigateTo, 
    showToast,
    wishlist,
    toggleWishlist,
    followedCreators,
    toggleFollowCreator,
    addToCart,
    setIsCartOpen,
    openAuthModal,
    orders: globalOrders
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'favorites' | 'orders'>('wishlist');
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [favoriteCreatorsList, setFavoriteCreatorsList] = useState<Creator[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit profile form
  const [editName, setEditName] = useState(currentUser?.full_name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editCountry, setEditCountry] = useState(currentUser?.country || 'Kenya');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar_url || '');

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.full_name);
      setEditPhone(currentUser.phone || '');
      setEditCountry(currentUser.country || 'Kenya');
      setEditAvatar(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  // Load wishlist products
  useEffect(() => {
    async function loadData() {
      const allProducts = await dbService.getAllActiveProducts();
      setWishlistProducts(allProducts.filter((p) => wishlist.includes(p.id)));

      const approvedCreators = await dbService.getApprovedCreators();
      setFavoriteCreatorsList(approvedCreators.filter((c) => followedCreators.includes(c.slug)));

      if (currentUser?.email) {
        const userOrders = await dbService.getOrdersForCustomer(currentUser.email);
        // Combine with recent session orders if any
        const combined = [...globalOrders, ...userOrders].filter(
          (o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx
        );
        setCustomerOrders(combined);
      }
    }
    loadData();
  }, [wishlist, followedCreators, currentUser, globalOrders]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-[#111111] border border-[#2B2B2B] space-y-4">
          <div className="w-16 h-16 rounded-full bg-black border border-[#333333] flex items-center justify-center mx-auto text-[#8E8E93]">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Sign In Required</h2>
          <p className="text-sm text-[#8E8E93]">
            Sign in to access your collector dashboard, view saved favorite creators, track orders, and manage your wishlist.
          </p>
          <button
            onClick={() => openAuthModal('customer', 'login')}
            id="btn-account-signin"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-semibold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Sign In or Register
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await authService.updateProfile(currentUser.user_id || currentUser.id, {
        full_name: editName,
        phone: editPhone,
        country: editCountry,
        avatar_url: editAvatar,
      });
      setCurrentUser(updated);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'warn');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
    navigateTo('home');
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#111111] border border-[#2B2B2B] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black border border-[#333333]">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentUser.full_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {currentUser.full_name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech uppercase bg-black border border-[#333333] text-[#D9D9D9]">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-sm text-[#8E8E93] font-mono-tech">
                  {currentUser.email} · {currentUser.country || 'Kenya'} {currentUser.phone && `· ${currentUser.phone}`}
                </p>
                <p className="text-xs text-[#666666] font-mono-tech">
                  Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                id="btn-fan-cart"
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-[#1A1A1A] border border-[#2B2B2B] text-xs font-semibold text-white flex items-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>My Bag</span>
              </button>
              <button
                onClick={handleLogout}
                id="btn-fan-logout"
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-[#1A1A1A] border border-[#2B2B2B] text-xs font-semibold text-[#8E8E93] hover:text-white flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-8 mt-6 border-t border-[#222222] scrollbar-none">
            <button
              onClick={() => setActiveTab('wishlist')}
              id="tab-wishlist"
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-black' : ''}`} />
              <span>Wishlist ({wishlistProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              id="tab-favorites"
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Favorite Creators ({favoriteCreatorsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              id="tab-orders"
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Order History ({customerOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              id="tab-profile-settings"
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-md'
                  : 'bg-black text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* ----------------- TAB: WISHLIST ----------------- */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Your Saved Pieces</h3>
                <p className="text-xs text-[#8E8E93]">Exclusive creator drops and garments you've bookmarked.</p>
              </div>
              <button
                onClick={() => navigateTo('explore')}
                className="text-xs font-mono-tech text-white hover:underline flex items-center gap-1"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
                <Heart className="w-10 h-10 text-[#666666] mx-auto" />
                <h4 className="text-sm font-semibold text-[#D9D9D9]">Your wishlist is currently empty</h4>
                <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
                  Click the heart icon on any hoodie, tee, cap, or limited edition drop to save it to your account.
                </p>
                <button
                  onClick={() => navigateTo('explore')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-colors shadow-md"
                >
                  Discover Drops
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#111111] border border-[#262626] hover:border-white/30 transition-all flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => navigateTo('product', { productId: product.id })}
                      className="cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-black">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 backdrop-blur-md text-[#8E8E93] hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3.5 space-y-1">
                        <span className="text-[10px] font-mono-tech text-[#8E8E93] uppercase">
                          {product.creatorName}
                        </span>
                        <h4 className="font-semibold text-xs text-white line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs font-mono-tech font-bold text-white">
                          {formatPrice(product.priceKES)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0">
                      <button
                        onClick={() => {
                          addToCart(product, product.sizes[0] || 'M', 1);
                          showToast(`Added ${product.name} to cart`, 'success');
                        }}
                        className="w-full py-2 rounded-lg bg-black hover:bg-[#1A1A1A] border border-[#333333] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: FAVORITE CREATORS ----------------- */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">Followed Creators</h3>
                <p className="text-xs text-[#8E8E93]">Creators whose drops you receive VIP notifications for.</p>
              </div>
            </div>

            {favoriteCreatorsList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
                <Sparkles className="w-10 h-10 text-[#666666] mx-auto" />
                <h4 className="text-sm font-semibold text-[#D9D9D9]">You haven't followed any creators yet</h4>
                <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
                  Follow musicians, comedians, and cultural influencers to stay updated whenever they drop new collections.
                </p>
                <button
                  onClick={() => navigateTo('home')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-colors shadow-md"
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCreatorsList.map((creator) => (
                  <div
                    key={creator.id}
                    className="p-4 rounded-2xl bg-[#111111] border border-[#262626] hover:border-[#333333] transition-all flex items-center justify-between gap-4"
                  >
                    <div 
                      onClick={() => navigateTo('creator', { creatorSlug: creator.slug })}
                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-[#333333] flex-shrink-0">
                        <img
                          src={creator.avatarUrl || creator.profile_image}
                          alt={creator.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate hover:text-[#C0C0C0] transition-colors">
                          {creator.name}
                        </h4>
                        <p className="text-xs text-[#8E8E93] truncate">
                          {creator.category} · {creator.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('creator', { creatorSlug: creator.slug })}
                        className="p-2 rounded-lg bg-black hover:bg-[#1A1A1A] border border-[#333333] text-white text-xs transition-colors"
                        title="Visit Store"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFollowCreator(creator.slug)}
                        className="px-3 py-1.5 rounded-lg bg-black hover:bg-[#1A1A1A] border border-[#333333] text-[#8E8E93] hover:text-white text-xs font-mono-tech transition-colors"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: ORDER HISTORY ----------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Your Orders</h3>
              <p className="text-xs text-[#8E8E93]">Track past purchases, delivery addresses, and M-Pesa receipts.</p>
            </div>

            {customerOrders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
                <Package className="w-10 h-10 text-[#666666] mx-auto" />
                <h4 className="text-sm font-semibold text-[#D9D9D9]">No order history found</h4>
                <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
                  When you check out using M-Pesa or Card, your order tracking updates will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-[#111111] border border-[#262626] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tech font-bold text-white text-sm">
                            {order.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold bg-black border border-[#333333] text-white">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8E93] font-mono-tech mt-0.5">
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'} · Payment:{' '}
                          {order.paystackReference ? (
                            <span className="text-[#00C3F7] font-semibold">PAYSTACK ({order.paystackReference})</span>
                          ) : (
                            <span>{order.paymentMethod.toUpperCase()} {order.mpesaReceipt && `(${order.mpesaReceipt})`}</span>
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-[#8E8E93]">Total Paid</span>
                        <p className="font-display font-bold text-lg text-white">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-12 object-cover rounded bg-black border border-[#2B2B2B]"
                            />
                            <div>
                              <p className="font-semibold text-white">{item.product.name}</p>
                              <p className="text-[#8E8E93] font-mono-tech">
                                Size: {item.selectedSize} · Qty: {item.quantity} · Creator: {item.product.creatorName}
                              </p>
                            </div>
                          </div>
                          <p className="font-mono-tech text-white font-medium">
                            {formatPrice(item.product.priceKES * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery summary */}
                    <div className="pt-3 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8E8E93] font-mono-tech">
                      <span>Delivery: {order.deliveryAddress}, {order.town}, {order.county}</span>
                      <span className="text-white flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        <span>Verified Dispatch</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: PROFILE SETTINGS ----------------- */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto rounded-3xl bg-[#111111] border border-[#262626] p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Account Information</h3>
              <p className="text-xs text-[#8E8E93]">Manage your contact information and shipping preferences.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <ImageUploadInput
                  id="customer-profile-avatar"
                  label="Profile Picture / Brand Avatar"
                  sublabel="Upload photo directly to Supabase storage"
                  value={editAvatar}
                  onChange={(val) => setEditAvatar(val)}
                  aspect="square"
                  storageBucket="avatars"
                  folder="avatars"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-black border border-[#222222] text-[#666666] text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                  Phone (M-Pesa Checkout)
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase mb-1.5">
                  Default Shipping Country
                </label>
                <select
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
                >
                  <option value="Kenya">Kenya (🇰🇪)</option>
                  <option value="Nigeria">Nigeria (🇳🇬)</option>
                  <option value="South Africa">South Africa (🇿🇦)</option>
                  <option value="Ghana">Ghana (🇬🇭)</option>
                  <option value="Uganda">Uganda (🇺🇬)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-black" />
                <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
