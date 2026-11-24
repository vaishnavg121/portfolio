"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("./Chatbot").then(mod => mod.Chatbot), {
  ssr: false,
});

export const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeChat = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  return (
    <>
      <div className="lg:fixed lg:bottom-8 lg:left-8 lg:z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              ref={launcherRef}
              aria-haspopup="dialog"
              aria-label="Ask Vaishnav"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setIsOpen(true)}
              className="flex min-h-11 lg:min-h-0 items-center gap-2 px-3 lg:px-4 py-2 bg-surface-elevated border border-border text-xs font-mono text-text-primary uppercase tracking-widest hover:border-text-muted transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="lg:hidden">Ask</span>
              <span className="hidden lg:inline">Ask Vaishnav</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {isOpen && <Chatbot onClose={closeChat} />}
    </>
  );
};

