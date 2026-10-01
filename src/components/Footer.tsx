import React from 'react';
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

/* Inline brand SVGs — lucide-react ships no brand icons */
const InstagramIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
  </svg>
);
const isTWA = () => {
  return document.referrer.startsWith('android-app://');
};

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  const socials = [
    {
      name: 'Instagram',
      handle: '@dropk_ulture',
      href: 'https://instagram.com/dropk_ulture',
      Icon: InstagramIcon,
    },
    {
      name: 'TikTok',
      handle: '@drop_kulture',
      href: 'https://tiktok.com/@drop_kulture',
      Icon: TikTokIcon,
    },
  ];

  return (
    <footer className="w-full bg-black border-t border-[#222222] pt-16 pb-24 lg:pb-12 text-[#8E8E93]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Top Brand Statement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#222222]">

          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
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
              We engineer the physical and digital commerce infrastructure
              that enables Kenya's top artists, comedians, athletes, and
              digital personalities to build enduring commercial brands
              around their communities.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono-tech text-[#8E8E93]">
              <span className="flex items-center gap-1 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Nairobi, Kenya (HQ & Central Hub)
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

            {/* Social Handles */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {socials.map(({ name, handle, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} — ${handle}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2A2A2A] hover:border-[#C0C0C0]/50 bg-[#0D0D0D] hover:bg-[#151515] text-[11px] font-mono-tech text-[#C0C0C0] hover:text-white transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  <span>{handle}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              Marketplace
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  All Creators
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('drops')}
                  className="hover:text-white transition-colors"
                >
                  Trending Drops
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('categories')}
                  className="hover:text-white transition-colors"
                >
                  Categories
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>

              {/* Android Download */}
              {!isTWA() && (
  <li className="pt-1">
    <a
      href="/downloads/DropKulture.apk"
      download="DropKulture.apk"
      className="inline-flex items-center gap-1.5 text-white hover:text-emerald-400 transition-colors font-medium"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Download Android App</span>
    </a>
  </li>
)}
            </ul>
          </div>

          {/* For Creators */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              For Creators
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('become-a-creator')}
                  className="hover:text-white transition-colors text-white font-semibold flex items-center gap-1"
                >
                  <span>Apply to Launch</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('creator-dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Creator Hub Portal
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('become-a-creator')}
                  className="hover:text-white transition-colors"
                >
                  Creator FAQ & Payouts (30/70 Split)
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-white transition-colors"
                >
                  Brand Manifesto
                </button>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div className="md:col-span-1 space-y-3">
            <h4 className="text-xs font-mono-tech uppercase tracking-wider text-white font-bold">
              Follow
            </h4>

            <ul className="space-y-2 text-xs">
              {socials.map(({ name, handle, href, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} — ${handle}`}
                    className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#C0C0C0] group-hover:text-white transition-colors" />
                    <span className="font-mono-tech">{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantees */}
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

        {/* Bottom Copyright & Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#666666] font-mono-tech select-none">
          <p>
            © 2026 DROPKULTURE Commerce Ltd. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>Built for African Creators</span>

            <span>·</span>

            <button
              onClick={() => navigateTo('about')}
              className="hover:text-white transition-colors"
            >
              About The Platform
            </button>

            <span>·</span>

            <button
              onClick={() => navigateTo('terms')}
              className="hover:text-white transition-colors text-white"
            >
              Terms & Conditions
            </button>

            <span>·</span>

            <button
              onClick={() => navigateTo('become-a-creator')}
              className="hover:text-white transition-colors"
            >
              Join as Creator
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};