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
          {/* Layer D - Deepest background depth (Soft ghost lines / Grid anchors) */}
          <g stroke="var(--text-muted)" strokeWidth="0.5" opacity="0.05">
            {/* Horizontal divisions */}
            <line x1="0" y1="150" x2="1440" y2="150" />
            <line x1="0" y1="450" x2="1440" y2="450" />
            <line x1="0" y1="750" x2="1440" y2="750" />
            {/* Vertical divisions */}
            <line x1="240" y1="0" x2="240" y2="900" />
            <line x1="720" y1="0" x2="720" y2="900" />
            <line x1="1200" y1="0" x2="1200" y2="900" />
            {/* Deep ghost circle */}
            <circle cx="1100" cy="300" r="400" fill="none" strokeWidth="0.3" strokeDasharray="4 8" />
          </g>

          {/* Layer C - Technical / Editorial detail (ticks, notations, anchors) */}
          <g stroke="var(--text-muted)" fill="none" opacity="0.15" strokeWidth="1">
            {/* Crosshairs & Ticks */}
            <path d="M 230 150 L 250 150 M 240 140 L 240 160" />
            <path d="M 710 150 L 730 150 M 720 140 L 720 160" />
            <path d="M 1190 750 L 1210 750 M 1200 740 L 1200 760" />
            
            <circle cx="240" cy="450" r="4" />
            <circle cx="240" cy="450" r="1" fill="var(--text-muted)" />
            
            <circle cx="1200" cy="150" r="4" />
            
            {/* Micro notation arcs */}
            <path d="M 720 450 A 150 150 0 0 1 870 600" strokeDasharray="2 4" strokeWidth="0.5" />
            <path d="M 720 450 A 100 100 0 0 0 620 350" strokeDasharray="1 3" strokeWidth="0.5" />
            
            {/* Axis scales */}
            <path d="M 1300 800 L 1300 820 M 1320 800 L 1320 810 M 1340 800 L 1340 810 M 1360 800 L 1360 810 M 1380 800 L 1380 820" strokeWidth="0.5" />
            <text x="1300" y="835" fontSize="8" fill="var(--text-muted)" letterSpacing="1" opacity="0.5">SYS.01</text>
            
            <text x="50" y="145" fontSize="8" fill="var(--text-muted)" letterSpacing="1" opacity="0.5">LAT_ARC</text>
          </g>

          {/* Layer B - Secondary supporting curves (Charcoal / Muted Grey) */}
          <motion.path
            d="M -100 800 C 400 900, 800 200, 1500 400"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.5 }}
          />
          <motion.path
            d="M 1500 100 C 900 150, 600 800, -100 700"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="0.5"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerB, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.7 }}
          />
          
          {/* Layer A - Primary sweeping arcs (Crimson and clean structural lines) */}
          <motion.path
            d="M -200 600 C 300 600, 600 50, 1600 250"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeOut", delay: shouldReduceMotion ? 0 : 1 }}
          />
          
          <motion.path
            d="M -50 950 C 400 600, 1000 600, 1500 900"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            opacity="0.2"
            strokeDasharray="4 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeOut", delay: shouldReduceMotion ? 0 : 1.2 }}
          />
          
          <motion.path
            d="M 400 -100 C 500 300, 900 700, 1600 650"
            fill="none"
            stroke="var(--text-primary)"
            strokeWidth="0.5"
            opacity="0.08"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: durationLayerA, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 1.5 }}
          />

        </svg>
      </motion.div>
    </div>
  );
};

