"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useVelocity, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export type CompanionState = "IDLE" | "WALK" | "RUN" | "READ" | "SLEEP" | "SURPRISED" | "WIND_BLOWN" | "WAVE";

export const Companion = () => {
  const [state, setState] = useState<CompanionState>("IDLE");
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  useEffect(() => {
    return smoothVelocity.on("change", (latest) => {
      if (latest > 1000 || latest < -1000) {
        setState("WIND_BLOWN");
      } else if (latest > 300 || latest < -300) {
        setState("RUN");
      } else if (latest > 50 || latest < -50) {
        setState("WALK");
      } else {
        // Only return to IDLE if we were moving. Don't overwrite special states like WAVE or SLEEP immediately
        setState((prev) => {
          if (["WALK", "RUN", "WIND_BLOWN"].includes(prev)) return "IDLE";
          return prev;
        });
      }
    });
  }, [smoothVelocity]);

  // Set initial wave on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setState("WAVE");
      setTimeout(() => setState("IDLE"), 2000);
    }, 2500); // After entry sequence
    return () => clearTimeout(timer);
  }, []);

  // Simple state machine for visual
  const getVisualForState = () => {
    switch (state) {
      case "IDLE": return "(-_-)";
      case "WALK": return "(o_o)";
      case "RUN": return "(O_O)";
      case "WIND_BLOWN": return "(>_<)";
      case "SURPRISED": return "(!_!)";
      case "READ": return "(-_-)📖";
      case "SLEEP": return "(u_u)zZ";
      case "WAVE": return "\\(^_^)";
      default: return "(-_-)";
    }
  };

  return (
    <motion.div
      className={cn(
        "fixed bottom-8 right-8 z-40 hidden md:flex items-center justify-center mix-blend-difference pointer-events-none transition-all duration-300"
      )}
      animate={{
        y: state === "WALK" || state === "RUN" ? [0, -10, 0] : 0,
      }}
      transition={{
        repeat: state === "WALK" || state === "RUN" ? Infinity : 0,
        duration: state === "RUN" ? 0.3 : 0.6,
      }}
    >
      <div className="relative group pointer-events-auto cursor-pointer" onClick={() => setState("SURPRISED")} onMouseLeave={() => setTimeout(() => setState("IDLE"), 1000)}>
        {/* Placeholder SVG - A small abstract entity */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" className="fill-white transition-all duration-300" 
            style={{
              transformOrigin: "center",
              transform: state === "WIND_BLOWN" ? "skewX(-20deg)" : "none"
            }}
          />
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {getVisualForState()}
          </text>
          
          {/* Accent decoration */}
          {state === "SURPRISED" && (
             <circle cx="35" cy="5" r="3" fill="#cc3333" />
          )}
        </svg>
      </div>
    </motion.div>
  );
};
