import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, Loader2, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/categories';
import { dbService, CategoryDatabaseCount, DropsAvailabilitySummary } from '../services/supabaseService';
import { ProductCard } from '../components/ProductCard';
import { CreatorCard } from '../components/CreatorCard';
import { CategoryType, Product, Creator, Collection } from '../types';

export const CategoriesPage: React.FC = () => {
  const { selectedCategory, navigateTo } = useApp();
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'ALL'>(
    selectedCategory !== 'ALL' ? selectedCategory : 'MUSIC'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
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
    async function loadData() {
      setIsLoading(true);
      try {
        const [allProds, allCreators, allCols, catStats, summary] = await Promise.all([
          dbService.getAllActiveProducts(),
          dbService.getApprovedCreators(),
          dbService.getAllCollections(),
          dbService.getCategoriesWithCounts(),
          dbService.getDropsAvailabilitySummary(),
        ]);
        setProducts(allProds);
        setCreators(allCreators);
        setCollections(allCols);
        setCategoriesWithCounts(catStats);
        setDropsSummary(summary);
      } catch (err) {
        console.error('Failed to load category products/creators from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const currentCategoryInfo = CATEGORIES_LIST.find(c => c.id === activeCategory) || CATEGORIES_LIST[0];
  const activeCategoryData = categoriesWithCounts.find(c => c.id === activeCategory);

  const categoryProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => p.creatorCategory === activeCategory);

  const categoryCreators = activeCategory === 'ALL'
    ? creators
    : creators.filter(c => c.category === activeCategory);

  // Collections (drops) linked to this category via creator
  const categoryCreatorIds = new Set(
    categoryCreators.flatMap(c => [c.id, c.slug])
  );
  const categoryDrops = activeCategory === 'ALL'
    ? collections
    : collections.filter(col => categoryCreatorIds.has(col.creator_id));

  return (
    <div className="w-full min-h-screen pb-24 space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 bg-black text-white">
      {/* Category Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9] font-bold">
          <Layers className="w-3.5 h-3.5 text-white" />
          <span>CURATED CULTURAL DISCIPLINES · {dropsSummary.totalDrops} DROPS AVAILABLE IN DATABASE</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          CATEGORIES & <span className="text-metallic-silver">DISCIPLINES</span>
        </h1>

        <p className="text-sm sm:text-base text-[#D9D9D9] max-w-2xl leading-relaxed">
          From Nairobi’s gritty urban sounds to Lagos Afrobeats and South African Amapiano, explore creator merchandise by cultural discipline. Live counts and drops fetched directly from the database.
        </p>

        {/* Category Visual Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2">
          {(categoriesWithCounts.length > 0 ? categoriesWithCounts : CATEGORIES_LIST).map((cat) => {
            const dropsCount = (cat as CategoryDatabaseCount).dropsCount ?? 0;
            const prodsCount = (cat as CategoryDatabaseCount).productsCount ?? 0;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-[#1A1A1A] border-[#C0C0C0] shadow-[0_0_15px_rgba(255,255,255,0.12)]'
                    : 'bg-[#111111] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-mono-tech font-bold ${
                    isSelected ? 'text-white' : 'text-[#8E8E93]'
                  }`}>
                    {dropsCount} {dropsCount === 1 ? 'drop' : 'drops'} available
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className={`font-display font-bold text-xs uppercase leading-tight ${
                    isSelected ? 'text-white' : 'text-[#D9D9D9]'
                  }`}>
                    {cat.name}
                  </h4>
                  <span className="text-[9px] font-mono-tech text-[#8E8E93] block mt-1">
                    {prodsCount} {prodsCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Hero Card */}
      <section className="relative rounded-2xl overflow-hidden bg-black border border-[#2B2B2B] p-5 sm:p-8 flex flex-col justify-end min-h-[200px] sm:min-h-[260px] md:aspect-[21/9] shadow-2xl">
        <img
          src={currentCategoryInfo.image}
          alt={currentCategoryInfo.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter brightness-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-tech uppercase font-bold text-[#C0C0C0]">
              ACTIVE PILLAR
            </span>
            {activeCategoryData && (
              <span className="text-[11px] font-mono-tech px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold">
                {activeCategoryData.dropsCount} {activeCategoryData.dropsCount === 1 ? 'drop' : 'drops'} available · {activeCategoryData.productsCount} pieces in DB
              </span>
            )}
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase">
            {currentCategoryInfo.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#D9D9D9] max-w-xl">
            {currentCategoryInfo.description}
          </p>
        </div>
      </section>

      {/* Category Drops & Collections */}
      {categoryDrops.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-white" />
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">
                {currentCategoryInfo.name} DROPS & CAPSULES ({categoryDrops.length} AVAILABLE)
              </h3>
            </div>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              Fetched from Database
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryDrops.map((drop) => (
              <div
                key={drop.id}
                onClick={() => navigateTo('drops', { dropId: drop.id })}
                className="group relative rounded-2xl overflow-hidden bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between aspect-[4/3]"
              >
                <img
                  src={drop.cover_image}
                  alt={drop.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10 p-4 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech font-bold uppercase bg-black/80 border border-[#333333] text-white">
                    {drop.status.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech font-bold uppercase bg-white text-black">
                    Official Drop
                  </span>
                </div>

                <div className="relative z-10 p-5 space-y-1">
                  <h4 className="font-display font-bold text-lg text-white uppercase tracking-tight">
                    {drop.name}
                  </h4>
                  <p className="text-xs text-[#D9D9D9] line-clamp-1">
                    {drop.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-mono-tech text-[#C0C0C0]">
                    <span>View Drop Merchandise →</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Creators in this Category */}
      {categoryCreators.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">
              {currentCategoryInfo.name} CREATORS ({categoryCreators.length})
            </h3>
            <span className="text-xs font-mono-tech text-[#8E8E93]">
              Verified Storefronts
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>
      )}

      {/* Products in this Category */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">
            OFFICIAL {currentCategoryInfo.name} MERCHANDISE ({categoryProducts.length})
          </h3>
          <span className="text-xs font-mono-tech text-[#8E8E93]">
            Direct Creator Inventory
          </span>
        </div>
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#222222]">
            <p className="text-white text-sm font-medium">No garments published for this discipline yet.</p>
            <p className="text-xs text-[#8E8E93] mt-1">Creator drops are being prepared in the studio.</p>
          </div>
        )}
      </section>
    </div>
  );
};
