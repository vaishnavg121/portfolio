"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { THEME_ASSETS, MASCOT_ASSETS } from "@/lib/assets";

interface PortfolioLoaderProps {
  onComplete: () => void;
}

export const PortfolioLoader = ({ onComplete }: PortfolioLoaderProps) => {
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEM");
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const realProgress = useRef(0);
  const progressSpring = useSpring(0, { damping: 25, stiffness: 120, mass: 1 });
  const widthTransform = useTransform(progressSpring, v => `${v}%`);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const tasks = [
      {
        name: "DOM READY",
        weight: 10,
        run: async () => {
          if (document.readyState === "complete") return true;
          return new Promise(resolve => window.addEventListener("load", resolve));
        }
      },
      {
        name: "FONTS READY",
        weight: 15,
        run: async () => {
          if ("fonts" in document) {
            await document.fonts.ready;
          }
          return true;
        }
      },
      {
        name: "PREPARING INTERFACE",
        weight: 20,
        run: async () => {
          await preloadImage(THEME_ASSETS.global.paperGrain);
        }
      },
      {
        name: "SUMMONING FAMILIAR",
        weight: 35,
        run: async () => {
          await Promise.all([
            preloadImage(MASCOT_ASSETS.poses.sleep),
            preloadImage(MASCOT_ASSETS.poses.idle),
            preloadImage(MASCOT_ASSETS.poses.surprised)
          ]);
        }
      },
      {
        name: "INITIALIZING MOTION",
        weight: 20,
        run: async () => {
          await new Promise(r => setTimeout(r, 100));
        }
      }
    ];

    let isCancelled = false;
    let completedWeight = 0;

    const runTasks = async () => {
      const timeout = setTimeout(() => {
        if (!isCancelled) {
          isCancelled = true;
          onComplete();
        }
      }, 3500);

      for (const task of tasks) {
        if (isCancelled) break;
        setLoadingText(task.name);
        try { await task.run(); } catch { /* ignore */ }
        completedWeight += task.weight;
        realProgress.current = completedWeight;
        progressSpring.set(completedWeight);
      }

      if (!isCancelled) {
        clearTimeout(timeout);
      }
    };

    runTasks();

    const unsubscribe = progressSpring.on("change", (v) => {
      const val = Math.round(v);
      setDisplayProgress(val);
      if (val >= 99 && !isCancelled && !isFinishing) {
        setIsFinishing(true);
        setTimeout(() => {
          isCancelled = true;
          onComplete();
        }, 500); // Wait for the contraction animation
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [onComplete, progressSpring, isFinishing]);

  const getMascotPose = () => {
    if (displayProgress < 60) return MASCOT_ASSETS.poses.sleep;
    if (displayProgress < 99) return MASCOT_ASSETS.poses.idle;
    return MASCOT_ASSETS.poses.surprised;
  };

  return (
    <motion.div
      key="portfolio-loader"
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="w-full max-w-xs flex flex-col items-center gap-6 relative">
        
        {/* Mascot */}
        <div className="absolute -top-32 w-24 h-24 flex items-end justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={getMascotPose()}
              src={getMascotPose()}
              alt=""
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="max-h-full object-contain"
            />
          </AnimatePresence>
        </div>

        <motion.div 
          animate={isFinishing ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
          className="text-xs font-mono text-text-primary tracking-[0.2em]"
        >
          VAISHNAV
        </motion.div>

        {/* Progress Line */}
        <motion.div 
          className="w-full relative h-[1px] bg-border overflow-hidden rounded-full origin-center"
          animate={isFinishing ? { scaleX: 0, opacity: 0, rotate: 15 } : { scaleX: 1, opacity: 1, rotate: 0 }}
          transition={isFinishing ? { duration: 0.3, ease: "backIn" } : { duration: 0 }}
        >
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-accent"
            style={{ width: widthTransform }} 
          />
        </motion.div>

        <motion.div 
          animate={isFinishing ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          className="flex w-full justify-between items-center text-[10px] font-mono tracking-widest text-text-muted"
        >
          <span>{loadingText}</span>
          <span>[ {displayProgress.toString().padStart(3, "0")}% ]</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

