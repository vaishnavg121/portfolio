/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoveLeft, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const VisualSlot = ({ src, alt, className = "", objectFit = "contain" }: { src: string, alt: string, className?: string, objectFit?: "cover" | "contain" }) => {
  return (
    <div className={`relative w-full bg-[#030303] border border-white/5 overflow-hidden flex items-center justify-center group ${className}`} data-familiar-protect data-familiar-reaction="inspect">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)", backgroundSize: "4px 4px" }} />
      <div className="absolute inset-0 border border-accent/20 scale-[0.98] opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
      <span className="absolute bottom-4 left-4 font-mono text-[10px] text-text-muted tracking-widest z-10 uppercase mix-blend-difference pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">{alt}</span>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        sizes="100vw"
        className={`object-${objectFit} opacity-0 transition-opacity duration-700`} 
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
        onLoad={(e) => {
          (e.target as HTMLElement).style.opacity = '1';
        }}
      />
    </div>
  );
};

const SectionHeader = ({ number, title }: { number: string, title: string }) => (
  <div className="mb-10 md:mb-14 case-section-header">
    <div className="flex items-center gap-4 text-accent font-mono text-xs tracking-widest mb-4">
      <span>{number}</span>
      <div className="w-12 h-[1px] bg-accent/50" />
    </div>
    <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-white/90">{title}</h2>
  </div>
);

const CaseSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`case-section relative w-full ${className}`}>
    {children}
  </section>
);

