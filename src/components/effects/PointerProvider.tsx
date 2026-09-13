"use client";

import { createContext, useContext, useEffect } from "react";
import { useMotionValue, useSpring, MotionValue } from "framer-motion";

interface PointerContextType {
  x: MotionValue<number>;
  y: MotionValue<number>;
  nX: MotionValue<number>;
  nY: MotionValue<number>;
  sNX: MotionValue<number>;
  sNY: MotionValue<number>;
  readingMode: MotionValue<number>;
}

const PointerContext = createContext<PointerContextType | null>(null);

export const PointerProvider = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const nX = useMotionValue(0);
  const nY = useMotionValue(0);
  const readingMode = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 200, mass: 1 };
  const sNX = useSpring(nX, springConfig);
  const sNY = useSpring(nY, springConfig);
  const sReadingMode = useSpring(readingMode, { damping: 30, stiffness: 100 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      readingMode.set(1);
      return;
    }
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    let ticking = false;
    let readingTimeout: NodeJS.Timeout;

    const breakReadingMode = () => {
       readingMode.set(0);
       document.body.setAttribute("data-reading-mode", "false");
       clearTimeout(readingTimeout);
       readingTimeout = setTimeout(() => {
          readingMode.set(1);
          document.body.setAttribute("data-reading-mode", "true");
       }, 500);
    };

    const handlePointerMove = (e: MouseEvent) => {
      breakReadingMode();
      if (!ticking) {
        requestAnimationFrame(() => {
          x.set(e.clientX);
          y.set(e.clientY);
          nX.set((e.clientX / window.innerWidth) * 2 - 1);
          nY.set((e.clientY / window.innerHeight) * 2 - 1);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleScroll = () => breakReadingMode();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial start
    breakReadingMode();

    return () => {
       window.removeEventListener("pointermove", handlePointerMove);
       window.removeEventListener("scroll", handleScroll);
       clearTimeout(readingTimeout);
    };
  }, [x, y, nX, nY, readingMode]);

  return (
    <PointerContext.Provider value={{ x, y, nX, nY, sNX, sNY, readingMode: sReadingMode }}>
      {children}
    </PointerContext.Provider>
  );
};

export const usePointer = () => {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("usePointer must be used within PointerProvider");
  return ctx;
};

