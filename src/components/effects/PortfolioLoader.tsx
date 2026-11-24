"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useSpring } from "framer-motion";
import { MASCOT_ASSETS } from "@/lib/assets";

export const PortfolioLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const trace = useSpring(0, { damping: 26, stiffness: 240 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }
    const unsubscribe = trace.on("change", (value) => setProgress(Math.min(100, Math.round(value * 100))));
    trace.set(1);
    const finish = window.setTimeout(onComplete, 300);
    return () => {
      window.clearTimeout(finish);
      unsubscribe();
    };
  }, [onComplete, trace]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] hidden motion-safe:flex items-end bg-gradient-to-t from-[#100b0c] via-[#0a0a0a]/95 to-background px-[var(--portfolio-edge)] py-8"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Image src={MASCOT_ASSETS.poses.sleep} alt="" width={100} height={100} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-75" />
      <div className="w-full">
        <div className="mb-3 flex items-end justify-between gap-4 font-mono text-[10px] tracking-widest text-text-muted uppercase">
          <span>Initializing motion</span>
          <span className="font-display text-3xl text-text-primary tabular-nums">{progress}%</span>
        </div>
        <div className="h-px bg-border">
          <motion.div className="h-full origin-left bg-accent" style={{ scaleX: trace }} />
        </div>
      </div>
    </motion.div>
  );
};
