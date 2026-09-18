/* eslint-disable react-hooks/purity */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { CompanionRenderer } from "./CompanionRenderer";
import { CompanionState, CompanionDirection } from "./companion.types";
import { COMPANION_PROFILES, VELOCITY_THRESHOLDS, CompanionProfile } from "./companion.config";

type RequestSource = 'safety' | 'chat' | 'hover' | 'section' | 'movement' | 'idle' | 'scroll' | 'cursor-evasion' | 'init';

interface StateRequest {
  state: CompanionState;
  priority: number;
  source: string;
  minDuration: number;
  requestedAt: number;
}

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
  
  const profileRef = useRef<CompanionProfile>(COMPANION_PROFILES.home);
  const protectedRectsRef = useRef<{rect: DOMRect, margin: number}[]>([]);
  const activeHoverTargetRef = useRef<HTMLElement | null>(null);

  const activeRequestRef = useRef<StateRequest>({
    state: "SLEEP", priority: 0, source: "init", minDuration: 0, requestedAt: typeof performance !== "undefined" ? performance.now() : 0
  });
  
  const cooldownsRef = useRef<Record<string, number>>({});

  const requestState = useCallback((
    newState: CompanionState, 
    source: string, 
    priority: number, 
    minDuration: number, 
    cooldownMs: number = 0
  ) => {
    const now = performance.now();
    
    // Check cooldown
    const cooldownKey = `${newState}-${source}`;
    if (cooldownsRef.current[cooldownKey] && cooldownsRef.current[cooldownKey] > now) {
      return;
    }
    
    const currentReq = activeRequestRef.current;
    
    // Evaluate if we can override current state
    const timeInCurrentState = now - currentReq.requestedAt;
    const currentIsLocked = timeInCurrentState < currentReq.minDuration;
    
    // Safety check - always override if priority is strict safety (100)
    if (currentIsLocked && priority <= currentReq.priority && priority < 100) {
      return; 
    }

    activeRequestRef.current = {
      state: newState,
      priority,
      source,
      minDuration,
      requestedAt: now
    };
    
    if (cooldownMs > 0) {
      cooldownsRef.current[cooldownKey] = now + cooldownMs;
    }
    
    setState(newState);
  }, []);

  // Determine Profile
  useEffect(() => {
    if (pathname === "/") profileRef.current = COMPANION_PROFILES.home;
    else if (pathname.includes("imdpune")) profileRef.current = COMPANION_PROFILES.imd;
    else if (pathname.includes("swaneeti")) profileRef.current = COMPANION_PROFILES.swaNeeti;
    else if (pathname.includes("windy")) profileRef.current = COMPANION_PROFILES.windy;
    else if (pathname.includes("spenza")) profileRef.current = COMPANION_PROFILES.spenza;
    else if (pathname.includes("robotics") || pathname.includes("thriveforce")) profileRef.current = COMPANION_PROFILES.robotics;
    else profileRef.current = COMPANION_PROFILES.home;
    
    // Request section entry wake
    requestState(profileRef.current.defaultState || "IDLE", "route-change", 75, 1000);
  }, [pathname, requestState]);

  // Handle Reduced Motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Update Protected Rectangles periodically
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateRects = () => {
      const els = Array.from(document.querySelectorAll("[data-familiar-protect], h1, h2, h3, p, a, button, img, figure, table, pre, .project-card, .project-scene, .protected-zone"));
      
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
    
    updateRects(); 
    const initTimer = setTimeout(updateRects, 1000); 
    
    return () => {
      window.removeEventListener("scroll", throttledUpdate);
      window.removeEventListener("resize", throttledUpdate);
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [pathname]);

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
       const protectedEl = el.closest("[data-familiar-protect], h1, h2, h3, p, a, button, img, figure, table, pre, .project-card, .project-scene, .protected-zone") as HTMLElement;
       
       if (window.getSelection()?.toString().length) return;
       
       if (protectedEl) {
          activeHoverTargetRef.current = protectedEl;
          const reaction = protectedEl.getAttribute("data-familiar-reaction");
          if (reaction) {
             requestState(reaction.toUpperCase() as CompanionState, "hover-meta", 80, 1000, 200);
          } else {
             const defaultReaction = el.tagName === "P" || el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3" ? "READ" : "INSPECT";
             requestState(defaultReaction, "hover-default", 80, 1000, 200);
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
  }, [requestState]);

  // Set initial position safely
  useEffect(() => {
    posRef.current = { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    setTimeout(() => {
      requestState("SLEEP", "init", 99, 1500); 
    }, 100);
  }, [requestState]);

  // External interactions (Chatbot, Section changes)
  useEffect(() => {
    const handleInteract = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "project-hover") {
         requestState("INSPECT", "project", 80, 1500, 500);
      } else if (detail?.type === "section-enter") {
         const stateType = detail.data === "contact" ? "WAVE" : "READ";
         // Cooldown of 10s for wave on section enter to avoid spam
         requestState(stateType as CompanionState, "section", 70, 1500, stateType === "WAVE" ? 10000 : 0);
      } else if (detail?.type === "github-cell-hover") {
         requestState("INSPECT", "github", 85, 1200, 200);
      } else if (detail?.type === "chat-hover" || detail?.type === "chat-open") {
         requestState("INSPECT", "chat-open", 90, 1500, 1000);
      } else if (detail?.type === "chat-typing" || detail?.type === "chat-streaming") {
         requestState("READ", "chat-typing", 90, 1200, 500);
      } else if (detail?.type === "chat-send") {
         requestState("SURPRISED", "chat-send", 95, 800, 3000);
      } else if (detail?.type === "chat-close") {
         requestState("IDLE", "chat-close", 99, 500, 0);
      } else if (detail?.type === "weather-wind") {
         requestState("WIND_BLOWN", "wind-event", 85, 1200, 8000);
      }
    };
    window.addEventListener("companionInteract", handleInteract);
    
    // Toggle debug mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key === "D") {
         setDebugMode(v => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("companionInteract", handleInteract);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestState]);

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
      
      // Determine base target
      if (isTouch || profile.mode === "DOCKED") {
         targetX = window.innerWidth - 60;
         targetY = window.innerHeight - 60;
      } else if (activeHoverTargetRef.current && !isTouch) {
         const rect = activeHoverTargetRef.current.getBoundingClientRect();
         const margin = 40;
         
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
         
      } else if (cursorRef.current.active) {
         const offsetX = cursorRef.current.vx > 0 ? -120 : 120;
         const offsetY = 90;
         
         let cx = cursorRef.current.x + offsetX;
         let cy = cursorRef.current.y + offsetY;
         
         cx = Math.max(40, Math.min(window.innerWidth - 40, cx));
         cy = Math.max(40, Math.min(window.innerHeight - 40, cy));
         
         if (isColliding(cx, cy)) {
            const candidates = [
              { x: cursorRef.current.x - 120, y: cursorRef.current.y + 90 },
              { x: cursorRef.current.x + 120, y: cursorRef.current.y + 90 },
              { x: cursorRef.current.x - 120, y: cursorRef.current.y - 90 },
              { x: cursorRef.current.x + 120, y: cursorRef.current.y - 90 },
              { x: cursorRef.current.x, y: cursorRef.current.y + 120 },
              { x: cursorRef.current.x, y: cursorRef.current.y - 120 },
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
         
         // Too Close Evasion
         const distToCursor = Math.hypot(cursorRef.current.x - posRef.current.x, cursorRef.current.y - posRef.current.y);
         if (distToCursor < 70) {
             targetX = posRef.current.x + (posRef.current.x > cursorRef.current.x ? 90 : -90);
             targetY = posRef.current.y + (posRef.current.y > cursorRef.current.y ? 90 : -90);
             requestState("SURPRISED", "cursor-evasion", 85, 600, 6000); 
         }
      }

      // Smooth interpolation
      if (reducedMotion) {
        posRef.current.x = targetX;
        posRef.current.y = targetY;
      } else {
        // slightly slower if reading/inspecting to feel deliberate
        const speedFactor = activeHoverTargetRef.current ? 2.5 : 3.5;
        posRef.current.x += (targetX - posRef.current.x) * (1 - Math.exp(-speedFactor * dt));
        posRef.current.y += (targetY - posRef.current.y) * (1 - Math.exp(-speedFactor * dt));
      }

      containerRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;

      // Direction Hysteresis
      if (Math.abs(targetX - posRef.current.x) > 20) {
        if (targetX > posRef.current.x && direction !== "right") setDirection("right");
        if (targetX < posRef.current.x && direction !== "left") setDirection("left");
      }
      
      // Calculate continuous speed
      const movementSpeed = Math.sqrt(Math.pow((targetX - posRef.current.x)/dt, 2) + Math.pow((targetY - posRef.current.y)/dt, 2));
      const timeSinceLastCursor = time - lastCursorTime.current;
      
      // Fallback state logic (priority 10-60)
      if (timeSinceLastCursor > 15000 && !activeHoverTargetRef.current && !isTouch) {
         requestState("SLEEP", "inactivity", 50, 2000);
      } else if (!activeHoverTargetRef.current && !isTouch) {
         if (movementSpeed > VELOCITY_THRESHOLDS.RUN * 10) {
            requestState("RUN", "movement", 60, 350);
         } else if (movementSpeed > VELOCITY_THRESHOLDS.WALK * 10) {
            requestState("WALK", "movement", 60, 500);
         } else {
            // Settle to default state
            requestState(profile.defaultState || "IDLE", "idle", 10, 800);
         }
      }
    };
    
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, direction, requestState]);

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed top-0 left-0 flex items-center justify-center mix-blend-difference pointer-events-none"
        style={{ willChange: "transform", zIndex: "var(--z-familiar)", width: "32px", height: "32px", marginLeft: "-16px", marginTop: "-16px" }}
      >
        <CompanionRenderer state={state} direction={direction} intensity={0} />
      </div>
      
      {debugMode && (
        <div className="fixed bottom-4 left-4 z-[99999] bg-black/80 text-[#00ffcc] font-mono text-xs p-4 border border-[#00ffcc]/30 shadow-2xl backdrop-blur-md pointer-events-none">
          <h4 className="font-bold mb-2 border-b border-[#00ffcc]/30 pb-1">FAMILIAR DEBUG</h4>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr><td className="pr-4 py-1 text-white/50">STATE</td><td>{state}</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">REQUESTED</td><td>{activeRequestRef.current.state}</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">SOURCE</td><td>{activeRequestRef.current.source}</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">PRIORITY</td><td>{activeRequestRef.current.priority}</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">DIR</td><td>{direction}</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">PROFILE</td><td>{profileRef.current.mode} ({profileRef.current.defaultState})</td></tr>
              <tr><td className="pr-4 py-1 text-white/50">COLLIDERS</td><td>{protectedRectsRef.current.length}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

