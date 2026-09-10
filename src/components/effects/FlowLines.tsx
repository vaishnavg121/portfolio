"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const FlowLines = ({ paths }: { paths?: string[] }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mediaQuery.matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  const defaultPaths = [
    "M-100,50 Q250,150 600,50 T1300,50",
    "M-100,80 Q300,20 600,100 T1300,80",
    "M-100,20 Q200,80 600,30 T1300,20",
  ];

  const renderPaths = paths || defaultPaths;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      <svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {renderPaths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={i === 0 ? "1" : "0.5"}
            initial={{ pathOffset: 0, opacity: 0 }}
            animate={{ pathOffset: [0, 1], opacity: [0, i === 0 ? 0.5 : 0.3, 0] }}
            transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear", delay: i * 2 }}
          />
        ))}
      </svg>
    </div>
  );
};
