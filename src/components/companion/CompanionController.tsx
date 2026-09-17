"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { CompanionRenderer } from "./CompanionRenderer";
import { CompanionState, CompanionDirection } from "./companion.types";
import { COMPANION_PROFILES, VELOCITY_THRESHOLDS, CompanionProfile } from "./companion.config";

export const CompanionController = () => {
  const [state, setState] = useState<CompanionState>("SLEEP");
  const [direction, setDirection] = useState<CompanionDirection>("right");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const posRef = useRef({ x: -200, y: -200 }); 
  const cursorRef = useRef({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 0, y: typeof window !== "undefined" ? window.innerHeight / 2 : 0, vx: 0, vy: 0, active: false });
  const lastCursorTime = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const isTransitioningRef = useRef(false);
  const profileRef = useRef<CompanionProfile>(COMPANION_PROFILES.home);
  
  const protectedRectsRef = useRef<{rect: DOMRect, margin: number}[]>([]);
  const activeHoverTargetRef = useRef<HTMLElement | null>(null);
  
  // Determine Profile
  useEffect(() => {
    if (pathname === "/") profileRef.current = COMPANION_PROFILES.home;
    else if (pathname.includes("imdpune")) profileRef.current = COMPANION_PROFILES.imd;
    else if (pathname.includes("swaneeti")) profileRef.current = COMPANION_PROFILES.swaNeeti;
    else if (pathname.includes("windy")) profileRef.current = COMPANION_PROFILES.windy;
    else if (pathname.includes("spenza")) profileRef.current = COMPANION_PROFILES.spenza;
    else if (pathname.includes("robotics") || pathname.includes("thriveforce")) profileRef.current = COMPANION_PROFILES.robotics;
    else profileRef.current = COMPANION_PROFILES.home;
  }, [pathname]);

  // Handle Reduced Motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Update Protected Rectangles periodically / on scroll
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateRects = () => {
      const els = Array.from(document.querySelectorAll("[data-familiar-protect], h1, h2, h3, p, a, button, img, figure, table, pre, .project-card, .protected-zone"));
      
      const newRects: {rect: DOMRect, margin: number}[] = [];
      els.forEach((el) => {
        if (el.tagName === "A" && el.parentElement?.tagName === "P") return;
        
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        
        const margin = parseInt(el.getAttribute("data-familiar-margin") || "24", 10);
        newRects.push({ rect, margin });
      });
      protectedRectsRef.current = newRects;
    };

    const throttledUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateRects, 200);
    };

    window.addEventListener("scroll", throttledUpdate, { passive: true });
    window.addEventListener("resize", throttledUpdate, { passive: true });
    
    updateRects(); // initial
    const initTimer = setTimeout(updateRects, 1000); // delayed pass
    
    return () => {
      window.removeEventListener("scroll", throttledUpdate);
      window.removeEventListener("resize", throttledUpdate);
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [pathname]);

  const temporarilySetState = useCallback((tempState: CompanionState, duration: number) => {
    isTransitioningRef.current = true;
    setState(tempState);
    setTimeout(() => {
      isTransitioningRef.current = false;
      setState(profileRef.current.defaultState || "IDLE");
    }, duration);
  }, []);

  // Track Cursor passively
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastCursorTime.current);
      cursorRef.current.vx = (e.clientX - cursorRef.current.x) / dt;
      cursorRef.current.vy = (e.clientY - cursorRef.current.y) / dt;
      
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
      lastCursorTime.current = now;
    };
    
    const handleLeave = () => { cursorRef.current.active = false; };
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Track Hover for Contextual Reactions
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
       const el = e.target as HTMLElement;
       const protectedEl = el.closest("[data-familiar-protect], h1, h2, h3, p, a, button, img, figure, table, pre, .project-card, .protected-zone") as HTMLElement;
       
       if (window.getSelection()?.toString().length) return;
       
       if (protectedEl) {
          activeHoverTargetRef.current = protectedEl;
          
          const reaction = protectedEl.getAttribute("data-familiar-reaction");
          if (reaction && !isTransitioningRef.current) {
             temporarilySetState((reaction.toUpperCase() as CompanionState) || "INSPECT", 2000);
          } else if (!isTransitioningRef.current && Math.random() > 0.5) {
             const defaultReaction = el.tagName === "P" || el.tagName === "H1" || el.tagName === "H2" ? "READ" : "INSPECT";
             temporarilySetState(defaultReaction, 1500);
          }
       }
    };
    
    const handleMouseOut = () => {
       activeHoverTargetRef.current = null;
    };
    
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });
    
    return () => {
       window.removeEventListener("mouseover", handleMouseOver);
       window.removeEventListener("mouseout", handleMouseOut);
    }
  }, [temporarilySetState]);

  // Set initial position safely
  useEffect(() => {
    posRef.current = { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    setTimeout(() => {
      setState(profileRef.current.defaultState || "IDLE");
    }, 2000);
  }, []);

  // RAF LOOP for motion and state
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    
    const isColliding = (x: number, y: number) => {
      const size = 30; // approx half size of familiar
      for (const p of protectedRectsRef.current) {
         const m = p.margin;
         if (x + size > p.rect.left - m && 
             x - size < p.rect.right + m && 
             y + size > p.rect.top - m && 
             y - size < p.rect.bottom + m) {
             return true;
         }
      }
      return false;
    };
    
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!containerRef.current) return;
      
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const profile = profileRef.current;
      
      let targetX = posRef.current.x;
      let targetY = posRef.current.y;
      
      if (isTouch || profile.mode === "DOCKED") {
         targetX = window.innerWidth - 60;
         targetY = window.innerHeight - 60;
      } else if (activeHoverTargetRef.current && !isTouch) {
         // Move to safe edge of hovered element
         const rect = activeHoverTargetRef.current.getBoundingClientRect();
         const margin = 40;
         
         // determine closest edge
         const distLeft = Math.abs(cursorRef.current.x - rect.left);
         const distRight = Math.abs(cursorRef.current.x - rect.right);
         
         if (distLeft < distRight) {
             targetX = rect.left - margin;
         } else {
             targetX = rect.right + margin;
         }
         targetY = rect.top + rect.height / 2;
         
         targetX = Math.max(40, Math.min(window.innerWidth - 40, targetX));
         targetY = Math.max(40, Math.min(window.innerHeight - 40, targetY));
         
      } else if (cursorRef.current.active && !isTransitioningRef.current) {
         // Free Follow or Constrained Follow
         const offsetX = cursorRef.current.vx > 0 ? -90 : 90;
         const offsetY = 70;
         
         let cx = cursorRef.current.x + offsetX;
         let cy = cursorRef.current.y + offsetY;
         
         // Clamp to viewport
         cx = Math.max(40, Math.min(window.innerWidth - 40, cx));
         cy = Math.max(40, Math.min(window.innerHeight - 40, cy));
         
         // Collision Avoidance - Simple 4-way check
         if (isColliding(cx, cy)) {
            const candidates = [
              { x: cursorRef.current.x - 90, y: cursorRef.current.y + 70 },
              { x: cursorRef.current.x + 90, y: cursorRef.current.y + 70 },
              { x: cursorRef.current.x - 90, y: cursorRef.current.y - 70 },
              { x: cursorRef.current.x + 90, y: cursorRef.current.y - 70 },
            ];
            
            let foundSafe = false;
            for (const c of candidates) {
               c.x = Math.max(40, Math.min(window.innerWidth - 40, c.x));
               c.y = Math.max(40, Math.min(window.innerHeight - 40, c.y));
               if (!isColliding(c.x, c.y)) {
                  cx = c.x;
                  cy = c.y;
                  foundSafe = true;
                  break;
               }
            }
            
            if (!foundSafe) {
               cx = window.innerWidth - 60;
               cy = window.innerHeight - 60;
            }
         }
         
         targetX = cx;
         targetY = cy;
      }

      // Smooth interpolation
      if (reducedMotion) {
        posRef.current.x = targetX;
        posRef.current.y = targetY;
      } else {
        const speed = 4.0;
        posRef.current.x += (targetX - posRef.current.x) * (1 - Math.exp(-speed * dt));
        posRef.current.y += (targetY - posRef.current.y) * (1 - Math.exp(-speed * dt));
      }

      containerRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;

      if (!isTransitioningRef.current && Math.abs(targetX - posRef.current.x) > 5) {
        if (targetX > posRef.current.x && direction !== "right") setDirection("right");
        if (targetX < posRef.current.x && direction !== "left") setDirection("left");
      }
      
      if (!isTransitioningRef.current && !activeHoverTargetRef.current) {
         const speed = Math.sqrt(Math.pow((targetX - posRef.current.x)/dt, 2) + Math.pow((targetY - posRef.current.y)/dt, 2));
         if (speed > VELOCITY_THRESHOLDS.RUN * 10) {
            if (state !== "RUN") setState("RUN");
         } else if (speed > VELOCITY_THRESHOLDS.WALK * 10) {
            if (state !== "WALK") setState("WALK");
         } else {
            if (state === "WALK" || state === "RUN") setState(profile.defaultState || "IDLE");
         }
      }
    };
    
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, direction, state]);

  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "project-hover") {
         temporarilySetState("INSPECT", 2000);
      } else if (detail?.type === "section-enter") {
         const stateType = detail.data === "contact" ? "WAVE" : "READ";
         temporarilySetState(stateType as CompanionState, 2000);
      }
    };
    window.addEventListener("companionInteract", handleInteract);
    return () => window.removeEventListener("companionInteract", handleInteract);
  }, [temporarilySetState]);

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed top-0 left-0 z-50 flex items-center justify-center mix-blend-difference pointer-events-none"
        style={{ willChange: "transform" }}
      >
        <CompanionRenderer state={state} direction={direction} intensity={0} />
      </div>
      
      {debugMode && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-accent font-mono text-xs p-4 border border-accent/20">
          <p>State: {state}</p>
          <p>Direction: {direction}</p>
          <p>Profile: {profileRef.current.mode}</p>
          <p>Protected: {protectedRectsRef.current.length} rects</p>
        </div>
      )}
    </>
  );
};

