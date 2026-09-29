import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Flame, Clock, Award, Store, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreatorCard } from '../components/CreatorCard';
import { ProductCard } from '../components/ProductCard';
import { dbService } from '../services/supabaseService';
import { Creator, Product, Collection } from '../types';

export const ExplorePage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'KENYA' | 'CREATORS' | 'TRENDING_PRODUCTS' | 'DROPS' | 'LIMITED'>('ALL');

  const [approvedCreators, setApprovedCreators] = useState<Creator[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dbCollections, setDbCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExploreData() {
      setLoading(true);
      try {
        const [creators, prods, cols] = await Promise.all([
          dbService.getApprovedCreators(),
          dbService.getAllActiveProducts(),
          dbService.getAllCollections(),
        ]);
        // Sort Kenya creators first
        const sorted = [...creators].sort((a, b) => {
          if (a.country === 'Kenya' && b.country !== 'Kenya') return -1;
          if (a.country !== 'Kenya' && b.country === 'Kenya') return 1;
          return 0;
        });
        setApprovedCreators(sorted);
        setAllProducts(prods);
        setDbCollections(cols);
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExploreData();
  }, []);

  const kenyaCreators = approvedCreators.filter(c => c.country === 'Kenya');
  const trendingCreators = approvedCreators.slice(0, 4);
  const newCreators = approvedCreators.slice(4);
  
  const trendingProducts = allProducts.filter(p => p.isTrending || p.rating >= 4.8);
  const limitedEditions = allProducts.filter(p => p.isLimitedEdition);

  return (
    <div className="w-full min-h-screen pb-24 space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 bg-black text-white">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9] font-bold">
          <Compass className="w-3.5 h-3.5 text-white" />
          <span>AFRICAN CREATOR DISCOVERY HUB</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          EXPLORE THE <span className="text-metallic-silver">CULTURE</span>
        </h1>

        <p className="text-sm sm:text-base text-[#D9D9D9] max-w-2xl leading-relaxed">
          Discover rising artists, viral comedians, sports legends, and exclusive merch drops across the African continent.
        </p>

        {/* Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'ALL', label: 'All Discovery' },
            { id: 'KENYA', label: `🇰🇪 Kenya Creators (${kenyaCreators.length})` },
            { id: 'CREATORS', label: 'All Creators' },
            { id: 'TRENDING_PRODUCTS', label: 'Trending Merch' },
            { id: 'DROPS', label: dbCollections.length > 0 ? `Drops & Capsules (${dbCollections.length})` : 'Popular Collections' },
            { id: 'LIMITED', label: 'Limited Editions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono-tech font-bold uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 0: KENYA CREATORS SPOTLIGHT */}
      {activeTab === 'KENYA' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                🇰🇪 KENYA CREATOR SPOTLIGHT
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-emerald-400 font-semibold">
              Dispatched from Nairobi Hub
            </span>
          </div>

          {kenyaCreators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kenyaCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
              <Store className="w-7 h-7 text-[#8E8E93] mx-auto" />
              <p className="text-white text-sm">No creators registered yet.</p>
              <p className="text-xs text-[#8E8E93]">New creators will appear here as soon as they are approved.</p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 1: TRENDING CREATORS */}
      {(activeTab === 'ALL' || activeTab === 'CREATORS') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                TRENDING CREATORS
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              High Community Momentum
            </span>
          </div>

          {trendingCreators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
              <Store className="w-7 h-7 text-[#8E8E93] mx-auto" />
              <p className="text-white text-sm">No creators in database yet.</p>
              <p className="text-xs text-[#8E8E93]">Approved creators will be featured here.</p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: NEW & SPOTLIGHT CREATORS */}
      {(activeTab === 'ALL' || activeTab === 'CREATORS') && newCreators.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                NEW & SPOTLIGHT CREATORS
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              Fresh Drops
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: TRENDING PRODUCTS */}
      {(activeTab === 'ALL' || activeTab === 'TRENDING_PRODUCTS') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-white" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                TRENDING MERCHANDISE
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              Top Selling Right Now
            </span>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
              <Package className="w-7 h-7 text-[#8E8E93] mx-auto" />
              <p className="text-white text-sm">No trending garments currently available.</p>
              <p className="text-xs text-[#8E8E93]">Active releases from creators will be displayed here.</p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 4: POPULAR COLLECTIONS & DROPS */}
      {(activeTab === 'ALL' || activeTab === 'DROPS') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                POPULAR COLLECTIONS & DROPS ({dbCollections.length} AVAILABLE)
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-[#C0C0C0]">
              {dbCollections.length} Drops in Database
            </span>
          </div>

          {dbCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbCollections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => navigateTo('drops', { dropId: col.id })}
                  className="group relative rounded-2xl overflow-hidden bg-black border border-[#2B2B2B] hover:border-[#C0C0C0]/50 p-6 flex flex-col justify-between aspect-[16/9] cursor-pointer transition-all shadow-xl"
                >
                  <img
                    src={col.cover_image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80'}
                    alt={col.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono-tech text-white uppercase font-bold border border-white/10">
                      Official Collection
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white text-black text-[10px] font-mono-tech uppercase font-bold">
                      {col.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h3 className="font-display font-bold text-2xl text-white uppercase">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#D9D9D9] line-clamp-1">{col.description}</p>
                    <p className="text-xs font-mono-tech text-white font-bold uppercase pt-1 group-hover:translate-x-1 transition-transform">
                      Explore Drop →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#222222] text-center space-y-2">
              <p className="text-white text-sm">No drop collections in database yet.</p>
              <p className="text-xs text-[#8E8E93]">New capsule drops will be published here.</p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 5: LIMITED EDITIONS */}
      {(activeTab === 'ALL' || activeTab === 'LIMITED') && limitedEditions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                LIMITED EDITIONS
              </h2>
            </div>
            <span className="text-xs font-mono-tech text-[#C0C0C0]">
              Low Stock Allocation
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {limitedEditions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
