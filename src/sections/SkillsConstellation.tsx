/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSectionVisibility } from "@/lib/visibility";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

const compactLayout = "(width < 64rem)";
const isCompact = () => typeof window !== "undefined" && window.matchMedia(compactLayout).matches;
type TouchPoint = { x: number; y: number };

const formatSvgNumber = (value: number) => Number(value.toFixed(3));

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  const lastTouchEnd = useRef(-Infinity);
  const touches = useRef(new Map<number, TouchPoint>());
  const touchStart = useRef<{ point: TouchPoint; node?: string; moved: boolean } | null>(null);
  const reduceMotion = useReducedMotion();
  const terrainRefs = useRef<(SVGPathElement | null)[]>([]);
  const cursorMaskRef = useRef<SVGCircleElement>(null);
  const interactionState = useRef({ x: 0, y: 0, nx: 0, ny: 0, master: 0, _wasZero: true });
  const { ref: visibilityRef, isVisible } = useSectionVisibility("200px");
  const cachedRect = useRef({ width: 0, height: 0, left: 0, top: 0, svgWidth: 0 });
  
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof NODES>([]);
  
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const camera = useRef({ x: -190, y: 240, z: 0.82 });
  const visibleCamera = useRef({ x: 0, y: 0, z: 1 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // HYDRATION-SAFE MEMOIZED MATHEMATICS
  const { terrainBands, nodesProj, edgesProj, domainsProj } = useMemo(() => {
    const getZ = (x: number, y: number) => {
      let z = 0;
      
      // Helper for anisotropic rotated ridges
      const ridge = (cx: number, cy: number, amp: number, sx: number, sy: number, rotDeg: number) => {
          const r = rotDeg * Math.PI / 180;
          const cos = Math.cos(r);
          const sin = Math.sin(r);
          const dx = x - cx;
          const dy = y - cy;
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          return amp * Math.exp(-( (rx*rx)/(sx*sx) + (ry*ry)/(sy*sy) ));
      };

      // 1. AI / ML - Dominant dramatic multi-ridge system
      // Primary summit (tallest, slightly sharp)
      let ai = ridge(20, -480, 420, 220, 320, 15);
      // Secondary ridge (left-leaning, lower)
      ai += ridge(-140, -400, 310, 150, 400, -25);
      // Tertiary shoulder (reaching toward Data domain)
      ai += ridge(220, -320, 240, 280, 140, -15);
      // Back ridge (creates depth on the far side)
      ai += ridge(-60, -620, 180, 350, 120, -5);
      z += ai;

      // 2. AI/ML -> Data Saddle (connecting the shoulder to the plateau)
      z += ridge(350, -280, 150, 180, 120, -30);

      // 3. Data - Long horizontal plateau / wide ridge
      // Primary long spine
      let data = ridge(620, -180, 240, 450, 140, 10);
      // Second plateau crest
      data += ridge(850, -200, 190, 250, 120, 0);
      // Front descending ridge
      data += ridge(500, -80, 160, 200, 150, 35);
      z += data;

      // 4. Systems - Broad, rugged, multi-peak
      let sys = ridge(-500, -100, 180, 300, 200, -20);
      sys += ridge(-650, -200, 140, 250, 150, 15);
      sys += ridge(-350, 50, 120, 200, 150, -45);
      sys += ridge(-450, 0, 90, 150, 80, 45); 
      z += sys;

      // 5. Finance - Compact, sharp, distinct peak + small shoulder
      let fin = ridge(-400, 300, 220, 160, 120, 35);
      fin += ridge(-350, 360, 110, 140, 80, 10);
      z += fin;

      // 6. Web / Infrastructure - Lower connective valley, rolling basin
      let web = ridge(0, 350, 90, 350, 200, -10);
      web += ridge(120, 280, 60, 250, 120, 30);
      web += ridge(-150, 320, 65, 200, 120, -20);
      z += web;

      // 7. Robotics - Angular, distinct foreground, asymmetrical shoulders
      let rob = ridge(450, 300, 240, 180, 130, -25);
      rob += ridge(520, 340, 140, 150, 90, -45);
      rob += ridge(380, 260, 110, 130, 80, 15);
      z += rob;

      // 8. Peripheral / Secondary Mountains (Subtle Depth)
      // Behind Systems (distant left)
      z += ridge(-1200, -600, 130, 400, 200, 30);
      z += ridge(-1600, -200, 90, 300, 500, -15);
      
      // Behind AI/ML (deep background)
      z += ridge(-200, -1100, 160, 500, 300, -10);
      z += ridge(400, -1000, 120, 400, 200, 20);
      
      // Beyond Data (extending the horizontal plateau)
      z += ridge(1400, -300, 110, 600, 200, 15);
      z += ridge(2000, 100, 80, 500, 250, 35);
      
      // Foreground / Finance & Robotics outskirts
      z += ridge(-1000, 800, 90, 300, 400, -25);
      z += ridge(300, 1000, 100, 600, 250, 0);
      z += ridge(1200, 800, 85, 400, 300, -40);

      // 9. Subordinate Detail Noise (10-15%)
      const noise1 = Math.sin(x / 45) * Math.cos(y / 45) * 14;
      const noise2 = Math.sin(x / 20 + y / 25) * 6;
      z += (noise1 + noise2) * (z / 180);
      
      return z;
    };

    const angle = -25 * Math.PI / 180;
    const tilt = 62 * Math.PI / 180;
    const project = (x: number, y: number, z: number) => {
       const x1 = x * Math.cos(angle) - y * Math.sin(angle);
       const y1 = x * Math.sin(angle) + y * Math.cos(angle);
       return { x: x1, y: y1 * Math.cos(tilt) - z * Math.sin(tilt) };
    };

    const BANDS = 12;
    const terrainBands = Array.from({ length: BANDS }, (_, i) => {
        const depthRatio = i / (BANDS - 1);
        const baseAlpha = 0.02 + depthRatio * 0.28;
        
        // Emulate previous hover highlight properties statically for mask layering
        const terrainWeight = 0.5 + (baseAlpha * 3.0);
        const peakInfluence = 1.0 * terrainWeight;
        const finalAlpha = Math.min(0.85, baseAlpha + peakInfluence * 0.3);
        
        const r = Math.round(245 + peakInfluence * 8);
        const g = Math.round(237 + peakInfluence * 5);
        const b = Math.round(227 - peakInfluence * 8);
        
        return { baseAlpha, peakAlpha: finalAlpha, color: `${r}, ${g}, ${b}`, d: "" };
    });

    const step = 50;
    const yMin = -1800, yMax = 1800;
    const xMin = -2600, xMax = 2600;
    
    for (let y = yMin; y <= yMax; y += step) {
      const ratio = (y - yMin) / (yMax - yMin);
      const bandIdx = Math.max(0, Math.min(BANDS - 1, Math.floor(ratio * BANDS)));
      let d = "";
      for (let x = xMin; x <= xMax; x += step) {
        const px = x + Math.sin(y / 180) * 12 + Math.cos((x+y)/300) * 8;
        const py = y + Math.sin(x / 180) * 12 + Math.cos((x-y)/300) * 8;
        const p = project(px, py, getZ(px, py));
        d += x === xMin ? `M ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} ` : `L ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} `;
      }
      terrainBands[bandIdx].d += d;
    }
    
    for (let x = xMin; x <= xMax; x += step) {
      for (let y = yMin; y < yMax; y += step) {
        const ratio = (y - yMin) / (yMax - yMin);
        const bandIdx = Math.max(0, Math.min(BANDS - 1, Math.floor(ratio * BANDS)));
        
        const px1 = x + Math.sin(y / 180) * 12 + Math.cos((x+y)/300) * 8;
        const py1 = y + Math.sin(x / 180) * 12 + Math.cos((x-y)/300) * 8;
        const p1 = project(px1, py1, getZ(px1, py1));
        
        const y2 = y + step;
        const px2 = x + Math.sin(y2 / 180) * 12 + Math.cos((x+y2)/300) * 8;
        const py2 = y2 + Math.sin(x / 180) * 12 + Math.cos((x-y2)/300) * 8;
        const p2 = project(px2, py2, getZ(px2, py2));
        
        terrainBands[bandIdx].d += `M ${formatSvgNumber(p1.x)} ${formatSvgNumber(p1.y)} L ${formatSvgNumber(p2.x)} ${formatSvgNumber(p2.y)} `;
      }
    }

    const nData = NODES.map(n => {
       const z = getZ(n.x, n.y);
       const projection = project(n.x, n.y, z);
       return {
         ...n,
         proj: { x: formatSvgNumber(projection.x), y: formatSvgNumber(projection.y) },
         originalY: n.y,
         z,
         align: 'right' as 'left' | 'right' | 'top' | 'bottom'
       };
    });



    const dData = DOMAINS.map(d => {
       const z = getZ(d.x, d.y);
       const projection = project(d.x, d.y, z);
       return { ...d, proj: { x: formatSvgNumber(projection.x), y: formatSvgNumber(projection.y) }, originalY: d.y };
    });

    const eData = CONNECTIONS.map(([a, b]) => {
       const nA = nData.find(n => n.id === a);
       const nB = nData.find(n => n.id === b);
       if (!nA || !nB) return null;
       
       const dx = nB.x - nA.x;
       const dy = nB.y - nA.y;
       const dist = Math.sqrt(dx * dx + dy * dy);
       const numSamples = Math.max(16, Math.min(40, Math.floor(dist / 25)));
       
       const pts = [];
       for (let i = 0; i <= numSamples; i++) {
           const t = i / numSamples;
           const arcOffset = Math.sin(t * Math.PI) * (dist * 0.1); 
           const nx = -dy / dist;
           const ny = dx / dist;
           
           const x = nA.x + dx * t + nx * arcOffset;
           const y = nA.y + dy * t + ny * arcOffset;
           
           const z = getZ(x, y) + 2; 
           pts.push({ ...project(x, y, z), originalY: y });
       }
       
       return { a, b, pts };
    }).filter(Boolean) as { a: string, b: string, pts: {x: number, y: number, originalY: number}[] }[];

    return { terrainBands, nodesProj: nData, edgesProj: eData, domainsProj: dData };
  }, []);

  const labelLayout = useMemo(() => {
    const sorted = [...nodesProj].sort((a, b) => {
      const aRich = !!SKILL_DETAILS[a.id] ? 1 : 0;
      const bRich = !!SKILL_DETAILS[b.id] ? 1 : 0;
      if (aRich !== bRich) return bRich - aRich;
      const aLevel = a.level === 'A' ? 3 : a.level === 'B' ? 2 : 1;
      const bLevel = b.level === 'A' ? 3 : b.level === 'B' ? 2 : 1;
      return bLevel - aLevel;
    });

    const layout: Record<string, { align: string, lx: number, ly: number, hasLeader: boolean, leaderX: number, leaderY: number }> = {};
    const placed: { x: number, y: number, w: number, h: number }[] = [];
    
    let panelLeft = Infinity;
    if (pinnedNode && viewportSize.w >= 1024) {
      const targetNode = nodesProj.find(n => n.id === pinnedNode);
      if (targetNode) {
        let targetZ = camera.current.z * 1.10;
        targetZ = Math.max(0.9, Math.min(1.8, targetZ)); 
        const svgScale = cachedRect.current.svgWidth ? cachedRect.current.svgWidth / 2400 : 1;
        const targetScreenX = viewportSize.w * 0.38;
        const targetCamX = (targetScreenX - viewportSize.w / 2) / svgScale - targetNode.proj.x * targetZ;
        
        const panelScreenX = viewportSize.w * 0.64;
        panelLeft = (panelScreenX - viewportSize.w / 2) / svgScale / targetZ - targetCamX / targetZ;
      }
    }

    // Add domains to placed boxes so skills don't cover domain labels
    domainsProj.forEach(d => {
       placed.push({ x: d.proj.x, y: d.proj.y - 10, w: 200, h: 40 });
    });

    sorted.forEach(node => {
      const isHub = node.level === 'A';
      const isCore = node.level === 'B';
      const radius = isHub ? 8 : isCore ? 4 : 2.5;
      const w = isHub ? 110 : 80;
      const h = isHub ? 22 : 18;
      
      const padX = 6;
      const padY = 5;
      
      const tryPlacement = (dx: number, dy: number) => {
        const lx = node.proj.x + dx;
        const ly = node.proj.y + dy;
        
        if (lx + w/2 > panelLeft) return false;
        
        for (const p of placed) {
          if (Math.abs(lx - p.x) < (w + p.w)/2 + padX && Math.abs(ly - p.y) < (h + p.h)/2 + padY) {
            return false;
          }
        }
        return { lx, ly };
      };
      
      const candidates = [
        { align: 'right', dx: radius + w/2 + 6, dy: 0, leader: false },
        { align: 'left', dx: -(radius + w/2 + 6), dy: 0, leader: false },
        { align: 'bottom', dx: 0, dy: radius + h/2 + 6, leader: false },
        { align: 'top', dx: 0, dy: -(radius + h/2 + 6), leader: false },
        
        { align: 'right', dx: radius + w/2 + 6, dy: radius + h/2 + 4, leader: false },
        { align: 'right', dx: radius + w/2 + 6, dy: -(radius + h/2 + 4), leader: false },
        { align: 'left', dx: -(radius + w/2 + 6), dy: radius + h/2 + 4, leader: false },
        { align: 'left', dx: -(radius + w/2 + 6), dy: -(radius + h/2 + 4), leader: false },
        
        { align: 'bottom', dx: w/3, dy: radius + h/2 + 10, leader: false },
        { align: 'bottom', dx: -w/3, dy: radius + h/2 + 10, leader: false },
        
        { align: 'right', dx: radius + w/2 + 35, dy: radius + h/2 + 20, leader: true },
        { align: 'left', dx: -(radius + w/2 + 35), dy: radius + h/2 + 20, leader: true },
        { align: 'right', dx: radius + w/2 + 35, dy: -(radius + h/2 + 20), leader: true },
        { align: 'left', dx: -(radius + w/2 + 35), dy: -(radius + h/2 + 20), leader: true },
        
        { align: 'right', dx: radius + w/2 + 60, dy: radius + h/2 + 40, leader: true },
        { align: 'left', dx: -(radius + w/2 + 60), dy: radius + h/2 + 40, leader: true },
      ];
      
      let best: { lx: number, ly: number } | null = null;
      let usedCandidate: { align: string, dx: number, dy: number, leader: boolean } = candidates[0];
      
      for (const cand of candidates) {
         const res = tryPlacement(cand.dx, cand.dy);
         if (res) {
            best = res;
            usedCandidate = cand;
            break;
         }
      }
      
      if (!best) {
         best = { lx: node.proj.x, ly: node.proj.y + radius + h/2 + 5 };
         usedCandidate = { align: 'bottom', dx: 0, dy: radius + h/2 + 5, leader: false };
      }
      
      placed.push({ x: best.lx, y: best.ly, w, h });
      
      let textX = 0; let textY = 0;
      if (usedCandidate.align === 'right') textX = usedCandidate.dx - w/2;
      else if (usedCandidate.align === 'left') textX = usedCandidate.dx + w/2;
      else textX = usedCandidate.dx;
      textY = usedCandidate.dy + h/4; 
      
      let leaderX = 0; let leaderY = 0;
      if (usedCandidate.leader) {
         if (usedCandidate.align === 'right') { leaderX = usedCandidate.dx - w/2 - 3; leaderY = usedCandidate.dy; }
         else if (usedCandidate.align === 'left') { leaderX = usedCandidate.dx + w/2 + 3; leaderY = usedCandidate.dy; }
         else if (usedCandidate.align === 'bottom') { leaderX = usedCandidate.dx; leaderY = usedCandidate.dy - h/2 - 3; }
         else { leaderX = usedCandidate.dx; leaderY = usedCandidate.dy + h/2 + 3; }
      }
      
      layout[node.id] = {
         align: usedCandidate.align,
         lx: textX,
         ly: textY,
         hasLeader: usedCandidate.leader,
         leaderX,
         leaderY
      };
    });
    
    return layout;
  }, [nodesProj, domainsProj, pinnedNode, viewportSize]);

  const getDefaultCamera = useCallback(() => {
    if (!isCompact()) return { x: -190, y: 240, z: 0.82 };

    const coordinates = nodesProj.map(({ proj }) => proj);
    const left = Math.min(...coordinates.map(({ x }) => x));
    const right = Math.max(...coordinates.map(({ x }) => x));
    const top = Math.min(...coordinates.map(({ y }) => y));
    const bottom = Math.max(...coordinates.map(({ y }) => y));
    const { width, height } = cachedRect.current;
    const scale = Math.max(width / 2400, height / 1600);
    const fit = scale ? Math.min(width / (right - left + 510), height / (bottom - top + 460)) / scale : 0.7;

    return { x: -(left + right) * fit / 2, y: -(top + bottom) * fit / 2 - 90, z: fit };
  }, [nodesProj]);

  const toSvgPoint = (x: number, y: number) => {
    const matrix = svgRef.current?.getScreenCTM();
    return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : null;
  };

  const applyCamera = useCallback((animate = false, duration = 0.5) => {
    const world = worldRef.current;
    if (!world) return;
    const { x, y, z } = camera.current;
    if (isCompact()) {
      const visible = visibleCamera.current;
      const render = () => {
        world.setAttribute("transform", "translate(" + visible.x + " " + visible.y + ") scale(" + visible.z + ")");
        const { width, height } = cachedRect.current;
        const pixelsPerUnit = Math.max(width / 2400, height / 1600) * visible.z;
        world.toggleAttribute("data-overview", pixelsPerUnit < 0.34);
      };
      gsap.killTweensOf(visible);
      if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(visible, { x, y, z, duration, ease: "power3.inOut", onUpdate: render });
      } else {
        Object.assign(visible, { x, y, z });
        render();
      }
      return;
    }
    gsap.killTweensOf(worldRef.current, "x,y,scale");
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(worldRef.current, { x, y, scale: z, duration, ease: "power3.inOut" });
    } else {
      gsap.set(worldRef.current, { x, y, scale: z });
    }
  }, []);

  const getCameraBounds = useCallback((z: number) => {
    const safeWorldWidth = 2400; 
    const safeWorldHeight = 1250;
    
    const limitX = Math.max(0, safeWorldWidth * z - 1200);
    const limitY = Math.max(0, safeWorldHeight * z - 800);
    
    return {
      minX: -limitX,
      maxX: limitX,
      minY: -limitY,
      maxY: limitY
    };
  }, []);

  const clampCamera = useCallback(() => {
    if (isCompact()) {
      const state = camera.current;
      state.z = Math.max(Math.min(getDefaultCamera().z, 0.75), Math.min(6, state.z));
      state.x = Math.max(-1600 * state.z, Math.min(1600 * state.z, state.x));
      state.y = Math.max(-950 * state.z, Math.min(950 * state.z, state.y));
      return;
    }
    const minZ = 0.85;
    const maxZ = 2.5;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    
    const bounds = getCameraBounds(camera.current.z);
    
    camera.current.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.current.x));
    camera.current.y = Math.max(bounds.minY, Math.min(bounds.maxY, camera.current.y));
  }, [getCameraBounds, getDefaultCamera]);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    
    const updateRects = () => {
      if (svgWrapperRef.current) {
        const r = svgWrapperRef.current.getBoundingClientRect();
        cachedRect.current = { width: r.width, height: r.height, left: r.left, top: r.top, svgWidth: cachedRect.current.svgWidth };
        setViewportSize({ w: r.width, h: r.height });
      }
      if (svgRef.current) {
        cachedRect.current.svgWidth = svgRef.current.getBoundingClientRect().width;
      }
    };
    
    updateRects();
    if (isCompact()) {
      camera.current = getDefaultCamera();
      applyCamera();
    }
    const observer = new ResizeObserver(() => {
      const { width, height } = cachedRect.current;
      updateRects();
      if (isCompact() && (width !== cachedRect.current.width || height !== cachedRect.current.height)) {
        camera.current = getDefaultCamera();
        applyCamera();
      }
    });
    if (svgWrapperRef.current) observer.observe(svgWrapperRef.current);
    return () => observer.disconnect();
  }, [applyCamera, getDefaultCamera]);

  useEffect(() => {
    if (isDragging) {
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    if (isCmdOrCtrl && worldRef.current && svgRef.current) {
      e.preventDefault();
      
      if (isCompact()) {
        const point = toSvgPoint(e.clientX, e.clientY);
        if (!point) return;
        const { x, y, z } = camera.current;
        camera.current.z *= Math.exp(-e.deltaY * 0.008);
        clampCamera();
        const scale = camera.current.z / z;
        camera.current.x = point.x + (x - point.x) * scale;
        camera.current.y = point.y + (y - point.y) * scale;
        clampCamera();
        applyCamera();
        return;
      }
      const pt = svgRef.current!.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(worldRef.current!.getScreenCTM()!.inverse());
      
      const xs = (svgP.x - camera.current.x) / camera.current.z;
      const ys = (svgP.y - camera.current.y) / camera.current.z;
      
      const zoomAmount = 0.02;
      const newZ = Math.max(0.85, Math.min(2.5, camera.current.z - (e.deltaY * zoomAmount)));
      camera.current.z = newZ;

      camera.current.x = svgP.x - xs * camera.current.z;
      camera.current.y = svgP.y - ys * camera.current.z;

      clampCamera();
      applyCamera(false);
    }
  }, [applyCamera, clampCamera]);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") {
      e.preventDefault();
      const point = { x: e.clientX, y: e.clientY };
      touches.current.set(e.pointerId, point);
      if (touches.current.size === 1) {
        const node = (e.target as Element).closest("[data-skill-node]")?.getAttribute("data-skill-node");
        touchStart.current = { point, node: node ?? undefined, moved: false };
      } else if (touchStart.current) {
        touchStart.current.moved = true;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      if (isCompact()) {
        gsap.killTweensOf(visibleCamera.current);
        camera.current = { ...visibleCamera.current };
      } else {
        gsap.killTweensOf(worldRef.current, "x,y,scale");
      }
      return;
    }

    if ((e.target as Element).closest('.no-pan') || (e.target as Element).closest('.interactive-ui')) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    gsap.killTweensOf(worldRef.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isVisible) return;

    if (e.pointerType === "touch") {
      const start = touchStart.current;
      const previous = touches.current.get(e.pointerId);
      if (!start || !previous) return;

      const point = { x: e.clientX, y: e.clientY };
      const other = [...touches.current].find(([id]) => id !== e.pointerId)?.[1];
      if (!start.moved && Math.hypot(point.x - start.point.x, point.y - start.point.y) < 6) return;
      if (!start.moved) {
        start.moved = true;
        setShowHint(false);
      }
      touches.current.set(e.pointerId, point);

      const midpoint = (p: TouchPoint) => other ? { x: (p.x + other.x) / 2, y: (p.y + other.y) / 2 } : p;
      const distance = (a: TouchPoint, b: TouchPoint) => Math.hypot(a.x - b.x, a.y - b.y);
      const beforeMid = midpoint(previous);
      const afterMid = midpoint(point);
      const before = toSvgPoint(beforeMid.x, beforeMid.y);
      const after = toSvgPoint(afterMid.x, afterMid.y);
      if (!before || !after) return;

      const { x, y, z } = camera.current;
      if (other) camera.current.z *= distance(point, other) / Math.max(8, distance(previous, other));
      clampCamera();
      const ratio = camera.current.z / z;
      camera.current.x = after.x - (before.x - x) * ratio;
      camera.current.y = after.y - (before.y - y) * ratio;
      clampCamera();
      applyCamera();
      return;
    }

    if (svgWrapperRef.current && !isDragging && !reduceMotion && !isCompact()) {
      const rect = cachedRect.current;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(svgWrapperRef.current, { rotateX: -ny * 4, rotateY: nx * 4, duration: 1, ease: "power2.out" });
    }

    if (!isPanning.current && svgRef.current && worldRef.current) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(worldRef.current!.getScreenCTM()!.inverse());
        
        if (cursorMaskRef.current) {
            cursorMaskRef.current.setAttribute('cx', svgP.x.toString());
            cursorMaskRef.current.setAttribute('cy', svgP.y.toString());
            gsap.killTweensOf(cursorMaskRef.current);
            cursorMaskRef.current.style.opacity = '1';
        }
    }

    if (!isPanning.current) return;
    
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };

    const ratio = 2400 / (cachedRect.current.svgWidth || 2400);
    const matrix = isCompact() ? svgRef.current?.getScreenCTM() : null;
    camera.current.x += dx * (matrix ? 1 / matrix.a : ratio);
    camera.current.y += dy * (matrix ? 1 / matrix.d : ratio);
    clampCamera();
    applyCamera(false);
  };

  const onPointerLeave = () => {
    isPanning.current = false;
    setTimeout(() => setIsDragging(false), 50);
    if (cursorMaskRef.current) {
      gsap.to(cursorMaskRef.current, { opacity: 0, duration: 0.35, ease: "power2.out" });
    }
  };

  const onPointerUp = () => {
    isPanning.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  const getConnectedNodes = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  }, []);

  const focusOnNode = useCallback((nodeId: string) => {
    const nData = nodesProj.find(n => n.id === nodeId);
    if (!nData) return;

    const svgRect = cachedRect.current;
    if (svgRect.width === 0) return;

    if (isCompact()) {
      const z = Math.max(1.35, camera.current.z);
      camera.current = { x: -nData.proj.x * z, y: -nData.proj.y * z - 190, z };
      clampCamera();
      applyCamera(true);
      return;
    }
    
    // 1. Zoom strategy (slightly stronger focus as requested: ~10% bump)
    let targetZ = camera.current.z * 1.10;
    const maxZoomIn = camera.current.z * 1.15;
    const maxZoomOut = camera.current.z * 0.95;
    targetZ = Math.max(maxZoomOut, Math.min(maxZoomIn, targetZ));
    targetZ = Math.max(0.9, Math.min(1.8, targetZ)); 
    
    // 2. Base camera (place node at 38% viewport width and 50% height to leave room for right panel)
    const rect = svgRect;
    const svgScale = rect.svgWidth ? rect.svgWidth / 2400 : 1;
    
    const targetScreenX = rect.width * 0.38;
    const targetScreenY = rect.height * 0.50;

    const targetCamX = (targetScreenX - rect.width / 2) / svgScale - nData.proj.x * targetZ;
    const targetCamY = (targetScreenY - rect.height / 2) / svgScale - nData.proj.y * targetZ;

    camera.current = { x: targetCamX, y: targetCamY, z: targetZ };
    clampCamera();
    applyCamera(true, 0.5);
  }, [nodesProj, clampCamera, applyCamera]);

  const selectNode = (id: string) => {
    setHoveredNode(null);
    setPinnedNode(pinnedNode === id ? null : id);
    if (pinnedNode !== id) {
      focusOnNode(id);
      const position = nodesProj.find((node) => node.id === id)?.proj;
      const highlight = cursorMaskRef.current;
      if (position && highlight && isCompact() && !reduceMotion) {
        highlight.setAttribute("cx", String(position.x));
        highlight.setAttribute("cy", String(position.y));
        gsap.fromTo(highlight, { opacity: 0.7 }, { opacity: 0, delay: 0.45, duration: 0.45, overwrite: true });
      }
    }
  };

  const endTouch = (e: React.PointerEvent, canceled = false) => {
    if (!touches.current.delete(e.pointerId) || touches.current.size) return;
    lastTouchEnd.current = performance.now();
    const start = touchStart.current;
    touchStart.current = null;
    if (canceled || !start || start.moved) return;
    if (start.node) {
      selectNode(start.node);
      return;
    }
    if (pinnedNode) {
      setPinnedNode(null);
      return;
    }

    const matrix = worldRef.current?.getScreenCTM();
    if (!matrix) return;
    let nearest: string | undefined;
    let distance = 14;
    for (const node of nodesProj) {
      const point = new DOMPoint(node.proj.x, node.proj.y).matrixTransform(matrix);
      const delta = Math.hypot(point.x - start.point.x, point.y - start.point.y);
      if (delta < distance) {
        nearest = node.id;
        distance = delta;
      }
    }
    if (nearest) selectNode(nearest);
  };

  const isTouchClick = (event: React.MouseEvent) =>
    ("pointerType" in event.nativeEvent && event.nativeEvent.pointerType === "touch")
    || (event.detail > 0 && performance.now() - lastTouchEnd.current < 500);

  const zoomBy = (factor: number) => {
    const previous = camera.current.z;
    camera.current.z *= factor;
    clampCamera();
    const ratio = camera.current.z / previous;
    camera.current.x *= ratio;
    camera.current.y *= ratio;
    clampCamera();
    applyCamera(true);
  };

  const focusOn = useCallback((x: number, y: number, z: number) => {
    camera.current = { x: -x * z, y: -y * z, z };
    clampCamera();
    applyCamera(true, 0.9);
  }, [applyCamera, clampCamera]);

  const selectRegion = useCallback((id: string) => {
    const domain = domainsProj.find((entry) => entry.id === id);
    if (!domain) return;
    setActiveDomain(id);
    setPinnedNode(null);
    focusOn(domain.proj.x, domain.proj.y, isCompact() ? 1.25 : 1.1);
  }, [domainsProj, focusOn, setActiveDomain, setPinnedNode]);

  useEffect(() => {
    const openRegion = (e: Event) => selectRegion((e as CustomEvent<string>).detail);
    const requested = new URLSearchParams(window.location.search).get("knowledge");
    if (requested) selectRegion(requested);
    window.addEventListener("portfolio:knowledge-region", openRegion);
    return () => window.removeEventListener("portfolio:knowledge-region", openRegion);
  }, [selectRegion]);

  const resetCamera = () => {
    setActiveDomain(null);
    setPinnedNode(null);
    setSearchQuery("");
    camera.current = getDefaultCamera();
    clampCamera();
    applyCamera(true, 1.2);
    if (svgWrapperRef.current) gsap.to(svgWrapperRef.current, { rotateX: 0, rotateY: 0, duration: 1.2, ease: "power3.inOut" });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
         setPinnedNode(null);
         setSearchQuery("");
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    const defaultCam = getDefaultCamera();
    if (isCompact() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camera.current = defaultCam;
      if (!isCompact()) clampCamera();
      applyCamera();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(worldRef.current, { opacity: 0.3, duration: 0.7, ease: "power2.out" });
      }
      return;
    }
    
    // Start slightly higher so we drop into place smoothly
    gsap.set(worldRef.current, { opacity: 0, y: defaultCam.y - 60, x: defaultCam.x });
    
    tl.to(worldRef.current, { opacity: 1, y: defaultCam.y, duration: 1.5, ease: "power2.out", onComplete: () => {
      camera.current = { ...defaultCam };
      clampCamera();
      applyCamera(false);
    }}, 0);
    
    tl.fromTo('.topo-terrain', 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.5, stagger: 0.01, ease: "power2.out" }, 0.2
    );

    tl.fromTo('.constellation-node',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.8, stagger: 0.01, ease: "back.out(1.5)" }, 1.5
    );
  }, { scope: containerRef });



  const activeNode = pinnedNode || hoveredNode;
  const firstOrder = useMemo(() => activeNode ? getConnectedNodes(activeNode) : new Set<string>(), [activeNode, getConnectedNodes]);
  const secondOrder = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const second = new Set<string>();
    firstOrder.forEach(n => {
      getConnectedNodes(n).forEach(sn => {
        if (sn !== activeNode && !firstOrder.has(sn)) second.add(sn);
      });
    });
    return second;
  }, [activeNode, firstOrder, getConnectedNodes]);

  const activeNodeData = nodesProj.find(n => n.id === activeNode);
  const getProject = (slug: string) => projects.find(p => p.slug === slug);
  const detail = activeNodeData ? SKILL_DETAILS[activeNodeData.id] : null;
  const renderQueue: { yDepth: number, element: React.ReactNode }[] = [];

  // PURE WIREFRAME TERRAIN
  terrainBands.forEach((b, i) => {
    const yDepth = -1800 + (i + 0.5) * 300;
    
    // Base Layer
    renderQueue.push({
      yDepth,
      element: (
        <path 
          key={`terrain-base-${i}`}
          d={b.d}
          fill="none"
          stroke={`rgba(245, 237, 227, ${b.baseAlpha})`}
          strokeWidth="0.8"
          className="topo-terrain"
        />
      )
    });
    
    // Highlight Layer (Masked by CSS)
    renderQueue.push({
      yDepth: yDepth + 0.1, // draw slightly above base layer
      element: (
        <path 
          key={`terrain-highlight-${i}`}
          d={b.d}
          fill="none"
          stroke={`rgba(${b.color}, ${b.peakAlpha})`}
          strokeWidth="1.2"
          mask="url(#cursor-mask)"
          className="topo-terrain topo-highlight"
        />
      )
    });
  });

  domainsProj.forEach((d, i) => {
    renderQueue.push({
      yDepth: d.originalY,
      element: (
        <text
          key={`domain-${i}`}
          x={d.proj.x}
          y={d.proj.y}
          fontSize="48"
          fill="var(--text-muted)"
          opacity="0.3"
          textAnchor="middle"
          className="font-display tracking-[0.2em] max-lg:tracking-[0.06em] max-lg:opacity-75 pointer-events-none uppercase no-pan domain-label font-bold"
        >
          {d.label.split('// ')[1]}
        </text>
      )
    });
  });

  edgesProj.forEach((e, edgeIdx) => {
    const { a, b, pts } = e;
    const isDirectActive = activeNode && (
       (activeNode === a && firstOrder.has(b)) || 
       (activeNode === b && firstOrder.has(a))
    );
    const isSecondActive = activeNode && !isDirectActive && (
       (firstOrder.has(a) && secondOrder.has(b)) || 
       (firstOrder.has(b) && secondOrder.has(a)) ||
       (firstOrder.has(a) && firstOrder.has(b))
    );
    
    let opacity = 0.04;
    let stroke = "var(--border)";
    
    if (activeNode) {
      if (isDirectActive) {
        // Handled below
      } else if (isSecondActive) {
        opacity = 0.35;
        stroke = "var(--text-muted)";
      }
    }
    
    let fullPathD = "";
    pts.forEach((p, idx) => {
        fullPathD += idx === 0 ? `M ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} ` : `L ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} `;
    });
    
    const midY = (pts[0].originalY + pts[pts.length - 1].originalY) / 2;

    if (isDirectActive) {
       renderQueue.push({
         yDepth: midY,
         element: (
           <g key={`edge-${edgeIdx}`} className="pointer-events-none transition-opacity duration-300">
              <path d={fullPathD} fill="none" stroke="#000" strokeWidth="4" />
              <path d={fullPathD} fill="none" stroke="rgba(220,38,38,0.5)" strokeWidth="2.5" />
              <path d={fullPathD} fill="none" stroke="var(--text-primary)" strokeWidth="1.2" />
           </g>
         )
       });
    } else {
       renderQueue.push({
         yDepth: midY,
         element: (
           <path 
             key={`edge-${edgeIdx}`}
             d={fullPathD}
             fill="none"
             stroke={stroke}
             strokeWidth="1.5"
             opacity={opacity}
             className="constellation-line transition-opacity duration-500 pointer-events-none"
           />
         )
       });
    }
  });

  nodesProj.forEach((node, i) => {
    const isHovered = activeNode === node.id;
    const isFirstOrder = firstOrder.has(node.id);
    const isSecondOrder = secondOrder.has(node.id);
    const inActiveDomain = activeDomain === node.domainId;
    
    let opacity = 1;
    if (activeNode) {
      opacity = isHovered ? 1 : isFirstOrder ? 0.9 : isSecondOrder ? 0.6 : 0.30;
    } else if (activeDomain) {
      opacity = inActiveDomain ? 1 : 0.25;
    }

    const isHub = node.level === 'A';
    const isCore = node.level === 'B';
    const isRich = !!SKILL_DETAILS[node.id];
    
    const radius = isHub ? 8 : isCore ? 4 : 2.5;
    const fontSize = isHub ? 18 : isCore ? 14 : 14;

    const layout = labelLayout[node.id] || { align: 'bottom', lx: 0, ly: radius + 15, hasLeader: false, leaderX: 0, leaderY: 0 };
    
    let textAnchor = 'middle';
    if (layout.align === 'right') textAnchor = 'start';
    else if (layout.align === 'left') textAnchor = 'end';

    renderQueue.push({
      yDepth: node.originalY,
      element: (
        <g
          key={`node-${i}`}
          ref={(el) => { nodeRefs.current[node.id] = el; }}
          className={`constellation-node transition-all duration-300 no-pan ${isRich ? 'is-rich' : ''} ${opacity === 0 ? 'pointer-events-none' : 'cursor-pointer'}`}
          transform={`translate(${node.proj.x}, ${node.proj.y})`}
          opacity={opacity}
          data-skill-node={node.id}
          role="button"
          tabIndex={0}
          aria-label={node.label}
          aria-pressed={pinnedNode === node.id}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            selectNode(node.id);
          }}
          onMouseEnter={() => { if (!pinnedNode && !isDragging) setHoveredNode(node.id); }}
          onMouseLeave={() => { if (!pinnedNode) setHoveredNode(null); }}
          onClick={(e) => {
            if (isDragging || isTouchClick(e)) return;
            e.stopPropagation();
            selectNode(node.id);
          }}
        >
          <circle r="20" fill="transparent" className="lg:hidden" />
          {isHub && <line x1="0" y1="0" x2="0" y2="15" stroke="var(--text-muted)" strokeWidth="1" opacity={isHovered ? 1 : 0.4} />}
          
          {layout.hasLeader && (
            <line x1="0" y1="0" x2={layout.leaderX} y2={layout.leaderY} stroke="rgba(245, 237, 227, 0.2)" strokeWidth="1" className="pointer-events-none transition-all duration-300" />
          )}
          
          {isRich && (
             <circle 
               r={radius + (isHovered ? 6 : 3)} 
               fill="none" 
               stroke="rgba(220,38,38,0.5)" 
               strokeWidth="1" 
               opacity={isHovered ? 1 : 0.3} 
               className="transition-all duration-300 pointer-events-none" 
             />
          )}

          <circle
            r={radius}
            fill={isHovered ? "var(--text-primary)" : (isRich ? "#e5e5e5" : "#0a0a0a")}
            stroke={isHovered ? "var(--accent)" : isFirstOrder ? "var(--text-primary)" : (isRich ? "var(--accent)" : "var(--text-muted)")}
            strokeWidth={isHovered ? 2 : 1.5}
            className="transition-colors duration-300"
          />
          <text
            x={layout.lx}
            y={layout.ly}
            fontSize={fontSize}
            fill={isHovered ? "var(--text-primary)" : isFirstOrder ? "var(--text-primary)" : (isRich ? "var(--text-primary)" : "var(--text-muted)")}
            textAnchor={textAnchor as "start" | "middle" | "end"}
            className={`skill-label font-mono tracking-widest max-lg:tracking-normal lg:pointer-events-none transition-all duration-300 uppercase ${isHovered ? 'skill-label-featured max-lg:[font-size:38px]' : isHub ? 'max-lg:[font-size:32px]' : 'max-lg:[font-size:26px]'} ${isRich ? 'font-bold' : 'font-medium'}`}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,1), 0 0 7px rgba(0,0,0,0.8)" }}
          >
            {node.label}
          </text>
        </g>
      )
    });
  });

  renderQueue.sort((a, b) => a.yDepth - b.yDepth);

  return (
    <section id="knowledge" aria-label="Knowledge Landscape" className="relative isolate bg-[#030303] overflow-hidden select-none h-[clamp(28rem,calc(100svh-3rem),47rem)] lg:h-[100vh] w-full flex flex-col" ref={(node) => { containerRef.current = node; visibilityRef(node); }}>
          <h2 className="absolute left-4 top-4 z-40 font-mono text-xs uppercase tracking-widest text-[#f5ede3] lg:sr-only">Knowledge Landscape</h2>
          <label className="absolute right-4 left-4 top-[5.65rem] z-40 lg:hidden">
            <span className="sr-only">Knowledge region</span>
            <select
              value={activeDomain ?? ""}
              onChange={(event) => event.target.value ? selectRegion(event.target.value) : resetCamera()}
              className="w-full min-h-10 border border-border bg-[#0a0a0a] px-3 font-mono text-sm text-text-primary"
            >
              <option value="">All regions</option>
              {DOMAINS.map(({ id, label }) => <option key={id} value={id}>{label.split("// ")[1]}</option>)}
            </select>
          </label>
          {/* SEARCH */}
          <div className="absolute top-10 left-4 right-4 lg:top-6 lg:left-6 lg:right-auto z-[45] interactive-ui">
            <div className="relative group/search">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-border transition-all">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="search"
                  aria-label="Search skills"
                  placeholder="SEARCH SKILLS"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 1) {
                      setSearchResults(NODES.filter(n => n.label.toLowerCase().includes(e.target.value.toLowerCase())));
                    } else setSearchResults([]);
                  }}
                  className="bg-transparent border-none outline-none text-base lg:text-xs font-mono text-text-primary min-w-0 w-full lg:w-32 lg:focus:w-48 transition-all placeholder:text-text-muted/40 uppercase tracking-widest"
                />
              </div>
              {searchQuery.length > 1 && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-[#0a0a0a]/95 border border-border backdrop-blur-xl flex flex-col max-h-64 overflow-y-auto z-50">
                  {searchResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        const n = nodesProj.find(node => node.id === res.id);
                        if (n) {
                           setPinnedNode(res.id);
                           focusOnNode(res.id);
                           setSearchQuery("");
                           setSearchResults([]);
                        }
                      }}
                      className="text-left px-4 min-h-11 py-3 font-mono text-xs lg:text-[10px] tracking-widest text-text-muted hover:text-text-primary hover:bg-white/5 uppercase transition-colors border-b border-border/50 last:border-b-0"
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 font-mono text-[9px] tracking-[0.2em] text-text-muted/60 uppercase absolute right-12 bottom-24 hidden lg:flex">
            <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-text-muted/40" /> HIGH ABSTRACTION</div>
            <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-accent" /></div>
            <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-text-muted/40" /> LOW LEVEL</div>
          </div>
          
          <AnimatePresence>
             {showHint && !isDragging && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-40 items-center gap-3 px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-border rounded-full pointer-events-none">
                 <MousePointer2 className="w-3.5 h-3.5 text-accent" />
                 <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Drag to explore / Scroll to read</span>
               </motion.div>
             )}
          </AnimatePresence>

          {/* DOMAIN FILTERS */}
          <div className="absolute top-6 right-6 z-40 interactive-ui hidden lg:block">
            <div className="flex flex-col items-end gap-1">
              <button 
                 onClick={() => { setActiveDomain(null); resetCamera(); }}
                 className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${!activeDomain ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
              >
                ALL REGIONS
              </button>
              {DOMAINS.map(d => (
                <button 
                  key={d.id}
                  onClick={() => selectRegion(d.id)}
                  className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {d.label.split('// ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-2 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-auto z-30 flex items-center justify-between gap-3 touch-manipulation interactive-ui">
            <div className="font-mono text-[11px] leading-tight text-text-muted lg:hidden">
              <p>Drag, pinch or tap</p>
              <p className="mt-1">Zoom for skill labels</p>
            </div>
            <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-border flex lg:flex-col gap-1 p-1 shadow-2xl">
              <button onClick={() => zoomBy(1.25)} className="grid size-11 lg:size-auto lg:p-2.5 place-items-center text-text-muted hover:text-white" aria-label="Zoom in"><Plus className="w-4 h-4" /></button>
              <button onClick={() => zoomBy(0.8)} className="grid size-11 lg:size-auto lg:p-2.5 place-items-center text-text-muted hover:text-white" aria-label="Zoom out"><Minus className="w-4 h-4" /></button>
              <button onClick={resetCamera} className="grid size-11 lg:size-auto lg:p-2.5 place-items-center text-text-muted hover:text-white" aria-label="Reset landscape view"><Maximize className="w-4 h-4" /></button>
            </div>
          </div>

          <AnimatePresence>
            {hoveredNode && !pinnedNode && detail && (
              <motion.div
                className="absolute bottom-28 left-6 z-40 bg-[#0a0a0a] border border-border p-4 shadow-2xl max-w-[280px] pointer-events-none hidden lg:block"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              >
                <div className="font-mono text-[10px] text-accent tracking-widest mb-2 uppercase">{detail.title}</div>
                <p className="text-xs text-text-muted line-clamp-3">{detail.description}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pinnedNode && activeNodeData && (
              <motion.div
                role="region"
                aria-label="Skill details"
                className="absolute left-4 right-4 bottom-16 max-h-[53%] lg:left-auto lg:top-0 lg:bottom-0 lg:right-0 lg:max-h-none z-50 interactive-ui flex flex-col lg:w-[34%] lg:min-w-[320px] lg:max-w-[440px] bg-[rgba(10,10,10,0.94)] lg:bg-[rgba(10,10,10,0.76)] backdrop-blur-[20px] border lg:border-0 lg:border-l border-border/40 overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
                initial={reduceMotion ? false : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : 20, transition: { duration: reduceMotion ? 0 : 0.2 } }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
              >
                {/* Subtle top-left highlight sheen */}
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                
                {/* Crimson detailing: tiny top left tick */}
                <div className="absolute top-0 left-0 w-[2px] h-12 bg-accent/80" />

                <div className="relative p-4 lg:p-10 overflow-y-auto overscroll-contain h-full flex flex-col">
                  <button onClick={() => setPinnedNode(null)} aria-label="Close skill details" className="absolute right-1 top-1 grid size-11 place-items-center lg:right-8 lg:top-8 lg:size-auto text-text-muted hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2 pr-10 lg:mb-5 mt-2">
                    <div className="w-1.5 h-1.5 bg-accent" />
                    <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase">{DOMAINS.find(d => d.id === activeNodeData.domainId)?.label.split('// ')[1]}</span>
                  </div>
                  
                  <h3 className="text-xl lg:text-3xl font-display font-medium text-[#f5ede3] mb-4 lg:mb-6 uppercase tracking-tight leading-none">{activeNodeData.label}</h3>
                  
                  {detail && <p className="text-[#a0a0a0] text-sm lg:text-[13px] font-light leading-relaxed mb-5 lg:mb-10">{detail.description}</p>}
                  
                  <div className="flex-1">
                    <div className={detail?.usedIn.length ? "font-mono text-[10px] text-text-muted tracking-widest mb-4 uppercase flex items-center gap-2" : "hidden"}>
                       <div className="w-1 h-1 bg-text-muted/40" /> USED IN
                    </div>
                    <div className={detail?.usedIn.length ? "flex flex-col gap-2 mb-5 lg:mb-10" : "hidden"}>
                      {detail?.usedIn.map((u, i) => {
                        if (u.href) {
                          const slug = u.href.split('/').pop();
                          const proj = getProject(slug || '');
                          return (
                            <Link key={i} href={proj ? `/work/${proj.slug}` : u.href} 
                              className="group/chip flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-border/50 hover:bg-white/[0.04] hover:border-accent/40 transition-all"
                            >
                              <span className="font-mono text-[11px] text-[#e0e0e0] uppercase tracking-widest group-hover/chip:text-accent transition-colors">{u.label}</span>
                              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover/chip:text-accent transition-colors transform group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5" />
                            </Link>
                          );
                        }
                        return (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/[0.01] border border-border/30">
                            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest">{u.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="font-mono text-[10px] text-text-muted tracking-widest mb-4 uppercase flex items-center gap-2">
                       <div className="w-1 h-1 bg-text-muted/40" /> RELATED SKILLS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(firstOrder).map(relId => {
                        const n = nodesProj.find(x => x.id === relId);
                        if (!n) return null;
                        return (
                          <button key={relId} onClick={() => { setPinnedNode(relId); focusOnNode(relId); }}
                            className="min-h-11 lg:min-h-0 px-3 py-2 font-mono text-xs lg:text-[10px] tracking-[0.1em] border border-border/50 bg-[#0a0a0a]/50 text-[#a0a0a0] hover:border-accent/50 hover:text-[#f5ede3] hover:bg-accent/10 transition-colors cursor-pointer"
                          >
                            {n.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            ref={svgWrapperRef}
            className="absolute inset-x-3 top-[8.5rem] bottom-16 max-lg:border max-lg:border-[#231d1d] touch-none lg:touch-auto lg:inset-0 transform-style-3d origin-center"
            data-knowledge-canvas
            onClick={(e) => {
              if (isCompact() && !isTouchClick(e) && !(e.target as Element).closest("[data-skill-node]")) setPinnedNode(null);
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => e.pointerType === "touch" ? endTouch(e) : onPointerUp()}
            onPointerCancel={(e) => endTouch(e, true)}
            onLostPointerCapture={(e) => endTouch(e, true)}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") onPointerLeave(); }}
          >
            <svg
              ref={svgRef}
              viewBox="-1200 -800 2400 1600"
              preserveAspectRatio="xMidYMid slice" className="absolute inset-0 max-lg:h-full max-lg:w-full"
            >
              <defs>
                <radialGradient id="cursor-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="10%" stopColor="white" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="white" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="black" stopOpacity="0" />
                </radialGradient>
                <mask id="cursor-mask" maskUnits="userSpaceOnUse" x="-4000" y="-3000" width="8000" height="6000">
                  <circle ref={cursorMaskRef} cx="-5000" cy="-5000" r="600" fill="url(#cursor-gradient)" style={{ opacity: 0 }} />
                </mask>
              </defs>
              <g ref={worldRef}>
                {/* Base Wireframe Mesh Queue */}
                {renderQueue.map((item, i) => React.cloneElement(item.element as React.ReactElement, { key: `depth-${i}` }))}
              </g>
            </svg>
          </div>
    </section>
  );
};
