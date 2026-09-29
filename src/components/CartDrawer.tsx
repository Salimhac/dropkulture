import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotalKES, 
    formatPrice, 
    setIsCheckoutOpen,
    navigateTo,
    currentUser,       // 👈 add
    openAuthModal,     // 👈 add
    showToast
  } = useApp();

  if (!isCartOpen) return null;

  const estimatedShippingKES = cart.length > 0 ? (cartTotalKES > 5000 ? 0 : 150) : 0;
  const orderTotalKES = cartTotalKES + estimatedShippingKES;

  const handleCheckoutClick = () => {
  if (!currentUser) {
    showToast('Please sign in to proceed to checkout.', 'warn');
    setIsCartOpen(false);
    openAuthModal('customer', 'login');
    return;
  }
  setIsCartOpen(false);
  setIsCheckoutOpen(true);
};
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-black border-l border-[#2B2B2B] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] safe-area-bottom">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white tracking-tight uppercase">Your Merch Bag</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#333333] text-xs font-mono-tech text-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              id="close-cart-btn"
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-black">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2B2B2B] flex items-center justify-center text-[#8E8E93]">
                  <Lock className="w-7 h-7 text-[#C0C0C0]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Your bag is empty</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 max-w-xs">
                    Support premier creators with exclusive limited-run merchandise pieces.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('explore');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  Explore Drops
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-3.5 p-3 rounded-xl bg-[#111111] border border-[#262626] relative group"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 rounded-lg object-cover bg-black border border-[#2A2A2A] flex-shrink-0 cursor-pointer"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigateTo('product', { productId: item.product.id });
                    }}
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider truncate">
                          {item.product.creatorName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          className="text-[#666666] hover:text-white transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 
                        onClick={() => {
                          setIsCartOpen(false);
                          navigateTo('product', { productId: item.product.id });
                        }}
                        className="font-medium text-sm text-white truncate cursor-pointer hover:underline"
                      >
                        {item.product.name}
                      </h4>

                      <p className="text-xs text-[#8E8E93] mt-0.5">
                        Size: <span className="text-white font-semibold">{item.selectedSize}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222222]">
                      <div className="flex items-center border border-[#333333] rounded-md bg-black">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-1 hover:text-white text-[#8E8E93] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono-tech font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-1 hover:text-white text-[#8E8E93] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono-tech font-bold text-sm text-white">
                        {formatPrice(item.product.priceKES * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#222222] bg-[#0A0A0A] space-y-3">
              <div className="space-y-1.5 text-xs text-[#8E8E93]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-tech text-white font-medium">{formatPrice(cartTotalKES)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#8E8E93]" />
                    <span>Estimated Shipping (Kenya)</span>
                  </span>
                  <span className="font-mono-tech text-white font-medium">
                    {estimatedShippingKES === 0 ? (
                      <span className="text-white font-bold uppercase text-[10px]">Free</span>
                    ) : (
                      formatPrice(estimatedShippingKES)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#222222] flex justify-between text-sm sm:text-base font-bold text-white">
                  <span>Total</span>
                  <span className="font-mono-tech text-white">{formatPrice(orderTotalKES)}</span>
                </div>
              </div>

              {/* Paystack Payment Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141414] border border-[#2B2B2B] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#00C3F7]/20 text-[#00C3F7] flex items-center justify-center font-bold text-[10px]">
                    ⚡
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">Mobile Money</p>
                    <p className="text-[10px] text-[#8E8E93]">Secure Mobile Money Payments</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#00C3F7]/10 text-[#00C3F7] font-semibold border border-[#00C3F7]/20">
                  Paystack Powered
                </span>
              </div>

              <button
                id="proceed-checkout-btn"
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-98"
              >
                <span>{currentUser ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              <p className="text-[10px] text-center text-[#666666] flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                <span>100% Authentic Creator Merchandise · Serialized Guarantee</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
