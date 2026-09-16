"use client";

import { useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSectionVisibility, useReducedMotion } from "@/lib/visibility";
import dynamic from 'next/dynamic';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const VelociraptorScene = dynamic(() => import('@/components/3d/VelociraptorScene').then(mod => mod.VelociraptorScene), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#050505] flex items-center justify-center text-text-muted font-mono text-xs tracking-widest">LOADING CAD DATA...</div>
});

export const RoboticsShowcase = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { ref: visibilityRef, isVisible } = useSectionVisibility("500px");
  const shouldReduceMotion = useReducedMotion();

  // Scroll triggers will control timeline state
  const [activeScene, setActiveScene] = useState("entry");

  useGSAP(() => {
    if (!isVisible) return;
    
    // Create the master scroll timeline
    const ctx = gsap.context(() => {
      // Pin the whole section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250vh",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
             const prog = self.progress;
             if (prog < 0.1) setActiveScene("entry");
             else if (prog < 0.3) setActiveScene("reveal");
             else if (prog < 0.5) setActiveScene("weapon");
             else if (prog < 0.7) setActiveScene("fea");
             else if (prog < 0.85) setActiveScene("powertrain");
             else setActiveScene("closing");
             
             const devEl = document.getElementById('dev-progress');
             if (devEl) devEl.innerText = prog.toFixed(3);
             
             // Dispatch a custom event so the 3D scene can react without React re-renders
             window.dispatchEvent(new CustomEvent("robotics-scroll", { detail: prog }));
          }
        }
      });
      
      // Explicit 0 to 1 timeline mapping
      // ENTRY: visible 0 to 0.15, fades out 0.10 -> 0.15
      tl.to(".text-entry", { opacity: 0, y: -50, duration: 0.05 }, 0.10);
      
      // REVEAL: fades in 0.10->0.15, visible 0.15 to 0.35, fades out 0.30->0.35
      tl.fromTo(".text-reveal", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.05 }, 0.10);
      tl.to(".text-reveal", { opacity: 0, y: -50, duration: 0.05 }, 0.30);
      
      // WEAPON: fades in 0.30->0.35, visible 0.35 to 0.50, instantly disappears at 0.50
      tl.fromTo(".text-weapon", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.05 }, 0.30);
      tl.set(".text-weapon", { opacity: 0 }, 0.50);
      
      // FEA: fades in 0.48->0.53, visible 0.53 to 0.70, fades out 0.65->0.70
      tl.fromTo(".text-fea", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.05 }, 0.48);
      tl.to(".text-fea", { opacity: 0, x: -50, duration: 0.05 }, 0.65);
      
      // POWERTRAIN: fades in 0.65->0.70, visible 0.70 to 0.85, fades out 0.80->0.85
      tl.fromTo(".text-powertrain", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.05 }, 0.65);
      tl.to(".text-powertrain", { opacity: 0, y: -50, duration: 0.05 }, 0.80);
      
      // CLOSING: fades in 0.80->0.85, visible 0.85 to 1.00
      tl.fromTo(".text-closing", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.05 }, 0.80);
      
      // Dummy tween to pad timeline to exactly 1.0 duration
      tl.to({}, {duration: 0.15}, 0.85);

    }, containerRef);
    
    return () => ctx.revert();
  }, [isVisible]);

  return (
    <section 
      id="robotics" 
      ref={(el) => { containerRef.current = el; visibilityRef(el); }}
      className="relative w-full h-screen bg-[#030303] overflow-hidden"
    >
      {/* 3D Underlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {isVisible && !shouldReduceMotion ? (
             <VelociraptorScene />
         ) : (
             <div className="w-full h-full relative">
                 <Image src="/assets/robotics/velociraptor/velociraptor-hero.png" alt="Velociraptor" fill className="object-contain opacity-50" />
             </div>
         )}
      </div>
      
      {/* HUD & Typography Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center px-12">
        
        {/* SCENE: ENTRY */}
        <div className="text-entry absolute top-1/2 left-12 -translate-y-1/2">
           <p className="font-mono text-xs text-accent tracking-[0.3em] mb-4">THRIVEFORCE // COMBAT ROBOTICS</p>
           <h2 className="font-display text-7xl md:text-9xl font-bold text-[#f5ede3] leading-[0.85] tracking-tighter uppercase">
             Designed<br/>For<br/>Impact.
           </h2>
        </div>
        
        {/* SCENE: REVEAL */}
        <div className="text-reveal absolute bottom-24 right-12 text-right opacity-0">
           <h3 className="font-display text-5xl text-[#f5ede3] uppercase tracking-tight">Velociraptor</h3>
           <p className="font-mono text-xs text-text-muted tracking-widest mt-2">3 LB / UNDERCUTTER / HARDENED EN24</p>
        </div>
        
        {/* SCENE: WEAPON */}
        <div className="text-weapon absolute top-1/2 right-12 -translate-y-1/2 text-right opacity-0">
           <h3 className="font-display text-8xl text-accent font-medium leading-none tracking-tighter">~470 J</h3>
           <p className="font-mono text-[10px] text-text-muted tracking-[0.2em] mt-4 uppercase">Stored Weapon Energy</p>
           <div className="mt-8 flex flex-col gap-2 font-mono text-[10px] text-text-muted tracking-widest uppercase">
             <div className="flex justify-end gap-4"><span>Mass</span> <span className="text-[#e0e0e0]">0.297 KG</span></div>
             <div className="flex justify-end gap-4"><span>Diameter</span> <span className="text-[#e0e0e0]">140.6 MM</span></div>
             <div className="flex justify-end gap-4"><span>Bite</span> <span className="text-[#e0e0e0]">15.8 MM</span></div>
           </div>
        </div>

        {/* SCENE: FEA */}
        <div className="text-fea absolute inset-0 opacity-0 bg-black/80 backdrop-blur-md flex items-center justify-between px-12 z-20">
            <div className="w-[35%]">
               <h3 className="font-display text-4xl text-[#f5ede3] uppercase tracking-tight mb-12">Engineering<br/>The Hit.</h3>
               
               {/* Side Load */}
               <div className="space-y-6 mb-12 pb-12 border-b border-border/30">
                 <div>
                   <div className="text-accent font-mono text-xl">2000 N</div>
                   <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Side Load Case</div>
                 </div>
                 <div className="flex gap-8">
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">449 MPa</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Von Mises</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~1.9</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Min Safety Factor</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~0.7 mm</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Displacement</div>
                   </div>
                 </div>
               </div>
               
               {/* Upward Load */}
               <div className="space-y-6">
                 <div>
                   <div className="text-accent font-mono text-xl">2000 N</div>
                   <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Upward Load Case</div>
                 </div>
                 <div className="flex gap-8">
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">208 MPa</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Max Von Mises</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~4.0</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Min Safety Factor</div>
                   </div>
                   <div>
                     <div className="text-[#e0e0e0] font-mono text-xl">~0.1 mm</div>
                     <div className="text-text-muted font-mono text-[10px] tracking-widest uppercase">Displacement</div>
                   </div>
                 </div>
               </div>

            </div>
            <div className="w-[60%] h-[80%] relative flex flex-col gap-4">
               <div className="relative flex-1 border border-border/30 bg-[#050505]">
                  <Image src="/assets/robotics/velociraptor/fea-side-stress.png" alt="FEA Side Stress" fill className="object-contain p-4" />
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest text-text-muted">FIG 1. SIDE IMPACT STRESS</div>
               </div>
               <div className="relative flex-1 border border-border/30 bg-[#050505]">
                  <Image src="/assets/robotics/velociraptor/fea-upward-stress.png" alt="FEA Upward Stress" fill className="object-contain p-4" />
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest text-text-muted">FIG 2. UPWARD IMPACT STRESS</div>
               </div>
            </div>
        </div>

        {/* SCENE: POWERTRAIN */}
        <div className="text-powertrain absolute top-1/3 left-12 opacity-0">
           <h3 className="font-display text-3xl text-[#f5ede3] uppercase tracking-tight mb-8">Powertrain</h3>
           <div className="flex flex-col gap-6 border-l border-border/50 pl-6">
             <div>
               <div className="font-mono text-xs text-accent tracking-widest">SCORPION 3S 1000mAh</div>
               <div className="font-mono text-[9px] text-text-muted uppercase">Power Source</div>
             </div>
             <div>
               <div className="font-mono text-xs text-[#e0e0e0] tracking-widest">HOBBYWING 50A</div>
               <div className="font-mono text-[9px] text-text-muted uppercase">Weapon ESC</div>
             </div>
             <div>
               <div className="font-mono text-xs text-[#e0e0e0] tracking-widest">DYS 3530 1100KV</div>
               <div className="font-mono text-[9px] text-text-muted uppercase">Weapon Motor</div>
             </div>
             <div>
               <div className="font-mono text-xs text-[#e0e0e0] tracking-widest">1.7:1 RATIO</div>
               <div className="font-mono text-[9px] text-text-muted uppercase">Speed Increase Pulley</div>
             </div>
           </div>
        </div>
        
        {/* SCENE: CLOSING */}
        <div className="text-closing absolute bottom-24 left-12 opacity-0">
           <h3 className="font-display text-3xl text-[#f5ede3] uppercase tracking-tight mb-4">Engineer & Treasurer</h3>
           <p className="font-mono text-[11px] text-text-muted max-w-md leading-relaxed uppercase tracking-widest">
             Design, simulation, and fabrication for ThriveForce combat robotics.
           </p>
           <a href="https://github.com/vaishnavg121/Velociraptor" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-8 font-mono text-[10px] text-accent tracking-widest hover:text-[#f5ede3] transition-colors pointer-events-auto">
             VIEW CAD / ANALYSIS SOURCE →
           </a>
        </div>
        
      </div>
      
      {/* DEV OVERLAY - REMOVE BEFORE FINAL COMMIT */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-24 left-12 z-50 bg-black/80 text-white font-mono text-xs p-4 pointer-events-none">
           <div>PROGRESS: <span id="dev-progress">0.000</span></div>
           <div>SCENE: {activeScene}</div>
        </div>
      )}
    </section>
  );
};