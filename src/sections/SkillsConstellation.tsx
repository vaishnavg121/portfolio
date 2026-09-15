"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});
  
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const camera = useRef({ x: 0, y: 0, z: 0.9 });
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
      gsap.to('.minimap-view', { x: -x * 0.1, y: -y * 0.1, scale: 1/z, duration, ease: "power3.inOut" });
    } else {
      gsap.set(worldRef.current, { x, y, scale: z });
      gsap.set('.minimap-view', { x: -x * 0.1, y: -y * 0.1, scale: 1/z });
    }
  }, []);

  const clampCamera = useCallback(() => {
    const minZ = 0.65;
    const maxZ = 2.5;
    camera.current.z = Math.max(minZ, Math.min(maxZ, camera.current.z));
    const limitX = 1500 * camera.current.z;
    const limitY = 1500 * camera.current.z;
    camera.current.x = Math.max(-limitX, Math.min(limitX, camera.current.x));
    camera.current.y = Math.max(-limitY, Math.min(limitY, camera.current.y));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Only intercept if Ctrl or Meta is held
    if (!e.ctrlKey && !e.metaKey) {
      return; 
    }
    
    e.preventDefault(); 
    setShowHint(false);
    
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
    setShowHint(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };

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
    setTimeout(() => {
       setIsDragging(false);
       setShowHint(false);
    }, 50);
  };

  const focusOn = useCallback((x: number, y: number, z: number) => {
    camera.current = { x: -x * z, y: -y * z, z };
    clampCamera();
    applyCamera(true, 0.8);
  }, [applyCamera, clampCamera]);

  const resetCamera = useCallback(() => {
    setActiveDomain(null);
    setPinnedNode(null);
    camera.current = { x: 0, y: 0, z: 0.9 };
    applyCamera(true, 1.2);
  }, [applyCamera]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinnedNode(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useGSAP(() => {
    gsap.set(worldRef.current, { scale: 0.5, opacity: 0 });
    gsap.to(worldRef.current, { scale: 0.9, opacity: 1, duration: 1.5, ease: "power3.out", onComplete: () => {
      camera.current.z = 0.9;
      applyCamera(false);
    }});
    
    gsap.fromTo('.constellation-line',
      { strokeDasharray: "0 1500", opacity: 0 },
      {
        strokeDasharray: "1500 0",
        opacity: (i, target) => parseFloat(target.dataset.opacity || "0.15"),
        duration: 2,
        delay: 0.5,
        ease: "power2.out"
      }
    );
    
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

  // Popup Positioning Logic
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, align: 'right' });
  
  useEffect(() => {
    if (pinnedNode && activeNodeData && containerRef.current && nodeRefs.current[pinnedNode]) {
      // Create a fast RAF loop to track the node position while camera moves
      let rafId: number;
      const updatePos = () => {
         const el = nodeRefs.current[pinnedNode];
         if (!el || !containerRef.current) return;
         const rect = el.getBoundingClientRect();
         const containerRect = containerRef.current.getBoundingClientRect();
         
         // Center of node relative to container
         const cx = rect.left - containerRect.left + rect.width / 2;
         const cy = rect.top - containerRect.top + rect.height / 2;
         
         let align = 'right';
         let px = cx + 24;
         if (cx > containerRect.width * 0.6) {
            align = 'left';
            px = cx - 24;
         }

         setPopupPos({ x: px, y: cy, align });
         rafId = requestAnimationFrame(updatePos);
      };
      updatePos();
      return () => cancelAnimationFrame(rafId);
    }
  }, [pinnedNode, activeNodeData]);

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
        <p className="text-sm font-light text-text-muted leading-relaxed hidden md:block">
          A living map of the technologies, concepts and domains I work with — and how they connect across projects, research and engineering.
        </p>
      </div>

      {/* Focus Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 right-12 z-40 bg-[#111]/80 backdrop-blur-md px-4 py-2 border border-border font-mono text-[10px] tracking-widest text-text-muted rounded-full pointer-events-none"
          >
            DRAG TO PAN | {isMac ? '⌘' : 'CTRL'} + SCROLL TO ZOOM
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <div 
        className={`w-full min-h-[80vh] md:min-h-[90vh] relative cursor-${isDragging ? 'grabbing' : 'grab'}`}
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
              >
                {d.label}
              </text>
            ))}

            {/* Edges */}
            {CONNECTIONS.map(([a, b], idx) => {
              const nodeA = NODES.find(n => n.id === a);
              const nodeB = NODES.find(n => n.id === b);
              if (!nodeA || !nodeB) return null;

              const isDirectActive = activeNode && (
                 (activeNode === a && firstOrder.has(b)) || 
                 (activeNode === b && firstOrder.has(a))
              );
              
              const isSecondActive = activeNode && !isDirectActive && (
                 (firstOrder.has(a) && secondOrder.has(b)) || 
                 (firstOrder.has(b) && secondOrder.has(a)) ||
                 (firstOrder.has(a) && firstOrder.has(b))
              );

              const isDomainActive = activeDomain && (nodeA.domainId === activeDomain || nodeB.domainId === activeDomain);
              
              let opacity = 0.15;
              let stroke = "var(--border)";
              let strokeWidth = 1;
              
              if (activeNode) {
                if (isDirectActive) {
                  opacity = 0.9;
                  stroke = "var(--text-primary)";
                  strokeWidth = 2;
                } else if (isSecondActive) {
                  opacity = 0.3;
                  stroke = "var(--text-muted)";
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
                  data-opacity={opacity}
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
              const isFirstOrder = firstOrder.has(node.id);
              const isSecondOrder = secondOrder.has(node.id);
              const inActiveDomain = activeDomain === node.domainId;
              
              let opacity = 1;
              if (activeNode) {
                opacity = isHovered ? 1 : isFirstOrder ? 0.85 : isSecondOrder ? 0.45 : 0.2;
              } else if (activeDomain) {
                opacity = inActiveDomain ? 1 : 0.2;
              }

              
              const isHub = node.level === 'A';
              const isCore = node.level === 'B';
              
              const radius = isHub ? 12 : isCore ? 8 : 5;
              const fontSize = isHub ? 14 : isCore ? 10 : 8;

              return (
                <g
                  key={node.id}
                  ref={(el) => { nodeRefs.current[node.id] = el; }}
                  className={`constellation-node transition-all duration-300 no-pan cursor-pointer`}
                  transform={`translate(${node.x}, ${node.y})`}
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
                    
                    setPinnedNode(pinnedNode === node.id ? null : node.id);
                    setHoveredNode(null);
                    
                    if (pinnedNode !== node.id) {
                      focusOn(node.x, node.y, 1.2);
                    }
                  }}
                >
                  {/* Halo */}
                  {isHovered && (
                    <circle r={radius + 8} fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" />
                  )}
                  
                  {/* Core */}
                  <circle
                    r={radius}
                    fill={isHovered ? "var(--text-primary)" : "var(--background)"}
                    stroke={isHovered ? "var(--accent)" : isFirstOrder ? "var(--text-primary)" : "var(--text-muted)"}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Label */}
                  <text
                    x={isHub ? 0 : (node.x > 0 ? radius + 6 : -(radius + 6))}
                    y={isHub ? radius + 18 : 3}
                    fontSize={fontSize}
                    fill={isHovered ? "var(--text-primary)" : isFirstOrder ? "var(--text-primary)" : "var(--text-muted)"}
                    textAnchor={isHub ? "middle" : (node.x > 0 ? "start" : "end")}
                    className={`font-mono tracking-wider pointer-events-none transition-colors duration-300 ${isHub || isHovered ? 'font-bold' : ''}`}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-4 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border border-border rounded-full overflow-x-auto max-w-[90vw] no-scrollbar interactive-ui">
          <button 
            onClick={() => resetCamera()}
            className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${!activeDomain && !activeNode ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            ALL
          </button>
          {DOMAINS.map(d => (
            <button 
              key={d.id}
              onClick={() => { setActiveDomain(d.id); setPinnedNode(null); focusOn(d.x, d.y, 1.0); }}
              className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              {d.label.split('// ')[1]}
            </button>
          ))}
        </div>

        {/* CONTROLS & MINIMAP */}
        <div className="absolute bottom-6 left-6 z-30 hidden md:flex items-end gap-4 interactive-ui">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-border flex flex-col gap-1 p-1">
            <button onClick={() => { camera.current.z *= 1.2; clampCamera(); applyCamera(true); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-4 h-4" /></button>
            <button onClick={() => { camera.current.z *= 0.8; clampCamera(); applyCamera(true); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-4 h-4" /></button>
            <button onClick={resetCamera} className="p-2 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-4 h-4" /></button>
          </div>
          
          <div className="w-24 h-16 bg-[#050505] border border-border relative overflow-hidden opacity-40 hover:opacity-100 transition-opacity cursor-pointer" onClick={resetCamera}>
            <svg width="100%" height="100%" viewBox="-750 -500 1500 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
               {NODES.map(n => (
                 <circle key={n.id} cx={n.x} cy={n.y} r={15} fill={activeNode === n.id ? "var(--accent)" : "var(--text-muted)"} opacity={n.level === 'A' ? 0.8 : 0.3} />
               ))}
            </svg>
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

        {/* CONTEXTUAL POPUP DOSSIER (Pinned) */}
        <AnimatePresence>
          {pinnedNode && (
            <motion.div
              className={`absolute z-50 interactive-ui hidden md:flex flex-col shadow-2xl ${popupPos.align === 'left' ? '-translate-x-full' : ''}`}
              style={{
                left: popupPos.x,
                top: popupPos.y,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
            >
              {/* Connector line graphic */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-[1px] bg-border flex items-center ${popupPos.align === 'left' ? 'left-full flex-row-reverse' : 'right-full'}`}>
                <div className="w-1 h-1 bg-accent rounded-full absolute -left-[2px]" />
              </div>

              <div className="w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-border p-6 flex flex-col relative">
                <button 
                  onClick={() => setPinnedNode(null)}
                  className="absolute top-4 right-4 p-1 text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span className="font-mono text-[10px] tracking-widest text-text-muted uppercase">
                    {activeNodeData?.id.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-display font-medium text-text-primary mb-1 uppercase">
                  {activeNodeData?.label}
                </h3>
                
                <div className="font-mono text-[10px] text-accent tracking-widest mb-4 uppercase">
                  {DOMAINS.find(d => d.id === activeNodeData?.domainId)?.label.split('// ')[1]}
                </div>
                
                {detail ? (
                  <>
                    <p className="text-text-muted text-xs font-light leading-relaxed mb-6">
                      {detail.description}
                    </p>
                    
                    <div className="border-t border-white/5 pt-4 mb-6">
                      <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3">USED IN</div>
                      <div className="flex flex-col gap-2">
                        {detail.usedIn.map((u, i) => {
                          if (u.href) {
                            const slug = u.href.split('/').pop();
                            const proj = getProject(slug || '');
                            return (
                              <Link 
                                key={i} 
                                href={proj ? `/work/${proj.slug}` : u.href} 
                                className="group flex items-center justify-between p-2.5 bg-surface border border-border hover:border-accent transition-colors"
                              >
                                <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest">{u.label}</span>
                                <ArrowUpRight className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors" />
                              </Link>
                            );
                          }
                          return (
                            <div key={i} className="flex items-center gap-2 p-2.5 bg-[#111] border border-white/5">
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
                      Active connection node.
                    </p>
                  </div>
                )}

                <div className="border-t border-white/5 pt-4">
                  <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3">CONNECTED TO</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(firstOrder).slice(0, 8).map(relId => {
                      const n = NODES.find(x => x.id === relId);
                      if (!n) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => {
                            setPinnedNode(relId);
                            focusOn(n.x, n.y, 1.2);
                          }}
                          className="px-2 py-1 font-mono text-[9px] tracking-widest border border-transparent bg-surface text-text-muted hover:border-border hover:text-text-primary transition-colors cursor-pointer"
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
