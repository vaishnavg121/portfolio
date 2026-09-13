"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const NODES = [
  { id: "ai", label: "AI", x: 50, y: 30 },
  { id: "ml", label: "ML", x: 20, y: 50 },
  { id: "rag", label: "RAG", x: 80, y: 20 },
  { id: "agents", label: "Agents", x: 70, y: 45 },
  { id: "finance", label: "Finance", x: 30, y: 75 },
  { id: "markets", label: "Markets", x: 50, y: 85 },
  { id: "cpp", label: "C++", x: 80, y: 75 },
  { id: "algorithms", label: "Algorithms", x: 90, y: 55 },
  { id: "python", label: "Python", x: 45, y: 55 },
  { id: "robotics", label: "Robotics", x: 15, y: 25 },
  { id: "ros2", label: "ROS2", x: 10, y: 40 },
  { id: "cad", label: "CAD", x: 25, y: 15 },
  { id: "data", label: "Data", x: 40, y: 40 },
];

const CONNECTIONS = [
  ["rag", "agents"],
  ["agents", "ai"],
  ["ml", "ai"],
  ["data", "ml"],
  ["python", "data"],
  ["python", "ai"],
  ["finance", "markets"],
  ["markets", "python"],
  ["cpp", "algorithms"],
  ["cpp", "robotics"],
  ["robotics", "ros2"],
  ["cad", "robotics"],
];

export const SkillsConstellation = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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
    <section className="py-32 relative bg-background border-t border-border overflow-hidden">
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
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke={isActive ? "var(--accent)" : "var(--border)"}
                strokeWidth={isActive ? 0.3 : 0.1}
                opacity={isFaded ? 0.1 : isActive ? 1 : 0.5}
                animate={{
                  opacity: isFaded ? 0.1 : isActive ? 1 : 0.5,
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
                onMouseEnter={(e) => {
                  setHoveredNode(node.id);
                  const target = e.currentTarget as unknown as HTMLElement;
                  window.dispatchEvent(new CustomEvent("companionInteract", { 
                    detail: { type: "anchor-hover", target }
                  }));
                }}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all duration-300"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 2 : 1}
                  fill={isHovered || isConnected ? "var(--accent)" : "var(--text-muted)"}
                  opacity={isFaded ? 0.2 : 1}
                  animate={{
                    r: isHovered ? 2 : 1,
                    opacity: isFaded ? 0.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.text
                  x={node.x}
                  y={node.y - 3}
                  fontSize="2.5"
                  fill={isHovered || isConnected ? "var(--text-primary)" : "var(--text-muted)"}
                  textAnchor="middle"
                  opacity={isFaded ? 0.1 : isHovered ? 1 : 0.7}
                  className="font-mono tracking-wider select-none pointer-events-none"
                  animate={{
                    opacity: isFaded ? 0.1 : isHovered ? 1 : 0.7,
                    y: isHovered ? node.y - 4 : node.y - 3
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
