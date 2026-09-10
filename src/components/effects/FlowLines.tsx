"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

export const FlowLines = () => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShouldAnimate(false);
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute top-1/4 left-[-20%] w-[140%] h-[50%]"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.flowRibbon})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%, black 60%, transparent)'
        }}
        initial={{ x: "-10%", opacity: 0 }}
        whileInView={shouldAnimate ? {
          x: "5%",
          opacity: [0, 0.4, 0.2]
        } : { opacity: 0.2 }}
        transition={{
          duration: 3,
          ease: "easeOut",
        }}
        viewport={{ once: false, margin: "-100px" }}
      />
    </div>
  );
};
