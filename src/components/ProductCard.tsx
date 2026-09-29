import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, navigateTo, toggleWishlist, isWishlisted, setQuickViewProduct, addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorite = isWishlisted(product.id);

  const handleCardClick = () => {
    navigateTo('product', { productId: product.id });
  };

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, size, 1);
    setShowQuickSizes(false);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#C0C0C0]/60 hover:shadow-[0_0_25px_rgba(192,192,192,0.12)] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickSizes(false);
      }}
      onClick={handleCardClick}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#111111]">
        <img
          src={product.images?.[0] || (product as any).image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Secondary image on hover if available */}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 pointer-events-none" />

        {/* Badges top left (Brushed silver effect for limited edition) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isLimitedEdition && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#D9D9D9] via-white to-[#A8A8A8] text-black shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              Limited Edition
            </span>
          )}
          {product.isNewArrival && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md text-[#D9D9D9] border border-[#333333]">
              New Drop
            </span>
          )}
        </div>

        {/* Action icons top right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            id={`wishlist-btn-${product.id}`}
            type="button"
            aria-label="Wishlist"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'bg-black/60 text-[#D9D9D9] hover:bg-black hover:text-white border border-[#333333]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            id={`quick-view-btn-${product.id}`}
            type="button"
            aria-label="Quick View"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/60 text-[#D9D9D9] hover:bg-black hover:text-white backdrop-blur-md border border-[#333333] transition-all opacity-0 group-hover:opacity-100"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Creator Pill bottom left */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            navigateTo('creator', { creatorSlug: product.creatorSlug });
          }}
          className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#333333] hover:border-[#C0C0C0]/60 transition-all cursor-pointer max-w-[80%]"
        >
          <img
            src={product.creatorAvatar}
            alt={product.creatorName}
            referrerPolicy="no-referrer"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover border border-[#C0C0C0]/30 flex-shrink-0"
          />
          <span className="text-[10px] sm:text-[11px] font-medium text-[#D9D9D9] hover:text-white tracking-wide truncate">
            {product.creatorName}
          </span>
        </div>

        {/* Quick Add Overlay on bottom */}
        {showQuickSizes ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-2 bottom-2 p-2 bg-[#141414]/95 backdrop-blur-xl border border-[#333333] rounded-lg z-20 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between text-[11px] text-[#A8ACB4] font-medium px-1">
              <span>Select Size:</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickSizes(false);
                }} 
                className="hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => handleQuickAdd(size, e)}
                  className="py-1 text-xs font-semibold rounded bg-[#1A1A1A] hover:bg-white hover:text-black text-[#D9D9D9] border border-[#2B2B2B] transition-all text-center"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              id={`quick-add-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (product.sizes.length === 1) {
                  handleQuickAdd(product.sizes[0], e);
                } else {
                  setShowQuickSizes(true);
                }
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-semibold text-xs tracking-wider uppercase hover:brightness-110 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all active:scale-95"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-black" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section (Matte black background, Graphite border, White price, Silver creator) */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-[#0A0A0A]">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-[#A8ACB4] mb-1">
            <span className="uppercase tracking-wider font-mono-tech text-[#C0C0C0]">{product.category}</span>
            <span className="text-[#8E8E93]">
              {product.stockCount < 10 ? (
                <span className="text-white font-medium">Only {product.stockCount} left</span>
              ) : (
                'In Stock'
              )}
            </span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-white line-clamp-1 group-hover:text-[#D9D9D9] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#8E8E93] mt-0.5 line-clamp-1">{product.creatorName}</p>
        </div>

        <div className="mt-3 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono-tech font-bold text-sm sm:text-base text-white">
              {formatPrice(product.priceKES)}
            </span>
            {product.originalPriceKES && (
              <span className="text-xs text-[#666666] line-through">
                {formatPrice(product.originalPriceKES)}
              </span>
            )}
          </div>

          <span className="text-[11px] text-[#A8ACB4] flex items-center gap-1">
            <span className="text-white">★</span>
            <span className="font-medium text-white">{product.rating}</span>
          </span>
        </div>

        {/* Mobile Quick Add Button */}
        <div className="mt-2.5 block sm:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (product.sizes.length === 1) {
                handleQuickAdd(product.sizes[0], e);
              } else {
                setQuickViewProduct(product);
              }
            }}
            className="w-full py-2 px-3 rounded-lg bg-black border border-[#C0C0C0]/50 hover:border-white text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C0C0C0]" />
            <span>Select & Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
