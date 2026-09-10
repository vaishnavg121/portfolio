"use client";

import { useState, useEffect, useRef } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import { CompanionRenderer } from "./CompanionRenderer";
import { CompanionState, CompanionDirection } from "./companion.types";
import { SECTION_BEHAVIORS, VELOCITY_THRESHOLDS } from "./companion.config";

export const CompanionController = () => {
  const [state, setState] = useState<CompanionState>("SLEEP");
  const [direction, setDirection] = useState<CompanionDirection>("right");
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const isTransitioningRef = useRef(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const currentPos = useRef({ x: 0, y: 0 });

  // Reduced motion setup
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 1. Initial Position Setup
  useEffect(() => {
    currentPos.current = {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100
    };
  }, []);

  // 2. Smooth Movement Loop (Bypasses React State)
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!containerRef.current) return;
      
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      let targetX = window.innerWidth - 120;
      let targetY = window.innerHeight - 120;

      if (targetElementRef.current) {
        const rect = targetElementRef.current.getBoundingClientRect();
        const isCell = targetElementRef.current.hasAttribute('data-github-cell');
        
        if (isCell) {
          // Prefer below cell
          targetX = rect.left + rect.width / 2 - 40; 
          targetY = rect.bottom + 10;
          
          // viewport boundary checks for safe margins
          if (targetY > window.innerHeight - 80) {
            targetY = rect.top - 80 - 10; // move above cell if it hits bottom
          }
          if (targetX < 20) targetX = 20;
          if (targetX > window.innerWidth - 80 - 20) targetX = window.innerWidth - 80 - 20;
        } else {
          targetX = rect.left + rect.width / 2 - 40;
          targetY = rect.top + rect.height / 2 - 40;
        }
      }

      if (reducedMotion) {
        currentPos.current.x = targetX;
        currentPos.current.y = targetY;
      } else {
        // Smooth interpolation (lerp)
        const speed = 5.0; // speed factor
        currentPos.current.x += (targetX - currentPos.current.x) * (1 - Math.exp(-speed * dt));
        currentPos.current.y += (targetY - currentPos.current.y) * (1 - Math.exp(-speed * dt));
      }

      // Apply transform directly to DOM
      containerRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;

      // Direction derived from movement
      if (!isTransitioningRef.current && Math.abs(targetX - currentPos.current.x) > 10) {
        if (targetX > currentPos.current.x && direction !== "right") setDirection("right");
        if (targetX < currentPos.current.x && direction !== "left") setDirection("left");
      }
    };
    
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, direction]);

  // 3. Scroll Velocity Behavior
  useEffect(() => {
    return smoothVelocity.on("change", (latest) => {
      if (isTransitioningRef.current) return;
      
      const v = Math.abs(latest);
      if (v > VELOCITY_THRESHOLDS.RUN) {
        setState("WIND_BLOWN");
      } else if (v > VELOCITY_THRESHOLDS.WALK * 5) {
        setState("RUN");
      } else if (v > VELOCITY_THRESHOLDS.WALK) {
        setState("WALK");
      } else {
        setState((prev) => {
          if (["WALK", "RUN", "WIND_BLOWN"].includes(prev)) {
            // Restore context state
            if (targetElementRef.current) return "INSPECT";
            return "IDLE";
          }
          return prev;
        });
      }
    });
  }, [smoothVelocity]);

  // 4. Section Awareness
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.find((e) => e.isIntersecting);
      if (active && active.target.id) {
        const id = active.target.id;
        
        // Clear target element when leaving github section
        if (id !== "github") {
          targetElementRef.current = null;
        }

        if (SECTION_BEHAVIORS[id]) {
          setState((prev) => {
             if (["SURPRISED", "WAVE", "WIND_BLOWN"].includes(prev)) return prev;
             return SECTION_BEHAVIORS[id];
          });
        }
      }
    }, { threshold: 0.6 });

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const temporarilySetState = (tempState: CompanionState, duration: number) => {
    isTransitioningRef.current = true;
    setState(tempState);
    setTimeout(() => {
      isTransitioningRef.current = false;
      setState(targetElementRef.current ? "INSPECT" : "IDLE");
    }, duration);
  };

  // 5. Global Interaction Events
  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      if (detail?.type === "github-cell-hover" && detail.target) {
        targetElementRef.current = detail.target as HTMLElement;
        temporarilySetState("INSPECT", 1500);
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

  // Ambient GitHub behavior
  useEffect(() => {
    const ambientLoop = setInterval(() => {
      if (isTransitioningRef.current || reducedMotion) return;
      
      const githubSection = document.getElementById("github");
      if (!githubSection) return;
      
      const rect = githubSection.getBoundingClientRect();
      // Check if github is mostly in view
      if (rect.top > window.innerHeight * 0.8 || rect.bottom < window.innerHeight * 0.2) return;

      if (Math.random() < 0.15) {
        const activeCells = Array.from(document.querySelectorAll('[data-github-cell]:not([data-level="0"])'));
        if (activeCells.length > 0) {
          const randomCell = activeCells[Math.floor(Math.random() * activeCells.length)];
          window.dispatchEvent(new CustomEvent("companionInteract", { 
            detail: { type: "github-cell-hover", target: randomCell }
          }));
        }
      }
    }, 6000);

    return () => clearInterval(ambientLoop);
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 z-50 hidden md:flex items-center justify-center mix-blend-difference pointer-events-none"
      onClick={() => temporarilySetState("SURPRISED", 1000)}
    >
      <CompanionRenderer state={state} direction={direction} intensity={0} />
    </div>
  );
};
