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
}

const PointerContext = createContext<PointerContextType | null>(null);

export const PointerProvider = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const nX = useMotionValue(0);
  const nY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 200, mass: 1 };
  const sNX = useSpring(nX, springConfig);
  const sNY = useSpring(nY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    let ticking = false;

    const handlePointerMove = (e: MouseEvent) => {
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

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [x, y, nX, nY]);

  return (
    <PointerContext.Provider value={{ x, y, nX, nY, sNX, sNY }}>
      {children}
    </PointerContext.Provider>
  );
};

export const usePointer = () => {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("usePointer must be used within PointerProvider");
  return ctx;
};

