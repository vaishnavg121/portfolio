"use client";

import { createContext, useContext, useEffect, useRef } from "react";
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

  const rafIdRef = useRef<number | null>(null);
  const pendingRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const readingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      readingMode.set(1);
      return;
    }

    const flushPointer = () => {
      const pending = pendingRef.current;
      if (pending) {
        x.set(pending.clientX);
        y.set(pending.clientY);
        nX.set((pending.clientX / window.innerWidth) * 2 - 1);
        nY.set((pending.clientY / window.innerHeight) * 2 - 1);
        pendingRef.current = null;
      }
      rafIdRef.current = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!e.isPrimary || (e.pointerType === "touch" && e.target instanceof Element && e.target.closest("[data-knowledge-canvas]"))) return;
      breakReadingMode();
      pendingRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flushPointer);
      }
    };

    const breakReadingMode = () => {
      readingMode.set(0);
      document.body.setAttribute("data-reading-mode", "false");
      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      readingTimeoutRef.current = setTimeout(() => {
        readingMode.set(1);
        document.body.setAttribute("data-reading-mode", "true");
      }, 500);
    };

    const handleScroll = () => breakReadingMode();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    breakReadingMode();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
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