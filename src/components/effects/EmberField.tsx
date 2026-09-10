"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Ember {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

export const EmberField = () => {
  const [shouldRender, setShouldRender] = useState(false);

  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    // Disable on reduced motion or mobile widths
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.innerWidth < 768;
    if (!mediaQuery.matches && !isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      
      const generated = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100,
        size: Math.random() * 2 + 1, // 1-3px
        duration: Math.random() * 4 + 4, // 4-8s
        delay: Math.random() * 5,
        drift: Math.random() * 20 - 10,
      }));
      setEmbers(generated);
    }
  }, []);

  if (!shouldRender || embers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute bg-accent rounded-full"
          style={{
            width: ember.size,
            height: ember.size,
            left: `${ember.x}%`,
            top: `${ember.y}%`,
            boxShadow: `0 0 ${ember.size * 2}px var(--accent)`,
          }}
          animate={{
            y: [0, -100],
            x: [0, ember.drift], // slight drift
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};
