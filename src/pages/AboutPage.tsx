import React from 'react';
import { Sparkles, Globe, ShieldCheck, Heart, Layers, ArrowRight, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="w-full min-h-screen pb-24 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 bg-black text-white">
      {/* Editorial Manifesto Hero */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>OUR MANIFESTO</span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tight leading-[0.95]">
          THE BRANDS BEHIND <br />
          <span className="text-metallic-silver">THE CREATORS YOU RESPECT.</span>
        </h1>

        <p className="text-base sm:text-xl text-[#D9D9D9] font-light max-w-2xl mx-auto leading-relaxed">
          DROPKULTURE is the creator-commerce company built for Africa. We provide the physical, digital, and financial infrastructure that allows artists, comedians, athletes, and digital personalities to build enduring commercial brands around their communities.
        </p>
      </section>

      {/* Five Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">PILLAR 01</span>
          <h3 className="font-display font-bold text-xl text-white">
            Infrastructure for African Creators
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
            African creative culture shapes music, dance, humor, and fashion worldwide. Yet historically, creators relied solely on ephemeral ad revenue and brand endorsements. We equip them to own their commercial upside through tangible branded products.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">PILLAR 02</span>
          <h3 className="font-display font-bold text-xl text-white">
            Official & Counterfeit-Free
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
            For decades, unofficial bootlegs of African artists filled local markets with zero royalties going to the talent. Every item on DROPKULTURE is 100% authorized, serialized, and directly supports the creator.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">PILLAR 03</span>
          <h3 className="font-display font-bold text-xl text-white">
            High-Grade Garment Craft
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
            We reject flimsy promotional blanks. Our garments feature 380–450 GSM custom combed cotton, reinforced collar ribs, high-density screen prints, and custom-dyed fabrics made to stand alongside global luxury streetwear giants.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">PILLAR 04</span>
          <h3 className="font-display font-bold text-xl text-white">
            Paystack & M-PESA Financial Rails
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
            We partner with Paystack to power seamless African commerce: frictionless Safaricom M-Pesa STK prompts pushed directly to SIM cards with zero forex conversion, 3D-Secure cards, instant confirmations, and real-time royalty settlement for Kenyan creators.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold">PILLAR 05</span>
          <h3 className="font-display font-bold text-xl text-white">
            Nairobi Hub & 47 Counties Dispatch
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
            Operating from our central Nairobi fulfillment facility, we guarantee same-day and 24hr motorcycle delivery across Nairobi and 24–48hr courier coverage across all 47 counties via Fargo Courier and G4S. Worldwide shipping for our global diaspora launches in Phase 2.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#141414] border border-[#333333] space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono-tech uppercase text-white font-bold">THE VISION</span>
            <h3 className="font-display font-bold text-xl text-white mt-1">
              Building 1,000 African Creator Brands
            </h3>
            <p className="text-xs sm:text-sm text-[#D9D9D9] leading-relaxed mt-2">
              Our ambition is to generate over $100M in direct commerce royalties for African storytellers and artists over the next decade.
            </p>
          </div>
          <button
            onClick={() => navigateTo('become-a-creator')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>Partner With Us</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </section>

      {/* Operational Hubs */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#111111] border border-[#262626] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
          <div>
            <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold tracking-widest">
              CONTINENTAL NETWORK
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase mt-1">
              OUR HUBS & FULFILLMENT NETWORK
            </h2>
          </div>
          <span className="text-xs font-mono-tech text-[#8E8E93]">
            Headquartered in Nairobi, Kenya
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white" /> Nairobi HQ (East Africa)
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Design studio, screen-printing facility, and primary warehouse serving Kenya, Uganda, Tanzania, and Rwanda.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C0C0C0]" /> Lagos Hub (West Africa)
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Distribution and creator management center servicing Nigeria, Ghana, and regional music tour merchandise.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8E8E93]" /> Johannesburg Hub (Southern Africa)
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Apparel production and fulfillment node connecting South Africa, Botswana, and Amapiano artist collectives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
