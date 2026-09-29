import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  Share2, 
  ArrowLeft, 
  Sparkles,
  Info,
  PackageCheck,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/supabaseService';
import { ProductCard } from '../components/ProductCard';
import { Product, Creator } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { 
    activeProductId, 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    navigateTo, 
    setIsCheckoutOpen,
    showToast 
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      setIsLoading(true);
      try {
        const prods = await dbService.getAllActiveProducts();
        const found = prods.find((p) => p.id === activeProductId) || prods[0] || null;
        if (found) {
          setProduct(found);
          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }

          const creatorData = await dbService.getCreatorById(found.creatorId);
          setCreator(creatorData);

          const related = prods
            .filter((p) => p.id !== found.id && (p.creatorId === found.creatorId || p.category === found.category))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Failed to load product from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProductData();
  }, [activeProductId]);

  if (isLoading || !product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[#8E8E93] bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-xs font-mono-tech tracking-wider uppercase">Loading garment specs...</span>
      </div>
    );
  }

  const isFavorite = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    setIsCheckoutOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link to ${product.name} copied!`, 'success');
    }
  };

  return (
    <div className="w-full min-h-screen pb-24 space-y-8 sm:space-y-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 bg-black text-white">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('creator', { creatorSlug: product.creatorSlug })}
          className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {product.creatorName} Storefront</span>
        </button>
      </div>

      {/* Main Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Visual Stage */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#111111] border border-[#2B2B2B]">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isLimitedEdition && (
                <span className="px-3 py-1 rounded text-xs font-mono-tech font-bold uppercase tracking-wider bg-gradient-to-r from-[#D9D9D9] via-white to-[#A8A8A8] text-black shadow-lg">
                  Limited Drop
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-3 py-1 rounded text-xs font-mono-tech font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20">
                  New Arrival
                </span>
              )}
            </div>

            {/* Wishlist floating button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-black/70 text-[#D9D9D9] hover:bg-black hover:text-white border border-[#333333]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-black' : ''}`} />
            </button>
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-white' : 'border-[#222222] opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Purchasing & Technical Specs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Creator Attribution */}
            <div
              onClick={() => navigateTo('creator', { creatorSlug: product.creatorSlug })}
              className="flex items-center gap-2 cursor-pointer group w-fit"
            >
              <img
                src={product.creatorAvatar}
                alt={product.creatorName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-[#333333]"
              />
              <span className="text-xs font-bold text-[#D9D9D9] group-hover:text-white transition-colors">
                {product.creatorName}
              </span>
              <span className="text-xs text-[#555555]">·</span>
              <span className="text-xs font-mono-tech uppercase text-[#8E8E93]">
                {product.creatorCategory}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Reviews */}
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div className="flex items-baseline gap-3">
                <span className="font-mono-tech font-black text-2xl sm:text-3xl text-white">
                  {formatPrice(product.priceKES)}
                </span>
                {product.originalPriceKES && (
                  <span className="text-sm font-mono-tech text-[#666666] line-through">
                    {formatPrice(product.originalPriceKES)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex text-white">
                  {'★★★★☆'.split('').map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <span className="font-mono-tech text-[#8E8E93]">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Official Creator Merchandise Badge */}
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#2B2B2B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black border border-[#333333] flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Official Creator Merchandise</h4>
                  <p className="text-[11px] text-[#8E8E93]">Authorized by {product.creatorName}. NFC Authenticated.</p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-md hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white transition-colors"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-tech uppercase font-bold text-[#C0C0C0]">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-xs text-[#D9D9D9] hover:underline font-medium"
                >
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-mono-tech font-bold rounded-xl border transition-all text-center ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black border-white shadow-lg'
                        : 'bg-[#111111] text-[#D9D9D9] border-[#262626] hover:border-[#444444]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {showSizeGuide && (
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#2B2B2B] text-xs space-y-1 animate-in fade-in">
                  <p className="font-bold text-white">Size Chart (Chest / Length in Inches):</p>
                  <p className="text-[#8E8E93]">S (38" / 27") · M (40" / 28") · L (44" / 29") · XL (48" / 30") · XXL (52" / 31")</p>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-mono-tech uppercase font-bold text-[#8E8E93]">Quantity</span>
              <div className="flex items-center border border-[#333333] rounded-xl bg-[#111111]">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-[#8E8E93] hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono-tech font-bold text-sm text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-1.5 text-[#8E8E93] hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl bg-black border border-[#C0C0C0]/50 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Add to Bag · {formatPrice(product.priceKES * quantity)}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span>Instant Checkout · Paystack M-PESA & Card</span>
              </button>
            </div>
          </div>

          {/* Collapsible / Rich Info Cards: Description, Materials, Shipping, Returns */}
          <div className="space-y-3 pt-6 border-t border-[#222222] text-xs">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
              <h4 className="font-mono-tech uppercase font-bold text-white">Description</h4>
              <p className="text-[#8E8E93] leading-relaxed">{product.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
              <h4 className="font-mono-tech uppercase font-bold text-white">Materials & Fit</h4>
              <p className="text-[#8E8E93] leading-relaxed">{product.materials}</p>
              <p className="text-[#666666]">{product.fit}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono-tech uppercase font-bold text-white">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Kenya Delivery & Global Roadmap</span>
                </div>
                <span className="text-[10px] font-mono-tech text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                  🇰🇪 47 Counties
                </span>
              </div>
              <p className="text-[#8E8E93] leading-relaxed">
                {product.shippingInfo} Dispatched from Nairobi within 24 hours. Nairobi same-day/next-day rider delivery. Rest of Kenya (all 47 counties) 24–48 hours via Fargo Courier & G4S. Worldwide shipping for international diaspora fans launches in Phase 2.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-1.5">
              <div className="flex items-center gap-2 font-mono-tech uppercase font-bold text-white">
                <RotateCcw className="w-4 h-4 text-white" />
                <span>Returns & Exchanges</span>
              </div>
              <p className="text-[#8E8E93] leading-relaxed">
                7-day size exchanges available within Nairobi. Unworn items with original serialized tags are eligible for exchange.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products from Creator */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#222222]">
          <div className="mb-6">
            <span className="text-xs font-mono-tech text-[#C0C0C0] uppercase font-bold tracking-wider">
              MORE FROM THE STORE
            </span>
            <h3 className="font-display font-bold text-2xl text-white uppercase tracking-tight mt-1">
              YOU MAY ALSO LIKE
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