export const SpenzaCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });

      (gsap.utils.toArray('.case-section') as HTMLElement[]).forEach((section) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div className="bg-[#020202] min-h-screen text-[#e5e5e5] selection:bg-accent-soft selection:text-accent font-sans" ref={containerRef}>
      
      {/* 01 HERO */}
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <Link href="/#work" className="hero-elem inline-flex items-center gap-2 text-text-muted hover:text-white font-mono text-xs tracking-widest uppercase mb-12 md:mb-20 group transition-colors" data-familiar-reaction="wave">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="hero-elem font-mono text-accent text-xs tracking-widest mb-6 uppercase flex items-center gap-4">
              <div className="w-8 h-[1px] bg-accent/50" />
              <span>SPENZA</span>
            </div>
            
            <h1 className="hero-elem text-3xl md:text-5xl font-display uppercase tracking-tighter leading-tight mb-8 text-white/90">
              PWA-First Expense Splitting Platform
            </h1>
            
            <div className="hero-elem font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase mb-8 space-y-2">
              <p>Financial Engineering</p>
              <p>Next.js / Express / Prisma</p>
              <p className="text-white/30">PostgreSQL / Clerk</p>
            </div>
            
            <div className="hero-elem flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="px-3 py-1 bg-white/5 border border-white/10">Idempotency</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Minor Units</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Monorepo</span>
            </div>
            
            <div className="hero-elem mt-16 font-mono text-xs text-text-muted tracking-widest uppercase flex items-center gap-3">
              <span className="w-4 h-[1px] bg-text-muted" /> SCROLL TO EXPLORE
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="hero-elem w-full aspect-[4/3] md:aspect-[16/10] relative rounded-sm overflow-hidden border border-white/10 bg-[#050505]">
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(0deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10 mix-blend-screen opacity-90">
                 <div className="w-full max-w-lg font-mono text-[10px] md:text-xs text-accent/70 tracking-widest text-left space-y-2 mb-8 p-4 border border-accent/20 bg-accent/5">
                   <p>&#123;</p>
                   <p className="pl-4">"currency": "INR",</p>
                   <p className="pl-4">"amountMinor": "10000",</p>
                   <p className="pl-4">"idempotency_key": "req_8xV1..."</p>
                   <p>&#125;</p>
                 </div>
                 <h2 className="font-display text-4xl text-white/40 tracking-tight uppercase">Financial Invariants</h2>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-32 space-y-32 md:space-y-40">
        
        {/* 01 PROBLEM */}
        <CaseSection>
          <SectionHeader number="01" title="The Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              Expense sharing applications frequently suffer from floating-point arithmetic errors, dropped network requests resulting in double-charging, and fragile state synchronization across clients.
            </p>
            <p>
              Spenza is engineered to eliminate these classes of errors by treating the ledger as a strict financial system. It enforces exact-integer minor units across the entire stack, requires idempotency keys for mutations, and utilizes shared Zod schemas to guarantee API contracts between the frontend and backend.
            </p>
          </div>
        </CaseSection>

        {/* 02 ARCHITECTURE */}
        <CaseSection>
          <SectionHeader number="02" title="Monorepo Architecture" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Spenza is organized as a strict `pnpm` workspace monorepo. This allows the Next.js web client and the Express backend to share exact typing without duplicating models or creating integration drift.
            </p>
            <ul className="font-mono text-[11px] md:text-xs space-y-3 mt-6 mb-8 text-white/70 bg-white/5 border border-white/10 p-6 md:p-8">
              <li><strong>apps/web:</strong> The production Next.js PWA (Progressive Web App).</li>
              <li><strong>apps/api:</strong> The Express API connected to PostgreSQL via Prisma.</li>
              <li><strong>packages/contracts:</strong> Shared Zod schemas enforcing the API boundary.</li>
            </ul>
            <p>
              The system relies on Clerk for robust authentication, maintaining strict separation between identity management and financial ledgers.
            </p>
          </div>
        </CaseSection>

        {/* 03 FINANCIAL INVARIANTS */}
        <CaseSection>
          <SectionHeader number="03" title="Strict Financial Invariants" />
          <div className="w-full h-auto aspect-[16/10] md:aspect-[16/9] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/spenza/spenza-insights-control-logic.png" alt="Spenza insights and control logic illustrating the core invariant enforcement." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Spenza enforces a zero-tolerance policy for precision loss. A monetary amount is a signed integer count of the currency's minor unit. For INR, ₹100.00 is stored and processed strictly as <code>10000</code>.
            </p>
            <p>
              Persistent monetary columns use PostgreSQL <code>BIGINT</code>. In TypeScript, financial arithmetic relies on <code>bigint</code> representations. Crucially, JSON transmits these minor-unit values as base-10 strings (<code>"amountMinor": "10000"</code>), guaranteeing that values cannot silently lose precision during JavaScript parsing.
            </p>
            <p>
              The sum of all payer contributions must identically equal the total expense amount. Negative expense totals or zero-value settlements are strictly rejected at the schema level.
            </p>
          </div>
        </CaseSection>

        {/* 04 SPENDING ANALYSIS FLOW */}
        <CaseSection>
          <SectionHeader number="04" title="Analysis & Ledger Flow" />
          <div className="w-full h-auto aspect-[16/10] md:aspect-[16/9] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/spenza/spenza-spending-analysis-flow.png" alt="Spenza spending analysis and idempotent transaction flow." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Network requests from mobile devices are inherently unreliable. To prevent double-charging users if a request times out and is retried, all mutating endpoints demand a client-generated <code>idempotency_key</code>. The Express API checks this key against a dedicated idempotency table before executing the financial write, guaranteeing exactly-once transaction semantics.
            </p>
            <p>
              Analytics and balance projections are built as disposable, rebuildable projections derived from the authoritative, immutable expense records. The core ledger remains the irrefutable source of truth.
            </p>
          </div>
        </CaseSection>

        {/* 05 TESTING AND STABILITY */}
        <CaseSection>
          <SectionHeader number="05" title="Validation & Test Scale" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-text-muted mb-8" data-familiar-protect data-familiar-reaction="read">
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">214 exhaustive API tests</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Idempotency & Retry validations</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Complete typecheck pipeline</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Cross-currency rejection tests</div>
          </div>
        </CaseSection>

        {/* 06 METADATA */}
        <CaseSection className="border-t border-white/10 pt-24 flex flex-col items-center text-center pb-8">
          <h3 className="font-mono text-xs tracking-widest text-white/70 uppercase mb-4">Spenza</h3>
          <p className="font-mono text-[10px] text-accent mb-8">FINANCIAL ENGINEERING &middot; 2026</p>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-tight text-white/90 mb-16 max-w-2xl">
            Reliable Expense Sharing
          </h2>
          
          <div className="flex justify-center">
            <a href="https://github.com/vaishnavg121/Spenza" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors text-text-muted" data-familiar-protect data-familiar-reaction="wave">
              <ExternalLink className="w-4 h-4" />
              <span>View Source</span>
            </a>
          </div>
        </CaseSection>

      </div>
    </div>
  );
};
