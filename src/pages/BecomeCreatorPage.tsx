import React from 'react';
import {
  Sparkles,
  Palette,
  Factory,
  Truck,
  Store,
  Coins,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BecomeCreatorPage: React.FC = () => {
  const { currentUser, navigateTo, openAuthModal } = useApp();

  const benefits = [
    {
      icon: <Palette className="w-6 h-6 text-white" />,
      title: 'Custom Merch Design',
      desc: 'Our streetwear apparel designers craft premium drops aligned with your signature aesthetic and slogans.',
    },
    {
      icon: <Factory className="w-6 h-6 text-[#C0C0C0]" />,
      title: 'High-Quality Manufacturing',
      desc: '380-450 GSM French Terry cotton hoodies, heavyweight oversized tees, custom wash treatments and embroidered caps.',
    },
    {
      icon: <Truck className="w-6 h-6 text-[#D9D9D9]" />,
      title: 'Kenya-First & Regional Fulfillment',
      desc: 'Central Nairobi fulfillment hub with same-day rider dispatch and 24–48hr courier delivery across all 47 counties. Phase 2 unlocks DHL Express shipping for global diaspora fans.',
    },
    {
      icon: <Store className="w-6 h-6 text-white" />,
      title: 'Dedicated Creator Storefront',
      desc: 'Your own branded URL on DROPKULTURE with custom banners, campaign lookbooks, and mobile-optimized browsing.',
    },
    {
      icon: <Coins className="w-6 h-6 text-[#C0C0C0]" />,
      title: '30% Creator / 70% Platform Split',
      desc: 'Creators receive 30% net royalties on every item sold. DROPKULTURE retains 70% to cover 100% of upfront garment production, luxury French Terry fabrics, warehousing, courier dispatch, and M-Pesa processing.',
    },
    {
      icon: <Megaphone className="w-6 h-6 text-[#D9D9D9]" />,
      title: 'Marketing & Drop Support',
      desc: 'Countdown launch pages, VIP early-access SMS/WhatsApp campaigns, and professional studio lookbook production.',
    },
  ];

  const handleApplyClick = () => {
    // Logged-in creator or admin — no need to reapply
    if (currentUser?.role === 'creator') {
      navigateTo('creator-dashboard');
      return;
    }
    if (currentUser?.role === 'admin') {
      navigateTo('admin-dashboard');
      return;
    }
    // Everyone else — open the auth modal in creator/register mode
    openAuthModal('creator', 'register');
  };

  const ctaLabel = (() => {
    if (currentUser?.role === 'creator') return 'Go to Creator Hub';
    if (currentUser?.role === 'admin') return 'Open Admin Console';
    if (currentUser) return 'Apply as Creator';
    return 'Apply to Launch Your Store';
  })();

  return (
    <div className="w-full min-h-screen pb-24 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 bg-black text-white">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>JOIN AFRICA'S PREMIER CREATOR COMMERCE PLATFORM</span>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tight leading-[0.95]">
          TURN YOUR COMMUNITY <br />
          <span className="text-metallic-silver">INTO AN ICONIC BRAND.</span>
        </h1>

        <p className="text-base sm:text-xl text-[#D9D9D9] font-light max-w-2xl mx-auto leading-relaxed">
          We design, manufacture, and distribute official merchandise for Africa's most influential creators. Zero upfront inventory cost. Pure commercial upside.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-98 flex items-center justify-center gap-2"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('explore')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-transparent border border-[#C0C0C0]/35 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            See Live Storefronts
          </button>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-mono-tech text-[#8E8E93]">
          <span>✓ Zero Inventory Risk</span>
          <span>✓ Guaranteed Royalties</span>
          <span>✓ M-Pesa Instant Settlement</span>
        </div>

        {/* Contextual banner for signed-in users */}
        {currentUser?.role === 'creator' && (
          <div className="mt-6 max-w-xl mx-auto p-3 rounded-xl bg-[#141414] border border-[#2B2B2B] text-xs text-[#D9D9D9] flex items-center gap-2.5 justify-center">
            <LayoutDashboard className="w-4 h-4 text-white flex-shrink-0" />
            <p>
              You're already a registered creator. Manage your storefront from the{' '}
              <button
                type="button"
                onClick={() => navigateTo('creator-dashboard')}
                className="text-white underline font-semibold hover:text-[#C0C0C0]"
              >
                Creator Hub
              </button>.
            </p>
          </div>
        )}
      </section>

      {/* Benefits Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold tracking-widest">
            THE PLATFORM ADVANTAGE
          </span>
          <h2 className="font-display font-bold text-3xl text-white uppercase tracking-tight mt-1">
            KEY BENEFITS FOR CREATORS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#111111] border border-[#262626] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-black border border-[#333333] flex items-center justify-center">
                {b.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-white">{b.title}</h3>
              <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <span className="text-xs font-mono-tech uppercase text-[#C0C0C0] font-bold tracking-widest">
            THE PROCESS
          </span>
          <h2 className="font-display font-bold text-3xl text-white uppercase tracking-tight mt-1">
            FROM APPLICATION TO FIRST DROP
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '01', t: 'Apply in 2 Minutes', d: 'Tell us your brand name, category, audience size, and socials.' },
            { n: '02', t: 'Review & Concept Deck', d: 'Our Head of Creator Partnerships responds within 48 hours with a drop concept.' },
            { n: '03', t: 'Launch Your Storefront', d: 'We manufacture, photograph, and ship. You promote. You earn 30% net per sale.' },
          ].map((step) => (
            <div key={step.n} className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#222222] space-y-2">
              <span className="text-[10px] font-mono-tech text-[#666666] font-bold">{step.n}</span>
              <h3 className="font-display font-bold text-base text-white">{step.t}</h3>
              <p className="text-xs text-[#8E8E93] leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terms + Final CTA */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="p-5 rounded-2xl bg-[#161616] border border-[#2B2B2B] text-xs text-[#A6ACB4] space-y-1.5">
          <div className="flex items-center gap-2 text-white font-mono-tech font-bold uppercase text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Commercial Revenue Terms</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong className="text-white">Creators receive 30% net revenue</strong> and{' '}
            <strong className="text-white">DROPKULTURE retains 70%</strong> to handle 100% of upfront fabric
            manufacturing, inventory warehousing, Kenyan and upcoming worldwide shipping, and M-Pesa processing fees.
            Review our complete{' '}
            <button
              type="button"
              onClick={() => navigateTo('terms')}
              className="text-white underline hover:text-[#C0C0C0] font-semibold"
            >
              Terms & Conditions
            </button>.
          </p>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleApplyClick}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-98 inline-flex items-center gap-2"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          {!currentUser && (
            <p className="mt-3 text-[11px] text-[#8E8E93]">
              Already a creator?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('creator', 'login')}
                className="text-white underline font-semibold hover:text-[#C0C0C0]"
              >
                Sign In to Creator Hub
              </button>
            </p>
          )}
        </div>
      </section>
    </div>
  );
};