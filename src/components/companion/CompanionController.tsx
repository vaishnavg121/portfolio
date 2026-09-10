"use client";

import { useState, useEffect, useRef } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import { CompanionRenderer } from "./CompanionRenderer";
import { CompanionState, CompanionDirection, CompanionAnchor } from "./companion.types";
import { SECTION_BEHAVIORS, VELOCITY_THRESHOLDS } from "./companion.config";

export const CompanionController = () => {
  const [state, setState] = useState<CompanionState>("SLEEP");
  const [direction, setDirection] = useState<CompanionDirection>("right");
  const [intensity, setIntensity] = useState<number>(0);
  const [anchor] = useState<CompanionAnchor>("fixed-bottom-right");
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const isTransitioningRef = useRef(false);

  // 1. Scroll Velocity Behavior
  useEffect(() => {
    return smoothVelocity.on("change", (latest) => {
      if (isTransitioningRef.current) return;
      
      const v = Math.abs(latest);
      setDirection(latest > 0 ? "right" : "left");
      setIntensity(Math.min(v / 1000, 1)); // 0 to 1

      if (v > VELOCITY_THRESHOLDS.RUN) {
        setState("WIND_BLOWN");
      } else if (v > VELOCITY_THRESHOLDS.WALK * 5) {
        setState("RUN");
      } else if (v > VELOCITY_THRESHOLDS.WALK) {
        setState("WALK");
      } else {
        setState((prev) => {
          if (["WALK", "RUN", "WIND_BLOWN"].includes(prev)) return "IDLE";
          return prev;
        });
      }
    });
  }, [smoothVelocity]);

  // 2. Section Awareness via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.find((e) => e.isIntersecting);
      if (active && active.target.id) {
        const id = active.target.id;
        if (SECTION_BEHAVIORS[id]) {
          setState((prev) => {
             // Don't override high-priority transient states
             if (["SURPRISED", "WAVE", "WIND_BLOWN"].includes(prev)) return prev;
             return SECTION_BEHAVIORS[id];
          });
        }
      }
    }, { threshold: 0.6 });

    // Find all sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const temporarilySetState = (tempState: CompanionState, duration: number) => {
    isTransitioningRef.current = true;
    setState(tempState);
    setTimeout(() => {
      isTransitioningRef.current = false;
      setState("IDLE");
    }, duration);
  };

  // 3. Global Interaction Events
  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "command-trigger" && detail.data === "hamster") {
        temporarilySetState("SURPRISED", 2000);
      } else if (detail?.type === "github-cell-hover") {
        temporarilySetState("INSPECT", 500);
      }
    };

    window.addEventListener("companionInteract", handleInteract);
    return () => window.removeEventListener("companionInteract", handleInteract);
  }, []);

  // Set initial wave on load
  useEffect(() => {
    const timer = setTimeout(() => {
      temporarilySetState("WAVE", 2000);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reduced motion handling
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  if (reducedMotion) return null; // Or render a fully static version

  return (
    <div 
      className="fixed bottom-8 right-8 z-40 hidden md:flex items-center justify-center mix-blend-difference"
      onClick={() => temporarilySetState("SURPRISED", 1000)}
      data-anchor={anchor}
    >
      <CompanionRenderer state={state} direction={direction} intensity={intensity} />
    </div>
  );
};
