"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COMMANDS = [
  { id: "projects", label: "Projects", action: () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "about", label: "About", action: () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "aiml", label: "AI / ML", action: () => console.log("Navigate to AI/ML") },
  { id: "finance", label: "Finance", action: () => console.log("Navigate to Finance") },
  { id: "robotics", label: "Robotics", action: () => document.getElementById("robotics")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "github", label: "GitHub", action: () => window.open("https://github.com/vaishnav", "_blank") },
  { id: "resume", label: "Resume", action: () => window.open("/resume.pdf", "_blank") },
  { id: "contact", label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
];

const SECRET_COMMANDS = ["hamster", "breathing", "notes", "sudo hire vaishnav"];

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommand = (cmd: typeof COMMANDS[0]) => {
    cmd.action();
    setIsOpen(false);
    setQuery("");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const cmdStr = val.toLowerCase();
    
    if (SECRET_COMMANDS.includes(cmdStr)) {
      if (cmdStr === "hamster") {
        window.dispatchEvent(new CustomEvent("easterEgg", { detail: "hamster" }));
      } else if (cmdStr === "breathing") {
        window.dispatchEvent(new CustomEvent("easterEgg", { detail: "breathing" }));
      } else if (cmdStr === "notes") {
        window.dispatchEvent(new CustomEvent("easterEgg", { detail: "notes" }));
        document.getElementById("notes")?.scrollIntoView({ behavior: "smooth" });
      } else if (cmdStr === "sudo hire vaishnav") {
        window.dispatchEvent(new CustomEvent("easterEgg", { detail: "hire" }));
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-surface border border-border shadow-2xl rounded-xl overflow-hidden font-mono"
          >
            <div className="flex items-center px-4 border-b border-border">
              <span className="text-text-muted mr-2">{'>'}</span>
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={handleInput}
                className="w-full bg-transparent py-4 text-text-primary focus:outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-muted text-sm">
                  No commands found.
                </div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommand(cmd)}
                    className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated hover:text-accent focus:bg-surface-elevated focus:text-accent transition-colors flex items-center justify-between group"
                  >
                    <span>{cmd.label}</span>
                    <span className="text-text-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Return ↵
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="bg-surface-elevated px-4 py-2 text-xs text-text-muted flex justify-between border-t border-border">
              <span>Navigation & Actions</span>
              <span>esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
