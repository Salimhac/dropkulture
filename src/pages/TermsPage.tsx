import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  ShieldCheck, 
  Percent, 
  Coins, 
  Truck, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="w-full min-h-screen pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-white bg-black">
      {/* Back button */}
      <button 
        onClick={() => navigateTo('home')}
        className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93] hover:text-white mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO HOME</span>
      </button>

      {/* Header */}
      <div className="space-y-4 border-b border-[#222222] pb-8 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2B2B2B] text-xs font-mono-tech text-[#D9D9D9]">
          <FileText className="w-3.5 h-3.5 text-white" />
          <span>OFFICIAL PLATFORM AGREEMENT</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
          TERMS & CONDITIONS
        </h1>
        <p className="text-sm text-[#8E8E93] font-mono-tech">
          Last Updated: September 2026 · Effective for all Customers, Creators, and Partners across Africa and Worldwide.
        </p>
      </div>

      {/* Highlight Box: 70/30 Commercial Revenue Split */}
      <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1A1A1A] via-[#121212] to-[#0A0A0A] border-2 border-[#C0C0C0]/40 shadow-[0_0_35px_rgba(255,255,255,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Percent className="w-5 h-5 text-metallic-silver" />
            <span className="text-xs font-mono-tech uppercase tracking-widest font-bold">
              COMMERCIAL REVENUE SPLIT MODEL
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            70% Platform / 30% Creator Revenue Share
          </h2>

          <p className="text-sm sm:text-base text-[#D9D9D9] leading-relaxed">
            DROPKULTURE operates on a transparent, performance-based revenue sharing model for all merchandise drops and creator storefront sales:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-black/60 border border-[#333333] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech text-[#8E8E93] uppercase font-bold">Platform Retainer</span>
                <span className="text-2xl font-display font-black text-white">70%</span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Retained by DROPKULTURE to cover 100% of upfront physical garment production, luxury 380–450 GSM French Terry fabric sourcing, inventory warehousing in Nairobi and Lagos, international & local courier fulfillment, M-Pesa & card transaction processing fees, customer support, and platform infrastructure.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-[#333333] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech text-white uppercase font-bold">Creator Net Royalty</span>
                <span className="text-2xl font-display font-black text-white">30%</span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Directly disbursed to the Creator on every garment sold with zero upfront capital risk. Net earnings are computed in real time on the Creator Hub and paid out weekly via automated M-Pesa business settlement or bank transfer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10 text-sm text-[#CCCCCC] leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">01.</span>
            Platform Overview & Acceptance
          </h3>
          <p>
            Welcome to DROPKULTURE (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing, browsing, registering an account (as a customer/collector, creator, or administrator), or purchasing products from DROPKULTURE, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
          <p>
            If you do not agree with any part of these Terms, you must discontinue your use of the platform immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">02.</span>
            Creator Commercial Terms & Revenue Split
          </h3>
          <p>
            DROPKULTURE provides end-to-end merchandise commercialization for African cultural creators, artists, musicians, comedic icons, athletes, and digital personalities.
          </p>
          <div className="space-y-2.5 pl-4 border-l-2 border-[#333333]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span><strong>The 70/30 Split:</strong> On every completed sale of branded apparel or accessories, DROPKULTURE receives seventy percent (70%) of the gross purchase price to offset all manufacturing, fabric, packaging, courier logistics, payment gateway charges, and administrative expenses. The Creator receives thirty percent (30%) net royalty.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span><strong>Zero Inventory Risk:</strong> Creators are never required to purchase or hold pre-made stock. Production is managed on demand or through scheduled batch drops backed by DROPKULTURE capital.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span><strong>Automated Weekly Settlement:</strong> Creator royalties accumulate in real time on the Creator Hub dashboard and are settled weekly to verified M-Pesa phone numbers or local bank accounts.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span><strong>Taxes and Compliance:</strong> Creators are responsible for reporting their net income to relevant national tax authorities (e.g. Kenya Revenue Authority, Federal Inland Revenue Service).</span>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">03.</span>
            Intellectual Property & Ownership
          </h3>
          <p>
            Creators retain 100% ownership of their brand name, trademarks, logos, catchphrases, and personal likeness. By creating a creator storefront on DROPKULTURE, the creator grants DROPKULTURE a non-exclusive, worldwide license solely to manufacture, market, photograph, display, and distribute official licensed products on their behalf.
          </p>
          <p>
            DROPKULTURE retains all intellectual property in the platform software, user interface design, proprietary manufacturing supply chain connections, and promotional materials produced by the platform.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">04.</span>
            Customer Orders, Payments & Fulfillment
          </h3>
          <p>
            All consumer orders placed through DROPKULTURE are subject to product availability and payment verification. Payments are processed securely via Paystack, supporting Safaricom M-Pesa and Airtel Money.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <Truck className="w-4 h-4 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-white mb-1">Kenya Delivery (47 Counties)</div>
              <p className="text-[11px] text-[#8E8E93]">Same-day & 24hr delivery in Nairobi; 24–48 hours across all 47 counties via Fargo Courier & G4S.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <Sparkles className="w-4 h-4 text-[#C0C0C0] mb-2" />
              <div className="text-xs font-bold text-white mb-1">Worldwide Shipping (Phase 2)</div>
              <p className="text-[11px] text-[#8E8E93]">International DHL Express shipping to the US, UK, and diaspora hubs currently in Phase 2 development.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <ShieldCheck className="w-4 h-4 text-white mb-2" />
              <div className="text-xs font-bold text-white mb-1">Authenticity Guaranteed</div>
              <p className="text-[11px] text-[#8E8E93]">Every piece features tamper-evident holographic serial tags and official numbered certificates.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">05.</span>
            Account Security & Password Protection
          </h3>
          <p>
            Users are solely responsible for maintaining the confidentiality of their account credentials, passwords, and security tokens. All passwords are encrypted using industry-standard cryptographic hashing and verified via Supabase Authentication clearance.
          </p>
          <p>
            If you notice any unauthorized access or security breach regarding your account, notify support immediately at mrsalimramadhan1@gmail.com.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">06.</span>
            Returns & Quality Assurance
          </h3>
          <p>
            Due to the limited-edition, numbered nature of our creator drops, size exchanges are subject to stock availability. If an item arrives with manufacturing defects or damage, customers are entitled to a full replacement or refund upon inspection within 7 days of delivery.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pb-8 border-b border-[#222222]">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">07.</span>
            Governing Law & Inquiries
          </h3>
          <p>
            These Terms are governed by and construed in accordance with the laws of Kenya and applicable international trade treaties. For legal questions or partnership inquiries, contact our legal department at legal@dropkulture.africa.
          </p>
        </section>

        {/* Action Button */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-[#8E8E93]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>DROPKULTURE Verified Platform Standard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('become-a-creator')}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D9D9D9] transition-all"
            >
              Apply as Creator
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white border border-[#333333] hover:border-[#666666] font-mono-tech text-xs uppercase transition-all"
            >
              Return to Drops
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
