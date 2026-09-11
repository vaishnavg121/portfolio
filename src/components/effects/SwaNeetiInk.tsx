"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

export const SwaNeetiInk = () => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldAnimate(false);
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute top-[10%] left-[-20%] w-[120%] h-[120%] origin-left"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.inkBrushReveal})`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
        initial={{ x: "-40%", scaleX: 0.8, opacity: 0 }}
        whileInView={shouldAnimate ? { 
          x: ["-40%", "10%", "0%"], 
          scaleX: [0.8, 1.1, 1],
          opacity: [0, 0.8, 0.25]
        } : { x: "0%", scaleX: 1, opacity: 0.25 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 1.8,
          times: [0, 0.5, 1],
          ease: "easeOut"
        }}
      />
    </div>
  );
};

