"use client";

import { useEffect, useState, useRef } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import { IllustratedCompanionRenderer as CompanionRenderer } from "./IllustratedCompanionRenderer";

type CompanionState = "IDLE" | "WALK" | "RUN" | "SLEEP" | "SURPRISED" | "WIND_BLOWN" | "INSPECT" | "WAVE" | "SITTING" | "READ";
type CompanionDirection = "left" | "right";

const VELOCITY_THRESHOLDS = {
  WALK: 50,
  RUN: 300,
};

const SECTION_BEHAVIORS: Record<string, CompanionState> = {
  hero: "IDLE",
  work: "WALK",
  alphacouncil: "INSPECT",
  swaneeti: "READ",
  windy: "WIND_BLOWN",
  spenza: "SITTING",
  github: "IDLE",
  engineering: "READ",
  thriveforce: "INSPECT",
  contact: "WAVE",
};

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
      x: window.innerWidth / 2,
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
        const isCell = targetElementRef.current.hasAttribute("data-github-cell");
        
        if (isCell) {
          // Prefer below cell
          targetX = rect.left + rect.width / 2 - 40; 
          targetY = rect.bottom + 10;
          if (targetY > window.innerHeight - 80) {
            targetY = rect.top - 80 - 10;
          }
        } else {
          targetX = rect.left + rect.width / 2 - 40;
          targetY = rect.top + rect.height / 2 - 40;
        }

        // Clamp to viewport
        if (targetX < 20) targetX = 20;
        if (targetX > window.innerWidth - 80) targetX = window.innerWidth - 80;
        if (targetY < 20) targetY = 20;
        if (targetY > window.innerHeight - 80) targetY = window.innerHeight - 80;
      }

      if (reducedMotion) {
        currentPos.current.x = targetX;
        currentPos.current.y = targetY;
      } else {
        // Evaluate horizontal arc for Y
        const dx = targetX - currentPos.current.x;
        const dy = targetY - currentPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const speed = dist > 400 ? 3.0 : 5.0; // slightly slower for long journeys
        
        // Linear lerp for basic traversal
        const lerpX = currentPos.current.x + (targetX - currentPos.current.x) * (1 - Math.exp(-speed * dt));
        const lerpY = currentPos.current.y + (targetY - currentPos.current.y) * (1 - Math.exp(-speed * dt));

        // Horizontal arc physics: add a subtle bezier dip based on distance
        const normalizedProg = Math.abs(currentPos.current.x - targetX) / (Math.abs(dx) + 1);
        const arcY = dist > 200 ? Math.sin(normalizedProg * Math.PI) * (dist * 0.1) : 0;
        
        currentPos.current.x = lerpX;
        currentPos.current.y = lerpY + (arcY * (1 - Math.exp(-speed * dt)));
      }

      containerRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;

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
            // Restore contextual state
            const activeSection = document.querySelector("section.is-active")?.id;
            if (activeSection && SECTION_BEHAVIORS[activeSection]) {
              return SECTION_BEHAVIORS[activeSection];
            }
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
        
        // Mark section active for velocity restoration logic
        document.querySelectorAll("section[id]").forEach(s => s.classList.remove("is-active"));
        active.target.classList.add("is-active");

        // Find semantic anchor in this section
        const sectionAnchor = active.target.querySelector("[data-familiar-anchor]") as HTMLElement;
        if (sectionAnchor) {
          targetElementRef.current = sectionAnchor;
        } else if (id !== "github") {
          targetElementRef.current = null; // Default to lower right
        }

        if (SECTION_BEHAVIORS[id]) {
          setState((prev) => {
             if (["SURPRISED", "WAVE", "WIND_BLOWN"].includes(prev)) return prev;
             return SECTION_BEHAVIORS[id];
          });
        }
      }
    }, { threshold: 0.3 });

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const temporarilySetState = (tempState: CompanionState, duration: number) => {
    isTransitioningRef.current = true;
    setState(tempState);
    setTimeout(() => {
      isTransitioningRef.current = false;
      
      const activeSection = document.querySelector("section.is-active")?.id;
      if (activeSection && SECTION_BEHAVIORS[activeSection]) {
        setState(SECTION_BEHAVIORS[activeSection]);
      } else {
        setState(targetElementRef.current ? "INSPECT" : "IDLE");
      }
    }, duration);
  };

  // 5. Global Interaction Events
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      if (detail?.type === "github-cell-hover" && detail.target) {
        targetElementRef.current = detail.target as HTMLElement;
        temporarilySetState("INSPECT", 1500);

        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
          const endAnchor = document.querySelector("[data-anchor=\"github-calendar-end\"]") as HTMLElement;
          if (endAnchor && document.getElementById("github")?.contains(targetElementRef.current)) {
             targetElementRef.current = endAnchor;
             setState("IDLE");
          }
        }, 4000);
      } else if (detail?.type === "anchor-hover" && detail.target) {
        targetElementRef.current = detail.target as HTMLElement;
        temporarilySetState("INSPECT", 2000);
      }
    };

    window.addEventListener("companionInteract", handleInteract);
    return () => window.removeEventListener("companionInteract", handleInteract);
  }, []);

  // Ambient GitHub behavior
  useEffect(() => {
    const ambientLoop = setInterval(() => {
      if (isTransitioningRef.current || reducedMotion) return;
      
      const githubSection = document.getElementById("github");
      if (!githubSection) return;
      
      const rect = githubSection.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.8 || rect.bottom < window.innerHeight * 0.2) return;

      if (Math.random() < 0.15) {
        const activeCells = Array.from(document.querySelectorAll("[data-github-cell]:not([data-level=\"0\"])"));
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
      className="fixed top-0 left-0 z-50 hidden md:flex items-center justify-center pointer-events-none mix-blend-difference"
      onClick={() => temporarilySetState("SURPRISED", 1000)}
    >
      <CompanionRenderer state={state} direction={direction} intensity={0} />
    </div>
  );
};

