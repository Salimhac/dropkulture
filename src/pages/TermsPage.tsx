import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  ShieldCheck, 
  Percent, 
  Truck, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2
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
          TERMS &amp; CONDITIONS
        </h1>
        <p className="text-sm text-[#8E8E93] font-mono-tech">
          Last Updated: September 2026 · Effective for all Customers, Creators, and Partners across Africa and Worldwide.
        </p>
      </div>

      {/* Highlight Box: Creator Commercial Model */}
      <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#1A1A1A] via-[#121212] to-[#0A0A0A] border-2 border-[#C0C0C0]/40 shadow-[0_0_35px_rgba(255,255,255,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Percent className="w-5 h-5 text-metallic-silver" />
            <span className="text-xs font-mono-tech uppercase tracking-widest font-bold">
              CREATOR COMMERCIAL MODEL
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Zero-Risk Creator Commerce
          </h2>

          <p className="text-sm sm:text-base text-[#D9D9D9] leading-relaxed">
            DROPKULTURE funds, produces, stores, ships, and supports every official drop on behalf of its creators. 
            Creators earn a transparent royalty on every unit sold — with no upfront capital required.
          </p>

          <p className="text-sm sm:text-base text-[#D9D9D9] leading-relaxed">
            The exact commercial terms, royalty percentage, and payout schedule are disclosed in your signed Creator Agreement 
            and are visible in your Creator Hub dashboard after approval.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10 text-sm text-[#CCCCCC] leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">01.</span>
            Platform Overview &amp; Acceptance
          </h3>
          <p>
            Welcome to DROPKULTURE (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing, browsing, registering an account 
            (as a customer/collector, creator, or administrator), or purchasing products from DROPKULTURE, you acknowledge 
            that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
          <p>
            If you do not agree with any part of these Terms, you must discontinue your use of the platform immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">02.</span>
            Creator Commercial Terms
          </h3>
          <p>
            DROPKULTURE provides end-to-end merchandise commercialization for African cultural creators, artists, musicians, 
            comedic icons, athletes, and digital personalities.
          </p>
          <div className="space-y-2.5 pl-4 border-l-2 border-[#333333]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong>Platform-Funded Production:</strong> DROPKULTURE covers all upfront manufacturing, quality control, 
                packaging, storage, and order fulfillment costs. Creators are not required to invest capital or hold inventory.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong>Creator Royalty:</strong> Creators earn a defined royalty on every completed sale of their official 
                merchandise. The specific percentage and payout cadence are set out in the Creator Agreement signed at onboarding.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong>Automated Settlement:</strong> Accrued royalties are tracked in real time inside the Creator Hub and 
                disbursed to the creator&rsquo;s verified payout method on a regular schedule.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong>Tax Responsibility:</strong> Creators are responsible for reporting their net income to the relevant 
                national tax authorities in their jurisdiction.
              </span>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">03.</span>
            Intellectual Property &amp; Ownership
          </h3>
          <p>
            Creators retain 100% ownership of their brand name, trademarks, logos, catchphrases, and personal likeness. 
            By creating a creator storefront on DROPKULTURE, the creator grants DROPKULTURE a non-exclusive, worldwide license 
            solely to manufacture, market, photograph, display, and distribute official licensed products on their behalf.
          </p>
          <p>
            DROPKULTURE retains all intellectual property in the platform software, user interface design, and promotional 
            materials produced by the platform.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">04.</span>
            Customer Orders, Payments &amp; Fulfillment
          </h3>
          <p>
            All consumer orders placed through DROPKULTURE are subject to product availability and payment verification. 
            Payments are processed through secure, PCI-compliant payment partners supporting mobile money and card transactions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <Truck className="w-4 h-4 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-white mb-1">Kenya Delivery</div>
              <p className="text-[11px] text-[#8E8E93]">
                Same-day and 24-hour delivery within Nairobi, and 24&ndash;48 hours across all 47 counties through our 
                verified fulfillment network.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <Sparkles className="w-4 h-4 text-[#C0C0C0] mb-2" />
              <div className="text-xs font-bold text-white mb-1">Worldwide Shipping</div>
              <p className="text-[11px] text-[#8E8E93]">
                International shipping to diaspora hubs is currently in development and will be announced as Phase 2 rolls out.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
              <ShieldCheck className="w-4 h-4 text-white mb-2" />
              <div className="text-xs font-bold text-white mb-1">Authenticity Guaranteed</div>
              <p className="text-[11px] text-[#8E8E93]">
                Every official piece ships with tamper-evident serialized verification tags and a numbered certificate.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">05.</span>
            Account Security
          </h3>
          <p>
            Users are solely responsible for maintaining the confidentiality of their account credentials, passwords, and 
            security tokens. Passwords are encrypted using industry-standard cryptographic hashing.
          </p>
          <p>
            If you notice any unauthorized access or security concern regarding your account, please contact our support 
            team immediately through the in-app contact channel.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">06.</span>
            Returns &amp; Quality Assurance
          </h3>
          <p>
            Due to the limited-edition, numbered nature of our creator drops, size exchanges are subject to stock availability. 
            If an item arrives with manufacturing defects or damage, customers are entitled to a full replacement or refund 
            upon inspection within 7 days of delivery.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3 pb-8 border-b border-[#222222]">
          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#8E8E93]">07.</span>
            Governing Law &amp; Inquiries
          </h3>
          <p>
            These Terms are governed by and construed in accordance with the laws of Kenya and applicable international trade 
            treaties. For legal questions or partnership inquiries, please reach out through the official contact channel on 
            the platform.
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