"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BootSlash } from "@/components/effects";

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
    const t3 = setTimeout(() => setStage(3), 1400); 

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === 3) return null;

  return (
    <>
      <AnimatePresence>
        {stage < 2 && (
          <motion.div
            key="boot-overlay"
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {stage >= 2 && <BootSlash />}
    </>
  );
};

