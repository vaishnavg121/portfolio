"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoveLeft, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Helper for image slots that fail gracefully
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
  <div className="mb-12 md:mb-16 case-section-header">
    <div className="flex items-center gap-4 text-accent font-mono text-sm tracking-widest mb-4">
      <span>{number}</span>
      <div className="w-12 h-[1px] bg-accent/50" />
    </div>
    <h2 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white">{title}</h2>
  </div>
);

export const ImdPuneCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });

      // Section reveals on scroll
      gsap.utils.toArray('.case-section').forEach((section: HTMLElement) => {
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

      // Parallax image slots
      gsap.utils.toArray('.parallax-slot').forEach((slot: HTMLElement) => {
        gsap.to(slot, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: slot,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });

      // Line traces
      gsap.utils.toArray('.trace-line').forEach((line: HTMLElement) => {
        gsap.fromTo(line, 
          { scaleX: 0, transformOrigin: "left center" },
          { 
            scaleX: 1, 
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: line,
              start: "top 90%"
            }
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div className="bg-[#030303] min-h-screen text-[#f5ede3] selection:bg-accent-soft selection:text-accent" ref={containerRef}>
      
      {/* 01 HERO */}
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 max-w-5xl mx-auto border-b border-white/5 relative">
        <Link href="/#work" className="hero-elem inline-flex items-center gap-2 text-text-muted hover:text-white font-mono text-sm tracking-widest uppercase mb-16 md:mb-24 group transition-colors">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        <div className="hero-elem font-mono text-accent text-xs md:text-sm tracking-widest mb-6 md:mb-8 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 uppercase">
          <span>IMD Pune</span>
          <span className="hidden md:inline text-white/30">/</span>
          <span>AI/ML &middot; Aviation Meteorology</span>
          <span className="hidden md:inline text-white/30">/</span>
          <span>May&ndash;Jul 2026</span>
        </div>

        <h1 className="hero-elem text-4xl md:text-6xl lg:text-7xl font-display uppercase tracking-tighter leading-[0.9] mb-8">
          Using AI/ML To Predict<br />
          <span className="text-white/60">Vertical Visibility</span><br />
          In Airports
        </h1>

        <p className="hero-elem text-lg md:text-xl text-text-muted font-light max-w-2xl leading-relaxed">
          An advanced machine learning pipeline developed for the India Meteorological Department to predict vertical visibility and Runway Visual Range at IGIA, New Delhi, using massive heterogeneous meteorological sensor data.
        </p>

        {/* Decorative structural lines */}
        <div className="absolute top-0 right-12 w-[1px] h-full bg-white/5 hidden lg:block" />
        <div className="absolute top-0 right-64 w-[1px] h-full bg-white/5 hidden lg:block" />
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-32 space-y-32 md:space-y-48">
        
        {/* 02 THE PROBLEM */}
        <section className="case-section">
          <SectionHeader number="02" title="The Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              Airport visibility, particularly Vertical Visibility and Cloud Ceiling, is arguably the most critical meteorological parameter for aviation operations. During severe weather phenomena like the dense winter fogs common at IGIA, New Delhi, these parameters dictate runway operability, flight diversions, and overall airspace safety.
            </p>
            <p>
              However, operational weather data is notoriously difficult to process. Raw sensor streams arrive at different frequencies, suffer from transient outages, contain complex encoded telegrams, and are highly sensitive to local micro-climates. Predicting these values accurately requires transforming this chaotic data landscape into a strictly synchronized, ML-ready temporal state.
            </p>
          </div>
        </section>

        {/* 03 DATA LANDSCAPE */}
        <section className="case-section">
          <SectionHeader number="03" title="Data Landscape" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#080808] border border-white/5 p-8">
              <h3 className="font-mono text-sm tracking-widest uppercase text-white mb-6">Four Airport Datasets</h3>
              <ul className="space-y-4 font-mono text-xs text-text-muted">
                <li className="flex justify-between items-center border-b border-white/5 pb-2"><span>HYDERABAD</span><span className="text-accent">VOHS</span></li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2"><span>JAIPUR</span><span className="text-accent">VIJP</span></li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2"><span>LUCKNOW</span><span className="text-accent">VILK</span></li>
                <li className="flex justify-between items-center pb-2"><span>GUWAHATI</span><span className="text-accent">VEGT</span></li>
              </ul>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="font-mono text-sm tracking-widest uppercase text-white mb-6">Data Streams</h3>
              <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white">PTU (Press/Temp/Hum)</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white">VIS (Visibility/RVR)</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white">WIND (Speed/Dir)</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white">PRESENT WEATHER</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-accent border-accent/30">CLOUD / CEILOMETER</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-80 overflow-hidden rounded-sm relative">
            <div className="parallax-slot w-full h-[130%] -top-[15%] relative">
              <VisualSlot src="/assets/projects/imd/imd-data-landscape.png" alt="[ SYSTEM DIAGRAM: DATA LANDSCAPE ]" className="h-full" />
            </div>
          </div>
        </section>

        {/* 04 THE REAL DATA PROBLEM */}
        <section className="case-section relative">
          <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-white/5 hidden md:block" />
          <SectionHeader number="04" title="The Real Data Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              In theory, time-series forecasting assumes a clean, continuous matrix of aligned variables. In practice, the IMD data presented a monumental engineering challenge.
            </p>
            <ul className="list-none pl-0 space-y-4 font-mono text-xs mt-8">
              <li className="flex gap-4 items-start"><span className="text-accent mt-0.5">■</span> <span><strong>Heterogeneous Formats:</strong> Different sensors export fundamentally different schemas.</span></li>
              <li className="flex gap-4 items-start"><span className="text-accent mt-0.5">■</span> <span><strong>Cadence Mismatch:</strong> Reporting intervals varied wildly, requiring intelligent temporal alignment.</span></li>
              <li className="flex gap-4 items-start"><span className="text-accent mt-0.5">■</span> <span><strong>Sensor Outages:</strong> Missing observations cannot simply be forward-filled without risking hallucinated meteorological states.</span></li>
              <li className="flex gap-4 items-start"><span className="text-accent mt-0.5">■</span> <span><strong>Encoded Telegrams:</strong> Critical cloud data was trapped in legacy meteorological encodings rather than clean integers.</span></li>
            </ul>
          </div>
        </section>

        {/* 05 PREPROCESSING ARCHITECTURE */}
        <section className="case-section">
          <SectionHeader number="05" title="Preprocessing Architecture" />
          
          {/* Custom Flow Diagram */}
          <div className="bg-[#050505] border border-white/10 p-8 md:p-12 mb-12 font-mono text-xs relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
            <div className="flex flex-col items-center gap-6 relative z-10 max-w-lg mx-auto">
              <div className="w-full text-center py-3 border border-white/20 bg-white/5 text-white tracking-widest">RAW AIRPORT SENSOR STREAMS</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/10 text-text-muted tracking-widest">FORMAT / SCHEMA NORMALIZATION</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/10 text-text-muted tracking-widest">VARIABLE-SPECIFIC QUALITY CONTROL</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-accent/40 text-accent tracking-widest bg-accent/5">CLOUD TELEGRAM DECODING</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/10 text-text-muted tracking-widest">TEMPORAL ALIGNMENT</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/10 text-text-muted tracking-widest">DATASET INTEGRATION</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/10 text-text-muted tracking-widest">FEATURE ENGINEERING</div>
              <div className="w-px h-6 bg-accent trace-line" />
              <div className="w-full text-center py-3 border border-white/20 bg-white/10 text-white font-bold tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)]">ML-READY TIME SERIES</div>
            </div>
          </div>

          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              PTU data originally sampled at ~1-minute intervals was aligned and interpolated toward a strict 15-second sensor cadence under aggressive quality constraints. Crucially, sensitive targets like cloud-base and visibility observations were treated conservatively rather than blindly interpolated, preserving the integrity of sudden weather shifts.
            </p>
          </div>
          
          <div className="w-full h-80 mt-12 overflow-hidden rounded-sm relative">
            <VisualSlot src="/assets/projects/imd/imd-preprocessing-architecture.png" alt="[ ARCHITECTURE: PREPROCESSING ]" className="h-full" />
          </div>
        </section>

        {/* 06 CLOUD DECODING */}
        <section className="case-section">
          <SectionHeader number="06" title="Cloud Decoding" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-12">
            <p>
              Different airports supplied highly idiosyncratic cloud representations. A dedicated parser was required to extract usable numerical intelligence from encoded meteorological messages.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-[10px] text-center mb-12">
            <div className="border border-white/10 p-4 bg-[#080808] flex items-center justify-center">ENCODED CLOUD MESSAGE</div>
            <div className="border border-white/10 p-4 bg-[#080808] flex items-center justify-center">MESSAGE PARSER</div>
            <div className="border border-white/10 p-4 bg-[#080808] flex items-center justify-center">CLOUD LAYER IDENTIFICATION</div>
            <div className="border border-white/10 p-4 bg-[#080808] flex items-center justify-center">COVERAGE / OKTA EXTRACTION</div>
            <div className="border border-white/10 p-4 bg-[#080808] flex items-center justify-center">HEIGHT EXTRACTION</div>
            <div className="border border-accent/30 p-4 bg-accent/5 text-accent flex items-center justify-center">STANDARDIZED SCHEMA</div>
          </div>
          
          <div className="w-full h-64 overflow-hidden rounded-sm relative">
            <VisualSlot src="/assets/projects/imd/imd-cloud-decoding.png" alt="[ DECODER FLOW ]" className="h-full" />
          </div>
        </section>

        {/* 07 QUALITY CONTROL */}
        <section className="case-section relative">
          <SectionHeader number="07" title="Quality Control" />
          <div className="absolute -right-6 top-24 w-32 h-32 border border-accent/20 rounded-full flex items-center justify-center opacity-30 pointer-events-none hidden lg:flex">
            <div className="font-mono text-[8px] text-center uppercase">Maximize Usability<br/>Preserve Realism</div>
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl">
            <p>
              Variable-specific handling was implemented based strictly on meteorological physics. We established source-derived boundaries to filter anomalous spikes without destroying true outlier weather events. The overriding engineering principle was clear: maximize data usability without destroying meteorological realism.
            </p>
          </div>
        </section>

        {/* 08 FEATURE / DATA INTEGRATION */}
        <section className="case-section">
          <SectionHeader number="08" title="Feature Integration" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-12">
            <p>
              The five sensor families were geometrically and temporally converged into a synchronized meteorological state vector. This included advanced temporal feature extraction and cyclical sine/cosine transformations for directional variables (like wind vectors), directly mapping meteorological reality to a format suitable for deep sequential learning.
            </p>
          </div>
          <div className="w-full h-96 overflow-hidden rounded-sm relative">
            <VisualSlot src="/assets/projects/imd/imd-sensor-integration.png" alt="[ SENSOR INTEGRATION VECTORS ]" className="h-full" />
          </div>
        </section>

        {/* 09 MODEL LANDSCAPE */}
        <section className="case-section">
          <SectionHeader number="09" title="Model Landscape" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">CLASSICAL ML</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>Linear Regression</li>
                <li>Random Forest</li>
                <li>XGBoost</li>
                <li>LightGBM</li>
                <li>CatBoost</li>
              </ul>
            </div>
            <div className="border border-white/10 p-8 bg-[#050505]">
              <h3 className="font-mono text-xs tracking-widest uppercase text-accent mb-6 pb-2 border-b border-accent/20">DEEP LEARNING</h3>
              <ul className="space-y-3 font-mono text-sm text-white/80">
                <li>LSTM</li>
                <li>GRU</li>
                <li>CNN-LSTM</li>
                <li>Attention-LSTM</li>
                <li>Multi-Output LSTM</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-6 font-mono text-xs tracking-widest text-text-muted justify-center border-t border-white/5 pt-8">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white/20"/> MAE</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white/20"/> RMSE</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-white/20"/> R²</span>
          </div>
        </section>

        {/* 10 RESULTS */}
        <section className="case-section">
          <SectionHeader number="10" title="Results" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl mb-12">
            <p>
              Rigorous evaluation revealed that ensemble and gradient-boosting approaches significantly outperformed linear baselines. <strong>XGBoost</strong> provided the best overall balance for MOR (Meteorological Optical Range) among classical models.
            </p>
            <p>
              In the deep learning domain, <strong>GRU</strong> showed the most consistent performance across the primary prediction targets. <strong>Attention-LSTM</strong> remained highly competitive, specifically demonstrating strong capabilities in Cloud Base performance. While <strong>CNN-LSTM</strong> was competitive, it lagged slightly behind GRU and Attention-LSTM for rapid MOR shifts. No single architecture dominated every atmospheric target, highlighting the complexity of heterogeneous weather phenomena.
            </p>
          </div>
          <div className="w-full h-80 overflow-hidden rounded-sm relative">
            <VisualSlot src="/assets/projects/imd/imd-results-comparison.png" alt="[ PERFORMANCE METRICS COMPARISON ]" className="h-full" />
          </div>
        </section>

        {/* 11 WHY MOR IS HARDER */}
        <section className="case-section">
          <SectionHeader number="11" title="Why MOR is Harder" />
          <div className="bg-accent/5 border-l-2 border-accent p-6 md:p-10">
            <p className="font-light text-lg leading-relaxed text-white/90">
              MOR depends on rapidly changing combinations of aerosols, fog, precipitation, cloud development, humidity, and wind. In contrast, Cloud Base Height exhibited greater temporal continuity, making it inherently more predictable for sequential memory models.
            </p>
          </div>
        </section>

        {/* 12 CONTRIBUTIONS */}
        <section className="case-section">
          <SectionHeader number="12" title="Core Contributions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-text-muted">
            <div className="border border-white/5 p-4 bg-[#080808]">Generalized multi-airport preprocessing</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Heterogeneous sensor standardization</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Custom cloud-telegram decoding</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Quality-controlled temporal integration</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Time-series feature engineering</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Modular workflow designed for scaling</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Classical ML baseline comparison</div>
            <div className="border border-white/5 p-4 bg-[#080808]">Recurrent/Deep model evaluation</div>
          </div>
        </section>

        {/* 13 LIMITATIONS / NEXT */}
        <section className="case-section">
          <SectionHeader number="13" title="Limitations & Future Scope" />
          <p className="text-text-muted font-light leading-relaxed max-w-3xl mb-8">
            While Milestone 0 delivered a highly functional pipeline, the report highlights clear operational extensions necessary for true production capability:
          </p>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <span className="px-3 py-1 border border-white/10 text-white/60">ADDITIONAL AIRPORTS</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">LARGER HISTORICAL DATASETS</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">RADAR INTEGRATION</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">SATELLITE DATA</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">NWP (Numerical Weather Prediction)</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">TRANSFORMER ARCHITECTURES</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">HYBRID ENSEMBLES</span>
            <span className="px-3 py-1 border border-white/10 text-white/60">ONLINE LEARNING</span>
          </div>
        </section>

        {/* 14 ROLE / EXPERIENCE */}
        <section className="case-section">
          <SectionHeader number="14" title="Role & Experience" />
          <div className="border-t border-white/10 pt-8 mt-4">
            <h3 className="font-mono text-sm tracking-widest text-white uppercase mb-2">India Meteorological Department (IMD), Pune</h3>
            <p className="font-mono text-xs text-accent mb-6">AI/ML INTERN &middot; MAY 2026 — JULY 2026</p>
            <p className="text-text-muted font-light leading-relaxed max-w-3xl">
              Core work in aviation-weather machine learning, time-series forecasting, and operational analytics. Developed extensive preprocessing pipelines and evaluated predictive architectures against real-world Indian meteorological data constraints.
            </p>
          </div>
        </section>

        {/* 15 CLOSING */}
        <section className="case-section border-t border-white/10 pt-24 pb-12 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight text-white mb-6">System Delivered</h2>
          <p className="text-text-muted font-mono text-sm mb-12 max-w-lg">
            This project remains an internal IMD asset. The architecture and methodology reflect the foundation of the final research report.
          </p>
          
          <Link href="/#work" className="group flex items-center gap-4 text-lg font-mono uppercase tracking-widest hover:text-accent transition-colors">
            <span>Return to Portfolio</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
};
