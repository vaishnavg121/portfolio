"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { NODES, CONNECTIONS } from "@/lib/skills_data";

export const SkillsConstellation = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

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

  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  };

  const activeConnections = hoveredNode ? getConnectedNodes(hoveredNode) : new Set();

  return (
    <section className="py-32 relative bg-background border-t border-border overflow-hidden" ref={containerRef}>
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

      <div className="w-full h-[60vh] min-h-[400px] relative mt-12 cursor-crosshair" data-cursor="VIEW">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
          {/* Draw all connections first */}
          {CONNECTIONS.map(([a, b], idx) => {
            const nodeA = NODES.find(n => n.id === a);
            const nodeB = NODES.find(n => n.id === b);
            if (!nodeA || !nodeB) return null;

            const isActive = hoveredNode === a || hoveredNode === b;
            const isFaded = hoveredNode && !isActive;

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
            const isHovered = hoveredNode === node.id;
            const isConnected = activeConnections.has(node.id);
            const isFaded = hoveredNode && !isHovered && !isConnected;

            return (
              <g
                key={node.id}
                className="constellation-node cursor-pointer transition-all duration-300"
                data-x={node.x}
                data-y={node.y}
                onMouseEnter={(e) => {
                  setHoveredNode(node.id);
                  const target = e.currentTarget as unknown as HTMLElement;
                  window.dispatchEvent(new CustomEvent("companionInteract", { 
                    detail: { type: "anchor-hover", target }
                  }));
                }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <motion.circle
                  cx={0}
                  cy={0}
                  r={isHovered ? 2 : 1}
                  fill={isHovered || isConnected ? "var(--accent)" : "var(--text-muted)"}
                  opacity={isFaded ? 0.4 : 1}
                  animate={{
                    r: isHovered ? 2 : 1,
                    opacity: isFaded ? 0.4 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.text
                  x={0}
                  y={-2}
                  fontSize="1.5"
                  fill={isHovered || isConnected ? "var(--text-primary)" : "var(--text-muted)"}
                  textAnchor="middle"
                  opacity={isFaded ? 0.4 : isHovered ? 1 : 0.7}
                  className="constellation-label font-mono tracking-wider select-none pointer-events-none"
                  animate={{
                    opacity: isFaded ? 0.4 : isHovered ? 1 : 0.7,
                    y: isHovered ? -4 : -3
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {node.label}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
