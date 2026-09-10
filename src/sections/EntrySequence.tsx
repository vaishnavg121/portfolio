"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

export const EntrySequence = () => {
  const [stage, setStage] = useState(0); // 0: initializing, 1: text, 2: slash, 3: done

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(3);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 700);
    const t3 = setTimeout(() => setStage(3), 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === 3) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono text-text-muted tracking-widest"
          >
            INITIALIZING...
          </motion.div>
        )}
        
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono text-text-primary tracking-[0.2em] flex flex-col items-center gap-2"
          >
            <span>VAISHNAV // 121</span>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="h-[1px] w-12 bg-accent"
            />
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute top-1/2 left-1/2 pointer-events-none w-[120vw] h-[120vw] max-w-[2000px] max-h-[2000px]"
            style={{ 
              backgroundImage: `url(${THEME_ASSETS.global.slashTransition})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
