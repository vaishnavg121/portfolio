"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

export const EmberField = () => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShouldAnimate(false);
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <motion.div
        className="absolute bottom-0 right-0 w-[80%] h-[80%] max-w-[800px]"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.emberFragments})`,
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          maskImage: 'radial-gradient(ellipse at bottom right, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 20%, transparent 80%)'
        }}
        animate={shouldAnimate ? {
          y: [0, -15, 0],
          opacity: [0.6, 0.9, 0.6]
        } : {}}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
