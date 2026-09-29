import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles, Flame, ShieldCheck, ChevronRight, Bell, Zap, Store, Truck, MapPin, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/categories';
import { CreatorCard } from '../components/CreatorCard';
import { ProductCard } from '../components/ProductCard';
import { CountdownTimer } from '../components/CountdownTimer';
import { dbService, CategoryDatabaseCount, DropsAvailabilitySummary } from '../services/supabaseService';
import { Creator, Product, Collection } from '../types';

export const HomePage: React.FC = () => {
  const { navigateTo, setIsSearchOpen, setNotifyDrop, formatPrice } = useApp();

  // Animated search suggestions focusing on official creator merchandise & streetwear
  const SEARCH_SUGGESTIONS = [
    'Search official creator streetwear, capsules & drops...',
    'Search 450 GSM heavyweight French Terry hoodies...',
    'Search limited edition drops & serialized merchandise...',
    'Search graphic tees, oversized fleeces & trucker caps...',
    'Search verified creator storefronts in Kenya...',
  ];

  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Dynamic live database data
  const [approvedCreators, setApprovedCreators] = useState<Creator[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbCollections, setDbCollections] = useState<Collection[]>([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<CategoryDatabaseCount[]>([]);
  const [dropsSummary, setDropsSummary] = useState<DropsAvailabilitySummary>({
    totalDrops: 0,
    liveDrops: 0,
    upcomingDrops: 0,
    sellingFastDrops: 0,
    soldOutDrops: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDynamicContent() {
      setIsLoading(true);
      try {
        const [creators, products, collections, catStats, summary] = await Promise.all([
          dbService.getApprovedCreators(),
          dbService.getAllActiveProducts(),
          dbService.getAllCollections(),
          dbService.getCategoriesWithCounts(),
          dbService.getDropsAvailabilitySummary(),
        ]);
        setApprovedCreators(creators);
        setDbProducts(products);
        setDbCollections(collections);
        setCategoriesWithCounts(catStats);
        setDropsSummary(summary);
      } catch (err) {
        console.error('Error fetching live home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDynamicContent();
  }, []);

  useEffect(() => {
    const currentFullText = SEARCH_SUGGESTIONS[suggestionIndex];
    const typingSpeed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
        if (displayText === currentFullText) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, suggestionIndex]);

  // Featured drops & creators from database
  const featuredCreators = approvedCreators.slice(0, 4);
  const trendingDrops = dbCollections.slice(0, 3);
  const limitedDrop = dbCollections.length > 0 ? {
    id: dbCollections[0].id,
    title: dbCollections[0].name,
    collectionName: dbCollections[0].name,
    coverImage: dbCollections[0].cover_image,
    status: dbCollections[0].status.toUpperCase(),
    productCount: dbCollections[0].product_ids?.length || 0,
    countdownTargetDate: dbCollections[0].release_date || new Date(Date.now() + 86400000 * 3).toISOString(),
  } : null;
  
  // Filter new arrivals from database
  const filteredProducts = activeCategoryFilter === 'ALL' 
    ? dbProducts.slice(0, 8)
    : dbProducts.filter(p => p.creatorCategory === activeCategoryFilter || p.category === activeCategoryFilter);

  return (
    <div className="w-full min-h-screen space-y-24 sm:space-y-32 pb-24 bg-black text-white">
      {/* =========================================================================
          HERO SECTION (Deep Black, Polished Metal Lighting, Metallic Silver Gradient)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[#1A1A1A]">
        {/* Polished Metal Surface Lighting Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-white/10 via-[#C0C0C0]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[300px] bg-white/[0.04] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-[350px] h-[300px] bg-[#C0C0C0]/[0.06] blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech tracking-wider text-[#D9D9D9] mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="uppercase text-[11px] font-bold text-white tracking-widest">🇰🇪 KENYA-FIRST CREATOR COMMERCE · WORLDWIDE SOON</span>
          </div>

          {/* Main Headline with Brushed Metallic Gradient */}
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase max-w-5xl leading-[1.02] sm:leading-[0.98] drop-shadow-lg break-words" style={{ textWrap: 'balance' }}>
            DISCOVER OFFICIAL MERCHANDISE <br className="hidden sm:inline" />
            <span className="text-metallic-silver font-black">
              FROM KENYA'S TOP CREATORS.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[#D9D9D9] font-light max-w-2xl leading-relaxed px-2">
            The brands behind Nairobi's cultural vanguard. Direct capsule collections, 450 GSM heavyweight streetwear, and limited edition drops delivered across all 47 counties with instant M-Pesa checkout.
          </p>

          {/* PRIMARY SEARCH BAR (Dark Graphite, Metallic Silver Border, Glow on focus) */}
          <div className="w-full max-w-2xl mt-8 sm:mt-10 px-1">
            <div
              id="hero-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="group relative flex items-center bg-[#1A1A1A] hover:bg-[#202020] border border-[#C0C0C0]/40 hover:border-white rounded-2xl p-2.5 sm:p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-white to-[#C0C0C0] text-black flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>

              <div className="flex-1 min-w-0 ml-2.5 sm:ml-3.5 text-left overflow-hidden">
                <span className="text-xs sm:text-base text-white font-medium truncate block">
                  {displayText}
                  <span className="inline-block w-1.5 h-3.5 sm:h-4 bg-white ml-0.5 animate-pulse align-middle" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono-tech text-[#8E8E93] uppercase tracking-wider block mt-0.5 truncate">
                  Search Nairobi creators, official streetwear drops & capsules
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black border border-[#333333] group-hover:border-[#C0C0C0]/60 text-xs font-mono-tech text-[#D9D9D9] group-hover:text-white transition-colors flex-shrink-0">
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C0C0C0]" />
              </div>
            </div>

            {/* Quick Country/Category Recommendations */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[11px] sm:text-xs">
              <span className="text-[#8E8E93] font-mono-tech uppercase text-[10px] sm:text-[11px]">
                {approvedCreators.length > 0 ? 'Featured Creators:' : 'Top Disciplines:'}
              </span>
              {approvedCreators.length > 0 ? (
                approvedCreators.slice(0, 5).map((creator) => (
                  <button
                    key={creator.id}
                    type="button"
                    onClick={() => navigateTo('creator', { creatorSlug: creator.slug })}
                    className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-[#D9D9D9] hover:text-white border border-[#262626] hover:border-[#C0C0C0]/40 transition-colors"
                  >
                    {creator.country === 'Kenya' ? '🇰🇪 ' : ''}{creator.name}
                  </button>
                ))
              ) : (
                ['MUSIC', 'COMEDY', 'SPORTS', 'FASHION', 'CONTENT CREATORS'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => navigateTo('categories', { category: cat as any })}
                    className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-[#D9D9D9] hover:text-white border border-[#262626] hover:border-[#C0C0C0]/40 transition-colors"
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Metrics / Assurance Badges - Focused on Kenya */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-[#1F1F1F] w-full max-w-3xl text-center">
            <div className="p-2">
              <p className="font-mono-tech font-black text-lg sm:text-2xl text-white">47 COUNTIES</p>
              <p className="text-[10px] sm:text-[11px] text-[#A8ACB4] uppercase tracking-wider font-medium mt-0.5">Delivered Countrywide</p>
            </div>
            <div className="p-2">
              <p className="font-mono-tech font-black text-lg sm:text-2xl text-white">M-PESA</p>
              <p className="text-[10px] sm:text-[11px] text-[#A8ACB4] uppercase tracking-wider font-medium mt-0.5">Instant STK Push</p>
            </div>
            <div className="p-2">
              <p className="font-mono-tech font-black text-lg sm:text-2xl text-[#C0C0C0]">NAIROBI HQ</p>
              <p className="text-[10px] sm:text-[11px] text-[#A8ACB4] uppercase tracking-wider font-medium mt-0.5">450 GSM French Terry</p>
            </div>
            <div className="p-2">
              <p className="font-mono-tech font-black text-lg sm:text-2xl text-white">GLOBAL SOON</p>
              <p className="text-[10px] sm:text-[11px] text-[#A8ACB4] uppercase tracking-wider font-medium mt-0.5">Phase 2 Worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED CREATORS (Dark Charcoal, Thin Metallic Silver Border, Silver Glow)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>THE ARCHIVE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              DISCOVER CREATORS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('explore')}
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider font-semibold text-[#D9D9D9] hover:text-white transition-colors"
          >
            <span>View All Creators ({approvedCreators.length})</span>
            <ChevronRight className="w-4 h-4 text-[#C0C0C0]" />
          </button>
        </div>

        {/* Editorial Creator Cards Grid */}
        {featuredCreators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-3">
            <Store className="w-8 h-8 text-[#8E8E93] mx-auto" />
            <p className="text-white font-medium text-sm">No creators live in database yet.</p>
            <p className="text-xs text-[#8E8E93]">New creator storefronts will appear here once approved in Supabase.</p>
          </div>
        )}
      </section>

      {/* =========================================================================
          TRENDING DROPS (Luxury Capsules & Editorial Posters)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider mb-1.5">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>LIMITED CAPSULES · {dbCollections.length} DROPS AVAILABLE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              TRENDING DROPS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('drops')}
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider font-semibold text-[#D9D9D9] hover:text-white transition-colors"
          >
            <span>Explore All Drops ({dbCollections.length} Available)</span>
            <ChevronRight className="w-4 h-4 text-[#C0C0C0]" />
          </button>
        </div>

        {/* Big visual campaign cards with metallic details */}
        {trendingDrops.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {trendingDrops.map((drop) => {
              const coverImg = drop.cover_image || (drop as any).coverImage || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80';
              const title = drop.name || (drop as any).title || 'Limited Drop';
              return (
                <div
                  key={drop.id}
                  onClick={() => navigateTo('drops', { dropId: drop.id })}
                  className="group relative rounded-2xl overflow-hidden bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all duration-500 cursor-pointer flex flex-col justify-between aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]"
                >
                  <img
                    src={coverImg}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 opacity-95" />

                  <div className="relative z-10 p-5 flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#333333] text-[11px] font-mono-tech uppercase font-bold text-white">
                      Official Drop
                    </span>

                    <span className="px-2.5 py-1 rounded text-[10px] font-mono-tech uppercase font-bold bg-white text-black shadow-sm">
                      {drop.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 p-6 flex flex-col justify-end space-y-2">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                      {title}
                    </h3>

                    <p className="text-xs text-[#D9D9D9] line-clamp-2 leading-relaxed">
                      {drop.description}
                    </p>

                    <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-xs font-bold text-white group-hover:text-white transition-colors">
                      <span className="tracking-wider uppercase">Shop Drop →</span>
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                        <ArrowRight className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
            <p className="text-white font-medium text-sm">No drop campaigns registered yet.</p>
            <p className="text-xs text-[#8E8E93]">New limited release capsules will be announced here.</p>
          </div>
        )}
      </section>

      {/* =========================================================================
          CURATED PILLARS & CATEGORIES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider mb-1.5">
              <span>CURATED PILLARS · {dbCollections.length} DROPS AVAILABLE IN DATABASE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              CATEGORIES
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('categories')}
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider font-semibold text-[#D9D9D9] hover:text-white transition-colors"
          >
            <span>Explore All Disciplines</span>
            <ChevronRight className="w-4 h-4 text-[#C0C0C0]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {(categoriesWithCounts.length > 0 ? categoriesWithCounts : CATEGORIES_LIST).map((cat) => {
            const dropsCount = (cat as CategoryDatabaseCount).dropsCount ?? 0;
            return (
              <div
                key={cat.id}
                onClick={() => navigateTo('categories', { category: cat.id })}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/60 transition-all duration-300 cursor-pointer p-3 flex flex-col justify-between"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-45 group-hover:brightness-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10 flex justify-end">
                  <span className="text-[10px] font-mono-tech text-white font-bold px-2 py-0.5 rounded bg-black/80 border border-[#333333] shadow-sm">
                    {dropsCount} {dropsCount === 1 ? 'drop' : 'drops'}
                  </span>
                </div>

                <div className="relative z-10">
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-[#D9D9D9] transition-colors leading-tight">
                    {cat.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          NEW ARRIVALS (Product Marketplace Grid)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider mb-1.5">
              <span>FRESH FROM NAIROBI & BEYOND</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              NEW ARRIVALS
            </h2>
          </div>

          {/* Quick Filter buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'MUSIC', 'COMEDY', 'SPORTS', 'HOODIES', 'TEES'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCategoryFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-semibold transition-all whitespace-nowrap ${
                  activeCategoryFilter === tab
                    ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-[#111111] text-[#A8ACB4] hover:text-white border border-[#222222]'
                }`}
              >
                {tab}
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
          <div className="p-12 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
            <p className="text-white font-medium text-sm">No live garments published in database.</p>
            <p className="text-xs text-[#8E8E93]">New apparel drops are being prepared by creators.</p>
          </div>
        )}
      </section>

      {/* =========================================================================
          HYPER-LIMITED DROP SECTION ("IF YOU KNOW, YOU KNOW" WITH COUNTDOWN)
          ========================================================================= */}
      {limitedDrop && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161616] via-[#111111] to-black border border-[#2A2A2A] p-6 sm:p-10 lg:p-12 shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
            {/* Subtle metallic shine */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.04] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-[#3A3A3A] text-xs font-mono-tech text-white font-bold">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>HYPER-LIMITED RELEASE</span>
                </div>

                <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
                  IF YOU KNOW, YOU KNOW.
                </h2>

                <p className="text-sm sm:text-base text-[#D9D9D9] max-w-lg leading-relaxed">
                  Limited quantities. Once they're gone, they're gone. Every item features an NFC-verified digital certificate of authenticity and custom numbered serial.
                </p>

                <div className="pt-2">
                  <span className="text-xs font-mono-tech text-[#8E8E93] uppercase tracking-wider block mb-2 font-medium">
                    Drop Window Closes In:
                  </span>
                  <CountdownTimer targetDate={limitedDrop.countdownTargetDate} />
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNotifyDrop(limitedDrop as any)}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-95"
                  >
                    <Bell className="w-4 h-4 text-black" />
                    <span>Notify Me Before Sellout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('drops', { dropId: limitedDrop.id })}
                    className="px-6 py-3.5 rounded-xl bg-black border border-[#C0C0C0]/50 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Explore Drop Lineup
                  </button>
                </div>
              </div>

              {/* Right Product Preview Box */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden bg-black border border-[#2B2B2B] p-4 group">
                  <img
                    src={limitedDrop.coverImage}
                    alt={limitedDrop.title}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{limitedDrop.title}</h4>
                      <p className="text-xs text-[#8E8E93]">{limitedDrop.collectionName} · {limitedDrop.productCount} Items</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1A1A1A] text-white font-mono-tech text-xs font-bold border border-[#333333]">
                      {limitedDrop.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          KENYA-FIRST LOGISTICS & DELIVERY NETWORK
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#141414] to-[#0A0A0A] border border-[#262626] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Subtle green ambient light reflecting Kenya's speed and reliability */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/[0.04] blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#222222]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono-tech text-emerald-400 font-bold mb-3">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>CENTRALIZED NAIROBI FULFILLMENT HUB</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                DELIVERING ACROSS ALL 47 COUNTIES
              </h2>
              <p className="text-xs sm:text-sm text-[#8E8E93] mt-2 max-w-xl leading-relaxed">
                Every hoodie, tee, and cap is manufactured, screen-printed, and dispatched directly from our Nairobi hub. We ensure fast, reliable doorstep and parcel delivery across Kenya with worldwide shipping coming in Phase 2.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-black border border-[#333333] text-left">
                <span className="text-[10px] font-mono-tech text-[#8E8E93] uppercase block">Global Diaspora:</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span>Phase 2 Worldwide</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nairobi Same-Day */}
            <div className="p-6 rounded-2xl bg-black/60 border border-[#222222] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono-tech font-bold text-sm">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  Nairobi Express
                </h3>
                <span className="text-xs font-mono-tech text-emerald-400 font-bold block mt-0.5">
                  Same-Day & 24hr Rider Delivery
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Direct motorcycle rider dispatch across Westlands, Kilimani, Karen, CBD, Roysambu, South B/C, Thika Road, Eastlands, and Ngong Road.
              </p>
            </div>

            {/* Rest of Kenya 47 Counties */}
            <div className="p-6 rounded-2xl bg-black/60 border border-[#222222] hover:border-white/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-mono-tech font-bold text-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  All 47 Counties
                </h3>
                <span className="text-xs font-mono-tech text-white font-bold block mt-0.5">
                  24–48hr Countrywide Dispatch
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Courier parcel delivery to Mombasa, Kisumu, Nakuru, Eldoret, Kisii, Machakos, Nyeri, Meru, and all Kenyan towns via Fargo Courier & G4S.
              </p>
            </div>

            {/* Worldwide Coming Soon */}
            <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#444444] transition-all space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#C0C0C0] flex items-center justify-center font-mono-tech font-bold text-sm">
                <Globe className="w-5 h-5 text-[#C0C0C0]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-white uppercase">
                    Worldwide Shipping
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono-tech bg-white/10 text-[#C0C0C0] uppercase font-bold">
                    Phase 2
                  </span>
                </div>
                <span className="text-xs font-mono-tech text-[#8E8E93] font-bold block mt-0.5">
                  International Diaspora Drops
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Are you in the US, UK, Europe, or UAE? We are expanding our international logistics pipeline. Diaspora fans can preview collections and get notified the moment global shipping unlocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (Three Sophisticated Editorial Steps)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold tracking-widest">
            THE PLATFORM ARCHITECTURE
          </span>
          <h2 className="font-display font-bold text-3xl text-white uppercase tracking-tight mt-1">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/40 transition-all space-y-3">
            <span className="font-mono-tech text-2xl font-black text-white">01</span>
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
              DISCOVER
            </h3>
            <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed">
              Find verified creators across African music, comedy, sports, gaming, and cultural storytelling.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/40 transition-all space-y-3">
            <span className="font-mono-tech text-2xl font-black text-white">02</span>
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
              SHOP
            </h3>
            <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed">
              Explore official collections, heavyweight hoodies, and limited drops with seamless M-Pesa payments.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/40 transition-all space-y-3">
            <span className="font-mono-tech text-2xl font-black text-white">03</span>
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-wide">
              REPRESENT
            </h3>
            <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed">
              Wear and support the people you love. Direct royalties flow transparently back to Africa’s creators.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOR CREATORS SECTION (Technology & Manufacturing Infrastructure)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#2B2B2B] p-8 sm:p-12">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold tracking-widest">
              INFRASTRUCTURE FOR CREATORS
            </span>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              YOUR AUDIENCE IS MORE THAN AN AUDIENCE.
            </h2>

            <p className="text-sm sm:text-base text-[#D9D9D9] leading-relaxed font-light">
              Build a brand around your influence. We provide the technology, manufacturing, and logistics infrastructure to help you launch merchandise and sell directly to your fans.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigateTo('become-a-creator')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-bold text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Build Your Store
              </button>
              <button
                type="button"
                onClick={() => navigateTo('about')}
                className="px-6 py-3.5 rounded-xl bg-black hover:bg-[#1A1A1A] text-white border border-[#C0C0C0]/50 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Learn Our Model
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
