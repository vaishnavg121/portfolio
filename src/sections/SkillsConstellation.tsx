"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSectionVisibility } from "@/lib/visibility";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

// Keep server-rendered SVG attributes byte-for-byte stable across runtimes.
const formatSvgNumber = (value: number) => Number(value.toFixed(3));

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  const cursorGradRef = useRef<SVGRadialGradientElement>(null);
  const cursorLayerRef = useRef<SVGGElement>(null);
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
  
  const camera = useRef({ x: 0, y: 150, z: 0.85 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const activeNode = pinnedNode || hoveredNode;

  useEffect(() => {
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
    window.addEventListener("resize", updateRects);
    return () => window.removeEventListener("resize", updateRects);
  }, []);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
      
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const applyCamera = useCallback((animate = false, duration = 0.5) => {
    if (!worldRef.current) return;
    const { x, y, z } = camera.current;
    if (animate) {
      gsap.to(worldRef.current, { x, y, scale: z, duration, ease: "power3.inOut" });
    } else {
      gsap.set(worldRef.current, { x, y, scale: z });
    }
    
    const isZoomedIn = z > 1.25;
    gsap.to('.semantic-minor', { opacity: isZoomedIn ? 1 : 0, duration: 0.3 });
  }, []);

  const clampCamera = useCallback(() => {
    const minZ = 0.85; 
    const maxZ = 2.5;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    const limitX = 2000 * camera.current.z;
    const limitY = 2000 * camera.current.z;
    camera.current.x = Math.max(-limitX, Math.min(limitX, camera.current.x));
    camera.current.y = Math.max(-limitY, Math.min(limitY, camera.current.y));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; 
    e.preventDefault(); 
    
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    if (!svgRef.current) return;

    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());

    const xs = (svgP.x - camera.current.x) / camera.current.z;
    const ys = (svgP.y - camera.current.y) / camera.current.z;

    camera.current.z *= zoomFactor;
    clampCamera();

    camera.current.x = svgP.x - xs * camera.current.z;
    camera.current.y = svgP.y - ys * camera.current.z;

    applyCamera(false);
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
    if (svgRef.current && cursorGradRef.current) {
       const pt = svgRef.current.createSVGPoint();
       pt.x = e.clientX; pt.y = e.clientY;
       const svgP = pt.matrixTransform(worldRef.current!.getScreenCTM()!.inverse());
       
       const scaleRatio = 2400 / (cachedRect.current.svgWidth || 2400);
       const worldRadius = (750 * scaleRatio) / camera.current.z;
       
       gsap.to(cursorGradRef.current, {
           attr: { cx: svgP.x, cy: svgP.y, r: worldRadius },
           duration: 0.18,
           ease: "power2.out",
           overwrite: "auto"
       });
    }

    if (svgWrapperRef.current && !isDragging) {
      const rect = cachedRect.current;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(svgWrapperRef.current, {
        rotateX: -ny * 4,
        rotateY: nx * 4,
        duration: 1,
        ease: "power2.out"
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
    if (cursorLayerRef.current) gsap.to(cursorLayerRef.current, { opacity: 0, duration: 0.35, ease: "power2.out" });
  };

  const onPointerEnter = () => {
    if (cursorLayerRef.current) gsap.to(cursorLayerRef.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
  };

  const onPointerUp = () => {
    isPanning.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

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

  // HYDRATION-SAFE MEMOIZED MATHEMATICS
  const { terrain, nodesProj, edgesProj, domainsProj } = useMemo(() => {
    const getZ = (x: number, y: number) => {
      let z = 0;
      z += 300 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - (-400), 2)) / 50000); 
      z += 220 * Math.exp(-(Math.pow(x - 450, 2) + Math.pow(y - 300, 2)) / 35000); 
      z += 180 * Math.exp(-(Math.pow(x - (-400), 2) + Math.pow(y - 300, 2)) / 40000); 
      z += 160 * Math.exp(-(Math.pow(x - (-500), 2) + Math.pow(y - (-100), 2)) / 80000); 
      z += 140 * Math.exp(-(Math.pow(x - 500, 2) + Math.pow(y - (-200), 2)) / 100000); 
      z += 70 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - 350, 2)) / 90000); 
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
       const x2 = x1;
       const y2 = y1 * Math.cos(tilt) - z * Math.sin(tilt);
       return { x: x2, y: y2 };
    };

    const tData = [];
    const step = 45;
    const yMin = -700, yMax = 650;
    const xMin = -950, xMax = 950;
    
    // Rows (Horizontal Contours)
    for (let y = yMin; y <= yMax; y += step) {
      let d = "";
      for (let x = xMin; x <= xMax; x += step) {
        const z = getZ(x, y);
        const p = project(x, y, z);
        const px = p.x.toFixed(1); // EXACT precision limits to cure hydration mismatch
        const py = p.y.toFixed(1);
        d += x === xMin ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      tData.push({ yDepth: y, d, isCol: false });
    }
    
    // Columns (Transverse lines to form pure mesh)
    for (let x = xMin; x <= xMax; x += step) {
      let d = "";
      for (let y = yMin; y <= yMax; y += step) {
        const z = getZ(x, y);
        const p = project(x, y, z);
        const px = p.x.toFixed(1);
        const py = p.y.toFixed(1);
        d += y === yMin ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      tData.push({ yDepth: 0, d, isCol: true });
    }
    
    const nData = NODES.map(n => {
       const z = getZ(n.x, n.y);
       const projection = project(n.x, n.y, z);
       return {
         ...n,
         proj: { x: formatSvgNumber(projection.x), y: formatSvgNumber(projection.y) },
         originalY: n.y,
         z,
       };
    });

    const dData = DOMAINS.map(d => {
       const z = getZ(d.x, d.y);
       const projection = project(d.x, d.y, z);
       return {
         ...d,
         proj: { x: formatSvgNumber(projection.x), y: formatSvgNumber(projection.y) },
         originalY: d.y,
       };
    });

    const eData = CONNECTIONS.map(([a, b]) => {
       const nA = NODES.find(n => n.id === a);
       const nB = NODES.find(n => n.id === b);
       if (!nA || !nB) return null;
       
       let d = "";
       const midY = (nA.y + nB.y) / 2;
       const segments = 12;
       for(let i=0; i<=segments; i++) {
         const t = i / segments;
         const nx = nA.x + (nB.x - nA.x) * t;
         const ny = nA.y + (nB.y - nA.y) * t;
         const nz = getZ(nx, ny) + 3;
         const p = project(nx, ny, nz);
         const px = p.x.toFixed(1);
         const py = p.y.toFixed(1);
         d += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
       }
       return { a, b, d, midY };
    }).filter(Boolean) as { a: string, b: string, d: string, midY: number }[];

    return { terrain: tData, nodesProj: nData, edgesProj: eData, domainsProj: dData };
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

  const getConnectedNodes = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  }, []);

  const { firstOrder, secondOrder } = useMemo(() => {
    const first = activeNode ? getConnectedNodes(activeNode) : new Set<string>();
    const second = new Set<string>();
    if (activeNode) {
      first.forEach(f => {
        getConnectedNodes(f).forEach(s => {
          if (s !== activeNode && !first.has(s)) second.add(s);
        });
      });
    }
    return { firstOrder: first, secondOrder: second };
  }, [activeNode, getConnectedNodes]);

  useEffect(() => {
    if (pinnedNode) {
       gsap.fromTo(`.edge-active`,
         { strokeDasharray: "1500", strokeDashoffset: 1500 },
         { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }
       );
    }
  }, [pinnedNode]);

  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;
  const activeNodeData = nodesProj.find(n => n.id === activeNode);
  const getProject = (slug: string) => projects.find(p => p.slug === slug);

  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, align: 'right' });
  
  useEffect(() => {
    if (pinnedNode && activeNodeData && containerRef.current && nodeRefs.current[pinnedNode]) {
      let rafId: number;
      let lastCx = -999; let lastCy = -999;
        const updatePos = () => {
         const el = nodeRefs.current[pinnedNode];
         if (!el || !containerRef.current) return;
         const rect = el.getBoundingClientRect();
         const containerRect = containerRef.current.getBoundingClientRect();
         
         const cx = rect.left - containerRect.left + rect.width / 2;
         const cy = rect.top - containerRect.top + rect.height / 2;
         
         let align = 'right';
         let px = cx + 48; // offset from node
         
         if (cx > containerRect.width * 0.5) {
            align = 'left';
            px = cx - 48;
         }

         if (Math.abs(cx - lastCx) > 0.5 || Math.abs(cy - lastCy) > 0.5) {
             setPopupPos({ x: px, y: cy, align });
             lastCx = cx;
             lastCy = cy;
           }
         rafId = requestAnimationFrame(updatePos);
      };
      updatePos();
      return () => cancelAnimationFrame(rafId);
    }
  }, [pinnedNode, activeNodeData]);

  const renderQueue: { yDepth: number, element: React.ReactNode }[] = [];

  // PURE WIREFRAME TERRAIN
  terrain.forEach((t, i) => {
    let strokeOpacity = 0.08;
    if (!t.isCol) {
       const depthRatio = (t.yDepth - (-700)) / (650 - (-700));
       strokeOpacity = 0.08 + depthRatio * 0.25; // Depth layering
    } else {
       strokeOpacity = 0.12;
    }
    
    renderQueue.push({
      yDepth: t.yDepth,
      element: (
        <path 
          key={`terrain-${i}`}
          d={t.d}
          fill="none"
          stroke={`rgba(245, 237, 227, ${strokeOpacity})`}
          strokeWidth="0.8"
          className="topo-terrain"
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
          x={d.proj.x} y={d.proj.y - 40}
          fontSize="36"
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

  edgesProj.forEach((e, i) => {
    const { a, b, d, midY } = e;
    const isDirectActive = activeNode && (
       (activeNode === a && firstOrder.has(b)) || 
       (activeNode === b && firstOrder.has(a))
    );
    const isSecondActive = activeNode && !isDirectActive && (
       (firstOrder.has(a) && secondOrder.has(b)) || 
       (firstOrder.has(b) && secondOrder.has(a)) ||
       (firstOrder.has(a) && firstOrder.has(b))
    );
    
    let opacity = 0.02;
    let stroke = "var(--border)";
    let strokeWidth = 1.5;
    let classes = "constellation-line transition-opacity duration-500 pointer-events-none";
    
    if (activeNode) {
      if (isDirectActive) {
        opacity = 1;
        stroke = "var(--text-primary)";
        strokeWidth = 2.5;
        classes += " edge-active filter drop-shadow-[0_0_6px_rgba(220,38,38,0.4)]";
      } else if (isSecondActive) {
        opacity = 0.45;
        stroke = "var(--text-muted)";
      }
    }

    renderQueue.push({
      yDepth: midY,
      element: (
        <path
          key={`edge-${i}`}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
          className={classes}
        />
      )
    });
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

    renderQueue.push({
      yDepth: node.originalY,
      element: (
        <g
          key={`node-${i}`}
          ref={(el) => { nodeRefs.current[node.id] = el; }}
          className="constellation-node transition-all duration-300 no-pan cursor-pointer"
          transform={`translate(${node.proj.x}, ${node.proj.y})`}
          opacity={opacity}
          onMouseEnter={() => { if (!pinnedNode && !isDragging) setHoveredNode(node.id); }}
          onMouseLeave={() => { if (!pinnedNode) setHoveredNode(null); }}
          onClick={(e) => {
            if (isDragging) return;
            e.stopPropagation();
            setPinnedNode(pinnedNode === node.id ? null : node.id);
            setHoveredNode(null);
            if (pinnedNode !== node.id) focusOn(node.proj.x, node.proj.y, 1.3);
          }}
        >
          {isHub && <line x1="0" y1="0" x2="0" y2="15" stroke="var(--text-muted)" strokeWidth="1" opacity={isHovered ? 1 : 0.4} />}
          {isHovered && <circle r={radius + 8} fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8" />}
          <circle
            r={radius}
            fill={isHovered ? "var(--text-primary)" : "#0a0a0a"}
            stroke={isHovered ? "var(--accent)" : isFirstOrder ? "var(--text-primary)" : "var(--text-muted)"}
            strokeWidth={isHovered ? 2 : 1.5}
            className="transition-colors duration-300"
          />
          <text
            x={isHub ? 0 : (node.proj.x > 0 ? radius + 5 : -(radius + 5))}
            y={isHub ? radius + 15 : 3}
            fontSize={fontSize}
            fill={isHovered ? "var(--text-primary)" : isFirstOrder ? "var(--text-primary)" : "var(--text-muted)"}
            textAnchor={isHub ? "middle" : (node.proj.x > 0 ? "start" : "end")}
            className={`font-mono tracking-widest pointer-events-none transition-colors duration-300 uppercase ${!isHub && !isHovered && !isFirstOrder ? 'semantic-minor opacity-0' : 'font-bold'}`}
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
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        <div className="flex justify-between items-start w-full">
          <div className="max-w-sm">
            <h2 className="text-[10px] font-mono text-text-muted mb-4 tracking-widest uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent" /> KNOWLEDGE LANDSCAPE
            </h2>
            <p className="text-xl font-light text-text-primary leading-tight mb-2 uppercase tracking-wide">
              A landscape of ideas.<br/>Connected by purpose.
            </p>
            <p className="text-xs font-light text-text-muted leading-relaxed hidden md:block">
              Explore the technologies, concepts and domains I work with — and how they intersect across projects, research and real-world experience.
            </p>
          </div>
          
          <div className="relative pointer-events-auto interactive-ui flex flex-col items-end">
            <div className="flex items-center border border-border bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 shadow-2xl">
              <Search className="w-3.5 h-3.5 text-text-muted mr-2" />
              <input 
                type="text" 
                placeholder="SEARCH_SKILL /"
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
                      setPinnedNode(res.id);
                      setSearchQuery("");
                      const n = nodesProj.find(x => x.id === res.id);
                      if (n) focusOn(n.proj.x, n.proj.y, 1.4);
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
          <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-text-muted/40" /> PRACTICAL APPLICATION</div>
        </div>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-[#111]/80 backdrop-blur-md px-5 py-2.5 border border-border font-mono text-[10px] tracking-widest text-text-muted rounded-full pointer-events-none flex items-center gap-3 shadow-2xl"
          >
            <MousePointer2 className="w-3 h-3 text-accent" /> DRAG TO PAN | {isMac ? '⌘' : 'CTRL'} + SCROLL TO ZOOM
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`w-full flex-1 relative cursor-${isDragging ? 'grabbing' : 'grab'} perspective-[1000px] overflow-hidden`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onPointerEnter={onPointerEnter}
        onClick={(e) => {
          if (!isDragging && !(e.target as Element).closest('.no-pan') && !(e.target as Element).closest('.interactive-ui')) {
            setPinnedNode(null);
          }
        }}
      >
        <div ref={svgWrapperRef} className="absolute inset-0 w-full h-full transform-style-3d origin-center">
          <svg 
            ref={svgRef} width="100%" height="100%" viewBox="-1200 -800 2400 1600" 
            preserveAspectRatio="xMidYMid slice" className="absolute inset-0"
          >
            <defs>
                <radialGradient id="cursor-grad" cx="-5000" cy="-5000" r="750" gradientUnits="userSpaceOnUse" ref={cursorGradRef}>
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="15%" stopColor="white" stopOpacity="0.7" />
                  <stop offset="40%" stopColor="white" stopOpacity="0.25" />
                  <stop offset="65%" stopColor="white" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
              {activeNodeData && (
                 <radialGradient id="select-grad" cx={activeNodeData.proj.x} cy={activeNodeData.proj.y} r="350" gradientUnits="userSpaceOnUse">
                   <stop offset="0%" stopColor="white" stopOpacity="1" />
                   <stop offset="100%" stopColor="white" stopOpacity="0" />
                 </radialGradient>
              )}
              <mask id="cursor-mask" maskUnits="userSpaceOnUse">
                 <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#cursor-grad)" />
              </mask>
              {activeNodeData && (
                <mask id="select-mask" maskUnits="userSpaceOnUse">
                   <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#select-grad)" />
                </mask>
              )}
            </defs>

            <g ref={worldRef} className="transform-origin-center">
              {/* Base Wireframe Mesh Queue */}
              {renderQueue.map((item, i) => React.cloneElement(item.element as React.ReactElement, { key: `depth-${i}` }))}
              
              {/* Cursor Exploration Layer */}
             <g ref={cursorLayerRef} mask="url(#cursor-mask)" className="pointer-events-none opacity-0">
                {terrain.map((t, i) => {
                  let baseOpacity = 0.08;
                  if (!t.isCol) {
                     const depthRatio = (t.yDepth - (-700)) / (650 - (-700));
                     baseOpacity = 0.08 + depthRatio * 0.25;
                  } else {
                     baseOpacity = 0.12;
                  }
                  return (
                    <path 
                      key={`ch-${i}`} 
                      d={t.d} 
                      fill="none" 
                      stroke={`rgba(255, 248, 235, ${baseOpacity * 2.8})`} 
                      strokeWidth="1.3" 
                    />
                  );
                })}
              </g>

              {/* Selection Focus Layer */}
              {activeNodeData && (
                <g mask="url(#select-mask)" className="pointer-events-none transition-opacity duration-500">
                  {terrain.map((t, i) => (
                    <path key={`sh-${i}`} d={t.d} fill="none" stroke="rgba(220, 38, 38, 0.45)" strokeWidth="1.5" />
                  ))}
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* DOMAIN LENSES */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-4 px-6 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-border overflow-x-auto max-w-[90vw] no-scrollbar interactive-ui shadow-2xl">
          <button 
            onClick={() => resetCamera()}
            className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${!activeDomain && !activeNode ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            LENS // ALL
          </button>
          {DOMAINS.map(d => (
            <button 
              key={d.id}
              onClick={() => { 
                setActiveDomain(d.id); setPinnedNode(null); 
                const proj = domainsProj.find(dp => dp.id === d.id)?.proj;
                if(proj) focusOn(proj.x, proj.y, 1.2); 
              }}
              className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              {d.label.split('// ')[1]}
            </button>
          ))}
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
                
                <div className="relative p-7 flex flex-col">
                  <button onClick={() => setPinnedNode(null)} className="absolute top-5 right-5 p-1.5 text-text-muted hover:text-accent transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-1.5 bg-accent transform rotate-45 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
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
                      {Array.from(firstOrder).slice(0, 8).map(relId => {
                        const n = nodesProj.find(x => x.id === relId);
                        if (!n) return null;
                        return (
                          <button key={relId} onClick={() => { setPinnedNode(relId); focusOn(n.proj.x, n.proj.y, 1.4); }}
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
      </div>
    </section>
  );
};
