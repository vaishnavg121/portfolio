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

export const WindyCaseStudy = () => {
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
          <div className="font-mono text-accent text-sm mb-4 tracking-widest">WINDY // 2026 // IMPLEMENTED</div>
          <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 uppercase tracking-tighter">Aviation Weather Intelligence</h1>
          <p className="text-xl md:text-2xl text-text-muted font-light leading-relaxed mb-12 max-w-3xl">
            An agentic investigation layer routing natural-language questions through deterministic DuckDB analytics, bounded PCA/K-Means pattern discovery, and semantic RAG.
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <a href="https://github.com/vaishnavg121/Windy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors">
              [GITHUB] View Source ?
            </a>
          </div>
        </div>

        {/* 02 PROBLEM STATEMENT */}
        <section className="case-section mb-24">
          <SectionHeader number="02" title="The Engineering Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              Large aviation-weather datasets are difficult to investigate through natural language without losing numerical rigor. A language model should not calculate over millions of sensor rows, invent missing measurements, or blur the boundary between observed evidence and general meteorological guidance.
            </p>
            <p>
              The LLM must be used for intent assistance and grounded synthesis, never as the calculator or source of measured values.
            </p>
          </div>
        </section>

        {/* 03 ARCHITECTURE */}
        <section className="case-section mb-24">
          <SectionHeader number="03" title="System Architecture" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-12">
            <p>
              Windy implements a strictly bounded execution pipeline. Numerical weather truth always comes from deterministic tools, and semantic RAG retrieves qualitative domain knowledge.
            </p>
          </div>
          <div className="bg-accent/5 border-l-2 border-accent p-6 md:p-10 mb-8 font-mono text-sm text-white/90">
            Next.js UI ? FastAPI SSE Agent ? Typed Deterministic Tools ? DuckDB / PCA / Semantic RAG ? Evidence Collection ? NVIDIA Nemotron Synthesis
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/windy/windy-agent-architecture.png" alt="[ AGENT ARCHITECTURE ]" className="h-full" />
          </div>
        </section>

        {/* 04 DETERMINISTIC ANALYTICS */}
        <section className="case-section mb-24">
          <SectionHeader number="04" title="Deterministic Analytics" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              The system queries over approximately <strong>15 million observations</strong> across 5 airports (Hyderabad, Guwahati, Jaipur, Lucknow, Varanasi). 
            </p>
            <p>
              Typed tools own filtering, aggregation, airport selection, and cross-airport comparisons using <strong>DuckDB</strong>. The LLM does not generate arbitrary SQL. When comparing two airports, a bounded scalar comparison queries each independently, validating metric availability before the LLM synthesizes the result.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/windy/windy-data-boundaries.png" alt="[ DUCKDB DATA BOUNDARIES ]" className="h-full" />
          </div>
        </section>

        {/* 05 RAG BOUNDARIES */}
        <section className="case-section mb-24">
          <SectionHeader number="05" title="Semantic RAG Boundaries" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              The structured 15M-row dataset is <strong>never embedded</strong>. The RAG index is exclusively for text documentation from authoritative domain sources (WMO, FAA, NOAA/NWS, ICAO) and internal project reports.
            </p>
            <p>
              Retrieval uses page-aware chunks, source metadata citations, a <code>top_k=4</code> limit, and a strict <code>0.20</code> minimum relevance gate. Retrieved documentation is strictly prevented from introducing measured weather values.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/windy/windy-rag-boundary.png" alt="[ STRICT RAG BOUNDARY ]" className="h-full" />
          </div>
        </section>

        {/* 06 PATTERN DISCOVERY */}
        <section className="case-section mb-24">
          <SectionHeader number="06" title="Bounded Pattern Discovery" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-8">
            <p>
              An unsupervised ML pipeline (StandardScaler ? PCA ? K-Means) discovers multivariate patterns. To ensure predictable interactivity, the analysis sample is strictly capped at 5,000 rows.
            </p>
            <p>
              The system explicitly reports <code>rows_used</code> vs <code>total_eligible</code>. Clusters are treated as descriptive patterns, not supervised forecasts or official meteorological labels.
            </p>
          </div>
          <div className="w-full h-[400px]">
            <VisualSlot src="/assets/projects/windy/windy-pattern-discovery.png" alt="[ K-MEANS PATTERN DISCOVERY ]" className="h-full" />
          </div>
        </section>

        {/* 07 LIMITATIONS */}
        <section className="case-section mb-24">
          <SectionHeader number="07" title="Limitations & Safety" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">SSE TELEMETRY</h3>
              <p className="font-mono text-sm text-white/80 leading-relaxed">
                The FastAPI-to-React SSE stream exposes application-level telemetry (classification, tool execution, retrieval, synthesis) while strictly hiding model chain-of-thought, credentials, and raw provider traces.
              </p>
            </div>
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">OPERATIONAL LIMITS</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Demonstrator analytics platform, not a certified flight-safety system.</li>
                <li>RAG is bounded by the indexed corpus.</li>
                <li>Raw weather dataset is omitted from public release.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 08 CLOSING */}
        <section className="case-section border-t border-white/10 pt-24 pb-12 flex flex-col items-center text-center">
          <Link href="/work/spenza" className="group flex items-center gap-4 text-lg font-mono uppercase tracking-widest hover:text-accent transition-colors">
            <span>Next Project: Spenza</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
};

