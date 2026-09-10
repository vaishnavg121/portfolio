"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const FlowLines = () => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mediaQuery.matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      <svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M-100,50 Q250,150 600,50 T1300,50"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          initial={{ pathOffset: 0, opacity: 0 }}
          animate={{ pathOffset: [0, 1], opacity: [0, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M-100,80 Q300,20 600,100 T1300,80"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.5"
          initial={{ pathOffset: 0, opacity: 0 }}
          animate={{ pathOffset: [0, 1], opacity: [0, 0.3, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
        />
        <motion.path
          d="M-100,20 Q200,80 600,30 T1300,20"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.5"
          initial={{ pathOffset: 0, opacity: 0 }}
          animate={{ pathOffset: [0, 1], opacity: [0, 0.2, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 5 }}
        />
      </svg>
    </div>
  );
};
