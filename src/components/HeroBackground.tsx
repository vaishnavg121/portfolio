"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";

interface HeroBackgroundProps {
  bgX: MotionValue<number>;
  bgY: MotionValue<number>;
  mounted: boolean;
  shouldReduceMotion: boolean | null;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ bgX, bgY, mounted, shouldReduceMotion }) => {
  if (!mounted) return null;

  const durationLayerD = shouldReduceMotion ? 0 : 5;
  const durationLayerC = shouldReduceMotion ? 0 : 4;
  const durationLayerB = shouldReduceMotion ? 0 : 3.5;
  const durationLayerA = shouldReduceMotion ? 0 : 3;

  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center overflow-hidden">
      <motion.div
        className="w-full h-full relative"
        style={{ x: shouldReduceMotion ? 0 : bgX, y: shouldReduceMotion ? 0 : bgY }}
      >
        <svg viewBox="0 0 1440 900" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
          {/* Layer D - Very Faint Topo / System Structure */}
          <g stroke="var(--text-muted)" strokeWidth="0.5" opacity="0.04">
            {/* Grid structure */}
            <path d="M 0 100 L 1440 100 M 0 200 L 1440 200 M 0 300 L 1440 300 M 0 400 L 1440 400 M 0 500 L 1440 500 M 0 600 L 1440 600 M 0 700 L 1440 700 M 0 800 L 1440 800" strokeDasharray="2 8" />
            <path d="M 100 0 L 100 900 M 300 0 L 300 900 M 500 0 L 500 900 M 700 0 L 700 900 M 900 0 L 900 900 M 1100 0 L 1100 900 M 1300 0 L 1300 900" strokeDasharray="2 8" />
            
            {/* Architectural construction lines */}
            <line x1="0" y1="900" x2="1440" y2="0" strokeWidth="0.2" />
            <line x1="0" y1="0" x2="1440" y2="900" strokeWidth="0.2" />
            
            {/* Topo curves */}
            <path d="M -100 400 Q 300 200, 700 600 T 1500 400" fill="none" strokeWidth="0.3" strokeDasharray="10 5" />
            <path d="M -100 420 Q 300 220, 700 620 T 1500 420" fill="none" strokeWidth="0.3" strokeDasharray="10 5" />
            <path d="M -100 440 Q 300 240, 700 640 T 1500 440" fill="none" strokeWidth="0.3" strokeDasharray="10 5" />
            
            {/* Deep ghost nodes */}
            <circle cx="1100" cy="300" r="400" fill="none" strokeWidth="0.3" strokeDasharray="4 8" />
            <circle cx="300" cy="700" r="250" fill="none" strokeWidth="0.2" strokeDasharray="2 6" />
          </g>

          {/* Layer C - Technical Anchors & Detail */}
          <g stroke="var(--text-muted)" fill="none" opacity="0.12" strokeWidth="1">
            {/* Nodes and Crosshairs */}
            <path d="M 130 250 L 150 250 M 140 240 L 140 260" />
            <path d="M 810 150 L 830 150 M 820 140 L 820 160" />
            <path d="M 1290 650 L 1310 650 M 1300 640 L 1300 660" />
            
            <circle cx="140" cy="250" r="2" />
            <circle cx="820" cy="150" r="4" />
            <circle cx="820" cy="150" r="1" fill="var(--text-muted)" />
            <circle cx="1300" cy="650" r="2" />
            
            <path d="M 1300 650 L 1400 650" strokeDasharray="2 4" strokeWidth="0.5" />
            <text x="1350" y="640" fontSize="8" fill="var(--text-muted)" letterSpacing="1" opacity="0.5">TRJ_0X</text>
            
            {/* Coordinate ticks */}
            <path d="M 1300 800 L 1300 820 M 1320 800 L 1320 810 M 1340 800 L 1340 810 M 1360 800 L 1360 810 M 1380 800 L 1380 820" strokeWidth="0.5" />
            <text x="1300" y="835" fontSize="8" fill="var(--text-muted)" letterSpacing="1" opacity="0.5">SYS.01</text>
            <text x="50" y="145" fontSize="8" fill="var(--text-muted)" letterSpacing="1" opacity="0.5">LAT_ARC_</text>
            
            {/* Orbital path segments */}
            <path d="M 900 700 A 300 300 0 0 1 1200 400" strokeDasharray="4 8" strokeWidth="0.5" />
            <path d="M 900 700 A 250 250 0 0 0 650 450" strokeDasharray="2 4" strokeWidth="0.5" />
          </g>

          {/* Layer B - Secondary Structural Curves */}
          <motion.path
            d="M -100 800 C 300 900, 700 200, 1500 400"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.3 }}
          />
          <motion.path
            d="M 1500 100 C 1000 150, 700 800, -100 700"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="0.5"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.5 }}
          />
          <motion.path
            d="M 400 -100 C 600 300, 1100 700, 1600 650"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="0.5"
            opacity="0.06"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.7 }}
          />
          <motion.path
            d="M 200 1000 C 500 500, 900 900, 1500 750"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="0.5"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.9 }}
          />
          
          {/* Layer A - Primary Sweeping Arcs (Crimson) */}
          <motion.path
            d="M -200 600 C 300 600, 600 50, 1600 250"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            opacity="0.25"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.8 }}
          />
          <motion.path
            d="M -50 950 C 400 600, 1000 500, 1500 850"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity="0.2"
            strokeDasharray="4 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeOut", delay: shouldReduceMotion ? 0 : 1.0 }}
          />
          <motion.path
            d="M 800 -100 C 900 400, 1100 600, 1600 500"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1.2 }}
          />

        </svg>
      </motion.div>
    </div>
  );
};

