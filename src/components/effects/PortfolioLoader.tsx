"use client";

import { useEffect, useState, useRef } from "react";
import { getImageProps } from "next/image";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { THEME_ASSETS, MASCOT_ASSETS } from "@/lib/assets";

interface PortfolioLoaderProps {
  onComplete: () => void;
}

export const PortfolioLoader = ({ onComplete }: PortfolioLoaderProps) => {
  const [loadingText, setLoadingText] = useState("INITIALIZING_SYSTEM");
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

    if (window.matchMedia("(width < 64rem)").matches) {
      progressSpring.set(100);
      setLoadingText("INITIALIZING_MOTION");
      const update = progressSpring.on("change", (value) => setDisplayProgress(Math.round(value)));
      const finish = setTimeout(onComplete, 560);
      return () => { clearTimeout(finish); update(); };
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
        name: "DOM_READY",
        weight: 10,
        run: async () => {
          if (document.readyState === "complete") return true;
          return new Promise(resolve => window.addEventListener("load", resolve));
        }
      },
      {
        name: "FONTS_READY",
        weight: 15,
        run: async () => {
          if ("fonts" in document) {
            await document.fonts.ready;
          }
          return true;
        }
      },
      {
        name: "PREPARING_INTERFACE",
        weight: 20,
        run: async () => {
          await preloadImage(THEME_ASSETS.global.paperGrain);
        }
      },
      {
        name: "SUMMONING_FAMILIAR",
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
        name: "INITIALIZING_MOTION",
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
        }, 500);
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

  const desktopPose = getMascotPose();
  const { props: mobilePose } = getImageProps({
    src: MASCOT_ASSETS.poses.sleep,
    alt: "",
    width: 128,
    height: 128,
  });

  return (
    <motion.div
      key="portfolio-loader"
      className="fixed inset-0 z-[100] bg-background hidden motion-safe:flex flex-col justify-end p-8 md:p-16 overflow-hidden pointer-events-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="w-full flex flex-col relative h-full">
        
        {/* Top Header */}
        <motion.div 
          className="absolute top-0 left-0 w-full flex justify-between items-start"
          animate={isFinishing ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
            [ VAISHNAV ]
          </div>
          <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase text-right">
            PORTFOLIO // 2026
          </div>
        </motion.div>

        {/* Mascot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center opacity-60">
          <AnimatePresence mode="wait">
            <picture key={desktopPose}>
              <source media="(min-width: 64rem) and (prefers-reduced-motion: no-preference)" srcSet={desktopPose} />
              <motion.img
                src={mobilePose.src}
                alt=""
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="max-h-32 object-contain"
              />
            </picture>
          </AnimatePresence>
        </div>

        {/* Bottom Elements */}
        <div className="mt-auto flex flex-col gap-6">
          <motion.div 
            className="flex justify-between items-end"
            animate={isFinishing ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
              {loadingText}
            </div>
            <div className="text-6xl md:text-8xl font-display font-medium tracking-tighter tabular-nums text-text-primary/90 leading-none">
              {displayProgress.toString().padStart(2, "0")}<span className="text-xl md:text-2xl text-text-muted/50 ml-1">%</span>
            </div>
          </motion.div>

          {/* Progress Line */}
          <motion.div 
            className="w-full relative h-[1px] bg-white/5 overflow-hidden origin-right"
            animate={isFinishing ? { scaleX: 0, opacity: 0, rotate: -2 } : { scaleX: 1, opacity: 1, rotate: 0 }}
            transition={isFinishing ? { duration: 0.4, ease: "backIn" } : { duration: 0 }}
          >
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-accent/80"
              style={{ width: widthTransform }} 
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

