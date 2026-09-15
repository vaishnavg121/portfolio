"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof NODES>([]);
  
  const camera = useRef({ x: 0, y: 150, z: 0.8 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const activeNode = pinnedNode || hoveredNode;
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
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
    
    // Semantic zoom: Hide/show smaller labels based on zoom level
    const isZoomedIn = z > 1.3;
    gsap.to('.semantic-minor', { opacity: isZoomedIn ? 1 : 0, duration: 0.3 });
  }, []);

  const clampCamera = useCallback(() => {
    const minZ = 0.6;
    const maxZ = 2.4;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    const limitX = 2000 * camera.current.z;
    const limitY = 2000 * camera.current.z;
    camera.current.x = Math.max(-limitX, Math.min(limitX, camera.current.x));
    camera.current.y = Math.max(-limitY, Math.min(limitY, camera.current.y));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; 
    
    e.preventDefault(); 
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const pt = svgRef.current!.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());

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
    // Micro-perspective tilt
    if (svgWrapperRef.current && !isDragging) {
      const rect = svgWrapperRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Extremely subtle perspective shift
      gsap.to(svgWrapperRef.current, {
        rotateX: -ny * 3,
        rotateY: nx * 3,
        duration: 0.8,
        ease: "power2.out"
      });
    }

    if (!isPanning.current) return;
    
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };

    const svgRect = svgRef.current!.getBoundingClientRect();
    const viewBoxWidth = 2400; // Match SVG viewBox width
    const ratio = viewBoxWidth / svgRect.width;

    camera.current.x += dx * ratio;
    camera.current.y += dy * ratio;
    
    clampCamera();
    applyCamera(false);
  };

  const onPointerUp = () => {
    isPanning.current = false;
    setTimeout(() => {
       setIsDragging(false);
    }, 50);
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
    camera.current = { x: 0, y: 150, z: 0.8 };
    applyCamera(true, 1.2);
    
    if (svgWrapperRef.current) {
      gsap.to(svgWrapperRef.current, { rotateX: 0, rotateY: 0, duration: 1.2, ease: "power3.inOut" });
    }
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

  // MATHEMATICAL GEOMETRY ENGINE 
  const { terrain, nodesProj, edgesProj, domainsProj } = useMemo(() => {
    // 1. Z-Height Function (Gaussian Mountains)
    const getZ = (x: number, y: number) => {
      let z = 0;
      // AI/ML: Tallest Mountain
      z += 300 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - (-400), 2)) / 50000); 
      // Robotics: Lower Right Mountain
      z += 220 * Math.exp(-(Math.pow(x - 450, 2) + Math.pow(y - 300, 2)) / 35000); 
      // Finance: Lower Left Ridge
      z += 180 * Math.exp(-(Math.pow(x - (-400), 2) + Math.pow(y - 300, 2)) / 40000); 
      // Systems: Left Rugged Range
      z += 160 * Math.exp(-(Math.pow(x - (-500), 2) + Math.pow(y - (-100), 2)) / 80000); 
      // Data: Right Plateau
      z += 140 * Math.exp(-(Math.pow(x - 500, 2) + Math.pow(y - (-200), 2)) / 100000); 
      // Web: Center Base
      z += 70 * Math.exp(-(Math.pow(x - 0, 2) + Math.pow(y - 350, 2)) / 90000); 
      
      // Terrain noise
      const noise1 = Math.sin(x / 40) * Math.cos(y / 40) * 12;
      const noise2 = Math.sin(x / 15 + y / 20) * 5;
      z += (noise1 + noise2) * (z / 150); 
      
      return z;
    };

    // 2. Isometric Projection
    const angle = -25 * Math.PI / 180;
    const tilt = 62 * Math.PI / 180;
    const project = (x: number, y: number, z: number) => {
       const x1 = x * Math.cos(angle) - y * Math.sin(angle);
       const y1 = x * Math.sin(angle) + y * Math.cos(angle);
       const x2 = x1;
       const y2 = y1 * Math.cos(tilt) - z * Math.sin(tilt);
       return { x: x2, y: y2 };
    };

    // 3. Terrain Grid Lines (Rows)
    const tData = [];
    const step = 45;
    const yMin = -700, yMax = 650;
    const xMin = -950, xMax = 950;
    
    for (let y = yMin; y <= yMax; y += step) {
      let d = "";
      for (let x = xMin; x <= xMax; x += step) {
        const z = getZ(x, y);
        const p = project(x, y, z);
        d += x === xMin ? `M ${p.x} ${p.y} ` : `L ${p.x} ${p.y} `;
      }
      
      // Close path massively below the visible area to create solid occlusion
      const pRightBase = project(xMax, y, -1000);
      const pLeftBase = project(xMin, y, -1000);
      d += `L ${pRightBase.x} 1500 L ${pLeftBase.x} 1500 Z`;

      tData.push({ yDepth: y, d });
    }
    
    // 4. Node Coordinates
    const nData = NODES.map(n => {
       const z = getZ(n.x, n.y);
       return { ...n, proj: project(n.x, n.y, z), originalY: n.y, z };
    });

    // 5. Domain Labels
    const dData = DOMAINS.map(d => {
       const z = getZ(d.x, d.y);
       return { ...d, proj: project(d.x, d.y, z), originalY: d.y };
    });

    // 6. Edges (Paths over terrain)
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
         const nz = getZ(nx, ny) + 3; // Float slightly
         const p = project(nx, ny, nz);
         d += i === 0 ? `M ${p.x} ${p.y} ` : `L ${p.x} ${p.y} `;
       }
       return { a, b, d, midY };
    }).filter(Boolean);

    return { terrain: tData, nodesProj: nData, edgesProj: eData, domainsProj: dData };
  }, []);

  useGSAP(() => {
    // Terrain Entry Choreography
    const tl = gsap.timeline();
    
    gsap.set(worldRef.current, { opacity: 0, y: 150 });
    
    tl.to(worldRef.current, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out", onComplete: () => {
      camera.current.z = 0.8;
      applyCamera(false);
    }}, 0);
    
    // Stagger terrain slices from back to front (horizon resolving)
    tl.fromTo('.topo-terrain', 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.5, stagger: 0.03, ease: "power2.out" }, 0.2
    );

    tl.fromTo('.constellation-line',
      { strokeDasharray: "0 1500", opacity: 0 },
      { strokeDasharray: "1500 0", opacity: 1, duration: 2, ease: "power2.out" }, 1.5
    );
    
    tl.fromTo('.domain-label',
      { opacity: 0, y: -20 },
      { opacity: 0.25, y: 0, duration: 1, stagger: 0.1, ease: "power2.out" }, 1.8
    );

    tl.fromTo('.constellation-node',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.8, stagger: 0.01, ease: "back.out(1.5)" }, 2.0
    );
  }, { scope: containerRef });

  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  };

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
  }, [activeNode]);

  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;
  const activeNodeData = NODES.find(n => n.id === activeNode);
  const getProject = (slug: string) => projects.find(p => p.slug === slug);

  // Popup Positioning Logic (Screen space mapping)
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, align: 'right' });
  
  useEffect(() => {
    if (pinnedNode && activeNodeData && containerRef.current && nodeRefs.current[pinnedNode]) {
      let rafId: number;
      const updatePos = () => {
         const el = nodeRefs.current[pinnedNode];
         if (!el || !containerRef.current) return;
         const rect = el.getBoundingClientRect();
         const containerRect = containerRef.current.getBoundingClientRect();
         
         const cx = rect.left - containerRect.left + rect.width / 2;
         const cy = rect.top - containerRect.top + rect.height / 2;
         
         let align = 'right';
         let px = cx + 32;
         
         // Flip if near right edge
         if (cx > containerRect.width * 0.6) {
            align = 'left';
            px = cx - 32;
         }

         setPopupPos({ x: px, y: cy, align });
         rafId = requestAnimationFrame(updatePos);
      };
      updatePos();
      return () => cancelAnimationFrame(rafId);
    }
  }, [pinnedNode, activeNodeData]);

  // BUILD RENDER QUEUE FOR PERFECT DEPTH SORTING
  const renderQueue: { yDepth: number, element: React.ReactNode }[] = [];
  
  // 1. Terrain slices
  terrain.forEach((t, i) => {
    // Opacity creates atmospheric depth fading towards horizon
    const depthRatio = (t.yDepth - (-700)) / (650 - (-700));
    let strokeOpacity = 0.05 + depthRatio * 0.2;
    
    // Highlight local terrain heavily if domain is active
    const fill = "#050505";
    if (activeNodeData && Math.abs(t.yDepth - activeNodeData.y) < 100) {
      strokeOpacity += 0.2;
    }
    
    renderQueue.push({
      yDepth: t.yDepth,
      element: (
        <path 
          key={`terrain-${i}`}
          d={t.d}
          fill={fill}
          stroke={`rgba(230, 225, 215, ${strokeOpacity})`}
          strokeWidth="0.8"
          className="topo-terrain transition-colors duration-500"
        />
      )
    });
  });

  // 2. Domain Labels
  domainsProj.forEach((d, i) => {
    renderQueue.push({
      yDepth: d.originalY,
      element: (
        <text
          key={`domain-${i}`}
          x={d.proj.x} y={d.proj.y - 40}
          fontSize="36"
          fill="var(--text-muted)"
          opacity="0.25"
          textAnchor="middle"
          className="font-display tracking-[0.2em] pointer-events-none uppercase no-pan domain-label font-bold"
        >
          {d.label.split('// ')[1]}
        </text>
      )
    });
  });

  // 3. Edges
  edgesProj.forEach((e, i) => {
    if (!e) return;
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
    
    let opacity = 0.05;
    let stroke = "var(--border)";
    let strokeWidth = 1;
    
    if (activeNode) {
      if (isDirectActive) {
        opacity = 0.9;
        stroke = "var(--text-primary)";
        strokeWidth = 2;
      } else if (isSecondActive) {
        opacity = 0.4;
        stroke = "var(--text-muted)";
      } else {
        opacity = 0.02;
      }
    } else if (activeDomain) {
      // Logic for domain lens
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
          className="constellation-line transition-all duration-300 pointer-events-none"
        />
      )
    });
  });

  // 4. Nodes
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
    
    const radius = isHub ? 8 : isCore ? 4 : 2;
    const fontSize = isHub ? 14 : isCore ? 10 : 8;

    renderQueue.push({
      yDepth: node.originalY,
      element: (
        <g
          key={`node-${i}`}
          ref={(el) => { nodeRefs.current[node.id] = el; }}
          className={`constellation-node transition-all duration-300 no-pan cursor-pointer`}
          transform={`translate(${node.proj.x}, ${node.proj.y})`}
          opacity={opacity}
          onMouseEnter={() => {
            if (!pinnedNode && !isDragging) {
              setHoveredNode(node.id);
            }
          }}
          onMouseLeave={() => {
            if (!pinnedNode) setHoveredNode(null);
          }}
          onClick={(e) => {
            if (isDragging) return;
            e.stopPropagation();
            
            // Path trace animation
            if (pinnedNode !== node.id) {
               gsap.fromTo(`.edge-${node.id}`, 
                 { strokeDashoffset: 1500, strokeDasharray: "1500 0" },
                 { strokeDashoffset: 0, duration: 1, ease: "power2.out" }
               );
            }
            
            setPinnedNode(pinnedNode === node.id ? null : node.id);
            setHoveredNode(null);
            
            if (pinnedNode !== node.id) {
              focusOn(node.proj.x, node.proj.y, 1.4);
            }
          }}
        >
          {/* Vertical Anchor Pin touching the terrain */}
          {isHub && <line x1="0" y1="0" x2="0" y2="15" stroke="var(--text-muted)" strokeWidth="1" opacity={isHovered ? 1 : 0.4} />}
          
          {/* Active Pulse Ring */}
          {isHovered && (
            <circle r={radius + 8} fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8" />
          )}
          
          <circle
            r={radius}
            fill={isHovered ? "var(--text-primary)" : "var(--background)"}
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
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
          >
            {node.label}
          </text>
        </g>
      )
    });
  });

  // Sort queue by depth
  renderQueue.sort((a, b) => a.yDepth - b.yDepth);

  return (
    <section className="relative bg-[#030303] overflow-hidden select-none h-[100vh] w-full flex flex-col" ref={containerRef}>
      
      {/* HUD Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-start w-full">
          <div className="max-w-sm">
            <h2 className="text-[10px] font-mono text-text-muted mb-4 tracking-widest uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent" />
              KNOWLEDGE LANDSCAPE
            </h2>
            <p className="text-xl font-light text-text-primary leading-tight mb-2 uppercase tracking-wide">
              A landscape of ideas.<br/>Connected by purpose.
            </p>
            <p className="text-xs font-light text-text-muted leading-relaxed hidden md:block">
              Explore the technologies, concepts and domains I work with — and how they intersect across projects, research and real-world experience.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative pointer-events-auto interactive-ui flex flex-col items-end">
            <div className="flex items-center border border-border bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2 rounded-sm shadow-2xl">
              <Search className="w-3.5 h-3.5 text-text-muted mr-2" />
              <input 
                type="text" 
                placeholder="SEARCH_SKILL /"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 1) {
                    setSearchResults(NODES.filter(n => n.label.toLowerCase().includes(e.target.value.toLowerCase())));
                  } else {
                    setSearchResults([]);
                  }
                }}
                className="bg-transparent border-none outline-none text-xs font-mono text-text-primary w-32 focus:w-48 transition-all placeholder:text-text-muted/40 uppercase tracking-widest"
              />
            </div>
            {searchQuery.length > 1 && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-[#0a0a0a]/95 border border-border backdrop-blur-xl flex flex-col max-h-64 overflow-y-auto z-50 rounded-sm">
                {searchResults.map(res => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setPinnedNode(res.id);
                      setSearchQuery("");
                      const n = nodesProj.find(x => x.id === res.id);
                      if (n) focusOn(n.proj.x, n.proj.y, 1.5);
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

        {/* Legend */}
        <div className="flex flex-col items-start gap-1 font-mono text-[9px] tracking-[0.2em] text-text-muted/60 uppercase absolute right-12 bottom-24 hidden lg:flex">
          <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-text-muted/40" /> HIGH ABSTRACTION</div>
          <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-accent" /></div>
          <div className="flex items-center gap-3"><div className="w-[1px] h-4 bg-text-muted/40" /> PRACTICAL APPLICATION</div>
        </div>
      </div>

      {/* Focus Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-[#111]/80 backdrop-blur-md px-5 py-2.5 border border-border font-mono text-[10px] tracking-widest text-text-muted rounded-full pointer-events-none flex items-center gap-3 shadow-2xl"
          >
            <MousePointer2 className="w-3 h-3 text-accent" />
            DRAG TO PAN | {isMac ? '⌘' : 'CTRL'} + SCROLL TO ZOOM
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topographic Viewport */}
      <div 
        className={`w-full flex-1 relative cursor-${isDragging ? 'grabbing' : 'grab'} perspective-[1000px] overflow-hidden`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={(e) => {
          if (!isDragging && !(e.target as Element).closest('.no-pan') && !(e.target as Element).closest('.interactive-ui')) {
            setPinnedNode(null);
          }
        }}
      >
        <div 
          ref={svgWrapperRef} 
          className="absolute inset-0 w-full h-full transform-style-3d origin-center"
        >
          <svg 
            ref={svgRef}
            width="100%" height="100%" 
            viewBox="-1200 -800 2400 1600" 
            preserveAspectRatio="xMidYMid slice" 
            className="absolute inset-0"
          >
            <g ref={worldRef} className="transform-origin-center">
              {renderQueue.map((item, i) => React.cloneElement(item.element as React.ReactElement, { key: `depth-${i}` }))}
            </g>
          </svg>
        </div>

        {/* DOMAIN LENSES (Filter Bar) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-4 px-6 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-border overflow-x-auto max-w-[90vw] no-scrollbar interactive-ui shadow-2xl rounded-sm">
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
                setActiveDomain(d.id); 
                setPinnedNode(null); 
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
          <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-border flex flex-col gap-1 p-1 shadow-2xl rounded-sm">
            <button onClick={() => { camera.current.z *= 1.2; clampCamera(); applyCamera(true); }} className="p-2.5 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
            <button onClick={() => { camera.current.z *= 0.8; clampCamera(); applyCamera(true); }} className="p-2.5 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
            <button onClick={resetCamera} className="p-2.5 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* HOVER PREVIEW (when not pinned) */}
        <AnimatePresence>
          {hoveredNode && !pinnedNode && detail && (
            <motion.div
              className="absolute bottom-28 left-6 z-40 bg-[#0a0a0a] border border-border p-4 shadow-2xl max-w-[280px] pointer-events-none hidden md:block rounded-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div className="font-mono text-[10px] text-accent tracking-widest mb-2 uppercase">{detail.title}</div>
              <p className="text-xs text-text-muted line-clamp-3">{detail.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARTOGRAPHIC CALLOUT (Pinned) */}
        <AnimatePresence>
          {pinnedNode && (
            <motion.div
              className={`absolute z-50 interactive-ui hidden md:flex flex-col drop-shadow-2xl ${popupPos.align === 'left' ? '-translate-x-full' : ''}`}
              style={{
                left: popupPos.x,
                top: popupPos.y,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
            >
              {/* Cartographic Line Connector */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-10 h-[1px] bg-border flex items-center ${popupPos.align === 'left' ? 'left-full flex-row-reverse' : 'right-full'}`}>
                <div className="w-1.5 h-1.5 bg-accent rounded-none absolute -left-[3px] border border-[#111]" />
              </div>

              <div className="w-[340px] bg-[#0a0a0a] backdrop-blur-xl border border-border p-6 flex flex-col relative rounded-sm shadow-2xl">
                <button 
                  onClick={() => setPinnedNode(null)}
                  className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-3 bg-accent" />
                  <span className="font-mono text-[9px] tracking-[0.15em] text-text-muted uppercase">
                    MK_ID // {activeNodeData?.id.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <h3 className="text-2xl font-display font-medium text-text-primary mb-1 uppercase tracking-tight">
                  {activeNodeData?.label}
                </h3>
                
                <div className="font-mono text-[10px] text-accent tracking-widest mb-6 uppercase">
                  {DOMAINS.find(d => d.id === activeNodeData?.domainId)?.label.split('// ')[1]}
                </div>
                
                {detail ? (
                  <>
                    <p className="text-text-muted text-[13px] font-light leading-relaxed mb-6">
                      {detail.description}
                    </p>
                    
                    <div className="border-t border-border/50 pt-5 mb-6">
                      <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase">Application Context</div>
                      <div className="flex flex-col gap-2">
                        {detail.usedIn.map((u, i) => {
                          if (u.href) {
                            const slug = u.href.split('/').pop();
                            const proj = getProject(slug || '');
                            return (
                              <Link 
                                key={i} 
                                href={proj ? `/work/${proj.slug}` : u.href} 
                                className="group flex items-center justify-between p-3 bg-surface border border-border hover:border-accent/50 transition-colors rounded-sm"
                              >
                                <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest">{u.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                              </Link>
                            );
                          }
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-[#111] border border-border/30 rounded-sm">
                              <div className="w-1 h-1 bg-text-muted rounded-full" />
                              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                                {u.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-text-muted text-xs font-light italic">
                      Active cartographic node.
                    </p>
                  </div>
                )}

                <div className="border-t border-border/50 pt-5">
                  <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase">Topology Ties</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(firstOrder).slice(0, 8).map(relId => {
                      const n = nodesProj.find(x => x.id === relId);
                      if (!n) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => {
                            setPinnedNode(relId);
                            focusOn(n.proj.x, n.proj.y, 1.4);
                          }}
                          className="px-2.5 py-1.5 font-mono text-[9px] tracking-[0.1em] border border-transparent bg-surface text-text-muted hover:border-border hover:text-text-primary transition-colors cursor-pointer rounded-sm"
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

      </div>
    </section>
  );
};
