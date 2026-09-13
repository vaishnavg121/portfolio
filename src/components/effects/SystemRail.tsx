"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export const SystemRail = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, stiffness: 100 });
  const [activeLabel, setActiveLabel] = useState("INIT");

  useEffect(() => {
    const handleScroll = () => {
      const active = document.querySelector("section.is-active");
      if (active && active.id) {
         setActiveLabel(active.id.toUpperCase());
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const yPos = useTransform(smoothProgress, [0, 1], ["0%", "85vh"]);

  return (
    <div className="fixed right-6 md:right-12 top-0 bottom-0 w-[1px] pointer-events-none z-40 hidden md:block">
      {/* Background Track */}
      <div className="absolute inset-0 bg-[#333] opacity-20" />
      
      {/* Moving Marker */}
      <motion.div 
        className="absolute top-0 w-full flex items-center justify-center"
        style={{ y: yPos }}
      >
        <div className="w-[1px] h-32 bg-accent" />
        <div className="absolute left-4 opacity-50 transform -rotate-90 origin-left whitespace-nowrap text-[9px] font-mono tracking-widest text-text-muted">
          SYS // {activeLabel}
        </div>
      </motion.div>
    </div>
  );
};

