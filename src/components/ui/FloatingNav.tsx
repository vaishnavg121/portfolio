"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, FolderKanban, Cpu, Code2, PenTool, Mail, Bot } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'work', label: 'Selected Work', icon: FolderKanban, color: '#f5ede3' },
  { id: 'robotics', label: 'Combat Robotics', icon: Bot, color: '#cc3333' },
  { id: 'skills', label: 'Knowledge Landscape', icon: Cpu, color: '#f5ede3' },
  { id: 'github', label: 'GitHub Activity', icon: Code2, color: '#f5ede3' },
  { id: 'notes', label: 'Engineering Notes', icon: PenTool, color: '#f5ede3' },
  { id: 'contact', label: 'Contact', icon: Mail, color: '#f5ede3' },
];

export const FloatingNav = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Handle robotics section specifically if it doesn't have an ID
        if (id === 'robotics') {
            const rob = document.querySelector('.thriveforce-section') || document.querySelector('#thriveforce') || document.querySelector('section:nth-of-type(6)');
            if (rob) rob.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setIsExpanded(false);
  };

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-end"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-2 mb-4 items-end"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, delay: (NAV_ITEMS.length - 1 - i) * 0.05, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => scrollToSection(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group flex items-center gap-4 bg-[#050505]/90 backdrop-blur-md border border-white/10 p-3 rounded-sm cursor-pointer overflow-hidden relative w-auto max-w-[240px] shadow-2xl origin-right"
                style={{
                  transform: hoveredId === item.id && !shouldReduceMotion ? 'scale(1.02) translateX(-4px)' : 'scale(1) translateX(0)',
                  transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.3s'
                }}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Text Label */}
                <span className="font-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: item.color }}>
                  {item.label}
                </span>

                {/* Icon Container */}
                <div className="w-8 h-8 rounded-sm bg-[#0a0a0a] border border-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        className="w-14 h-14 bg-[#030303] border border-white/20 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative group"
        whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Layers className={`w-6 h-6 text-[#f5ede3] transition-transform duration-500 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
        
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-accent/20 blur-xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.button>
    </div>
  );
};
