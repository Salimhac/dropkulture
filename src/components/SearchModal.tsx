import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, User, ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_LIST } from '../data/categories';
import { dbService, CategoryDatabaseCount } from '../services/supabaseService';
import { Creator, Product, Collection } from '../types';
import { Layers } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigateTo, formatPrice } = useApp();
  const [query, setQuery] = useState('');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<CategoryDatabaseCount[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedKeywords = creators.length > 0
    ? [...creators.slice(0, 3).map(c => c.name), 'Hoodies', 'Graphic Tees', 'Jerseys']
    : ['Hoodies', 'Graphic Tees', 'Heavyweight Fleeces', 'Vintage Jerseys', 'Trucker Caps'];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';

      // Load database entities
      Promise.all([
        dbService.getApprovedCreators(),
        dbService.getAllActiveProducts(),
        dbService.getAllCollections(),
        dbService.getCategoriesWithCounts(),
      ]).then(([c, p, col, cats]) => {
        setCreators(c);
        setProducts(p);
        setCollections(col);
        setCategories(cats);
      }).catch(err => console.error('Search db load error:', err));
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSearchOpen]);

  const cleanQuery = query.trim().toLowerCase();

  // Instant filtering against live database
  const matchingCreators = cleanQuery
    ? creators.filter(c => 
        c.name.toLowerCase().includes(cleanQuery) || 
        c.category.toLowerCase().includes(cleanQuery) ||
        c.country.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingProducts = cleanQuery
    ? products.filter(p => 
        p.name.toLowerCase().includes(cleanQuery) ||
        (p.creatorName && p.creatorName.toLowerCase().includes(cleanQuery)) ||
        p.category.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingDrops = cleanQuery
    ? collections.filter(d => 
        d.name.toLowerCase().includes(cleanQuery) ||
        (d.description && d.description.toLowerCase().includes(cleanQuery))
      ).slice(0, 3)
    : [];

  const matchingCategories = cleanQuery
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleClose();
      navigateTo('search', { query: query.trim() });
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-3xl mx-auto px-4 pt-6 sm:pt-16 flex flex-col flex-1 pb-10">
        {/* Search Input Bar (Dark graphite background, Metallic silver border & glow, White text, Soft silver placeholder) */}
        <div className="relative flex items-center bg-[#1A1A1A] border border-[#C0C0C0]/40 rounded-2xl p-2 sm:p-3 shadow-2xl focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 focus-within:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#C0C0C0] ml-2" />
          <form onSubmit={handleSearchSubmit} className="flex-1 mx-3">
            <input
              ref={inputRef}
              id="search-overlay-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, pieces, drops, collections..."
              className="w-full bg-transparent text-white placeholder-[#8E8E93] text-base sm:text-lg focus:outline-none"
            />
          </form>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-2.5 py-1 text-xs font-mono-tech text-[#A8ACB4] hover:text-white border border-[#333333] rounded-md transition-colors"
            >
              <span className="hidden sm:inline">ESC</span>
              <span className="sm:hidden">Close</span>
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        {!cleanQuery && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93] uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Popular Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-[#222222] text-[#D9D9D9] hover:text-white border border-[#2B2B2B] hover:border-[#C0C0C0]/40 text-xs font-medium transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Area */}
        {cleanQuery && (
          <div className="mt-6 flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Creators Matching */}
            {matchingCreators.length > 0 && (
              <div>
                <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#8E8E93] mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span>Creators</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingCreators.map(creator => (
                    <div
                      key={creator.id}
                      onClick={() => {
                        handleClose();
                        navigateTo('creator', { creatorSlug: creator.slug });
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 hover:bg-[#161616] cursor-pointer transition-all"
                    >
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#333333]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{creator.name}</p>
                        <p className="text-xs text-[#8E8E93] truncate">{creator.category} · {creator.country}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C0C0C0]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Matching */}
            {matchingProducts.length > 0 && (
              <div>
                <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#8E8E93] mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span>Products</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        handleClose();
                        navigateTo('product', { productId: product.id });
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 hover:bg-[#161616] cursor-pointer transition-all"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 rounded-lg object-cover bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{product.name}</p>
                        <p className="text-xs text-[#8E8E93] truncate">{product.creatorName}</p>
                        <p className="text-xs font-mono-tech text-white font-bold mt-0.5">{formatPrice(product.priceKES)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C0C0C0]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drops / Collections Matching */}
            {matchingDrops.length > 0 && (
              <div>
                <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#8E8E93] mb-3 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>Drops & Capsules</span>
                </h4>
                <div className="space-y-2">
                  {matchingDrops.map(drop => (
                    <div
                      key={drop.id}
                      onClick={() => {
                        handleClose();
                        navigateTo('drops', { dropId: drop.id });
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 hover:bg-[#161616] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={(drop as any).coverImage || drop.cover_image}
                          alt={(drop as any).title || drop.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{(drop as any).title || drop.name}</p>
                          <p className="text-xs text-[#8E8E93]">{drop.description?.slice(0, 45)}...</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-tech uppercase font-bold text-black px-2.5 py-0.5 rounded bg-gradient-to-r from-white to-[#C0C0C0]">
                        {drop.status?.replace('_', ' ') || 'LIVE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Matching */}
            {matchingCategories.length > 0 && (
              <div>
                <h4 className="text-xs font-mono-tech uppercase tracking-wider text-[#8E8E93] mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#C0C0C0]" />
                  <span>Disciplines & Categories</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {matchingCategories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        handleClose();
                        navigateTo('categories', { category: cat.id });
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 hover:bg-[#161616] cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-bold text-xs uppercase text-white">{cat.name}</p>
                        <p className="text-[10px] font-mono-tech text-[#8E8E93] mt-0.5">
                          {cat.dropsCount} {cat.dropsCount === 1 ? 'drop' : 'drops'} available
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C0C0C0]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zero Results State */}
            {matchingCreators.length === 0 && matchingProducts.length === 0 && matchingDrops.length === 0 && matchingCategories.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-base text-white font-medium">No results found for "{query}"</p>
                <p className="text-xs text-[#8E8E93] mt-1">Try searching for creator names, streetwear pieces, or drop collections</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
