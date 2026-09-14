"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence,  } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  
  // Interaction states
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Camera state (Refs for performance, not React state)
  const camera = useRef({ x: 0, y: 0, z: 1 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const activeNode = pinnedNode || hoveredNode;
  
  // Update transform without React render
  const applyCamera = (animate = false, duration = 0.5) => {
    if (!worldRef.current) return;
    const { x, y, z } = camera.current;
    if (animate) {
      gsap.to(worldRef.current, { x, y, scale: z, duration, ease: "power3.inOut" });
      // Also update minimap indicator
      gsap.to('.minimap-view', { x: -x * 0.1, y: -y * 0.1, scale: 1/z, duration, ease: "power3.inOut" });
    } else {
      gsap.set(worldRef.current, { x, y, scale: z });
      gsap.set('.minimap-view', { x: -x * 0.1, y: -y * 0.1, scale: 1/z });
    }
  };

  const clampCamera = () => {
    const minZ = 0.5;
    const maxZ = 2.5;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    // Soft clamp limits
    const limitX = 1500 * camera.current.z;
    const limitY = 1500 * camera.current.z;
    camera.current.x = Math.max(-limitX, Math.min(limitX, camera.current.x));
    camera.current.y = Math.max(-limitY, Math.min(limitY, camera.current.y));
  };

  // Zoom logic
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault(); // Stop page scroll
    
    // Zoom around cursor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    // Pointer position relative to SVG center (our 0,0 is center of viewBox if we set it up that way)
    // Actually, viewBox is e.g. -500 -500 1000 1000
    // Let's get logical coordinates
    const pt = svgRef.current!.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());

    // svgP is the coordinate in the unscaled SVG viewBox. 
    // We want to scale around svgP.
    
    // xs, ys is distance from pointer to current camera position (in world space)
    const xs = (svgP.x - camera.current.x) / camera.current.z;
    const ys = (svgP.y - camera.current.y) / camera.current.z;

    
    camera.current.z *= zoomFactor;
    clampCamera();

    // Adjust camera x/y so pointer stays in same world position
    camera.current.x = svgP.x - xs * camera.current.z;
    camera.current.y = svgP.y - ys * camera.current.z;

    applyCamera(false);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Pan logic
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('.no-pan')) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    // kill any active camera tweens
    gsap.killTweensOf(worldRef.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    
    // Calculate SVG coordinate delta
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };

    // Approximation of pixel-to-SVG unit mapping
    // Since viewBox is e.g. 1500 wide, and window might be 1500 wide...
    // Let's use a scale factor
    const svgRect = svgRef.current!.getBoundingClientRect();
    const viewBoxWidth = 1500;
    const ratio = viewBoxWidth / svgRect.width;

    camera.current.x += dx * ratio;
    camera.current.y += dy * ratio;
    
    clampCamera();
    applyCamera(false);
  };

  const onPointerUp = () => {
    isPanning.current = false;
    setTimeout(() => setIsDragging(false), 50); // slight delay to prevent click firing
  };

  // Camera Focus
  const focusOn = (x: number, y: number, z: number) => {
    camera.current = { x: -x * z, y: -y * z, z };
    clampCamera();
    applyCamera(true, 0.8);
  };

  const resetCamera = () => {
    setActiveDomain(null);
    setPinnedNode(null);
    camera.current = { x: 0, y: 0, z: 0.9 };
    applyCamera(true, 1.2);
  };

  useGSAP(() => {
    // Authored entry animation
    gsap.set(worldRef.current, { scale: 0.5, opacity: 0 });
    gsap.to(worldRef.current, { scale: 0.9, opacity: 1, duration: 1.5, ease: "power3.out", onComplete: () => {
      camera.current.z = 0.9;
      applyCamera(false);
    }});
    
    // Animate lines drawing
    gsap.fromTo('.constellation-line',
      { strokeDasharray: "0 1500", opacity: 0 },
      {
        strokeDasharray: "1500 0",
        opacity: (i, target) => target.dataset.defaultOpacity || 0.15,
        duration: 2,
        delay: 0.5,
        ease: "power2.out"
      }
    );
    
    // Animate nodes resolving
    gsap.fromTo('.constellation-node',
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.01,
        delay: 0.8,
        ease: "back.out(1.2)"
      }
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

  const activeConnections = activeNode ? getConnectedNodes(activeNode) : new Set<string>();
  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;

  // Resolve projects
  const getProject = (slug: string) => projects.find(p => p.slug === slug);

  return (
    <section className="relative bg-background border-t border-border overflow-hidden select-none" ref={containerRef}>
      
      {/* Intro Copy */}
      <div className="absolute top-12 left-6 md:top-24 md:left-12 z-20 pointer-events-none max-w-sm">
        <h2 className="text-xs font-mono text-text-muted mb-4 tracking-widest uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-accent" />
          Knowledge Graph
        </h2>
        <p className="text-xl font-light text-text-primary leading-relaxed mb-4">
          Domains of interest and their intersections.
        </p>
        <p className="text-sm font-light text-text-muted leading-relaxed">
          A living map of the technologies, concepts and domains I work with — and how they connect across projects, research and engineering.
        </p>
        <div className="mt-8 font-mono text-[10px] text-text-muted uppercase tracking-widest opacity-60">
          Scroll to Zoom // Drag to Pan // Click to Pin
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        className={`w-full min-h-[80vh] md:min-h-[90vh] relative cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg 
          ref={svgRef}
          width="100%" height="100%" 
          viewBox="-750 -500 1500 1000" 
          preserveAspectRatio="xMidYMid slice" 
          className="absolute inset-0"
        >
          <g ref={worldRef} className="transform-origin-center">
            
            {/* Domain Background Labels */}
            {DOMAINS.map(d => (
              <text
                key={d.id}
                x={d.x} y={d.y - 120}
                fontSize="24"
                fill="var(--text-muted)"
                opacity="0.1"
                textAnchor="middle"
                className="font-mono tracking-widest pointer-events-none uppercase no-pan"
                onClick={() => {
                   setActiveDomain(d.id);
                   focusOn(d.x, d.y, 1.2);
                }}
              >
                {d.label}
              </text>
            ))}

            {/* Edges */}
            {CONNECTIONS.map(([a, b], idx) => {
              const nodeA = NODES.find(n => n.id === a);
              const nodeB = NODES.find(n => n.id === b);
              if (!nodeA || !nodeB) return null;

              const isDirectActive = activeNode === a || activeNode === b;
              const isDomainActive = activeDomain && (nodeA.domainId === activeDomain || nodeB.domainId === activeDomain);
              
              // Edge visibility logic
              let opacity = 0.15;
              let stroke = "var(--border)";
              let strokeWidth = 1;
              
              if (activeNode) {
                if (isDirectActive) {
                  opacity = 0.8;
                  stroke = "var(--accent)";
                  strokeWidth = 2;
                } else {
                  opacity = 0.05;
                }
              } else if (activeDomain) {
                if (isDomainActive) {
                  opacity = 0.4;
                  stroke = "var(--text-muted)";
                } else {
                  opacity = 0.05;
                }
              }

              return (
                <line
                  key={`line-${idx}`}
                  className="constellation-line transition-all duration-300"
                  data-default-opacity={0.15}
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const isHovered = activeNode === node.id;
              const isConnected = activeConnections.has(node.id);
              const inActiveDomain = activeDomain === node.domainId;
              
              let opacity = 1;
              if (activeNode) {
                opacity = (isHovered || isConnected) ? 1 : 0.3;
              } else if (activeDomain) {
                opacity = inActiveDomain ? 1 : 0.3;
              }

              const hasDetail = !!SKILL_DETAILS[node.id];
              const isHub = node.level === 'A';
              const isCore = node.level === 'B';
              
              const radius = isHub ? 12 : isCore ? 8 : 5;
              const fontSize = isHub ? 14 : isCore ? 10 : 8;

              return (
                <g
                  key={node.id}
                  className={`constellation-node transition-all duration-300 no-pan ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={opacity}
                  onMouseEnter={() => {
                    if (hasDetail && !pinnedNode && !isDragging) {
                      setHoveredNode(node.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!pinnedNode) setHoveredNode(null);
                  }}
                  onClick={(e) => {
                    if (isDragging) return;
                    e.stopPropagation();
                    if (hasDetail) {
                      setPinnedNode(pinnedNode === node.id ? null : node.id);
                      setHoveredNode(null);
                      if (pinnedNode !== node.id) {
                         focusOn(node.x, node.y, 1.5);
                      }
                    } else if (isHub) {
                       focusOn(node.x, node.y, 1.2);
                    }
                  }}
                >
                  {/* Halo */}
                  {isHovered && (
                    <circle r={radius + 8} fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
                  )}
                  
                  {/* Core */}
                  <circle
                    r={radius}
                    fill={isHovered ? "var(--text-primary)" : "var(--background)"}
                    stroke={isHovered || isConnected ? "var(--accent)" : "var(--text-muted)"}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Label */}
                  <text
                    x={isHub ? 0 : (node.x > 0 ? radius + 6 : -(radius + 6))}
                    y={isHub ? radius + 18 : 3}
                    fontSize={fontSize}
                    fill={isHovered ? "var(--text-primary)" : "var(--text-muted)"}
                    textAnchor={isHub ? "middle" : (node.x > 0 ? "start" : "end")}
                    className={`font-mono tracking-wider pointer-events-none transition-colors duration-300 ${isHub ? 'font-bold' : ''}`}
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* DOMAIN FILTER BAR */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-4 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border border-border rounded-full overflow-x-auto max-w-[90vw] no-scrollbar">
          <button 
            onClick={() => resetCamera()}
            className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${!activeDomain ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            ALL
          </button>
          {DOMAINS.map(d => (
            <button 
              key={d.id}
              onClick={() => { setActiveDomain(d.id); focusOn(d.x, d.y, 1.2); }}
              className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              {d.label.split('// ')[1]}
            </button>
          ))}
        </div>

        {/* CONTROLS & MINIMAP */}
        <div className="absolute bottom-6 left-6 z-30 hidden md:flex items-end gap-4">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-border p-2 flex flex-col gap-2">
            <button onClick={() => focusOn(0, 0, camera.current.z * 1.2)} className="p-2 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-4 h-4" /></button>
            <button onClick={() => focusOn(0, 0, camera.current.z * 0.8)} className="p-2 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-4 h-4" /></button>
            <button onClick={resetCamera} className="p-2 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-4 h-4" /></button>
          </div>
          
          <div className="w-32 h-24 bg-[#050505] border border-border relative overflow-hidden opacity-50 hover:opacity-100 transition-opacity">
            {/* Tiny Map */}
            <svg width="100%" height="100%" viewBox="-750 -500 1500 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
               {NODES.map(n => (
                 <circle key={n.id} cx={n.x} cy={n.y} r={15} fill="var(--text-muted)" opacity={n.level === 'A' ? 0.8 : 0.3} />
               ))}
            </svg>
            {/* Viewport Indicator */}
            <div className="minimap-view absolute border border-accent bg-accent/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full transform-origin-center pointer-events-none" />
          </div>
        </div>

        {/* HOVER PREVIEW (when not pinned) */}
        <AnimatePresence>
          {hoveredNode && !pinnedNode && detail && (
            <motion.div
              className="absolute bottom-24 left-6 z-40 bg-[#0a0a0a] border border-border p-4 shadow-2xl max-w-[280px] pointer-events-none hidden md:block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div className="font-mono text-[10px] text-accent tracking-widest mb-2">{detail.title}</div>
              <p className="text-xs text-text-muted line-clamp-3">{detail.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL DOSSIER (Pinned) */}
        <AnimatePresence>
          {pinnedNode && detail && (
            <motion.div
              className="absolute top-0 right-0 h-full w-full md:w-[400px] z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <button 
                  onClick={() => setPinnedNode(null)}
                  className="absolute top-6 right-6 p-2 text-text-muted hover:text-white"
                >
                  ✕
                </button>
                
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span className="font-mono text-xs tracking-widest text-text-muted">
                    {detail.id.toUpperCase()} {"//"} ACTIVE
                  </span>
                </div>
                
                <h3 className="text-3xl font-display font-medium text-text-primary mb-2 uppercase">
                  {NODES.find(n => n.id === detail.id)?.label}
                </h3>
                <div className="font-mono text-xs text-accent tracking-widest mb-8 uppercase">
                  {DOMAINS.find(d => d.id === NODES.find(n => n.id === detail.id)?.domainId)?.label.split('// ')[1]}
                </div>
                
                <p className="text-text-muted text-base font-light leading-relaxed mb-12">
                  {detail.description}
                </p>
                
                <div className="border-t border-white/5 pt-8 mb-12">
                  <div className="font-mono text-[10px] text-text-muted tracking-widest mb-6">USED IN</div>
                  <div className="flex flex-col gap-3">
                    {detail.usedIn.map((u, i) => {
                      if (u.href) {
                        // Attempt to lookup canonical project to verify
                        const slug = u.href.split('/').pop();
                        const proj = getProject(slug || '');
                        
                        return (
                          <Link 
                            key={i} 
                            href={proj ? `/work/${proj.slug}` : u.href} 
                            className="group flex items-center justify-between p-4 bg-surface border border-border hover:border-accent transition-colors"
                          >
                            <span className="font-mono text-xs text-text-primary uppercase tracking-widest">{u.label}</span>
                            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                          </Link>
                        );
                      }
                      return (
                        <div key={i} className="flex items-center gap-3 p-4 bg-[#111] border border-white/5">
                          <div className="w-1 h-1 bg-text-muted rounded-full" />
                          <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
                            {u.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-8">
                  <div className="font-mono text-[10px] text-text-muted tracking-widest mb-6">RELATED SKILLS</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(activeConnections).map(relId => {
                      const n = NODES.find(x => x.id === relId);
                      if (!n) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => {
                            if (SKILL_DETAILS[relId]) {
                              setPinnedNode(relId);
                              focusOn(n.x, n.y, 1.5);
                            } else {
                              focusOn(n.x, n.y, 1.5);
                            }
                          }}
                          className={`px-3 py-1.5 font-mono text-xs tracking-widest border transition-colors ${SKILL_DETAILS[relId] ? 'border-border text-text-primary hover:border-text-muted cursor-pointer' : 'border-transparent bg-surface text-text-muted cursor-default'}`}
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
