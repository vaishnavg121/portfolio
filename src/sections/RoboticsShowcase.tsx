"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const STAGES = ["CAD", "COMPONENTS", "MANUFACTURE", "ASSEMBLY", "COMPETITION"];

const ROBOTS = [
  { id: "A7X", name: "A7X", weight: "8 KG", desc: "Kinetic energy drum spinner designed for high-impact horizontal strikes." },
  { id: "SLIPKNUT", name: "Slipknut", weight: "15 KG", desc: "Wedge/flipper bot engineered for defensive survival and leverage." }
];

export const RoboticsShowcase = () => {
  const [activeBot, setActiveBot] = useState(ROBOTS[0].id);
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const activeBotData = ROBOTS.find(b => b.id === activeBot);

  useGSAP(() => {
    if (!mounted) return;

    // Grid reveal
    gsap.fromTo('.blueprint-grid', 
      { opacity: 0 },
      { opacity: 0.2, duration: 1, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 70%" } }
    );

    // Construction lines
    gsap.fromTo('.const-line',
      { strokeDasharray: "0 200", opacity: 0 },
      { strokeDasharray: "200 0", opacity: 1, duration: 1.5, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 60%" } }
    );

    // Crosshair traverse
    gsap.fromTo('.traverse-crosshair',
      { x: -50, opacity: 0 },
      { x: 150, opacity: 0.5, duration: 2, ease: "power1.inOut", scrollTrigger: { trigger: containerRef.current, start: "top 50%" } }
    );

    // Exit handoff into GitHub
    gsap.to('.const-line', {
      scaleX: 2,
      x: 100,
      opacity: 0,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "bottom 60%",
        end: "bottom top",
        scrub: 1
      }
    });
  }, { scope: containerRef, dependencies: [mounted] });

  return (
    <section className="py-32 bg-[#050505]" id="robotics" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-sm font-mono text-text-muted mb-16 tracking-widest uppercase border-b border-[#222] pb-4">
          Robotics / Hardware
        </h2>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Controls & Info */}
          <div className="w-full lg:w-1/3 flex flex-col justify-between">
            <div>
              <div className="flex gap-4 mb-12">
                {ROBOTS.map(bot => (
                  <button
                    key={bot.id}
                    onClick={() => setActiveBot(bot.id)}
                    className={`font-mono text-xl tracking-widest pb-2 border-b-2 transition-colors ${
                      activeBot === bot.id ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {bot.name}
                  </button>
                ))}
              </div>

              <motion.div
                key={activeBot}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
              >
                <div className="text-accent font-mono text-xs mb-2 uppercase">{activeBotData?.weight} CLASS</div>
                <p className="text-text-muted text-lg leading-relaxed mb-6">
                  {activeBotData?.desc}
                </p>
                <div className="text-xs font-mono text-text-muted opacity-80 border-l border-border pl-3 flex flex-col gap-2">
                  <p className="text-accent">Designed and filed a patent application for a custom combat-robotics Kill Switch.</p>
                  <p>Sponsors / Suppliers: PCBWay, OnlyScrews, Technobotix</p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-xs font-mono text-text-muted mb-2 tracking-widest uppercase">System Evolution</div>
              {STAGES.map((stage, idx) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(idx)}
                  className={`text-left text-sm font-mono tracking-wider py-2 pl-4 border-l-2 transition-all ${
                    activeStage === idx 
                      ? 'border-accent text-text-primary bg-accent/5' 
                      : 'border-[#222] text-text-muted hover:border-text-muted hover:text-text-primary'
                  }`}
                >
                  0{idx + 1} {`//`} {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Visualization Area */}
          <div className="w-full lg:w-2/3 aspect-video bg-[#0a1128] border border-[#1d2d50] relative overflow-hidden rounded-sm cursor-crosshair group" data-cursor="VIEW">
            {/* Blueprint Grid Background */}
            <div className="blueprint-grid absolute inset-0 opacity-20" 
              style={{
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeBot}-${activeStage}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 p-8 md:p-12"
              >
                {/* Technical SVG Blueprint Placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  
                  {/* Grid / Frame */}
                  <rect className="const-line" x="5" y="5" width="190" height="140" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
                  <line className="const-line" x1="5" y1="20" x2="195" y2="20" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
                  <line className="const-line" x1="160" y1="5" x2="160" y2="145" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
                  <line className="traverse-crosshair" x1="0" y1="0" x2="0" y2="150" stroke="#3b82f6" strokeWidth="0.2" opacity="0.5" />
                  
                  {/* Measurements */}
                  <line className="const-line" x1="20" y1="130" x2="140" y2="130" stroke="#3b82f6" strokeWidth="0.5" />
                  <line className="const-line" x1="20" y1="128" x2="20" y2="132" stroke="#3b82f6" strokeWidth="0.5" />
                  <line className="const-line" x1="140" y1="128" x2="140" y2="132" stroke="#3b82f6" strokeWidth="0.5" />
                  <text x="80" y="127" fill="#3b82f6" fontSize="4" fontFamily="monospace">TBD_DIMENSION</text>

                  {/* Stage-specific graphics */}
                  {activeStage === 0 && (
                     <g stroke="#3b82f6" strokeWidth="0.5">
                       <rect x="40" y="50" width="80" height="40" strokeDasharray="2 2" />
                       <circle cx="60" cy="70" r="15" />
                       <circle cx="100" cy="70" r="15" />
                       <line x1="20" y1="70" x2="140" y2="70" strokeWidth="0.2" opacity="0.5" />
                       <line x1="80" y1="30" x2="80" y2="110" strokeWidth="0.2" opacity="0.5" />
                       <text x="10" y="15" fill="#3b82f6" fontSize="5" fontFamily="monospace">TOP_DOWN_ELEVATION</text>
                     </g>
                  )}
                  {activeStage > 0 && activeStage < 3 && (
                     <g stroke="#3b82f6" strokeWidth="0.5">
                       <circle cx="50" cy="50" r="10" fill="rgba(59, 130, 246, 0.1)" />
                       <rect x="80" y="40" width="20" height="20" fill="rgba(59, 130, 246, 0.1)" />
                       <path d="M40,90 L60,90 L70,110 L30,110 Z" fill="rgba(59, 130, 246, 0.1)" />
                       <circle cx="100" cy="100" r="15" strokeDasharray="1 1"/>
                       <line x1="60" y1="50" x2="80" y2="50" strokeWidth="0.2" strokeDasharray="2 2" />
                       <text x="10" y="15" fill="#3b82f6" fontSize="5" fontFamily="monospace">{`BOM // CNC_PARTS`}</text>
                     </g>
                  )}
                  {activeStage >= 3 && (
                     <g stroke="#3b82f6" strokeWidth="0.5">
                       {/* Isometric placeholder */}
                       <path d="M50 60 L110 40 L150 70 L90 90 Z" fill="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                       <path d="M50 60 L50 75 L90 105 L90 90 Z" fill="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
                       <path d="M150 70 L150 85 L90 105 L90 90 Z" fill="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
                       
                       <text x="10" y="15" fill="#3b82f6" fontSize="5" fontFamily="monospace">SYS_ASSEMBLY_ISO</text>
                       
                       {activeStage === 4 && (
                         <motion.rect 
                           x="85" y="85" width="10" height="10" 
                           fill="rgba(204, 51, 51, 0.5)" 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: [0, 1, 0] }} 
                           transition={{ repeat: Infinity, duration: 1.5 }} 
                         />
                       )}
                     </g>
                  )}

                  {/* Tech specs block */}
                  <text x="165" y="30" fill="#3b82f6" fontSize="3" fontFamily="monospace" opacity="0.8">MAT: AL7075-T6</text>
                  <text x="165" y="35" fill="#3b82f6" fontSize="3" fontFamily="monospace" opacity="0.8">TOL: +/- 0.05MM</text>
                  <text x="165" y="45" fill="#3b82f6" fontSize="3" fontFamily="monospace" opacity="0.8">DIM: CUSTOM</text>
                  <text x="165" y="50" fill="#3b82f6" fontSize="3" fontFamily="monospace" opacity="0.8">REV: 02.B</text>
                </svg>
              </motion.div>
            </AnimatePresence>

            {/* Overlay Info */}
            <div className="absolute bottom-4 right-4 text-[#3b82f6] font-mono text-xs text-right opacity-70">
              <div>FILE: {activeBot}_{STAGES[activeStage]}.dwg</div>
              <div>SCALE: 1:10</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
