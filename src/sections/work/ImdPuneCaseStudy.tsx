"use client";

import React, { useRef } from 'react';
import { VisualSlot } from './VisualSlot';
import Link from 'next/link';
import { MoveLeft } from 'lucide-react';
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

export const ImdPuneCaseStudy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useCaseMotion(containerRef);

  return (
    <main className="case-page min-h-screen text-[#e5e5e5] selection:bg-accent-soft selection:text-accent font-sans" ref={containerRef}>
      
      {/* 01 HERO */}
      <section className="case-cover portfolio-frame relative">
        <Link href="/#work" className="hero-elem inline-flex min-h-11 lg:min-h-0 items-center gap-2 text-text-muted hover:text-white font-mono text-xs tracking-widest uppercase mb-4 lg:mb-10 group transition-colors">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        <div className="case-cover-layout flex flex-col lg:flex-row">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="hero-elem font-mono text-accent text-xs tracking-widest mb-6 uppercase flex items-center gap-4">
              <div className="w-8 h-[1px] bg-accent/50" />
              <span>IMD PUNE</span>
            </div>
            
            <h1 className="hero-elem case-title font-display lg:text-5xl uppercase tracking-tighter leading-tight mb-4 lg:mb-8 text-white/90">
              Using AI/ML To Predict Vertical Visibility In Airports
            </h1>
            
            <div className="hero-elem font-mono text-[10px] md:text-xs text-text-muted tracking-widest uppercase mb-4 lg:mb-8 space-y-2">
              <p>Practice School I</p>
              <p>25 May 2026 — 18 July 2026</p>
              <p className="text-white/30">DURATION: 54 DAYS</p>
            </div>
            
            <div className="hero-elem flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="px-3 py-1 bg-white/5 border border-white/10">Aviation Meteorology</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Time-Series</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Deep Learning</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10">Sensor Integration</span>
            </div>
            
            <div className="hero-elem mt-4 lg:mt-16 font-mono text-xs text-text-muted tracking-widest uppercase flex items-center gap-3">
              <span className="w-4 h-[1px] bg-text-muted" /> SCROLL TO EXPLORE
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="hero-elem case-art w-full aspect-[4/3] md:aspect-[16/10] relative rounded-sm overflow-hidden border border-white/10 bg-[#050505]">
               <VisualSlot src="/assets/projects/imd-pune/imd-hero-aviation-weather.png" alt="IMD Pune Aviation Weather Hero" className="h-full p-4" objectFit="contain" />
            </div>
          </div>
        </div>
      </section>

      <div className="case-body portfolio-frame">
        
        {/* 02 THE PROBLEM */}
        <CaseSection>
          <SectionHeader number="02" title="The Problem" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              Visibility is one of the most critical meteorological parameters in aviation. Reduced visibility from fog, haze, mist, precipitation, or low cloud severely affects aircraft take-off, landing, and taxiing operations, directly impacting operational capacity, diversions, delays, and aviation safety.
            </p>
            <p>
              While horizontal visibility is widely monitored, vertical visibility and cloud ceiling become equally critical in dense fog, low-cloud, and obscured-sky conditions. The engineering problem presented by the India Meteorological Department was twofold: build a unified data system capable of aligning chaotic heterogeneous sensor streams, and then build a prediction system evaluating both classical and sequential machine learning architectures for vertical visibility and Meteorological Optical Range (MOR).
            </p>
          </div>
        </CaseSection>

        {/* 03 OBSERVATION NETWORK */}
        <CaseSection>
          <SectionHeader number="03" title="Observation Network" />
          <div className="w-full h-auto aspect-[16/7] md:aspect-[2/1] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-observation-network.png" alt="IMD Pune multi-sensor observation network showing PTU, visibility, cloud, wind and present-weather inputs." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Our primary data consisted of five distinct meteorological sensor networks:
            </p>
            <ul className="font-mono text-[11px] md:text-xs space-y-3 mt-6 mb-8 text-white/70 bg-white/5 border border-white/10 p-6 md:p-8">
              <li className="flex flex-col md:flex-row gap-2 md:gap-8"><strong className="text-accent w-24">PTU:</strong> <span>Pressure, Temperature, Humidity, Dew Point</span></li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-8"><strong className="text-accent w-24">VIS:</strong> <span>Visibility / Meteorological Optical Range</span></li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-8"><strong className="text-accent w-24">WIND:</strong> <span>Mean Wind Speed, Wind Direction</span></li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-8"><strong className="text-accent w-24">PW:</strong> <span>Present Weather conditions</span></li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-8 border-t border-white/10 pt-3 mt-3"><strong className="text-accent w-24">CLOUD:</strong> <span>Cloud-base heights, multiple cloud layers, cloud coverage, vertical visibility</span></li>
            </ul>
            <p>
              The Ceilometer plays a unique role. Operating via optical remote sensing (LiDAR), it transmits laser pulses to estimate cloud structure and vertical atmospheric layering.
            </p>
          </div>
        </CaseSection>

        {/* 04 DATA WAS THE HARD PART */}
        <CaseSection>
          <SectionHeader number="04" title="Data Was The Hard Part" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Integrating the network created systematic temporal gaps. PTU sensors generally supplied 1-minute observations, while visibility, wind, cloud, and rain commonly operated at 15-second cadences. 
            </p>
            <p>
              Resolving these differing temporal resolutions was only the first barrier. We consistently encountered missing records, duplicated records, inconsistent timestamps, sensor outages, and substantial formatting differences between airports like Hyderabad, Jaipur, and Lucknow. Preprocessing was not a minor step; it was a major engineering component of the project.
            </p>
          </div>
        </CaseSection>

        {/* 05 CLOUD DECODING / STANDARDIZATION */}
        <CaseSection>
          <SectionHeader number="05" title="Cloud Decoding & Standardization" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Cloud data from Hyderabad and Lucknow was relatively structured. However, the data from Jaipur included compact, encoded cloud telegrams.
            </p>
            <p>
              We developed rule-based parsing to decode these telegrams, extracting cloud layers, cloud coverage (Okta), cloud-base heights, and vertical visibility. This was then standardized into a unified schema consisting of Cloud Base Height for up to three layers, minimum cloud base, vertical visibility, and corresponding coverage values, standardizing the format across all study locations.
            </p>
          </div>
        </CaseSection>

        {/* 06 PREPROCESSING PIPELINE */}
        <CaseSection>
          <SectionHeader number="06" title="Preprocessing Pipeline" />
          <div className="w-full h-auto aspect-[16/7] md:aspect-[2/1] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-forecasting-pipeline.png" alt="IMD Pune data preprocessing pipeline from raw observations to ML-ready temporal dataset." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              The pipeline transforms raw meteorological observations through validation, timestamp synchronization, duplicate handling, missing-value analysis, cloud decoding, temporal alignment, and integration, concluding with feature preparation.
            </p>
            <p>
              Strict preliminary PTU checks were enforced: Temperature and Dew Point to ±0.5°C, Relative Humidity to ±5%, and Pressure to ±2 hPa. Missing intervals exceeding 5 minutes were flagged for manual review rather than reconstructed blindly. Crucially, visibility and cloud observations were treated conservatively to avoid aggressive interpolation. The primary objective was to maximize usable data while rigorously preserving meteorological realism.
            </p>
          </div>
        </CaseSection>

        {/* 07 EXPLORATORY DATA ANALYSIS */}
        <CaseSection>
          <SectionHeader number="07" title="Exploratory Data Analysis" />
          <div className="w-full h-auto aspect-[4/3] md:aspect-[16/9] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-eda-overview.png" alt="Exploratory data analysis showing statistical distributions of visibility, cloud base height, and temperature." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Exploratory Data Analysis evaluated visibility, temperature, humidity, wind-speed, and cloud-base distributions. The distributions revealed that visibility contains discrete reporting behavior, with strong concentration near the upper visibility limits representing clear conditions. Low-visibility events, while operationally critical, occurred relatively infrequently, establishing an imbalanced distribution for model training.
            </p>
          </div>
        </CaseSection>

        {/* 08 CORRELATION ANALYSIS */}
        <CaseSection>
          <SectionHeader number="08" title="Correlation Analysis" />
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
            <div className="lg:w-1/2 w-full aspect-square rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2">
              <VisualSlot src="/assets/projects/imd-pune/imd-correlation-analysis.png" alt="Correlation matrix heatmap of meteorological variables." className="h-full w-full" objectFit="contain" />
            </div>
            <div className="lg:w-1/2 prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light" data-familiar-protect data-familiar-reaction="read">
              <p>
                Correlation analysis identified useful relationships to inform feature interpretation. Key findings included:
              </p>
              <ul className="font-mono text-[11px] space-y-2 mt-4 text-white/70 bg-white/5 border border-white/10 p-4 md:p-6">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Visibility ↔ Vertical Vis:</span> <span className="text-accent">+0.62</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Visibility ↔ Temperature:</span> <span className="text-accent">+0.58</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Visibility ↔ Pressure:</span> <span className="text-white/40">-0.49</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Temperature ↔ Humidity:</span> <span className="text-white/40">-0.59</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Humidity ↔ Dew Point:</span> <span className="text-accent">+0.74</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Dew Point ↔ Pressure:</span> <span className="text-white/40">-0.60</span></li>
                <li className="flex justify-between"><span>Pressure ↔ Wind Speed:</span> <span className="text-white/40">-0.51</span></li>
              </ul>
              <p className="mt-6 text-xs text-white/50 border-l border-accent pl-4">
                While these correlations guide our architecture, they strictly identify statistical relationships, not underlying causal meteorological mechanisms.
              </p>
            </div>
          </div>
        </CaseSection>

        {/* 09 TEMPORAL ANALYSIS */}
        <CaseSection>
          <SectionHeader number="09" title="Temporal Analysis" />
          <div className="w-full h-auto aspect-[16/7] md:aspect-[2/1] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-temporal-analysis.png" alt="Time-series plot showing temporal evolution of visibility." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Temporal analysis exposed repeated high-visibility plateaus interrupted by intermittent, sharp reduced-visibility intervals. This temporal variability demonstrates recurring low-visibility episodes rather than smooth continuous seasonal transitions, highlighting the highly dynamic nature of the prediction target.
            </p>
          </div>
        </CaseSection>

        {/* 10 CLASSICAL MACHINE LEARNING */}
        <CaseSection>
          <SectionHeader number="10" title="Classical Machine Learning" />
          <div className="w-full h-auto aspect-[16/9] md:aspect-[2/1] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-classical-ml-results.png" alt="Performance metrics comparison of classical ML models including XGBoost, LightGBM, and Random Forest." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              We evaluated numerous model families, including Linear Regression, Ridge, Lasso, ElasticNet, Random Forest, Gradient Boosting, Extra Trees, Histogram Gradient Boosting, XGBoost, LightGBM, CatBoost, and AdaBoost.
            </p>
            <p>
              For MOR prediction, <strong>XGBoost</strong> achieved the best overall balance among evaluated classical models, producing an RMSE of approximately 1655.76 m and an R² of 0.645. Extra Trees, Histogram Gradient Boosting, LightGBM, and CatBoost were also highly competitive. Linear models performed substantially worse, occasionally producing negative R² values, underscoring that visibility behavior is nonlinear and highly dependent on complex interactions among moisture, clouds, wind, and precipitation.
            </p>
          </div>
        </CaseSection>

        {/* 11 & 12 EFFICIENCY & FEATURES */}
        <CaseSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <SectionHeader number="11" title="Efficiency Trade-offs" />
              <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light" data-familiar-protect data-familiar-reaction="read">
                <p>
                  LightGBM delivered the shortest training time among the best-performing ensemble models while remaining highly competitive. XGBoost offered a strong balance between prediction accuracy and computational efficiency, making these tree-based approaches attractive for potential operational forecasting workflows.
                </p>
              </div>
            </div>
            <div>
              <SectionHeader number="12" title="Feature Importance" />
              <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light" data-familiar-protect data-familiar-reaction="read">
                <p>
                  Feature importance analysis confirmed that a small subset of variables drove prediction. Influential groups included temperature, humidity/dew point, low-cloud indicators, rain/present-weather indicators, pressure, wind, and extracted temporal features.
                </p>
              </div>
            </div>
          </div>
        </CaseSection>

        {/* 13 & 14 DEEP LEARNING & FINDINGS */}
        <CaseSection>
          <SectionHeader number="13" title="Sequential Deep Learning" />
          <div className="w-full h-auto aspect-[16/7] md:aspect-[2/1] mb-12 rounded-sm overflow-hidden relative border border-white/5 bg-[#050505] p-2 md:p-6">
            <VisualSlot src="/assets/projects/imd-pune/imd-deep-learning-results.png" alt="Performance summary of sequential deep learning architectures including GRU, Attention-LSTM, and CNN-LSTM." className="h-full w-full" objectFit="contain" />
          </div>
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              We benchmarked several recurrent architectures: LSTM, GRU, CNN-LSTM, and Attention-LSTM. Training utilized a sliding-window sequential setup, supplying the previous 15 minutes of meteorological observations to predict future visibility parameters.
            </p>
            <p>
              For MOR, <strong>GRU</strong> achieved the lowest prediction error among implemented deep-learning models, followed closely by Attention-LSTM. CNN-LSTM remained competitive but exhibited generally higher error, while the conventional LSTM was comparatively weaker.
            </p>
            <p>
              For Cloud Base Height, GRU was particularly consistent, achieving coefficients of determination approaching unity, with Attention-LSTM also showing exceptionally strong performance.
            </p>
          </div>
        </CaseSection>

        {/* 15 & 16 COMPARISON */}
        <CaseSection>
          <SectionHeader number="15" title="Classical vs Deep Learning" />
          <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light max-w-3xl" data-familiar-protect data-familiar-reaction="read">
            <p>
              Weather observations are temporally dependent. Recurrent deep learning models natively process sequences of previous observations rather than treating every timestamp as an independent state, which is why GRU performed strongest among tested architectures for modelling sequential meteorological dynamics.
            </p>
            <p>
              However, classical boosting methods like XGBoost maintained formidable strengths: superior tabular prediction efficiency, significantly lower training complexity, and interpretable feature importance. They represent slightly different solutions to the problem, balancing predictive depth against operational cost.
            </p>
          </div>
        </CaseSection>

        {/* 17 WHAT WAS DELIVERED */}
        <CaseSection>
          <SectionHeader number="16" title="What The Project Delivered" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-text-muted mb-8" data-familiar-protect data-familiar-reaction="read">
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Multi-source meteorological preprocessing</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Quality-control framework & temporal alignment</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Cloud telegram decoding & unified schema</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Exploratory weather analysis</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Classical ML benchmarking (XGBoost)</div>
            <div className="border border-white/5 p-5 bg-[#050505] hover:border-accent/40 transition-colors">Recurrent DL benchmarking (GRU, Attention)</div>
            <div className="border border-accent/20 p-5 bg-accent/5 sm:col-span-2 text-accent text-center font-bold tracking-widest">Aviation visibility prediction research workflow</div>
          </div>
        </CaseSection>

        {/* 18 LIMITATIONS & 19 LEARNED */}
        <CaseSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-16 border-t border-white/5">
            <div>
              <SectionHeader number="17" title="Limitations" />
              <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light" data-familiar-protect data-familiar-reaction="read">
                <p>
                  As an engineering research workflow, the project faced real-world limitations. Limited airport coverage, prolonged sensor outages, and heterogeneous source formats constrained the dataset. Visibility interpolation requires extreme caution, and raw observational behavior differed across airports.
                </p>
                <p>
                  Future improvements identified in the report include integrating radar, satellite, aerosol measurements, and Numerical Weather Prediction (NWP) data, alongside exploring Transformer architectures and hybrid ensembles.
                </p>
              </div>
            </div>
            <div>
              <SectionHeader number="18" title="What I Learned" />
              <div className="prose prose-invert prose-p:text-text-muted prose-p:leading-relaxed prose-p:font-light" data-familiar-protect data-familiar-reaction="read">
                <p>
                  Real-world machine learning starts with data engineering. Missing data cannot simply be imputed aggressively when the domain forbids it, making temporal alignment critical.
                </p>
                <p>
                  I learned that model accuracy alone is insufficient; interpretability, training cost, and strict adherence to domain constraints matter just as much. Domain knowledge and ML must work together to produce usable insights.
                </p>
              </div>
            </div>
          </div>
        </CaseSection>

        {/* 20 METADATA */}
        <CaseSection className="border-t border-white/10 pt-24 flex flex-col items-center text-center pb-8">
          <h3 className="font-mono text-xs tracking-widest text-white/70 uppercase mb-4">India Meteorological Department (IMD), Pune</h3>
          <p className="font-mono text-[10px] text-accent mb-8">PRACTICE SCHOOL I &middot; MAY — JULY 2026</p>
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-tight text-white/90 mb-16 max-w-2xl">
            Using AI/ML to Predict Vertical Visibility in Airports
          </h2>
          
          <Link href="/#work" className="group flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-accent transition-colors" data-familiar-protect data-familiar-reaction="wave">
            <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            <span>Return to Portfolio</span>
          </Link>
        </CaseSection>

      </div>
    </main>
  );
};
