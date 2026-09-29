import React, { useState, useEffect } from 'react';
import { Flame, Bell, Zap, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/supabaseService';
import { CountdownTimer } from '../components/CountdownTimer';
import { ProductCard } from '../components/ProductCard';
import { Drop, Product, Collection, Creator } from '../types';

export const DropsPage: React.FC = () => {
  const { setNotifyDrop, navigateTo, activeDropId } = useApp();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [mappedDrops, allProds] = await Promise.all([
          dbService.getAllDropsWithDetails(),
          dbService.getAllActiveProducts(),
        ]);

        setDrops(mappedDrops);
        setProducts(allProds);
        if (mappedDrops.length > 0) {
          setSelectedDropId(activeDropId || mappedDrops[0].id);
        }
      } catch (err) {
        console.error('Failed to load drops from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeDropId]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[#8E8E93] bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-xs font-mono-tech tracking-wider uppercase">Loading drops calendar from database...</span>
      </div>
    );
  }

  if (drops.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4 py-20 bg-black max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#111111] border border-[#2B2B2B] flex items-center justify-center text-white mb-2">
          <Flame className="w-6 h-6 text-[#C0C0C0]" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tight">No Active Drops In Database</h2>
        <p className="text-sm text-[#A8ACB4] leading-relaxed">
          There are currently no active drops or serialized capsules published in the database. New releases will be announced here once created.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={() => navigateTo('explore')}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase font-mono-tech hover:bg-neutral-200 transition-colors"
          >
            Explore Merch
          </button>
          <button
            onClick={() => navigateTo('become-a-creator')}
            className="px-5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white font-bold text-xs uppercase font-mono-tech hover:bg-[#222222] transition-colors"
          >
            Launch a Capsule
          </button>
        </div>
      </div>
    );
  }

  const currentDrop = drops.find((d) => d.id === selectedDropId) || drops[0];
  const dropProducts = products.filter(
    (p) => p.dropId === currentDrop.id || currentDrop.highlightProductIds?.includes(p.id) || p.creatorSlug === currentDrop.creatorSlug
  );

  const liveDropsCount = drops.filter(d => d.status === 'LIVE' || d.status === 'SELLING_FAST').length;
  const upcomingDropsCount = drops.filter(d => d.status === 'COMING_SOON').length;

  return (
    <div className="w-full min-h-screen pb-24 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 bg-black text-white">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9] font-bold">
          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span>AFRICAN CREATOR MERCHANDISE CALENDAR · {drops.length} DROPS AVAILABLE</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
          OFFICIAL DROPS & <span className="text-metallic-silver">CAPSULES</span>
        </h1>

        <p className="text-sm sm:text-base text-[#D9D9D9] max-w-2xl leading-relaxed">
          Every drop is an exclusive, serialized cultural release produced in limited runs. Once the allocation closes, pieces are permanently archived.
        </p>

        {/* Live Database Drops Summary Counters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono-tech">
          <span className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#2B2B2B] text-[#D9D9D9]">
            <span className="text-white font-bold">{drops.length}</span> Drops Available in Database
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#2B2B2B] text-[#D9D9D9]">
            <span className="text-white font-bold">{liveDropsCount}</span> Live Now
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#2B2B2B] text-[#D9D9D9]">
            <span className="text-[#A6ACB4] font-bold">{upcomingDropsCount}</span> Upcoming
          </span>
        </div>

        {/* Drop Switcher Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          {drops.map((drop) => (
            <button
              key={drop.id}
              onClick={() => setSelectedDropId(drop.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono-tech uppercase font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDropId === drop.id
                  ? 'bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'bg-[#111111] text-[#8E8E93] hover:text-white border border-[#222222]'
              }`}
            >
              <span>{drop.title}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] ${
                selectedDropId === drop.id ? 'bg-black text-white font-bold' : 'bg-black/60 text-[#D9D9D9] border border-[#333333]'
              }`}>
                {drop.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner for Current Drop with Live Countdown */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161616] via-[#111111] to-black border border-[#2B2B2B] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black border border-[#333333] text-white font-mono-tech text-xs font-bold uppercase tracking-wider">
                {currentDrop.creatorName} · {currentDrop.country}
              </span>
              <span className="text-xs font-mono-tech text-[#C0C0C0] uppercase font-bold">
                {currentDrop.collectionName}
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {currentDrop.title}
            </h2>

            <p className="text-sm text-[#D9D9D9] max-w-xl leading-relaxed">
              {currentDrop.description}
            </p>

            {/* Countdown Box */}
            <div className="pt-2">
              <span className="text-xs font-mono-tech text-[#8E8E93] uppercase tracking-wider block mb-2 font-medium">
                {currentDrop.status === 'COMING_SOON' ? 'Drop Launches In:' : 'Drop Window Closes In:'}
              </span>
              <CountdownTimer targetDate={currentDrop.countdownTargetDate} />
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setNotifyDrop(currentDrop)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-95"
              >
                <Bell className="w-4 h-4 text-black" />
                <span>Notify Me on Restock & Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('creator', { creatorSlug: currentDrop.creatorSlug })}
                className="px-6 py-3.5 rounded-xl bg-black border border-[#C0C0C0]/50 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                View {currentDrop.creatorName} Store
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-[#2B2B2B]">
            <img
              src={currentDrop.coverImage}
              alt={currentDrop.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Products included in this drop */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tight">
              DROP PIECES ({dropProducts.length})
            </h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Limited numbered units. Available while stocks last.
            </p>
          </div>
          <span className="text-xs font-mono-tech text-white">
            M-PESA Enabled
          </span>
        </div>

        {dropProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {dropProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#111111] border border-[#222222] space-y-3">
            <p className="text-sm text-white font-medium">This drop's preview items are unlocking soon.</p>
            <button
              onClick={() => setNotifyDrop(currentDrop)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-sm"
            >
              Get Early Notification
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
