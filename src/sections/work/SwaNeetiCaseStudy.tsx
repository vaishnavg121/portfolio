/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useRef } from 'react';
import { ProjectCoverVisual } from './ProjectMotion';
import { TechnicalFlow } from './TechnicalFlow';
import Link from 'next/link';
import { MoveLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useCaseMotion } from "./useCaseMotion";

const SectionHeader = ({ number, title }: { number: string, title: string }) => (
  <div className="mb-5 lg:mb-14 case-section-header">
    <div className="flex items-center gap-4 text-accent font-mono text-xs tracking-widest mb-4">
      <span>{number}</span>
      <div className="w-12 h-[1px] bg-accent/50" />
    </div>
    <h2 className="chapter-heading uppercase">{title}</h2>
  </div>
);

const CaseSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`case-section relative w-full ${className}`}>
    {children}
  </section>
);

export const SwaNeetiCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useCaseMotion(containerRef);

  return (
    <main className="case-page min-h-screen text-[#e5e5e5] selection:bg-accent-soft selection:text-accent font-sans" ref={containerRef}>
      
      {/* 01 HERO */}
      <section className="case-cover portfolio-frame relative">
        <Link href="/#work" className="hero-elem inline-flex min-h-11 lg:min-h-0 items-center gap-2 text-text-muted hover:text-white font-mono text-xs tracking-widest uppercase mb-4 lg:mb-10 group transition-colors" data-familiar-reaction="wave">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        <div className="case-cover-layout flex flex-col lg:flex-row">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="hero-elem font-mono text-accent text-xs tracking-widest mb-6 uppercase flex items-center gap-4">
              <div className="w-8 h-[1px] bg-accent/50" />
              <span>SWA.NEETI</span>
            </div>
            
            <h1 className="hero-elem case-title font-display lg:text-5xl uppercase tracking-tighter leading-tight mb-4 lg:mb-8 text-white/90">
              Evidence-Grounded Agentic Legal Research Engine
            </h1>
            <p className="hero-elem case-lede">An Indian legal research tool that connects preliminary analysis to retrieved statutes, precedents, and case evidence.</p>
            
            <div className="hero-elem font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase mb-4 lg:mb-8 space-y-2">
              <p>Legal Engineering</p>
              <p>FastAPI / Next.js / PGVector</p>
              <p className="text-white/30">NVIDIA Nemotron / Local BGE-M3</p>
            </div>
            
            <div className="hero-elem flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="px-3 py-1 bg-white/5 border border-white/10">Case Reasoning</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">RRF Retrieval</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Deterministic Graphs</span>
            </div>
            
          </div>
          
          <div className="hero-elem lg:w-2/3">
            <ProjectCoverVisual slug="swaneeti" />
          </div>
        </div>
      </section>

      <div className="case-body portfolio-frame">
        
        {/* 01 PROBLEM */}
        <CaseSection>
          <SectionHeader number="01" title="The Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              "Ask an LLM a legal question" is the wrong engineering problem. The real challenge is determining how legal research can be structured so that facts, evidence, legal authority, citations, research gaps, and competing arguments remain strictly traceable throughout an agentic workflow.
            </p>
            <p>
              If a system cannot guarantee that a piece of evidence supports a factual event rather than acting as a legal precedent, or if it cannot differentiate between a retrieved statute and an invented claim, the system is fundamentally unfit for legal analysis.
            </p>
          </div>
        </CaseSection>

        {/* 02 DESIGN THESIS */}
        <CaseSection>
          <SectionHeader number="02" title="Design Thesis" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Swa.Neeti proposes that the Language Model should not act as a legal database. The model is a reasoning engine operating over a deterministic relational graph reconstructed from canonical state.
            </p>
            <p>
              The application boundary enforces strict separation between the Next.js workspace and the FastAPI service. The browser receives structured Server-Sent Events containing deterministic responses—it never receives raw prompts, hidden reasoning, or arbitrary database queries. The model receives curated authority excerpts governed by a deterministic retrieval service, ensuring it cannot invent legal authority out of its latent memory.
            </p>
          </div>
        </CaseSection>

        {/* 03 LEGAL RESEARCH LOOP */}
        <CaseSection>
          <SectionHeader number="03" title="Legal Research Loop" />
          <TechnicalFlow id="legalLoop" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Swa.Neeti executes a staged, observable application workflow rather than relying on unconstrained chain-of-thought looping. The stages represent explicit application states:
            </p>
            <ul className="font-mono text-[11px] md:text-xs space-y-3 mt-6 mb-8 text-white/70 bg-white/5 border border-white/10 p-6 md:p-8">
              <li><strong>Intake:</strong> Extracts only facts explicitly supported by the user text.</li>
              <li><strong>Missing Facts / Issue Spotting:</strong> Identifies preliminary categories and factual omissions.</li>
              <li><strong>Research Planning:</strong> Translates issues into typed research queries.</li>
              <li><strong>Restricted Legal Search:</strong> Retrieves law from the configured corpus.</li>
              <li><strong>Authority Selection:</strong> Filters irrelevant retrieved results.</li>
              <li><strong>Issue Analysis:</strong> Synthesizes findings specifically for the spotted issue.</li>
              <li><strong>Support Validation:</strong> Ensures all claims trace back to selected authority.</li>
              <li><strong>Sufficiency & Bounded Gap Iteration:</strong> Retries retrieval if support is weak, or halts.</li>
              <li><strong>Preliminary Synthesis:</strong> Combines issue analyses into a single report.</li>
            </ul>
          </div>
        </CaseSection>

        {/* 04 HYBRID RETRIEVAL */}
        <CaseSection>
          <SectionHeader number="04" title="Hybrid Retrieval Architecture" />
          <TechnicalFlow id="legalRetrieval" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Retrieval is governed by a typed <code>LegalSearchQuery</code>. The pipeline initiates with deterministic parsing of exact statutory references and metadata filters, bypassing semantic search when an exact citation is requested.
            </p>
            <p>
              For semantic queries, the architecture employs <strong>Reciprocal Rank Fusion (k=60)</strong> to combine lexical and dense retrieval scores, accounting for their inherently incompatible numerical scales. Crucially, the system utilizes isolated embedding spaces: a local BGE-M3 profile (1024-dim, processed locally on GPU) and an NVIDIA Nemotron profile operate in completely distinct partitions, preventing cross-model retrieval collisions.
            </p>
            <p>
              Authority ranking is strictly applied <em>after</em> relevance scoring. An irrelevant Supreme Court judgment must not outrank highly relevant local jurisdiction law merely by possessing a higher authority class.
            </p>
          </div>
        </CaseSection>

        {/* 05 EVIDENCE & PROVENANCE */}
        <CaseSection>
          <SectionHeader number="05" title="Evidence & Provenance" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Every claim in the final analysis must demonstrate explicit provenance. The model is supplied with exact evidentiary chunks from uploaded documents. If text is unavailable, the pipeline requests OCR. Untraceable evidence quotes are aggressively discarded during validation. The system is designed to fail closed rather than construct an unsupported narrative.
            </p>
          </div>
        </CaseSection>

        {/* 06 CASE REASONING GRAPH */}
        <CaseSection>
          <SectionHeader number="06" title="Case Reasoning Graph" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The M8 reasoning layer rebuilds a deterministic relational topology representing the case. It contains strictly typed nodes including facts, missing facts, evidence chunks, documents, issues, research questions, statutes, judgments, legal propositions, arguments, and contradictions.
            </p>
            <p>
              The graph enforces profound engineering invariants:
            </p>
            <ul className="font-mono text-[11px] md:text-xs space-y-3 mt-6 mb-8 text-white/70 bg-white/5 border border-white/10 p-6 md:p-8">
              <li className="flex gap-4"><span className="text-accent">EVIDENCE</span> <span>can support a FACT.</span></li>
              <li className="flex gap-4"><span className="text-accent">EVIDENCE</span> <span>cannot become LEGAL AUTHORITY.</span></li>
              <li className="flex gap-4"><span className="text-accent">STATUTES</span> <span>can support LEGAL PROPOSITIONS.</span></li>
              <li className="flex gap-4"><span className="text-accent">STATUTES</span> <span>cannot prove a FACTUAL EVENT occurred.</span></li>
              <li className="flex gap-4"><span className="text-accent">CANDIDATE FACT</span> <span>remains a candidate until explicitly resolved.</span></li>
            </ul>
          </div>
        </CaseSection>

        {/* 07 GAP-AWARE RESEARCH */}
        <CaseSection>
          <SectionHeader number="07" title="Gap-Aware Research" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Research gaps are typed components of the reasoning graph, enabling the agent to evaluate the sufficiency of its own work.
            </p>
            <p>
              A <strong>Retrieval Gap</strong> instructs the agent to reformulate its query. A <strong>Support Gap</strong> mandates a search for stronger authority. A <strong>Fact Gap</strong> halts legal retrieval—acknowledging that missing context cannot be solved by reading more law. Finally, a <strong>Corpus Coverage Gap</strong> stops the branch entirely, explicitly preserving the warning that the required jurisdiction is not present in the ingested database.
            </p>
          </div>
        </CaseSection>

        {/* 08 ADVERSARIAL REASONING */}
        <CaseSection>
          <SectionHeader number="08" title="Adversarial Reasoning" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Instead of producing a singular, confident answer, Swa.Neeti constructs primary and opposing interpretations. 
            </p>
            <p>
              Crucially, this adversarial stage consumes <em>retained authority</em> from prior stages. It evaluates material facts and conditional case-turn scenarios against the same verified evidence, preventing the LLM from inventing a second, hallucinatory body of law to support the opposing argument.
            </p>
          </div>
        </CaseSection>

        {/* 09 VALIDATION & SAFETY */}
        <CaseSection>
          <SectionHeader number="09" title="Validation & Safety" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-text-muted mb-8" data-familiar-protect data-familiar-reaction="read">
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Rejects unsupported authority references</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Fails closed on graph validation errors</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Strict typing prevents cross-case leakage</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Prevents law from answering factual voids</div>
            <div className="border border-accent/20 p-5 bg-accent/5 sm:col-span-2 text-accent text-center font-bold tracking-widest">NOT LEGAL ADVICE — PRELIMINARY ANALYSIS ONLY</div>
          </div>
        </CaseSection>

        {/* 10 LIMITATIONS */}
        <CaseSection>
          <SectionHeader number="10" title="Current State & Limitations" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Swa.Neeti is a legal engineering demonstrator, not an operational law firm tool. The quality of research is strictly bounded by corpus coverage; if the law isn't indexed, it cannot be cited.
            </p>
            <p>
              The system produces preliminary legal research analysis, never legal advice or case-outcome predictions. Research sufficiency remains qualitative, and dense retrieval performance depends heavily on the configured embedding profile (e.g., local BGE-M3 vs NVIDIA Nemotron availability). 
            </p>
          </div>
        </CaseSection>

        {/* 11 METADATA */}
        <CaseSection className="border-t border-white/10 pt-24 flex flex-col items-center text-center pb-8">
          <h3 className="font-mono text-xs tracking-widest text-white/70 uppercase mb-4">Swa.Neeti</h3>
          <p className="font-mono text-[10px] text-accent mb-8">LEGAL ENGINEERING &middot; 2026</p>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-tight text-white/90 mb-16 max-w-2xl">
            Evidence-Grounded Case Reasoning
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <a href="https://github.com/vaishnavg121/swa-neeti" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors text-text-muted" data-familiar-protect data-familiar-reaction="wave">
              <ExternalLink className="w-4 h-4" />
              <span>View Source</span>
            </a>
            
            <Link href="/work/windy" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-accent transition-colors" data-familiar-protect data-familiar-reaction="wave">
              <span>Next Project: Windy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </CaseSection>

      </div>
    </main>
  );
};
