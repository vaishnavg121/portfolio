"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<"default" | "VIEW" | "DRAG" | "CODE">("default");
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;
    
    // Disable if reduced motion is preferred
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === "a" || target.tagName.toLowerCase() === "button" || target.closest("a") || target.closest("button")) {
         // Could set an interaction state here
      }
      
      const customCursorData = target.getAttribute("data-cursor") || target.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (customCursorData === "VIEW" || customCursorData === "DRAG" || customCursorData === "CODE") {
        setCursorState(customCursorData);
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Default small dot */}
      <motion.div
        className="bg-white rounded-full flex items-center justify-center overflow-hidden"
        initial={false}
        animate={{
          width: cursorState === "default" ? 12 : 60,
          height: cursorState === "default" ? 12 : 60,
          opacity: cursorState === "default" ? 1 : 0.8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {cursorState !== "default" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-black text-[10px] font-mono font-bold tracking-widest"
          >
            {cursorState}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};
