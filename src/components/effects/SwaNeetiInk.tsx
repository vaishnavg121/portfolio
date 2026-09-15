"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";
import { useSectionVisibility, useReducedMotion } from "@/lib/visibility";

export const SwaNeetiInk = () => {
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
        className="absolute top-[10%] left-[-20%] w-[120%] h-[120%] origin-left"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.inkBrushReveal})`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
        animate={shouldAnimate ? {
          x: ["-40%", "10%", "0%"],
          scaleX: [0.8, 1.1, 1],
          opacity: [0, 0.8, 0.25]
        } : { x: "0%", scaleX: 1, opacity: 0.25 }}
        transition={{
          duration: 1.8,
          times: [0, 0.5, 1],
          ease: "easeOut",
        }}
      />
    </div>
  );
};