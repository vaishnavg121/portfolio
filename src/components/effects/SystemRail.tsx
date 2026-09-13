"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export const SystemRail = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, stiffness: 100 });
  const [activeLabel, setActiveLabel] = useState("INIT");

  const [railState, setRailState] = useState({ height: 128, opacity: 0.5 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const active = document.querySelector("section.is-active");
      if (active && active.id) {
         setActiveLabel(active.id.toUpperCase());
         
         // Dynamically alter the rail based on section
         if (active.id === "hero") setRailState({ height: 64, opacity: 0.2 });
         else if (active.id === "work") setRailState({ height: 256, opacity: 0.8 });
         else if (active.id === "about") setRailState({ height: 128, opacity: 0.5 });
         else if (active.id === "github") setRailState({ height: 48, opacity: 0.9 });
         else setRailState({ height: 128, opacity: 0.5 });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const yPos = useTransform(smoothProgress, [0, 1], ["0%", "85vh"]);

  return (
    <div className="fixed right-6 md:right-12 top-0 bottom-0 w-[1px] pointer-events-none z-40 hidden md:block">
      {/* Background Track */}
      <div className="absolute inset-0 bg-[#333] opacity-20" />
      
      {/* Moving Marker */}
      <motion.div 
        className="absolute top-0 w-full flex items-center justify-center transition-all duration-1000 ease-out"
        style={{ y: mounted ? yPos : "0%", opacity: railState.opacity }}
      >
        <motion.div 
          className="w-[1px] bg-accent transition-all duration-1000 ease-out" 
          animate={mounted ? { height: railState.height } : { height: 128 }}
        />
        <div className="absolute left-4 opacity-50 transform -rotate-90 origin-left whitespace-nowrap text-[9px] font-mono tracking-widest text-text-muted transition-all duration-500">
          SYS // {activeLabel}
        </div>
      </motion.div>
    </div>
  );
};

