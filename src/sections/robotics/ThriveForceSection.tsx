"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';

import { VelociraptorHero } from './VelociraptorHero';
import { EngineeringDossier } from './EngineeringDossier';
import { ThriveForceTeam } from './ThriveForceTeam';

// Lazy load 3D to protect performance
const VelociraptorScene = dynamic(
  () => import('./VelociraptorScene').then((mod) => mod.VelociraptorScene),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

export const ThriveForceSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    // Master scroll trigger for the entire Act I + Act II wrapper
    const st = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        window.dispatchEvent(new CustomEvent('robotics-master-scroll', { detail: self.progress }));
      }
    });
    return () => st.kill();
  }, { scope: wrapperRef });

  return (
    <section className="relative w-full bg-[#030303] text-white overflow-hidden">
      
      {/* WRAPPER FOR ACT I & ACT II - SHARES THE 3D CANVAS */}
      <div ref={wrapperRef} className="relative w-full">
        
        {/* STICKY 3D CANVAS BACKGROUND */}
        <div className="sticky top-0 left-0 w-full h-screen z-0 pointer-events-none">
           <VelociraptorScene />
        </div>
        
        {/* ACT I: THE MACHINE (Cinematic Intro) */}
        <div className="relative z-10 w-full h-[300vh]">
           <VelociraptorHero />
        </div>
        
        {/* ACT II: ENGINEERING DOSSIER */}
        <div className="relative z-10 w-full">
           <EngineeringDossier />
        </div>
        
      </div>
      
      {/* ACT III: THRIVEFORCE TEAM */}
      <div className="relative z-20 w-full bg-[#030303] min-h-screen border-t border-border/30">
         <ThriveForceTeam />
      </div>
      
      {/* DEV OVERLAY - REMOVE BEFORE FINAL */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-24 left-12 z-50 bg-black/80 text-white font-mono text-xs p-4 pointer-events-none">
           <div>MASTER PROG: <span id="dev-master-prog">0.000</span></div>
        </div>
      )}
    </section>
  );
};
