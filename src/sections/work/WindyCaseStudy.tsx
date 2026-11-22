/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useRef } from 'react';
import { VisualSlot } from './VisualSlot';
import Link from 'next/link';
import { MoveLeft, ArrowRight, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const SectionHeader = ({ number, title }: { number: string, title: string }) => (
  <div className="mb-6 lg:mb-14 case-section-header">
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

export const WindyCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
    <main className="bg-[#020202] min-h-screen text-[#e5e5e5] selection:bg-accent-soft selection:text-accent font-sans" ref={containerRef}>
      
      {/* 01 HERO */}
      <section className="pt-8 pb-12 lg:pt-48 lg:pb-32 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <Link href="/#work" className="hero-elem inline-flex min-h-11 lg:min-h-0 items-center gap-2 text-text-muted hover:text-white font-mono text-xs tracking-widest uppercase mb-7 lg:mb-20 group transition-colors" data-familiar-reaction="wave">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-24">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="hero-elem font-mono text-accent text-xs tracking-widest mb-6 uppercase flex items-center gap-4">
              <div className="w-8 h-[1px] bg-accent/50" />
              <span>WINDY</span>
            </div>
            
            <h1 className="hero-elem text-3xl md:text-5xl font-display uppercase tracking-tighter leading-tight mb-8 text-white/90">
              Agentic Aviation Weather Intelligence
            </h1>
            
            <div className="hero-elem font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase mb-8 space-y-2">
              <p>Meteorological Analytics</p>
              <p>DuckDB / FastAPI / React</p>
              <p className="text-white/30">NVIDIA Nemotron 3.5 Lightning</p>
            </div>
            
            <div className="hero-elem flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="px-3 py-1 bg-white/5 border border-white/10">Deterministic SQL</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Semantic RAG</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">PCA / K-Means</span>
            </div>
            
            <div className="hero-elem mt-7 lg:mt-16 font-mono text-xs text-text-muted tracking-widest uppercase flex items-center gap-3">
              <span className="w-4 h-[1px] bg-text-muted" /> SCROLL TO EXPLORE
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="hero-elem w-full min-h-[16rem] lg:min-h-0 lg:aspect-[16/10] relative rounded-sm overflow-hidden border border-white/10 bg-[#050505]">
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(0deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
               <div className="inset-0 lg:absolute flex min-h-[16rem] lg:min-h-0 flex-col items-center justify-center text-center p-4 lg:p-8 relative z-10 mix-blend-screen opacity-90">
                 <div className="w-full max-w-lg font-mono text-[10px] md:text-xs text-accent/70 tracking-widest text-left space-y-2 mb-5 lg:mb-8 p-3 lg:p-4 max-lg:[overflow-wrap:anywhere] border border-accent/20 bg-accent/5">
                   <p>&#123;</p>
                   <p className="pl-4">"intent": "pattern_discovery",</p>
                   <p className="pl-4">"tool": "WeatherQueryTool",</p>
                   <p className="pl-4">"backend": "DuckDB"</p>
                   <p>&#125;</p>
                 </div>
                 <h2 className="font-display text-2xl lg:text-4xl text-white/40 tracking-tight uppercase">Numerical Grounding</h2>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-32 space-y-16 lg:space-y-40">
        
        {/* 01 PROBLEM */}
        <CaseSection>
          <SectionHeader number="01" title="The Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              Large heterogeneous meteorological datasets are difficult to investigate through natural language while keeping numerical results completely deterministic and explanations strictly grounded.
            </p>
            <p>
              Typical LLMs hallucinate calculations when presented with raw tabular data in-context, and fail to respect strict filtering parameters. The LLM does not, and cannot, calculate numerical weather truth. It needs an architecture that strictly separates numerical computation from semantic synthesis.
            </p>
          </div>
        </CaseSection>

        {/* 02 DATA SCALE */}
        <CaseSection>
          <SectionHeader number="02" title="Data Scale" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The system analyzes approximately 15 million structured meteorological observations across multiple major Indian airports (Hyderabad, Guwahati, Jaipur, Lucknow, Varanasi). 
            </p>
            <p className="text-sm border-l border-accent/50 pl-4 mt-6 text-white/60">
              Note: The raw meteorological dataset is restricted and generated DuckDB stores remain local. They are explicitly excluded from the public repository due to data ownership distribution constraints.
            </p>
          </div>
        </CaseSection>

        {/* 03 SYSTEM ARCHITECTURE */}
        <CaseSection>
          <SectionHeader number="03" title="System Architecture" />
          <div className="w-full h-auto aspect-[16/10] md:aspect-[16/9] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/windy/windy-weather-intelligence-pipeline.png" alt="Weather intelligence pipeline. Numerical weather truth remains inside deterministic tools; synthesis happens downstream." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Windy is an agentic aviation-weather intelligence system. It routes natural-language questions through a strict pipeline:
            </p>
            <ul className="font-mono text-[11px] md:text-xs space-y-3 mt-6 mb-8 text-white/70 bg-white/5 border border-white/10 p-6 md:p-8">
              <li><strong>Intent Classification:</strong> Identifies if the user needs pattern discovery, aggregation, multi-airport comparison, or domain knowledge.</li>
              <li><strong>Typed Deterministic Tools:</strong> Interrogates the local DuckDB instance holding the 15M sensor rows.</li>
              <li><strong>Semantic RAG:</strong> Embeds domain context using NVIDIA Nemotron.</li>
              <li><strong>Pattern Discovery:</strong> Optionally executes unsupervised K-Means clustering over PCA-reduced observations.</li>
              <li><strong>Grounded Synthesis:</strong> An NVIDIA Nemotron 3.5 Lightning LLM synthesizes the final textual conclusion based <em>only</em> on the exact numerical evidence returned by the tools.</li>
            </ul>
          </div>
        </CaseSection>

        {/* 04 DETERMINISTIC ANALYTICS */}
        <CaseSection>
          <SectionHeader number="04" title="Deterministic Analytics" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              LLMs are not calculators. In Windy, the typed analytics tools entirely own:
            </p>
            <ul className="space-y-2 mt-4 mb-6 list-disc list-inside">
              <li>Timeframe and airport filtering</li>
              <li>Data aggregations (averages, minimums, maximums)</li>
              <li>Event window generation</li>
              <li>Cross-airport scalar comparisons</li>
            </ul>
            <p>
              For multi-airport comparisons, the agent validates that the requested metric exists, invokes the deterministic <code>WeatherQueryTool</code> separately for each airport, and returns exact scalar values and row counts. The LLM operates only after this exact evidence is collected.
            </p>
          </div>
        </CaseSection>

        {/* 05 RAG BOUNDARY */}
        <CaseSection>
          <SectionHeader number="05" title="Numerical Data vs RAG Boundary" />
          <div className="bg-accent/5 border-l-2 border-accent p-6 md:p-10 mb-8">
            <p className="font-light text-lg leading-relaxed text-white/90">
              The 15 million structured sensor observations are NEVER placed in the vector database. RAG indexes text documentation only.
            </p>
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The semantic index (processed via <code>nvidia/nemotron-3-embed-1b</code>) is exclusively reserved for authoritative meteorological context, such as FAA, WMO, NOAA/NWS, ICAO guidelines, and internal project reports. 
            </p>
            <p>
              Retrieval is tightly bounded, using cosine similarity with <code>top_k=4</code> and a strict <code>0.20</code> minimum relevance threshold, allowing the system to return zero chunks if the question is unrelated to aviation meteorology. RAG provides the domain context; DuckDB provides the measured numerical truth.
            </p>
          </div>
        </CaseSection>

        {/* 06 PATTERN DISCOVERY */}
        <CaseSection>
          <SectionHeader number="06" title="Unsupervised Pattern Discovery" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              For requests investigating recurring multivariate patterns, the system executes an ML pipeline on the fly. It selects complete numerical rows for the requested timeframe, applies a <code>StandardScaler</code>, reduces dimensions via <code>PCA(2)</code>, and clusters using <code>K-Means</code>.
            </p>
            <p>
              To maintain responsive API times, the ML pipeline intentionally samples at most <strong>5,000</strong> eligible observations. The API explicitly reports both <code>rows_used</code> and <code>total_eligible</code> to the UI.
            </p>
            <p className="text-sm mt-4 text-white/60">
              These clusters are descriptive mathematical patterns. They are not certified weather labels or forecasting models.
            </p>
          </div>
        </CaseSection>

        {/* 07 ANALYTICS & INSIGHTS */}
        <CaseSection>
          <SectionHeader number="07" title="Analytics & Decision Insights" />
          <div className="w-full h-auto aspect-[16/10] md:aspect-[16/9] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/windy/windy-analytics-decision-insights.png" alt="Analytics and decision insights showing grounded synthesis and deterministic evidence bounds." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The frontend receives the final synthesis and the raw evidence payload, allowing it to render the conclusion alongside supporting tables, descriptive charts, and explicit RAG citations.
            </p>
          </div>
        </CaseSection>

        {/* 08 AGENT ACTIVITY */}
        <CaseSection>
          <SectionHeader number="08" title="Agent Activity / SSE" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The Next.js UI connects to the FastAPI backend via Server-Sent Events (SSE). The activity stream broadcasts application telemetry: intent classification, tool execution, retrieval, analysis, and synthesis phases.
            </p>
            <p>
              Crucially, this is application telemetry, not raw LLM thought. The site does not expose prompts, scratchpads, or provider traces, ensuring the user interface remains focused on meteorological insights rather than raw model debugging.
            </p>
          </div>
        </CaseSection>

        {/* 09 VALIDATION & LIMITATIONS */}
        <CaseSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">VALIDATED ARCHITECTURE</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Deterministic SQL filtering & aggregation</li>
                <li>RAG relevance rejection threshold</li>
                <li>PCA/K-Means sampling bounds</li>
                <li>Event stream routing and state</li>
              </ul>
            </div>
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">CURRENT LIMITATIONS</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Not certified aviation software or flight-safety system</li>
                <li>Raw dataset is restricted/local only</li>
                <li>Pattern discovery is sample-bound (5k rows max)</li>
                <li>NVIDIA services depend on API availability</li>
              </ul>
            </div>
          </div>
        </CaseSection>

        {/* 10 METADATA */}
        <CaseSection className="border-t border-white/10 pt-24 flex flex-col items-center text-center pb-8">
          <h3 className="font-mono text-xs tracking-widest text-white/70 uppercase mb-4">Windy</h3>
          <p className="font-mono text-[10px] text-accent mb-8">METEOROLOGICAL ANALYTICS &middot; 2026</p>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-tight text-white/90 mb-16 max-w-2xl">
            Agentic Aviation Weather Intelligence
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <a href="https://github.com/vaishnavg121/Windy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors text-text-muted" data-familiar-protect data-familiar-reaction="wave">
              <ExternalLink className="w-4 h-4" />
              <span>View Source</span>
            </a>
            
            <Link href="/work/spenza" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-accent transition-colors" data-familiar-protect data-familiar-reaction="wave">
              <span>Next Project: Spenza</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </CaseSection>

      </div>
    </main>
  );
};
