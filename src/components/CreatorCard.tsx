import React from 'react';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import { Creator } from '../types';
import { useApp } from '../context/AppContext';

interface CreatorCardProps {
  creator: Creator;
  variant?: 'large' | 'compact' | 'horizontal';
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, variant = 'large' }) => {
  const { navigateTo } = useApp();

  const displayName = creator.name || creator.creator_name || 'Creator';
  const displayImage = creator.avatarUrl || creator.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const displayFlag = creator.flag || (creator.country === 'Kenya' ? '🇰🇪' : creator.country === 'Nigeria' ? '🇳🇬' : creator.country === 'South Africa' ? '🇿🇦' : '🌍');

  const handleCardClick = () => {
    navigateTo('creator', { creatorSlug: creator.slug });
  };

  if (variant === 'compact') {
    return (
      <div
        id={`creator-compact-${creator.slug}`}
        onClick={handleCardClick}
        className="group flex items-center gap-3.5 p-3 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/50 hover:shadow-[0_0_20px_rgba(192,192,192,0.12)] transition-all duration-300 cursor-pointer"
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A1A1A] border border-[#333333]">
          <img
            src={displayImage}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-sm text-white truncate group-hover:text-[#D9D9D9] transition-colors">
              {displayName}
            </h4>
            {creator.verified && <BadgeCheck className="w-3.5 h-3.5 text-white flex-shrink-0" />}
          </div>
          <p className="text-xs text-[#C0C0C0] truncate">
            {creator.category} · {creator.country} {displayFlag}
          </p>
        </div>
        <span className="text-xs font-mono-tech text-[#8E8E93] font-medium px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A]">
          {creator.productCount
            ? `${creator.productCount} ${creator.productCount === 1 ? 'Drop' : 'Drops'}`
              : 'New Creator'}
        </span>
      </div>
    );
  }

  return (
    <div
      id={`creator-card-${creator.slug}`}
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111111] border border-[#222222] hover:border-[#C0C0C0]/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Visual Canvas Stage */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-[#1A1A1A]">
        <img
          src={displayImage}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-105"
        />

        {/* Cinematic dark luxury gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#333333] text-xs font-medium text-[#D9D9D9]">
            <span>{displayFlag}</span>
            <span>{creator.country}</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#333333] text-[11px] font-mono-tech text-[#C0C0C0]">
          <span>{creator.productCount ?? 0} {creator.productCount === 1 ? 'piece' : 'pieces'}</span>
          </div>
        </div>

        {/* Bottom Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end">
          {creator.featuredCollectionName && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-[#C0C0C0] uppercase tracking-wider font-semibold mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{creator.featuredCollectionName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight group-hover:text-white">
              {displayName}
            </h3>
            {creator.verified && (
              <BadgeCheck className="w-5 h-5 text-white flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-[#C0C0C0] font-medium mb-2.5">
            {creator.category === 'MUSIC' ? 'Artist' : creator.category === 'COMEDY' ? 'Comedian' : creator.category} · {creator.country}
          </p>

          <p className="text-xs text-[#8E8E93] line-clamp-2 mb-4 font-normal leading-relaxed">
            {creator.tagline || creator.bio?.slice(0, 80)}
          </p>

          {/* CTA: Silver Outline Button with Hover Metallic Glow */}
          <div className="pt-3 border-t border-[#222222] flex items-center justify-between">
            <button
              type="button"
              className="w-full py-2 px-4 rounded-lg border border-[#C0C0C0]/50 hover:border-white hover:bg-white/10 text-white font-medium text-xs tracking-wider uppercase flex items-center justify-between transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.18)]"
            >
              <span>View Storefront</span>
              <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all">
                <ArrowRight className="w-3 h-3 text-white group-hover:text-black" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
