"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { socials } from "@/lib/profile";
import { motionTokens } from "@/lib/motion";

type Navigate = (url: string) => void;

const openSection = (id: string, navigate: Navigate) => {
  const section = document.getElementById(id);
  if (!section) {
    navigate("/#" + id);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
};

const selectRegion = (id: string, navigate: Navigate) => {
  if (!document.getElementById("knowledge")) {
    navigate("/?knowledge=" + id + "#knowledge");
    return;
  }
  openSection("knowledge", navigate);
  window.dispatchEvent(new CustomEvent("portfolio:knowledge-region", { detail: id }));
};

const COMMANDS = [
  { id: "projects", label: "Projects", action: (navigate: Navigate) => openSection("work", navigate) },
  { id: "about", label: "About", action: (navigate: Navigate) => openSection("about", navigate) },
  { id: "aiml", label: "AI / ML", action: (navigate: Navigate) => selectRegion("ai", navigate) },
  { id: "finance", label: "Finance", action: (navigate: Navigate) => selectRegion("finance", navigate) },
  { id: "robotics", label: "Robotics", action: (navigate: Navigate) => openSection("robotics", navigate) },
  { id: "interwoven", label: "Interwoven Intelligence", action: (navigate: Navigate) => openSection("interwoven", navigate) },
  { id: "github", label: "GitHub", action: () => window.open(socials.github, "_blank", "noopener,noreferrer") },
  { id: "resume", label: "Resume", action: () => window.open("/resume.pdf", "_blank") },
  { id: "contact", label: "Contact", action: (navigate: Navigate) => openSection("contact", navigate) },
];

const SECRET_COMMANDS = ["hamster", "breathing", "notes", "sudo hire vaishnav"];

export const CommandPalette = () => {
  const reduced = useReducedMotion();
  const router = useRouter();
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
    const open = () => { setQuery(""); setIsOpen(true); };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("portfolio:command-palette", open);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("portfolio:command-palette", open);
    };
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommand = (cmd: typeof COMMANDS[0]) => {
    cmd.action((url) => router.push(url));
    setIsOpen(false);
    setQuery("");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const cmdStr = val.toLowerCase();
    
    if (SECRET_COMMANDS.includes(cmdStr)) {
      if (cmdStr === "hamster") {
        window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "command-trigger", data: "hamster" } }));
      } else if (cmdStr === "breathing") {
        window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "command-trigger", data: "breathing" } }));
      } else if (cmdStr === "notes") {
        window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "command-trigger", data: "notes" } }));
        document.getElementById("notes")?.scrollIntoView({ behavior: "smooth" });
      } else if (cmdStr === "sudo hire vaishnav") {
        window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "command-trigger", data: "hire" } }));
        openSection("contact", (url) => router.push(url));
      }
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[max(0.75rem,env(safe-area-inset-top))] lg:pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.985, y: -9 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : .99, y: reduced ? 0 : -5 }}
            transition={reduced ? { duration: 0 } : motionTokens.ease.panel}
            role="dialog"
            aria-label="Command palette"
            className="portfolio-popover relative w-full max-w-lg overflow-hidden font-mono"
          >
            <div className="flex items-center px-4 border-b border-border">
              <span className="text-text-muted mr-2">{'>'}</span>
              <input
                autoFocus
                type="text"
                aria-label="Search commands"
                placeholder="Type a command or search..."
                value={query}
                onChange={handleInput}
                className="w-full bg-transparent py-4 text-text-primary focus:outline-none placeholder:text-text-muted"
              />
              <button type="button" aria-label="Close command palette" onClick={() => setIsOpen(false)} className="grid size-11 shrink-0 place-items-center lg:hidden"><X size={18} /></button>
            </div>
            <div className="max-h-[min(16rem,45dvh)] overflow-y-auto py-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-muted text-sm">
                  No commands found.
                </div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommand(cmd)}
                    className="w-full min-h-11 lg:min-h-0 text-left px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated hover:text-accent focus:bg-surface-elevated focus:text-accent transition-colors flex items-center justify-between group"
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
