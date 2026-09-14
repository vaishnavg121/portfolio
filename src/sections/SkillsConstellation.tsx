"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { NODES, CONNECTIONS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";

export const SkillsConstellation = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0, align: 'right' });
  const containerRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<{ [key: string]: SVGGElement | null }>({});

  const activeNode = pinnedNode || hoveredNode;

  const updatePopoverPosition = (nodeId: string) => {
    const el = nodeRefs.current[nodeId];
    if (!el || !containerRef.current) return;
    
    const nodeRect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const centerX = nodeRect.left - containerRect.left + nodeRect.width / 2;
    const centerY = nodeRect.top - containerRect.top + nodeRect.height / 2;
    
    let align = 'right';
    let posX = centerX + 20;
    
    // Simple boundary check
    if (centerX > containerRect.width * 0.6) {
      align = 'left';
      posX = centerX - 20;
    }

    setPopoverPos({
      x: posX,
      y: centerY,
      align
    });
  };

  useEffect(() => {
    if (activeNode && SKILL_DETAILS[activeNode]) {
      updatePopoverPosition(activeNode);
    }
  }, [activeNode]);

  useGSAP(() => {
    // Animate lines
    gsap.fromTo('.constellation-line',
      { strokeDasharray: "0 100" },
      {
        strokeDasharray: "100 0",
        duration: 2,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        }
      }
    );

    // Animate nodes expanding outward from center
    gsap.fromTo('.constellation-node',
      { scale: 0.8, opacity: 0, x: 50, y: 50, transformOrigin: "center" },
      {
        scale: 1,
        opacity: 1,
        x: (index, target) => target.getAttribute('data-x'),
        y: (index, target) => target.getAttribute('data-y'),
        stagger: 0.03,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        }
      }
    );
    
    // Animate labels last
    gsap.fromTo('.constellation-label',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        delay: 1,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
        }
      }
    );
  }, { scope: containerRef });

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Unpin if clicking outside any interactive node and outside the popover
      const target = e.target as HTMLElement;
      if (!target.closest('.constellation-node') && !target.closest('.skill-popover')) {
        setPinnedNode(null);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinnedNode(null);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  };

  const activeConnections = activeNode ? getConnectedNodes(activeNode) : new Set();
  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;

  return (
    <section className="py-32 relative bg-background border-t border-border overflow-x-clip" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-2xl mb-16">
          <h2 className="text-sm font-mono text-text-muted mb-4 tracking-widest uppercase">
            Knowledge Graph
          </h2>
          <p className="text-2xl md:text-3xl font-light text-text-primary leading-tight">
            Domains of interest and their intersections.
          </p>
        </div>
      </div>

      <div className="w-full min-h-[75vh] md:min-h-[85vh] relative mt-12 cursor-crosshair" data-cursor="VIEW">
        <svg width="100%" height="100%" viewBox="-15 -15 130 130" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 overflow-visible">
          {/* Draw all connections first */}
          {CONNECTIONS.map(([a, b], idx) => {
            const nodeA = NODES.find(n => n.id === a);
            const nodeB = NODES.find(n => n.id === b);
            if (!nodeA || !nodeB) return null;

            const isActive = activeNode === a || activeNode === b;
            const isFaded = activeNode && !isActive;

            return (
              <motion.line
                key={`line-${idx}`}
                className="constellation-line"
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke={isActive ? "var(--accent)" : "var(--border)"}
                strokeWidth={isActive ? 0.3 : 0.1}
                opacity={isFaded ? 0.2 : isActive ? 1 : 0.5}
                animate={{
                  opacity: isFaded ? 0.2 : isActive ? 1 : 0.5,
                  strokeWidth: isActive ? 0.3 : 0.1
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Draw nodes */}
          {NODES.map((node) => {
            const isHovered = activeNode === node.id;
            const isConnected = activeConnections.has(node.id);
            const isFaded = activeNode && !isHovered && !isConnected;
            const hasDetail = !!SKILL_DETAILS[node.id];

            return (
              <g
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                className={`constellation-node transition-all duration-300 ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
                data-x={node.x}
                data-y={node.y}
                onMouseEnter={(e) => {
                  if (hasDetail && !pinnedNode) {
                    setHoveredNode(node.id);
                  }
                  if (!pinnedNode) {
                     const target = e.currentTarget as unknown as HTMLElement;
                     window.dispatchEvent(new CustomEvent("companionInteract", { 
                       detail: { type: "anchor-hover", target }
                     }));
                  }
                }}
                onMouseLeave={() => {
                  if (!pinnedNode) {
                    setHoveredNode(null);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasDetail) {
                    setPinnedNode(pinnedNode === node.id ? null : node.id);
                    setHoveredNode(null);
                  }
                }}
              >
                <motion.circle
                  cx={0}
                  cy={0}
                  r={isHovered ? 2.5 : 1}
                  fill={isHovered || isConnected ? "var(--accent)" : "var(--text-muted)"}
                  opacity={isFaded ? 0.4 : 1}
                  animate={{
                    r: isHovered ? 2.5 : 1,
                    opacity: isFaded ? 0.4 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.text
                  x={node.x > 50 ? -2 : 2}
                  y={node.y > 50 ? -2 : 2}
                  fontSize="1.5"
                  fill={isHovered || isConnected ? "var(--text-primary)" : "var(--text-muted)"}
                  textAnchor={node.x > 50 ? "end" : "start"}
                  opacity={isFaded ? 0.4 : isHovered ? 1 : 0.7}
                  className="constellation-label font-mono tracking-wider select-none pointer-events-none"
                  animate={{
                    opacity: isFaded ? 0.4 : isHovered ? 1 : 0.7,
                    fontWeight: isHovered ? 700 : 400
                  }}
                >
                  {node.label}
                </motion.text>
              </g>
            );
          })}
        </svg>

        {/* POPOVER OVERLAY */}
        <AnimatePresence>
          {detail && (
            <motion.div
              className={`skill-popover absolute z-50 bg-[#0a0a0a]/95 backdrop-blur-md border border-white/10 p-5 shadow-2xl max-w-sm hidden md:block ${popoverPos.align === 'left' ? '-translate-x-full' : ''}`}
              style={{
                left: popoverPos.x,
                top: popoverPos.y,
              }}
              initial={{ opacity: 0, y: 8, clipPath: 'inset(10% 0 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-accent" />
                <span className="font-mono text-xs tracking-widest text-text-muted">
                  {detail.id.toUpperCase()} {"//"} {pinnedNode === detail.id ? 'PINNED' : 'ACTIVE'}
                </span>
              </div>
              <h3 className="font-mono text-sm tracking-widest text-text-primary mb-4 uppercase">
                {detail.title}
              </h3>
              <p className="text-text-muted text-sm font-light leading-relaxed mb-4">
                {detail.description}
              </p>
              
              <div className="border-t border-white/5 pt-3 mt-3">
                <div className="font-mono text-[10px] text-text-muted tracking-widest mb-2">USED IN</div>
                <div className="flex flex-wrap gap-2">
                  {detail.usedIn.map((u, i) => (
                    u.href ? (
                      <Link 
                        key={i} 
                        href={u.href} 
                        className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:text-white transition-colors"
                      >
                        {u.label} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span key={i} className="font-mono text-xs text-text-muted uppercase">
                        {u.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE BOTTOM SHEET */}
        <AnimatePresence>
          {detail && (
            <motion.div
              className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0a] border-t border-border p-6 shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            >
              <button 
                onClick={() => { setPinnedNode(null); setHoveredNode(null); }}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-accent" />
                <span className="font-mono text-xs tracking-widest text-text-muted">
                  {detail.id.toUpperCase()}
                </span>
              </div>
              <h3 className="font-mono text-sm tracking-widest text-text-primary mb-4 uppercase">
                {detail.title}
              </h3>
              <p className="text-text-muted text-sm font-light leading-relaxed mb-6">
                {detail.description}
              </p>
              
              <div className="border-t border-white/5 pt-4">
                <div className="font-mono text-[10px] text-text-muted tracking-widest mb-3">USED IN</div>
                <div className="flex flex-col gap-3">
                  {detail.usedIn.map((u, i) => (
                    u.href ? (
                      <Link 
                        key={i} 
                        href={u.href} 
                        className="inline-flex items-center justify-between w-full p-3 bg-surface border border-border font-mono text-xs text-accent hover:text-white transition-colors"
                      >
                        {u.label} <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span key={i} className="inline-flex w-full p-3 bg-[#111] border border-white/5 font-mono text-xs text-text-muted uppercase">
                        {u.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
