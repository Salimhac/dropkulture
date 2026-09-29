import React from 'react';
import { ArrowUpRight, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="w-full bg-black border-t border-[#222222] pt-16 pb-24 lg:pb-12 text-[#8E8E93]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Brand Statement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#222222]">
          <div className="md:col-span-6 space-y-4">
            <div 
              onClick={() => navigateTo('home')}
              className="cursor-pointer"
            >
              <BrandLogo size="md" />
            </div>
            <p className="text-sm text-[#D9D9D9] max-w-md leading-relaxed font-light">
              «Find the creator. Discover the drop. Wear the culture.»
            </p>
            <p className="text-xs text-[#8E8E93] max-w-md leading-relaxed">
              We engineer the physical and digital commerce infrastructure that enables Kenya's top artists, comedians, athletes, and digital personalities to build enduring commercial brands around their communities.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono-tech text-[#8E8E93]">
              <span className="flex items-center gap-1 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Nairobi, Kenya (HQ & Central Hub)
              </span>
              <span>·</span>
              <span className="text-[#C0C0C0]">
                All 47 Counties Delivery
              </span>
              <span>·</span>
              <span className="text-[#666666]">
                Worldwide Shipping (Phase 2)
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('explore')} className="hover:text-white transition-colors">
                  All Creators
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('drops')} className="hover:text-white transition-colors">
                  Trending Drops
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('categories')} className="hover:text-white transition-colors">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('explore')} className="hover:text-white transition-colors">
                  New Arrivals
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              For Creators
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('become-a-creator')} className="hover:text-white transition-colors text-white font-semibold flex items-center gap-1">
                  <span>Apply to Launch</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('creator-dashboard')} className="hover:text-white transition-colors">
                  Creator Hub Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('become-a-creator')} className="hover:text-white transition-colors">
                  Creator FAQ & Payouts (40/60 Split)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  Brand Manifesto
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              Guarantees
            </h4>
            <div className="space-y-2 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>100% Official Licensed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white text-[9px] font-bold text-black flex items-center justify-center">
                  M
                </div>
                <span>M-PESA Express</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Limited Numbered Drops</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal disclaimers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#666666] font-mono-tech select-none">
          <p>
            © 2026 DROPKULTURE Commerce Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Built for African Creators</span>
            <span>·</span>
            <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
              About The Platform
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors text-white">
              Terms & Conditions
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('become-a-creator')} className="hover:text-white transition-colors">
              Join as Creator
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
