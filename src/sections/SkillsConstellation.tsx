"use client";
import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSectionVisibility } from "@/lib/visibility";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

const formatSvgNumber = (value: number) => Number(value.toFixed(3));

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  const terrainRefs = useRef<(SVGPathElement | null)[]>([]);
  const interactionState = useRef({ x: -5000, y: -5000, nx: 0, ny: 0, master: 0, _wasZero: false });
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
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, align: 'right' });
  const [popupOffset, setPopupOffset] = useState({ dx: 150, dy: -150, align: 'right' });
  
  const camera = useRef({ x: 0, y: 150, z: 0.85 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // HYDRATION-SAFE MEMOIZED MATHEMATICS
  const { terrain, parsedTerrain, nodesProj, edgesProj, domainsProj } = useMemo(() => {
    const getZ = (x: number, y: number) => {
      let z = 0;
      let ai = 350 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - (-450), 2)) / 50000);
      ai += 180 * Math.exp(-(Math.pow(x - (-120), 2) + Math.pow(y - (-550), 2)) / 30000);
      ai += 200 * Math.exp(-(Math.pow(x - 150, 2) + Math.pow(y - (-400), 2)) / 40000);
      z += ai;

      let sys = 180 * Math.exp(-(Math.pow(x - (-500), 2) + Math.pow(y - (-100), 2)) / 80000);
      sys += 140 * Math.exp(-(Math.pow(x - (-650), 2) + Math.pow(y - (-200), 2)) / 50000);
      sys += 120 * Math.exp(-(Math.pow(x - (-350), 2) + Math.pow(y - 50, 2)) / 40000);
      z += sys;

      z += 180 * Math.exp(-(Math.pow(x - 500, 2) / 120000 + Math.pow(y - (-250), 2) / 30000));
      z += 220 * Math.exp(-(Math.pow(x - (-400), 2) + Math.pow(y - 300, 2)) / 20000);
      z += 90 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - 350, 2)) / 90000);
      z += 240 * Math.exp(-(Math.pow(x - 450, 2) + Math.pow(y - 300, 2)) / 25000);

      const noise1 = Math.sin(x / 40) * Math.cos(y / 40) * 12;
      const noise2 = Math.sin(x / 15 + y / 20) * 5;
      z += (noise1 + noise2) * (z / 150);
      return z;
    };

    const angle = -25 * Math.PI / 180;
    const tilt = 62 * Math.PI / 180;
    const project = (x: number, y: number, z: number) => {
       const x1 = x * Math.cos(angle) - y * Math.sin(angle);
       const y1 = x * Math.sin(angle) + y * Math.cos(angle);
       return { x: x1, y: y1 * Math.cos(tilt) - z * Math.sin(tilt) };
    };

    const tData = [];
    const step = 50;
    const yMin = -1200, yMax = 1200;
    const xMin = -1800, xMax = 1800;
    
    for (let y = yMin; y <= yMax; y += step) {
      let d = "";
      for (let x = xMin; x <= xMax; x += step) {
        const p = project(x, y, getZ(x, y));
        d += x === xMin ? `M ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} ` : `L ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} `;
      }
      tData.push({ yDepth: y, d, isCol: false });
    }
    
    for (let x = xMin; x <= xMax; x += step) {
      let d = "";
      for (let y = yMin; y <= yMax; y += step) {
        const p = project(x, y, getZ(x, y));
        d += y === yMin ? `M ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} ` : `L ${formatSvgNumber(p.x)} ${formatSvgNumber(p.y)} `;
      }
      tData.push({ yDepth: 9999, d, isCol: true });
    }

    const pTerrain = tData.map(t => {
      const pts = t.d.split(/[ML]/).map(s => s.trim()).filter(Boolean).map(s => {
        const [x, y] = s.split(/\s+/).map(Number);
        return { x, y };
      });
      return { ...t, pts };
    });

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

    const placedLabels: { x: number, y: number, w: number, h: number }[] = [];
    nData.forEach(node => {
        const isHub = node.level === 'A';
        const isCore = node.level === 'B';
        const radius = isHub ? 8 : isCore ? 4 : 2.5;
        
        let bestAlign: 'left' | 'right' | 'top' | 'bottom' = isHub ? 'bottom' : (node.proj.x > 0 ? 'right' : 'left');
        let lx = 0, ly = 0;
        const w = 70, h = 18;
        
        const tryAlign = (align: string) => {
            if (align === 'bottom') { lx = node.proj.x - w/2; ly = node.proj.y + radius + 5; }
            else if (align === 'top') { lx = node.proj.x - w/2; ly = node.proj.y - radius - 15; }
            else if (align === 'right') { lx = node.proj.x + radius + 5; ly = node.proj.y - h/2; }
            else { lx = node.proj.x - radius - 5 - w; ly = node.proj.y - h/2; }
            
            for (const p of placedLabels) {
                if (Math.abs(lx - p.x) < (w+p.w)/2 && Math.abs(ly - p.y) < (h+p.h)/2) return false;
            }
            return true;
        };
        
        if (!tryAlign(bestAlign)) {
            const alts = ['right', 'left', 'bottom', 'top'];
            for (const alt of alts) {
                if (tryAlign(alt)) { bestAlign = alt as any; break; }
            }
        }
        placedLabels.push({ x: lx, y: ly, w, h });
        node.align = bestAlign;
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

    return { terrain: tData, parsedTerrain: pTerrain, nodesProj: nData, edgesProj: eData, domainsProj: dData };
  }, []);

  const renderCursorResponse = useCallback(() => {
    const state = interactionState.current;
    if (state.master === 0 && !interactionState.current._wasZero) {
        parsedTerrain.forEach((t, i) => {
            const pathEl = terrainRefs.current[i];
            if (!pathEl) return;
            let baseAlpha = 0.08;
            if (!t.isCol) {
               const depthRatio = (t.yDepth - (-1200)) / (1200 - (-1200));
               baseAlpha = 0.08 + depthRatio * 0.25;
            } else {
               baseAlpha = 0.12;
            }
            pathEl.style.stroke = `rgba(245, 237, 227, ${baseAlpha})`;
            pathEl.style.strokeWidth = "0.8";
        });
        interactionState.current._wasZero = true;
        return;
    }
    if (state.master === 0) return;
    interactionState.current._wasZero = false;

    const px = state.x, py = state.y;
    const master = state.master;
    
    const scale = camera.current.z || 0.85;
    const ratio = (cachedRect.current.svgWidth || 2400) / 2400;
    const screenMult = scale * ratio;
    
    parsedTerrain.forEach((t, i) => {
        const pathEl = terrainRefs.current[i];
        if (!pathEl) return;
        
        let minDistSq = Infinity;
        const len = t.pts.length;
        
        for (let j = 0; j < len; j++) {
            const pt = t.pts[j];
            const dx = pt.x - px;
            const dy = pt.y - py;
            const dSq = dx*dx + dy*dy;
            if (dSq < minDistSq) minDistSq = dSq;
        }
        
        let baseAlpha = 0.08;
        if (!t.isCol) {
           const depthRatio = (t.yDepth - (-1200)) / (1200 - (-1200));
           baseAlpha = 0.08 + depthRatio * 0.25;
        } else {
           baseAlpha = 0.12;
        }
        
        const pixelDist = Math.sqrt(minDistSq) * screenMult;
        
        let influence = 0;
        if (pixelDist < 600) {
            // Strong nonlinear falloff (core high, regional moderate, edge fast fade)
            const normalized = pixelDist / 280;
            influence = Math.exp(-Math.pow(normalized, 2.4));
            
            // Terrain-aware weighting (closer ridges respond slightly stronger)
            const terrainWeight = 0.5 + (baseAlpha * 3.0);
            influence *= terrainWeight;
        }
        
        // Reduced global/far influence to strict 0.
        // Reduced peak brightness (0.3 instead of 0.45).
        let finalAlpha = baseAlpha + (influence * 0.3) * master;
        finalAlpha = Math.max(0.02, Math.min(0.85, finalAlpha));
        
        const r = Math.round(245 + influence * master * 8);
        const g = Math.round(237 + influence * master * 5);
        const b = Math.round(227 - influence * master * 8);
        
        pathEl.style.stroke = `rgba(${r}, ${g}, ${b}, ${finalAlpha.toFixed(3)})`;
        pathEl.style.strokeWidth = (0.8 + influence * master * 0.4).toFixed(2);
    });
  }, [parsedTerrain]);

  const applyCamera = useCallback((animate = false, duration = 0.5) => {
    if (!worldRef.current) return;
    const { x, y, z } = camera.current;
    if (animate) {
      gsap.to(worldRef.current, { x, y, scale: z, duration, ease: "power3.inOut" });
    } else {
      gsap.set(worldRef.current, { x, y, scale: z });
    }
  }, []);

  const clampCamera = useCallback(() => {
    const minZ = 0.85; 
    const maxZ = 2.5;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    const limitX = Math.max(0, 1800 * camera.current.z - 1200);
    const limitY = Math.max(0, 1200 * camera.current.z - 800);
    camera.current.x = Math.max(-limitX, Math.min(limitX, camera.current.x));
    camera.current.y = Math.max(-limitY, Math.min(limitY, camera.current.y));
  }, []);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    
    const updateRects = () => {
      if (svgWrapperRef.current) {
        const r = svgWrapperRef.current.getBoundingClientRect();
        cachedRect.current = { width: r.width, height: r.height, left: r.left, top: r.top, svgWidth: cachedRect.current.svgWidth };
      }
      if (svgRef.current) {
        cachedRect.current.svgWidth = svgRef.current.getBoundingClientRect().width;
      }
    };
    
    updateRects();
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    if (isCmdOrCtrl) {
      e.preventDefault();
      
      const pt = svgRef.current!.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(worldRef.current!.getScreenCTM()!.inverse());
      
      const xs = (svgP.x - camera.current.x) / camera.current.z;
      const ys = (svgP.y - camera.current.y) / camera.current.z;
      
      const zoomAmount = 0.02;
      const newZ = Math.max(0.85, Math.min(2.5, camera.current.z - (e.deltaY * zoomAmount)));
      camera.current.z = newZ;
      clampCamera();

      camera.current.x = svgP.x - xs * camera.current.z;
      camera.current.y = svgP.y - ys * camera.current.z;

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
    if ((e.target as Element).closest('.no-pan') || (e.target as Element).closest('.interactive-ui')) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    gsap.killTweensOf(worldRef.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isVisible) return;

    if (svgWrapperRef.current && !isDragging) {
      const rect = cachedRect.current;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(svgWrapperRef.current, { rotateX: -ny * 4, rotateY: nx * 4, duration: 1, ease: "power2.out" });
    }

    if (!isPanning.current && svgRef.current) {
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(worldRef.current!.getScreenCTM()!.inverse());
        
        const rect = cachedRect.current;
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        
        gsap.to(interactionState.current, {
            x: svgP.x,
            y: svgP.y,
            nx: nx,
            ny: ny,
            master: 1,
            duration: 0.18,
            ease: "power2.out",
            onUpdate: renderCursorResponse,
            overwrite: "auto"
        });
    }

    if (!isPanning.current) return;
    
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };

    const ratio = 2400 / (cachedRect.current.svgWidth || 2400);

    camera.current.x += dx * ratio;
    camera.current.y += dy * ratio;
    clampCamera();
    applyCamera(false);
  };

  const onPointerLeave = () => {
    isPanning.current = false;
    setTimeout(() => setIsDragging(false), 50);
    gsap.to(interactionState.current, { master: 0, duration: 0.35, ease: "power2.out", onUpdate: renderCursorResponse, overwrite: "auto" });
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
    
    // 1. Zoom strategy: Start from current zoom and apply a small focus factor
    const smallFocusFactor = 1.05;
    let targetZ = camera.current.z * smallFocusFactor;
    
    // Hard cap the delta: no more than ~10% zoom in, ~5% zoom out from current camera
    const maxZoomIn = camera.current.z * 1.10;
    const maxZoomOut = camera.current.z * 0.95;
    targetZ = Math.max(maxZoomOut, Math.min(maxZoomIn, targetZ));
    
    // Absolute bounds for selection zoom
    targetZ = Math.max(0.9, Math.min(1.8, targetZ)); 
    
    // 2. Collision model to find best popupOffset
    const connectedNodes = getConnectedNodes(nodeId);
    const nodePt = nData.proj;
    const neighborPts = Array.from(connectedNodes).map(sn => nodesProj.find(n => n.id === sn)?.proj).filter(Boolean) as {x: number, y: number}[];
    const pathPts: {x: number, y: number}[] = [];
    edgesProj.forEach(e => {
        if (e.a === nodeId || e.b === nodeId) {
            pathPts.push(...e.pts);
        }
    });

    const cW = 420 / targetZ; 
    const cH = 380 / targetZ;
    const padX = 120 / targetZ;
    const padY = 120 / targetZ;

    const candidates = [
        { dx: padX, dy: -cH/2, align: 'right' },            // RIGHT
        { dx: -padX, dy: -cH/2, align: 'left' },           // LEFT
        { dx: padX, dy: -cH - padY, align: 'right' },      // TOP-RIGHT
        { dx: -padX, dy: -cH - padY, align: 'left' },     // TOP-LEFT
        { dx: padX, dy: padY, align: 'right' },            // BOTTOM-RIGHT
        { dx: -padX, dy: padY, align: 'left' }            // BOTTOM-LEFT
    ];

    let bestCandidate = candidates[0];
    let minScore = Infinity;

    for (const c of candidates) {
        const rectLeft = c.align === 'right' ? nodePt.x + c.dx : nodePt.x + c.dx - cW;
        const rectRight = rectLeft + cW;
        const rectTop = nodePt.y + c.dy;
        const rectBottom = rectTop + cH;

        let score = 0;

        const distToRect = (px: number, py: number) => {
            const dx = Math.max(rectLeft - px, 0, px - rectRight);
            const dy = Math.max(rectTop - py, 0, py - rectBottom);
            return Math.sqrt(dx*dx + dy*dy);
        };

        // Penalize if covering selected node (needs ~60px gap)
        if (distToRect(nodePt.x, nodePt.y) < 60) score += 100000;

        // Neighbors (medium protection ~40px)
        neighborPts.forEach(p => {
            if (distToRect(p.x, p.y) < 40) score += 5000;
        });

        // Paths (corridor protection ~25px)
        pathPts.forEach(p => {
            if (distToRect(p.x, p.y) < 25) score += 1000;
        });
        
        score += candidates.indexOf(c) * 10; // tie-breaker preference

        if (score < minScore) {
            minScore = score;
            bestCandidate = c;
        }
    }

    setPopupOffset(bestCandidate);

    // 3. Pan camera so the combination of the node and the chosen card is centered.
    // The visual center of interest is halfway between the node and the card.
    const cardCenterSVGX = bestCandidate.align === 'right' ? nodePt.x + bestCandidate.dx + cW/2 : nodePt.x + bestCandidate.dx - cW/2;
    const cardCenterSVGY = nodePt.y + bestCandidate.dy + cH/2;
    
    const focalX = (nodePt.x + cardCenterSVGX) / 2;
    const focalY = (nodePt.y + cardCenterSVGY) / 2;
    
    const targetCamX = -focalX * targetZ;
    const targetCamY = -focalY * targetZ;

    camera.current = { x: targetCamX, y: targetCamY, z: targetZ };
    clampCamera();
    applyCamera(true, 0.5); // 400-550ms transition
  }, [nodesProj, edgesProj, getConnectedNodes, clampCamera, applyCamera]);

  const focusOn = useCallback((x: number, y: number, z: number) => {
    camera.current = { x: -x * z, y: -y * z, z };
    clampCamera();
    applyCamera(true, 0.9);
  }, [applyCamera, clampCamera]);

  const resetCamera = useCallback(() => {
    setActiveDomain(null);
    setPinnedNode(null);
    setSearchQuery("");
    camera.current = { x: 0, y: 150, z: 0.85 };
    applyCamera(true, 1.2);
    if (svgWrapperRef.current) gsap.to(svgWrapperRef.current, { rotateX: 0, rotateY: 0, duration: 1.2, ease: "power3.inOut" });
  }, [applyCamera]);

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
    gsap.set(worldRef.current, { opacity: 0, y: 150 });
    
    tl.to(worldRef.current, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out", onComplete: () => {
      camera.current.z = 0.85;
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

  // Exact screen-space tracker for popup
  useEffect(() => {
    if (pinnedNode && activeNodeData && containerRef.current) {
      let rafId: number;
      const updatePos = () => {
         const rect = cachedRect.current;
         if (!rect.width) return;
         const svgScale = rect.svgWidth ? rect.svgWidth / 2400 : 1;
         const svgX = (activeNodeData.proj.x + popupOffset.dx) * camera.current.z + camera.current.x;
         const svgY = (activeNodeData.proj.y + popupOffset.dy) * camera.current.z + camera.current.y;
         const screenX = rect.width / 2 + svgX * svgScale;
         const screenY = rect.height / 2 + svgY * svgScale;
         setPopupPos({ x: screenX, y: screenY, align: popupOffset.align });
         rafId = requestAnimationFrame(updatePos);
      };
      updatePos();
      return () => cancelAnimationFrame(rafId);
    }
  }, [pinnedNode, activeNodeData, popupOffset]);

  const detail = activeNodeData ? SKILL_DETAILS[activeNodeData.id] : null;
  const renderQueue: { yDepth: number, element: React.ReactNode }[] = [];

  // PURE WIREFRAME TERRAIN
  parsedTerrain.forEach((t, i) => {
    let strokeOpacity = 0.08;
    if (!t.isCol) {
       const depthRatio = (t.yDepth - (-1200)) / (1200 - (-1200));
       strokeOpacity = 0.08 + depthRatio * 0.25;
    } else {
       strokeOpacity = 0.12;
    }
    
    renderQueue.push({
      yDepth: t.yDepth,
      element: (
        <path 
          key={`terrain-${i}`}
          ref={(el) => { terrainRefs.current[i] = el; }}
          d={t.d}
          fill="none"
          stroke={`rgba(245, 237, 227, ${strokeOpacity})`}
          strokeWidth="0.8"
          className="topo-terrain"
          style={{ willChange: "stroke, stroke-width, stroke-opacity" }}
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
          className="font-display tracking-[0.2em] pointer-events-none uppercase no-pan domain-label font-bold"
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
      opacity = isHovered ? 1 : isFirstOrder ? 0.9 : isSecondOrder ? 0.5 : 0.15;
    } else if (activeDomain) {
      opacity = inActiveDomain ? 1 : 0.15;
    }

    const isHub = node.level === 'A';
    const isCore = node.level === 'B';
    const radius = isHub ? 8 : isCore ? 4 : 2.5;
    const fontSize = isHub ? 14 : isCore ? 10 : 8;
    const isRich = !!SKILL_DETAILS[node.id];

    let labelX, labelY, textAnchor;
    if (node.align === 'bottom') {
       labelX = 0; labelY = radius + 15; textAnchor = 'middle';
    } else if (node.align === 'top') {
       labelX = 0; labelY = -(radius + 10); textAnchor = 'middle';
    } else if (node.align === 'right') {
       labelX = radius + 5; labelY = 3; textAnchor = 'start';
    } else {
       labelX = -(radius + 5); labelY = 3; textAnchor = 'end';
    }

    renderQueue.push({
      yDepth: node.originalY,
      element: (
        <g
          key={`node-${i}`}
          ref={(el) => { nodeRefs.current[node.id] = el; }}
          className={`constellation-node transition-all duration-300 no-pan cursor-pointer ${isRich ? 'is-rich' : ''}`}
          transform={`translate(${node.proj.x}, ${node.proj.y})`}
          opacity={opacity}
          onMouseEnter={() => { if (!pinnedNode && !isDragging) setHoveredNode(node.id); }}
          onMouseLeave={() => { if (!pinnedNode) setHoveredNode(null); }}
          onClick={(e) => {
            if (isDragging) return;
            e.stopPropagation();
            setPinnedNode(pinnedNode === node.id ? null : node.id);
            setHoveredNode(null);
            if (pinnedNode !== node.id) focusOnNode(node.id);
          }}
        >
          {isHub && <line x1="0" y1="0" x2="0" y2="15" stroke="var(--text-muted)" strokeWidth="1" opacity={isHovered ? 1 : 0.4} />}
          
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
            x={labelX}
            y={labelY}
            fontSize={fontSize}
            fill={isHovered ? "var(--text-primary)" : isFirstOrder ? "var(--text-primary)" : "var(--text-muted)"}
            textAnchor={textAnchor as any}
            className={`font-mono tracking-widest pointer-events-none transition-colors duration-300 uppercase font-bold text-text-primary`}
            style={{ textShadow: "0 2px 10px rgba(0,0,0,1)" }}
          >
            {node.label}
          </text>
        </g>
      )
    });
  });

  renderQueue.sort((a, b) => a.yDepth - b.yDepth);

  return (
    <section className="relative bg-[#030303] overflow-hidden select-none h-[100vh] w-full flex flex-col" ref={containerRef}>
      {isVisible && (
        <>
          {/* SEARCH */}
          <div className="absolute top-6 left-6 z-40 interactive-ui">
            <div className="relative group/search">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-border transition-all">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="SEARCH SKILLS"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 1) {
                      setSearchResults(NODES.filter(n => n.label.toLowerCase().includes(e.target.value.toLowerCase())));
                    } else setSearchResults([]);
                  }}
                  className="bg-transparent border-none outline-none text-xs font-mono text-text-primary w-32 focus:w-48 transition-all placeholder:text-text-muted/40 uppercase tracking-widest"
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
                      className="text-left px-4 py-3 font-mono text-[10px] tracking-widest text-text-muted hover:text-text-primary hover:bg-white/5 uppercase transition-colors border-b border-border/50 last:border-b-0"
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
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-border rounded-full pointer-events-none">
                 <MousePointer2 className="w-3.5 h-3.5 text-accent" />
                 <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">Drag to explore / Scroll to read</span>
               </motion.div>
             )}
          </AnimatePresence>

          {/* DOMAIN FILTERS */}
          <div className="absolute top-6 right-6 z-40 interactive-ui hidden md:block">
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
                  onClick={() => {
                    setActiveDomain(d.id);
                    setPinnedNode(null);
                    const dp = domainsProj.find(proj => proj.id === d.id);
                    if (dp) focusOn(dp.proj.x, dp.proj.y, 1.1);
                  }}
                  className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {d.label.split('// ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="absolute bottom-6 left-6 z-30 hidden md:flex items-end gap-4 interactive-ui">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-border flex flex-col gap-1 p-1 shadow-2xl">
              <button onClick={() => { camera.current.z *= 1.2; clampCamera(); applyCamera(true); }} className="p-2.5 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
              <button onClick={() => { camera.current.z *= 0.8; clampCamera(); applyCamera(true); }} className="p-2.5 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
              <button onClick={resetCamera} className="p-2.5 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <AnimatePresence>
            {hoveredNode && !pinnedNode && detail && (
              <motion.div
                className="absolute bottom-28 left-6 z-40 bg-[#0a0a0a] border border-border p-4 shadow-2xl max-w-[280px] pointer-events-none hidden md:block"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              >
                <div className="font-mono text-[10px] text-accent tracking-widest mb-2 uppercase">{detail.title}</div>
                <p className="text-xs text-text-muted line-clamp-3">{detail.description}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pinnedNode && activeNodeData && detail && (
              <motion.div
                className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-2xl border-t border-border p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] rounded-t-2xl interactive-ui"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%", transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <button onClick={() => setPinnedNode(null)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] tracking-[0.2em] text-text-muted uppercase">MK_ID // {activeNodeData.id.replace(/_/g, ' ')}</span>
                </div>
                
                <h3 className="text-xl font-display font-medium text-text-primary mb-1 uppercase tracking-tight">{activeNodeData.label}</h3>
                <div className="font-mono text-[9px] text-accent tracking-widest mb-4 uppercase">
                  {DOMAINS.find(d => d.id === activeNodeData.domainId)?.label.split('// ')[1]}
                </div>
                
                <p className="text-text-muted text-xs font-light leading-relaxed mb-6">{detail.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {Array.from(firstOrder).slice(0, 4).map(relId => {
                    const n = nodesProj.find(x => x.id === relId);
                    if (!n) return null;
                    return (
                      <button key={relId} onClick={() => { setPinnedNode(relId); focusOnNode(relId); }}
                        className="px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] border border-border bg-[#0e0e0e] text-text-muted hover:border-accent/40 hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pinnedNode && activeNodeData && detail && (
              <motion.div
                className={`absolute z-50 interactive-ui hidden md:flex flex-col drop-shadow-2xl ${popupPos.align === 'left' ? '-translate-x-full' : ''}`}
                style={{ left: popupPos.x, top: popupPos.y, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))" }}
                initial={{ opacity: 0, scale: 0.98, x: popupPos.align === 'left' ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Connector */}
                <div className={`absolute top-1/2 -translate-y-1/2 w-12 h-[1px] bg-text-muted/60 flex items-center ${popupPos.align === 'left' ? 'left-full flex-row-reverse' : 'right-full'}`}>
                  <div className="w-1.5 h-1.5 bg-accent absolute -left-[3px] shadow-[0_0_8px_rgba(220,38,38,1)]" />
                </div>

                {/* Premium Card */}
                <div className="relative w-[360px] group">
                  <div className="absolute inset-0 bg-[#080808]/90 backdrop-blur-2xl border-l border-t border-border/50 transition-colors group-hover:border-border/80" 
                       style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }} />
                  <div className="absolute bottom-0 right-0 w-[24px] h-[24px] border-b border-r border-accent bg-[#080808]/50 backdrop-blur-md flex items-center justify-center">
                    <div className="w-1 h-1 bg-accent/80 rounded-full" />
                  </div>
                  
                  <div className="relative p-8">
                    <button onClick={() => setPinnedNode(null)} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span className="font-mono text-[9px] tracking-[0.2em] text-text-muted uppercase">MK_ID // {activeNodeData.id.replace(/_/g, ' ')}</span>
                    </div>
                    
                    <h3 className="text-2xl font-display font-medium text-text-primary mb-1 uppercase tracking-tight">{activeNodeData.label}</h3>
                    <div className="font-mono text-[10px] text-accent tracking-widest mb-6 uppercase">
                      {DOMAINS.find(d => d.id === activeNodeData.domainId)?.label.split('// ')[1]}
                    </div>
                    
                    <p className="text-text-muted text-[13px] font-light leading-relaxed mb-6">{detail.description}</p>
                    
                    <div className="border-t border-border/40 pt-5 mb-6">
                      <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase flex items-center gap-2">
                         <div className="w-1 h-1 bg-text-muted/50" /> Application Context
                      </div>
                      <div className="flex flex-col gap-2">
                        {detail.usedIn.map((u, i) => {
                          if (u.href) {
                            const slug = u.href.split('/').pop();
                            const proj = getProject(slug || '');
                            return (
                              <Link key={i} href={proj ? `/work/${proj.slug}` : u.href} 
                                className="group/chip flex items-center justify-between px-3 py-2.5 bg-[#0e0e0e] border border-border hover:border-accent/50 transition-all"
                              >
                                <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest group-hover/chip:text-accent transition-colors">{u.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover/chip:text-accent transition-colors transform group-hover/chip:translate-x-0.5 group-hover/chip:-translate-y-0.5" />
                              </Link>
                            );
                          }
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#0e0e0e]/50 border border-border/30">
                              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{u.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-5">
                      <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase flex items-center gap-2">
                         <div className="w-1 h-1 bg-text-muted/50" /> Topology Ties
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(firstOrder).slice(0, 5).map(relId => {
                          const n = nodesProj.find(x => x.id === relId);
                          if (!n) return null;
                          return (
                            <button key={relId} onClick={() => { setPinnedNode(relId); focusOnNode(relId); }}
                              className="px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] border border-border bg-[#0e0e0e] text-text-muted hover:border-accent/40 hover:text-text-primary transition-colors cursor-pointer"
                            >
                              {n.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            ref={svgWrapperRef}
            className="absolute inset-0 w-full h-full transform-style-3d origin-center"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          >
            <svg
              ref={svgRef}
              viewBox="-1200 -800 2400 1600"
              preserveAspectRatio="xMidYMid slice" className="absolute inset-0"
            >
              <g ref={worldRef}>
                {/* Base Wireframe Mesh Queue */}
                {renderQueue.map((item, i) => React.cloneElement(item.element as React.ReactElement, { key: `depth-${i}` }))}
              </g>
            </svg>
          </div>
        </>
      )}
    </section>
  );
};
