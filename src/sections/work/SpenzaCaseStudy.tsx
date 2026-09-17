"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const VisualSlot = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => {
  return (
    <div className={`relative w-full bg-[#050505] border border-white/10 overflow-hidden flex items-center justify-center group ${className}`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)", backgroundSize: "10px 10px" }} />
      <div className="absolute inset-0 border border-accent/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700" />
      <span className="font-mono text-[10px] text-text-muted tracking-widest z-10 uppercase mix-blend-difference">{alt}</span>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className="object-cover opacity-0 transition-opacity duration-500 on-load-show" 
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
        onLoad={(e) => {
          (e.target as HTMLElement).style.opacity = "1";
        }}
      />
    </div>
  );
};

const SectionHeader = ({ number, title }: { number: string, title: string }) => (
  <div className="mb-12 md:mb-16 case-section-header">
    <div className="flex items-center gap-4 text-accent font-mono text-sm tracking-widest mb-4">
      <span>{number}</span>
      <div className="w-12 h-[1px] bg-accent/50" />
    </div>
    <h2 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white">{title}</h2>
  </div>
);

export const SpenzaCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-elem", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });

      (gsap.utils.toArray(".case-section") as HTMLElement[]).forEach((section) => {
        gsap.from(section, {
          y: 60,
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
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-32 pb-24 selection:bg-accent-soft selection:text-accent">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        
        {/* BACK LINK */}
        <Link href="/#work" className="hero-elem inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-mono text-sm tracking-widest uppercase mb-16 group transition-colors">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        {/* 01 HERO */}
        <div className="hero-elem mb-24">
          <div className="font-mono text-accent text-sm mb-4 tracking-widest">SPENZA // 2026 // IMPLEMENTED</div>
          <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 uppercase tracking-tighter">Deterministic Expense Engine</h1>
          <p className="text-xl md:text-2xl text-text-muted font-light leading-relaxed mb-12 max-w-3xl">
            A robust shared-expense system where monetary state remains deterministic and auditable under complex splitting, edits, retries, settlements, and concurrent changes.
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <a href="https://github.com/vaishnavg121/Spenza" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors">
              [GITHUB] View Source ?
            </a>
          </div>
        </div>

        {/* 02 PROBLEM STATEMENT */}
        <section className="case-section mb-24">
          <SectionHeader number="02" title="The Engineering Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              How do you build a financial application that survives network drops, duplicate requests, and concurrent edits without losing cents or corrupting the ledger?
            </p>
            <p>
              Spenza is not just a Splitwise clone. It is an exploration of immutable financial invariants, safe retries (idempotency), and strict split engines that maintain exact monetary reconciliation.
            </p>
          </div>
        </section>

        {/* 03 MONEY REPRESENTATION */}
        <section className="case-section mb-24">
          <SectionHeader number="03" title="Money Representation & Invariants" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              JavaScript floating-point math (e.g., <code>0.1 + 0.2 = 0.30000000000000004</code>) is unsafe for financial systems. 
            </p>
            <p>
              Spenza strictly stores and calculates all monetary values as <strong>integer minor units</strong> (e.g., ?100.00 is stored and computed as <code>10000</code>).
            </p>
            <p>
              The system enforces fundamental accounting invariants at the database transaction boundary:
            </p>
          </div>
          <div className="bg-[#050505] border border-white/10 p-6 md:p-8 font-mono text-sm text-white/80 space-y-4 mb-8">
            <div className="border-b border-white/5 pb-4">
              <span className="text-accent block text-xs mb-2">EXPENSE LEVEL INVARIANTS</span>
              sum(contributions) = total<br />
              sum(allocations) = total
            </div>
            <div className="pt-2">
              <span className="text-accent block text-xs mb-2">GROUP LEVEL INVARIANTS</span>
              sum(member net positions) = 0<br /><br />
              <span className="text-text-muted text-xs">net = contributions - allocations + settlements paid - settlements received</span>
            </div>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/spenza/spenza-money-invariants.png" alt="[ MONEY INVARIANTS SYSTEM ]" className="h-full" />
          </div>
        </section>

        {/* 04 SPLIT ENGINE */}
        <section className="case-section mb-24">
          <SectionHeader number="04" title="Deterministic Split Engine" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              Spenza supports equal, exact, percentage, and share-based splits. When an amount cannot be divided evenly, the engine uses <strong>largest-remainder integer allocation</strong> to ensure deterministic rounding without losing or creating a single cent.
            </p>
            <p>
              For example, splitting ?100 (<code>10000</code> units) equally among 3 people results in <code>3334</code>, <code>3333</code>, <code>3333</code>, maintaining the exact total invariant instead of independent floating-point rounding.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/spenza/spenza-split-engine.png" alt="[ SPLIT ALLOCATION ALGORITHM ]" className="h-full" />
          </div>
        </section>

        {/* 05 IDEMPOTENCY */}
        <section className="case-section mb-24">
          <SectionHeader number="05" title="Transaction Safety & Idempotency" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              A retry on a timeout should never create a duplicate financial charge. 
            </p>
            <p>
              Spenza uses idempotency keys. A request flows through validation and authorization into a PostgreSQL transaction. If it succeeds, the financial mutation and an immutable activity record are committed together. A retried request with the same idempotency key simply returns the original committed result without mutating state again.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/spenza/spenza-idempotency-flow.png" alt="[ IDEMPOTENT REQUEST FLOW ]" className="h-full" />
          </div>
        </section>

        {/* 06 ARCHITECTURE */}
        <section className="case-section mb-24">
          <SectionHeader number="06" title="System Architecture" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">WORKSPACE & FRONTEND</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>pnpm workspace monorepo</li>
                <li>Next.js App Router (PWA)</li>
                <li>TanStack Query + React Hook Form</li>
                <li>Zod schema validation</li>
              </ul>
            </div>
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">API & PERSISTENCE</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Express API (No direct DB from browser)</li>
                <li>Prisma + PostgreSQL transactions</li>
                <li>Clerk JWT verification</li>
                <li>Immutable activity appending</li>
              </ul>
            </div>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/spenza/spenza-system-architecture.png" alt="[ SPENZA MONOREPO ARCHITECTURE ]" className="h-full" />
          </div>
        </section>

        {/* 07 CLOSING */}
        <section className="case-section border-t border-white/10 pt-24 pb-12 flex flex-col items-center text-center">
          <Link href="/#work" className="group flex items-center gap-4 text-lg font-mono uppercase tracking-widest hover:text-accent transition-colors">
            <span>Next Project: Velociraptor</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
};

