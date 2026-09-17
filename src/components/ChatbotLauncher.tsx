"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("./Chatbot").then(mod => mod.Chatbot), {
  ssr: false,
});

export const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 md:bottom-8 left-4 md:left-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border text-xs font-mono text-text-primary uppercase tracking-widest hover:border-text-muted transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              ASK / VAISHNAV
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {isOpen && <Chatbot onClose={() => setIsOpen(false)} />}
    </>
  );
};

