import React, { useState } from 'react';
import { X, Heart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isWishlisted,
    navigateTo,
    setIsCartOpen,
    setIsCheckoutOpen,
    currentUser,
    openAuthModal,
    showToast
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const currentSize = selectedSize || quickViewProduct.sizes[0] || 'M';
  const isFavorite = isWishlisted(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, currentSize, quantity);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
    showToast('Please sign in to buy this item.', 'warn');
    openAuthModal('customer', 'login');
    return;
  }
    addToCart(quickViewProduct, currentSize, quantity);
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleViewFullPage = () => {
    const id = quickViewProduct.id;
    setQuickViewProduct(null);
    navigateTo('product', { productId: id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-black border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] my-6 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-[#D9D9D9] hover:text-white backdrop-blur-md border border-[#333333] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Visual Gallery Column */}
        <div className="w-full md:w-1/2 bg-[#111111] relative flex flex-col flex-shrink-0">
          <div className="relative h-52 sm:h-72 md:h-full md:aspect-[4/5] w-full overflow-hidden bg-black">
            <img
              src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {quickViewProduct.isLimitedEdition && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#D9D9D9] via-white to-[#A8A8A8] text-black shadow-md">
                Limited Drop
              </span>
            )}
          </div>

          {/* Thumbnails if multiple images */}
          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-black border-t border-[#222222] overflow-x-auto scrollbar-none">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-5 bg-[#0D0D0D]">
          <div>
            {/* Creator Attribution */}
            <div 
              onClick={() => {
                setQuickViewProduct(null);
                navigateTo('creator', { creatorSlug: quickViewProduct.creatorSlug });
              }}
              className="flex items-center gap-2 mb-2 cursor-pointer group w-fit"
            >
              <img
                src={quickViewProduct.creatorAvatar}
                alt={quickViewProduct.creatorName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-[#333333]"
              />
              <span className="text-xs font-semibold text-[#D9D9D9] group-hover:text-white transition-colors">
                {quickViewProduct.creatorName}
              </span>
              <span className="text-xs text-[#555555]">·</span>
              <span className="text-[11px] font-mono-tech uppercase text-[#8E8E93]">
                {quickViewProduct.creatorCategory}
              </span>
            </div>

            <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight leading-snug">
              {quickViewProduct.name}
            </h2>

            <div className="flex items-center gap-3 mt-2.5">
              <span className="font-mono-tech font-bold text-xl sm:text-2xl text-white">
                {formatPrice(quickViewProduct.priceKES)}
              </span>
              {quickViewProduct.originalPriceKES && (
                <span className="text-sm text-[#666666] line-through">
                  {formatPrice(quickViewProduct.originalPriceKES)}
                </span>
              )}
              <span className="text-xs text-[#8E8E93] flex items-center gap-1 ml-auto">
                <span className="text-white">★</span>
                <span className="font-semibold text-white">{quickViewProduct.rating}</span>
                <span className="text-[#666666]">({quickViewProduct.reviewsCount})</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#D9D9D9] mt-3 leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Official Merch Seal */}
            <div className="mt-4 p-2.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-[#D9D9D9] font-medium">Official Authorized Creator Merchandise · NFC Authenticated</span>
            </div>

            {/* Size Selector */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-tech uppercase tracking-wider text-[#C0C0C0] font-medium">
                  Select Size
                </span>
                <span className="text-[11px] text-[#8E8E93]">True to African Streetwear Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickViewProduct.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3.5 text-xs font-bold rounded-lg border transition-all ${
                      currentSize === size
                        ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black border-white shadow-md'
                        : 'bg-[#161616] text-[#D9D9D9] border-[#2A2A2A] hover:border-[#444444]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-xs font-mono-tech uppercase tracking-wider text-[#C0C0C0]">Quantity</span>
              <div className="flex items-center border border-[#333333] rounded-lg bg-[#141414]">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-[#8E8E93] hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-mono-tech text-xs font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-2.5 py-1 text-[#8E8E93] hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-[#222222]">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl bg-black border border-[#C0C0C0]/50 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Add To Bag
              </button>
              <button
  type="button"
  onClick={handleBuyNow}
  className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform active:scale-95"
>
  {currentUser ? 'Buy with M-Pesa' : 'Sign in to Buy'}
</button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className="flex items-center gap-1.5 text-[#8E8E93] hover:text-white transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : ''}`} />
                <span>{isFavorite ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleViewFullPage}
                className="flex items-center gap-1 text-[#C0C0C0] hover:text-white font-medium"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
