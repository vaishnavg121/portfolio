"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";
import { useSectionVisibility, useReducedMotion } from "@/lib/visibility";

export const EmberField = () => {
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
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-700">
      <motion.div
        className="absolute bottom-[-10%] right-[-5%] w-[80%] h-[80%] max-w-[800px] transition-opacity duration-500 group-hover:opacity-60"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.emberFragments})`,
          backgroundSize: "contain",
          backgroundPosition: "right bottom",
          backgroundRepeat: "no-repeat",
          maskImage: "radial-gradient(ellipse at bottom right, black 20%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse at bottom right, black 20%, transparent 60%)",
        }}
        animate={shouldAnimate ? {
          y: [0, -20, 0],
          x: [0, -5, 0],
          opacity: [0.25, 0.4, 0.25]
        } : { opacity: 0.25 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[-5%] right-[10%] w-[60%] h-[60%] max-w-[600px] transition-opacity duration-500 group-hover:opacity-80"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.emberFragments})`,
          backgroundSize: "cover",
          backgroundPosition: "top left",
          backgroundRepeat: "no-repeat",
          maskImage: "radial-gradient(circle at center, black 10%, transparent 50%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 10%, transparent 50%)",
          mixBlendMode: "screen",
        }}
        animate={shouldAnimate ? {
          y: [10, -30, 10],
          x: [5, -10, 5],
          scale: [0.95, 1.05, 0.95],
          opacity: [0.1, 0.5, 0.1]
        } : { opacity: 0.15 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute top-[20%] right-[30%] w-[30%] h-[30%] max-w-[300px] transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.emberFragments})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          maskImage: "radial-gradient(circle at center, black 5%, transparent 30%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 5%, transparent 30%)",
          mixBlendMode: "lighten",
        }}
        animate={shouldAnimate ? {
          y: [20, -50],
          x: [-10, 10],
          opacity: [0, 0.6, 0]
        } : { opacity: 0 }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 3,
        }}
      />
    </div>
  );
};