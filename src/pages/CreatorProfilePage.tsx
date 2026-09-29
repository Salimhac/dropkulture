import React, { useState, useEffect } from 'react';
import { 
  BadgeCheck, 
  Share2, 
  Instagram, 
  Youtube, 
  Twitter, 
  Music2, 
  Sparkles, 
  UserCheck, 
  UserPlus, 
  Check,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Store
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/supabaseService';
import { ProductCard } from '../components/ProductCard';
import { Creator, Product, Collection } from '../types';

export const CreatorProfilePage: React.FC = () => {
  const { activeCreatorSlug, navigateTo, isFollowingCreator,currentUser, toggleFollowCreator, showToast } = useApp();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CLOTHING' | 'ACCESSORIES' | 'LIMITED'>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic state
  const slug = activeCreatorSlug || '';
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorProducts, setCreatorProducts] = useState<Product[]>([]);
  const [creatorCollections, setCreatorCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic creator and products directly from database
  useEffect(() => {
    async function loadData() {
      if (!slug) {
        setCreator(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const found = await dbService.getCreatorBySlug(slug);
        if (found) {
          setCreator(found);
          const [prods, cols] = await Promise.all([
            dbService.getProductsByCreatorId(found.id),
            dbService.getCollectionsByCreatorId(found.id),
          ]);
          setCreatorProducts(prods);
          setCreatorCollections(cols);
        } else {
          setCreator(null);
        }
      } catch (err) {
        console.error('Error fetching creator profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const isFollowing = creator ? isFollowingCreator(creator.slug) : false;

  // Featured Collection
  const featuredCollection = creatorCollections[0];

  // Filtering
  const filteredProducts = creatorProducts.filter((product) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CLOTHING') return product.category === 'HOODIES' || product.category === 'TEES' || product.category === 'JERSEYS';
    if (activeFilter === 'ACCESSORIES') return product.category === 'CAPS' || product.category === 'ACCESSORIES' || product.category === 'POSTERS';
    if (activeFilter === 'LIMITED') return product.isLimitedEdition;
    return true;
  });

  const handleShare = () => {
    if (creator && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast(`Copied ${creator.name}'s official store link!`, 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToMerch = () => {
    const el = document.getElementById('creator-all-merchandise');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-xs font-mono-tech text-[#8E8E93] tracking-widest uppercase">Fetching Storefront from Database...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black text-white">
        <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#222222] flex items-center justify-center">
          <Store className="w-8 h-8 text-[#8E8E93]" />
        </div>
        <h2 className="font-display font-black text-2xl text-white uppercase">Creator Not Found</h2>
        <p className="text-xs text-[#8E8E93] max-w-md">
          This creator storefront does not exist in the database or has not yet been approved.
        </p>
        <button
          onClick={() => navigateTo('explore')}
          className="px-6 py-2.5 rounded-xl bg-white text-black font-mono-tech font-bold text-xs uppercase hover:bg-[#E5E5E5] transition-colors"
        >
          Explore All Creators
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-24 space-y-16 bg-black text-white">
      {/* Moderation Status Notice if suspended or pending */}
      {creator.status === 'suspended' && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-3 text-center text-xs text-red-300 font-mono-tech flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Notice: This creator storefront has been suspended by platform administration. Public order placement is temporarily restricted.</span>
        </div>
      )}

      {creator.status === 'pending' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-center text-xs text-amber-200 font-mono-tech flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Creator Storefront Status: Pending Admin Verification.</span>
        </div>
      )}

      {/* =========================================================================
          CREATOR HERO (Large black section with circular silver border)
          ========================================================================= */}
      <section className="relative w-full">
        {/* Large Banner Image */}
        <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden bg-[#111111]">
          <img
            src={creator.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
            alt={creator.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Creator Identity & Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-28 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#222222]">
            {/* Left: Avatar with Circular Silver Border */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              {/* Circular Silver Border Profile Image */}
              <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#C0C0C0] p-1 bg-black ring-4 ring-white/10 shadow-[0_0_25px_rgba(255,255,255,0.15)] flex-shrink-0">
                <img
                  src={creator.avatarUrl || creator.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt={creator.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-white text-black shadow-sm">
                    OFFICIAL STORE
                  </span>
                  <span className="text-xs font-mono-tech text-[#C0C0C0]">
                    {creator.country} {creator.flag}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight">
                    {creator.name}
                  </h1>
                  {creator.verified && (
                    <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-medium text-[#D9D9D9] max-w-xl">
                  {creator.tagline || creator.bio}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-2 sm:gap-3 pt-1 text-[#8E8E93] flex-wrap">
                  {creator.socialLinks?.instagram && (
                    <a
                      href={creator.socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-[#111111] hover:text-white border border-[#2B2B2B] hover:border-white transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {creator.socialLinks?.youtube && (
                    <a
                      href={creator.socialLinks.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-[#111111] hover:text-white border border-[#2B2B2B] hover:border-white transition-colors"
                      title="YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {creator.socialLinks?.spotify && (
                    <a
                      href={creator.socialLinks.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-[#111111] hover:text-white border border-[#2B2B2B] hover:border-white transition-colors"
                      title="Spotify"
                    >
                      <Music2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {(creator.socialLinks?.twitter || creator.socialLinks?.x) && (
                    <a
                      href={creator.socialLinks.twitter || creator.socialLinks.x}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-[#111111] hover:text-white border border-[#2B2B2B] hover:border-white transition-colors"
                      title="X / Twitter"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-full bg-[#111111] hover:text-white border border-[#2B2B2B] hover:border-white transition-colors ml-1"
                    title="Share Storefront"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={scrollToMerch}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center justify-center flex items-center"
              >
                Shop All ({creatorProducts.length})
              </button>

              {currentUser?.user_id && creator.user_id && currentUser.user_id === creator.user_id ? (
  // Owner view — show something instead of the Follow button
  <div className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#111111] border border-[#2B2B2B] text-[11px] font-mono-tech uppercase tracking-wider text-[#8E8E93] flex items-center justify-center gap-2">
    <UserCheck className="w-4 h-4 text-[#C0C0C0]" />
    <span>Your Storefront</span>
  </div>
                  ) : (
  <button
    type="button"
    onClick={() => toggleFollowCreator(creator.slug)}
    className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
      isFollowing
        ? 'bg-[#1A1A1A] text-white border-[#C0C0C0]/50'
        : 'bg-black hover:bg-[#111111] text-white border border-[#C0C0C0]/60 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
    }`}
  >
      {!currentUser ? (
    <>
      <UserPlus className="w-4 h-4 text-[#C0C0C0]" />
      <span>Sign in to Follow</span>
    </>
  ) : isFollowing ? (
    <>
      <UserCheck className="w-4 h-4 text-white" />
      <span>Following</span>
    </>
  ) : (
    <>
      <UserPlus className="w-4 h-4 text-[#C0C0C0]" />
      <span>Follow Creator</span>
    </>
  )}
</button>
)}
            </div>
          </div>

          {/* Statistics Bar (White numbers, Silver labels) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#1F1F1F]">
            <div>
              <p className="font-mono-tech font-black text-2xl sm:text-3xl text-white">
                {creatorProducts.length}
              </p>
              <p className="text-xs font-mono-tech uppercase tracking-wider text-[#C0C0C0] mt-1">
                Official Pieces
              </p>
            </div>
            <div>
              <p className="font-mono-tech font-black text-2xl sm:text-3xl text-white">
                {creatorCollections.length}
              </p>
              <p className="text-xs font-mono-tech uppercase tracking-wider text-[#C0C0C0] mt-1">
                Active Capsules
              </p>
            </div>
            <div>
              <p className="font-mono-tech font-black text-2xl sm:text-3xl text-white">
                100%
              </p>
              <p className="text-xs font-mono-tech uppercase tracking-wider text-[#C0C0C0] mt-1">
                Licensed Royalty
              </p>
            </div>
            <div>
              <p className="font-mono-tech font-black text-2xl sm:text-3xl text-white">
                NAIROBI
              </p>
              <p className="text-xs font-mono-tech uppercase tracking-wider text-[#C0C0C0] mt-1">
                Production Hub
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COLLECTIONS / CAPSULE DROP (Elegant dark cards with metallic details)
          ========================================================================= */}
      {featuredCollection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:w-1/2 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#C0C0C0] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>FEATURED CAPSULE COLLECTION</span>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                  {featuredCollection.name}
                </h2>

                <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed">
                  {featuredCollection.description}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-[#1A1A1A] text-white font-mono-tech text-xs border border-[#333333]">
                    Status: <strong className="text-white ml-1">{featuredCollection.status.toUpperCase()}</strong>
                  </span>
                  <span className="text-xs text-[#8E8E93] font-mono-tech">
                    {featuredCollection.product_ids?.length || 0} Pieces
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-1/2 aspect-video rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#262626]">
                <img
                  src={featuredCollection.cover_image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredCollection.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          ALL MERCHANDISE (Product Grid with Filters)
          ========================================================================= */}
      <section id="creator-all-merchandise" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              ALL MERCHANDISE
            </h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Official drops licensed directly by {creator.name}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Pieces' },
              { id: 'CLOTHING', label: 'Apparel' },
              { id: 'ACCESSORIES', label: 'Caps & Accessories' },
              { id: 'LIMITED', label: 'Limited Run' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-[#111111] border border-[#222222]">
            <p className="text-sm text-white font-medium">No pieces found in this category</p>
            <p className="text-xs text-[#8E8E93] mt-1">Check back soon for new drops and restocks</p>
          </div>
        )}
      </section>
    </div>
  );
};
