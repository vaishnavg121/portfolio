"use client";

import { useEffect, useState, useRef } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import { IllustratedCompanionRenderer as CompanionRenderer } from "./IllustratedCompanionRenderer";
import type { CompanionState, CompanionDirection } from "./companion.types";

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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const currentPos = useRef({ x: 0, y: 0 });
  const optimalOffsetRef = useRef({ x: 0, y: 0 }); // Pre-calculated safe offset

  // Priority Lock System: 0 = Direct, 1 = Section Context, 2 = Ambient, -1 = Safety Override
  const priorityLockRef = useRef<{ level: number, expires: number }>({ level: 2, expires: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    currentPos.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight - 100
    };
  }, []);

  // Helper to calculate safe offset ONCE when target changes
  const calculateSafeOffset = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const isCell = target.hasAttribute("data-github-cell");
    const isPipeline = target.classList.contains("group/node");
    
    // 1. Initial preferred offset
    let candidates = [
      { x: 40, y: 40 }, // default below right
      { x: -80, y: 40 }, // below left
      { x: 40, y: -80 }, // above right
      { x: -80, y: -80 }, // above left
      { x: 100, y: 0 }, // far right
      { x: -140, y: 0 } // far left
    ];

    if (isCell) {
      candidates = [
        { x: 20, y: 20 },
        { x: -40, y: 20 },
        { x: 20, y: -40 }
      ];
    } else if (isPipeline) {
      candidates = [
        { x: -120, y: 0 }, // left of pipeline
        { x: 120, y: 0 } // right of pipeline
      ];
    } else if (target.closest("#notes")) {
      candidates = [
        { x: 150, y: 0 }, // outer margin
        { x: -150, y: 0 }
      ];
    }

    // 2. Check collisions
    const avoids = Array.from(document.querySelectorAll("[data-familiar-avoid]"));
    const mascotW = 80, mascotH = 80;

    for (const offset of candidates) {
      const cx = rect.left + rect.width / 2 + offset.x;
      const cy = rect.top + rect.height / 2 + offset.y;
      
      let hits = false;
      for (const avoid of avoids) {
        const a = avoid.getBoundingClientRect();
        if (
          cx + mascotW/2 > a.left && cx - mascotW/2 < a.right &&
          cy + mascotH/2 > a.top && cy - mascotH/2 < a.bottom
        ) {
          hits = true;
          break;
        }
      }

      if (!hits) {
        return offset; // Found safe!
      }
    }

    return candidates[0]; // Fallback to preferred if everything collides
  };

  // 2. Smooth Movement Loop (Bypasses React State)
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    let lastTarget: HTMLElement | null = null;
    
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!containerRef.current) return;
      
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Recalculate offset ONLY if target changes
      if (targetElementRef.current !== lastTarget && targetElementRef.current) {
         optimalOffsetRef.current = calculateSafeOffset(targetElementRef.current);
         lastTarget = targetElementRef.current;
      }

      let targetX = window.innerWidth - 120;
      let targetY = window.innerHeight - 120;

      if (targetElementRef.current) {
        const rect = targetElementRef.current.getBoundingClientRect();
        targetX = rect.left + rect.width / 2 + optimalOffsetRef.current.x;
        targetY = rect.top + rect.height / 2 + optimalOffsetRef.current.y;

        // Clamp to viewport
        if (targetX < 20) targetX = 20;
        if (targetX > window.innerWidth - 80) targetX = window.innerWidth - 80;
        if (targetY < 20) targetY = 20;
        if (targetY > window.innerHeight - 80) targetY = window.innerHeight - 80;
      }

      const dx = targetX - currentPos.current.x;
      const dy = targetY - currentPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (reducedMotion) {
        currentPos.current.x = targetX;
        currentPos.current.y = targetY;
      } else {
        // Slow down dynamically as it arrives
        const speed = dist < 100 ? 8.0 : (dist > 400 ? 3.0 : 5.0);
        
        // Linear lerp for basic traversal
        const lerpX = currentPos.current.x + dx * (1 - Math.exp(-speed * dt));
        const lerpY = currentPos.current.y + dy * (1 - Math.exp(-speed * dt));

        // Horizontal arc physics: add a subtle bezier dip based on distance
        let arcY = 0;
        if (priorityLockRef.current.level > 0 && dist > 150) {
           const normalizedProg = Math.abs(currentPos.current.x - targetX) / (Math.abs(dx) + 1);
           arcY = Math.sin(normalizedProg * Math.PI) * (dist * 0.15);
        }
        
        currentPos.current.x = lerpX;
        currentPos.current.y = lerpY + (arcY * (1 - Math.exp(-speed * dt)));
      }

      containerRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;

      // Direction derived from movement, avoiding rapid flipping
      if (dist > 5) {
        if (dx > 0 && direction !== "right") setDirection("right");
        if (dx < 0 && direction !== "left") setDirection("left");
      }
    };
    
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, direction]);

  // 3. Scroll Velocity Behavior (Travel Priority P2)
  useEffect(() => {
    return smoothVelocity.on("change", (latest) => {
      if (priorityLockRef.current.level === 0 && performance.now() < priorityLockRef.current.expires) return;
      
      const v = Math.abs(latest);
      if (v > VELOCITY_THRESHOLDS.RUN) {
        setState("RUN");
      } else if (v > VELOCITY_THRESHOLDS.WALK) {
        setState("WALK");
      } else {
        setState((prev) => {
          if (["WALK", "RUN"].includes(prev)) {
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

  // 4. Section Awareness (P1 Context)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.find((e) => e.isIntersecting);
      if (active && active.target.id) {
        const id = active.target.id;
        
        document.querySelectorAll("section[id]").forEach(s => s.classList.remove("is-active"));
        active.target.classList.add("is-active");

        if (priorityLockRef.current.level > 0 || performance.now() >= priorityLockRef.current.expires) {
          priorityLockRef.current = { level: 1, expires: performance.now() + 5000 };

          const sectionAnchor = active.target.querySelector("[data-familiar-anchor]") as HTMLElement;
          if (sectionAnchor) {
            targetElementRef.current = sectionAnchor;
          } else if (id !== "github") {
            targetElementRef.current = null;
          }

          if (SECTION_BEHAVIORS[id]) {
            setState((prev) => {
               if (["SURPRISED", "WAVE"].includes(prev)) return prev;
               return SECTION_BEHAVIORS[id];
            });
          }
        }
      }
    }, { threshold: 0.3 });

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const executePriorityInteraction = (target: HTMLElement, tempState: CompanionState, duration: number) => {
    priorityLockRef.current = { level: 0, expires: performance.now() + duration };
    targetElementRef.current = target;
    setState(tempState);

    setTimeout(() => {
      if (priorityLockRef.current.level === 0 && performance.now() >= priorityLockRef.current.expires) {
        priorityLockRef.current.level = 1;
        const activeSection = document.querySelector("section.is-active")?.id;
        if (activeSection && SECTION_BEHAVIORS[activeSection]) {
          setState(SECTION_BEHAVIORS[activeSection]);
        } else {
          setState("IDLE");
        }
      }
    }, duration + 100);
  };

  // 5. Global Interaction Events (P0)
  const ambientTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      if (detail?.type === "github-cell-hover" && detail.target) {
        executePriorityInteraction(detail.target as HTMLElement, "INSPECT", 2000);
        
        if (ambientTimeoutRef.current) clearTimeout(ambientTimeoutRef.current);
        ambientTimeoutRef.current = setTimeout(() => {
          if (priorityLockRef.current.level > 0) {
            const endAnchor = document.querySelector("[data-anchor=\"github-calendar-end\"]") as HTMLElement;
            if (endAnchor && document.getElementById("github")?.contains(targetElementRef.current)) {
               targetElementRef.current = endAnchor;
               setState("IDLE");
            }
          }
        }, 4000);
      } else if (detail?.type === "pipeline-hover" && detail.target) {
        executePriorityInteraction(detail.target as HTMLElement, "INSPECT", 2000);
      } else if (detail?.type === "anchor-hover" && detail.target) {
        executePriorityInteraction(detail.target as HTMLElement, "INSPECT", 1500);
      }
    };

    window.addEventListener("companionInteract", handleInteract);
    return () => window.removeEventListener("companionInteract", handleInteract);
  }, []);

  // Ambient GitHub behavior (P2)
  useEffect(() => {
    const ambientLoop = setInterval(() => {
      // Check if user is actively reading (stationary for a while)
      const isReading = document.querySelector("[data-reading-mode='true']");
      if (reducedMotion || isReading || (priorityLockRef.current.level === 0 && performance.now() < priorityLockRef.current.expires)) return;
      
      const githubSection = document.getElementById("github");
      if (!githubSection || !githubSection.classList.contains("is-active")) return;

      if (Math.random() < 0.2) {
        const activeCells = Array.from(document.querySelectorAll("[data-github-cell]:not([data-level=\"0\"])"));
        if (activeCells.length > 0) {
          const randomCell = activeCells[Math.floor(Math.random() * activeCells.length)];
          priorityLockRef.current = { level: 2, expires: performance.now() + 1500 };
          targetElementRef.current = randomCell as HTMLElement;
          setState("INSPECT");
        }
      }
    }, 8000);

    return () => clearInterval(ambientLoop);
  }, [reducedMotion]);

  // Contextual scaling
  const getScale = () => {
    if (state === "INSPECT") return "scale-[0.9]";
    if (state === "READ") return "scale-[0.85]";
    return "scale-100";
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed top-0 left-0 z-50 hidden md:flex items-center justify-center pointer-events-none mix-blend-difference transition-transform duration-700 ${getScale()}`}
      onClick={() => {
        if (containerRef.current) {
          executePriorityInteraction(containerRef.current, "SURPRISED", 1000);
        }
      }}
    >
      <CompanionRenderer state={state} direction={direction} intensity={0} />
    </div>
  );
};

