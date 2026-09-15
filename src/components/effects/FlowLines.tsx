"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";
import { useSectionVisibility, useReducedMotion } from "@/lib/visibility";

export const FlowLines = () => {
  const shouldReduceMotion = useReducedMotion();
  const { ref, isVisible } = useSectionVisibility();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (isVisible) {
      setShouldAnimate(true);
    } else {
      setShouldAnimate(false);
    }
  }, [isVisible, shouldReduceMotion]);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute top-0 left-[-30%] w-[160%] h-[80%] opacity-20"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.flowRibbon})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
        }}
        animate={shouldAnimate ? {
          x: ["-5%", "0%", "5%"],
          y: ["5%", "0%", "-5%"],
          opacity: [0, 0.2, 0.1]
        } : { opacity: 0.1 }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute top-[10%] left-[-20%] w-[140%] h-[60%] opacity-40 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.flowRibbon})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
          maskImage: "linear-gradient(to right, transparent, black 40%, black 60%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 40%, black 60%, transparent)",
        }}
        animate={shouldAnimate ? {
          x: ["-12%", "0%", "8%"],
          y: ["20px", "-10px", "5px"],
          rotate: [-2, 0, 2],
          opacity: [0, 0.5, 0.2]
        } : { opacity: 0.2 }}
        transition={{
          duration: 4.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute top-[30%] left-[10%] w-[80%] h-[40%] opacity-60 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.flowRibbon})`,
          backgroundSize: "cover",
          backgroundPosition: "top right",
          backgroundRepeat: "no-repeat",
          maskImage: "radial-gradient(circle at center, black 20%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 20%, transparent 60%)",
        }}
        animate={shouldAnimate ? {
          x: ["-20%", "5%", "15%"],
          y: ["10px", "-5px", "0px"],
          opacity: [0, 0.7, 0]
        } : { opacity: 0 }}
        transition={{
          duration: 3,
          ease: "easeOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
};