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

export const SwaNeetiCaseStudy = () => {
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
          <div className="font-mono text-accent text-sm mb-4 tracking-widest">SWA.NEETI // 2026 // IMPLEMENTED</div>
          <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 uppercase tracking-tighter">Deterministic Legal Reasoning</h1>
          <p className="text-xl md:text-2xl text-text-muted font-light leading-relaxed mb-12 max-w-3xl">
            An evidence-grounded agentic legal research system for Indian law. Constraining LLM-driven research so facts, law, evidence, and citations remain structurally traceable.
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <a href="https://github.com/vaishnavg121/swa-neeti" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors">
              [GITHUB] View Source ?
            </a>
          </div>
        </div>

        {/* 02 PROBLEM STATEMENT */}
        <section className="case-section mb-24">
          <SectionHeader number="02" title="The Engineering Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              How do you make an LLM answer legal questions? This is the wrong question. 
            </p>
            <p>
              The real engineering challenge is: <strong>"How do I constrain an LLM-driven research process so facts, law, evidence, and citations remain structurally traceable?"</strong>
            </p>
            <p>
              If a system cannot guarantee that a legal statute supports a proposition, or that a piece of evidence supports a fact (and not a law), the system is fundamentally flawed for legal reasoning. Swa.Neeti solves this by introducing deterministic, typed relationship graphs and bounded retrieval over an authorized Indian law corpus.
            </p>
          </div>
        </section>

        {/* 03 RESEARCH WORKFLOW */}
        <section className="case-section mb-24">
          <SectionHeader number="03" title="Staged Research Workflow" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-12">
            <p>
              Swa.Neeti implements a bounded, typed application flow. It does not use hidden "chain of thought". Each stage is explicit and observable:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-text-muted mb-12">
            <div className="border border-white/5 p-4 bg-[#080808]">1. Case Intake & Structured Facts</div>
            <div className="border border-white/5 p-4 bg-[#080808]">2. Missing Facts & Issue Spotting</div>
            <div className="border border-white/5 p-4 bg-[#080808]">3. Restricted Legal Search</div>
            <div className="border border-white/5 p-4 bg-[#080808]">4. Authority Selection</div>
            <div className="border border-white/5 p-4 bg-[#080808]">5. Support Validation</div>
            <div className="border border-white/5 p-4 bg-[#080808]">6. Bounded Gap Iteration</div>
            <div className="border border-white/5 p-4 bg-[#080808]">7. Adversarial Reasoning</div>
            <div className="border border-white/5 p-4 bg-[#080808]">8. Reasoning Graph Synthesis</div>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/swa-neeti/swa-agent-loop.png" alt="[ RESEARCH STAGES & LOOP ]" className="h-full" />
          </div>
        </section>

        {/* 04 CASE REASONING GRAPH */}
        <section className="case-section mb-24">
          <SectionHeader number="04" title="Case Reasoning Graph" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              The Case Reasoning Graph is a deterministic relational layer over canonical case state, not a free-form generic knowledge graph. Node types are strictly defined: case facts, missing facts, evidence chunks, statutes, precedents, issues, arguments, contradictions.
            </p>
            <p>
              Edges use explicit relations (<code>SUPPORTED_BY</code>, <code>CONTRADICTED_BY</code>, <code>CITES</code>). Invariant rules govern this graph:
            </p>
          </div>
          <ul className="space-y-4 font-mono text-sm text-white/80 border-l-2 border-accent pl-6 mb-12">
            <li>Evidence can support a fact, but evidence cannot act as legal authority.</li>
            <li>A statute can support law, but cannot prove a factual event.</li>
            <li>Candidate document facts remain candidates until verified.</li>
            <li>Hypothetical case-turn scenarios always remain hypothetical.</li>
          </ul>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/swa-neeti/swa-reasoning-graph.png" alt="[ DETERMINISTIC GRAPH TOPOLOGY ]" className="h-full" />
          </div>
        </section>

        {/* 05 LEGAL RETRIEVAL */}
        <section className="case-section mb-24">
          <SectionHeader number="05" title="Hybrid Legal Retrieval (M2)" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              The retrieval pipeline is completely typed (<code>LegalSearchQuery</code>). It begins with exact statutory-reference parsing (e.g., recognizing <code>BNS Section 318</code> without requiring an LLM) and metadata/temporal filtering.
            </p>
            <p>
              It combines deterministic term-overlap (lexical) and cosine similarity (dense) searches using <strong>Reciprocal Rank Fusion (k=60)</strong>, followed by a deterministic reranker. A dense-only hit without lexical corroboration or an explicit reference is deliberately withheld to avoid highly confident results for irrelevant questions.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/swa-neeti/swa-hybrid-retrieval.png" alt="[ HYBRID RETRIEVAL PIPELINE ]" className="h-full" />
          </div>
        </section>

        {/* 06 ADVERSARIAL REASONING */}
        <section className="case-section mb-24">
          <SectionHeader number="06" title="Adversarial Legal Reasoning" />
          <div className="bg-accent/5 border-l-2 border-accent p-6 md:p-10 mb-8">
            <p className="font-light text-lg leading-relaxed text-white/90">
              The M4 stage is a bounded, conditional stage that runs only after M3 retains authority. It constructs a primary and opposing interpretation from the same issue packet. It consumes retrieved authority and does not invent a second law corpus from model memory.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/swa-neeti/swa-provenance-flow.png" alt="[ PROVENANCE & ADVERSARIAL FLOW ]" className="h-full" />
          </div>
        </section>

        {/* 07 SAFETY AND LIMITATIONS */}
        <section className="case-section mb-24">
          <SectionHeader number="07" title="Safety & Verification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">VALIDATION INVARIANTS</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li><code>CaseReasoningGraphValidator</code> fails closed.</li>
                <li>Unknown or cross-case identities are rejected.</li>
                <li>Untraceable evidence quotes are discarded.</li>
                <li>Candidate promotion must be explicit.</li>
              </ul>
            </div>
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">CURRENT LIMITATIONS</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Requires explicit corpus ingestion bounds.</li>
                <li>Produces preliminary research analysis, not legal advice.</li>
                <li>Does not predict case outcomes.</li>
                <li>Evidence descriptions are never treated as inspected evidence.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 08 CLOSING */}
        <section className="case-section border-t border-white/10 pt-24 pb-12 flex flex-col items-center text-center">
          <Link href="/work/windy" className="group flex items-center gap-4 text-lg font-mono uppercase tracking-widest hover:text-accent transition-colors">
            <span>Next Project: Windy</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
};

