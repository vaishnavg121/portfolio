"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: { type: string; label: string; target: string }[];
};

export const Chatbot = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    const list = messagesRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const mobile = window.matchMedia("(width < 64rem)");
    const viewport = window.visualViewport;
    const sizeDialog = () => {
      if (!viewport) return;
      dialog.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
      dialog.style.setProperty("--chat-height", `${viewport.height}px`);
    };
    const openDialog = () => {
      if (dialog.open) dialog.close();
      if (mobile.matches) dialog.showModal();
      else dialog.show();
      sizeDialog();
    };
    openDialog();
    mobile.addEventListener("change", openDialog);
    viewport?.addEventListener("resize", sizeDialog);
    viewport?.addEventListener("scroll", sizeDialog);

    // Notify companion to update its safe zones
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-open" } }));

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
       window.removeEventListener("keydown", handleEsc);
       mobile.removeEventListener("change", openDialog);
       viewport?.removeEventListener("resize", sizeDialog);
       viewport?.removeEventListener("scroll", sizeDialog);
       dialog.close();
       window.dispatchEvent(new Event("resize"));
       window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-close" } }));
    };
  }, [onClose]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-send" } }));

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!res.ok) throw new Error("API error");
      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-streaming" } }));
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.trim() !== "");
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.actions) {
                setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, actions: data.actions } : m));
              }
              if (data.text) {
                setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, content: m.content + data.text } : m));
              }
            } catch (e) {
              // ignore partial lines
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) => m.id === botMsgId ? { ...m, content: "Sorry, I encountered an error connecting to the knowledge base." } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleAction = (action: { type: string; target: string }) => {
    if (action.type === "navigate") {
      if (action.target.startsWith("#")) {
        const el = document.getElementById(action.target.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          onClose();
        }
      } else {
        router.push(action.target);
        onClose();
      }
    }
  };

  const suggestions = [
    "What did you work on at IMD Pune?",
    "How does Swa.Neeti work?",
    "Where have you used C++?",
    "What have you built in robotics?"
  ];

  return (
    <dialog ref={dialogRef} aria-labelledby="chat-title" className="chat-window fixed z-50 m-0 max-h-none max-w-none overflow-visible border-0 bg-transparent p-0 text-text-primary"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full lg:w-[400px] bg-surface-elevated border-t lg:border border-border shadow-2xl flex flex-col overflow-hidden h-full lg:h-[550px] lg:max-h-[calc(100vh-4rem)]"
        data-familiar-protect="true"
        onMouseEnter={() => {
           window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-hover" } }));
        }}
      >
        {/* Header */}
        <div className="chat-heading flex shrink-0 items-center justify-between px-4 lg:p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h3 id="chat-title" className="font-mono text-xs uppercase tracking-widest text-text-primary">Ask Vaishnav</h3>
          </div>
          <button type="button" aria-label="Close chat" onClick={onClose} className="grid size-11 lg:size-auto place-items-center text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar text-sm font-sans pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-6 pt-2 text-text-muted">
              <p className="leading-relaxed text-sm">Ask about my projects, coursework, or work with ThriveForce.</p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="min-h-11 lg:min-h-0 text-left p-3 border border-border hover:border-text-muted transition-colors text-xs text-text-primary leading-tight"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-text-muted uppercase">
                  {m.role === "user" ? "Visitor" : "Assistant"}
                </div>
                <div className={`max-w-full [overflow-wrap:anywhere] leading-relaxed whitespace-pre-wrap px-3 py-2 ${m.role === "user" ? "bg-surface text-text-primary text-right rounded-bl-xl rounded-tl-xl rounded-tr-xl" : "text-text-primary"}`}>
                  {m.content || (m.role === "assistant" && isLoading ? "..." : "")}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action)}
                        className="min-h-11 lg:min-h-0 flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
                      >
                        {action.label}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="chat-compose shrink-0 p-3 lg:p-4 border-t border-border bg-surface relative z-10">
          <div className="relative">
            <textarea
              aria-label="Ask about my work"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend(input);
                } else {
                  window.dispatchEvent(new CustomEvent("companionInteract", { detail: { type: "chat-typing" } }));
                }
              }}
              placeholder="Ask about my work..."
              className="w-full bg-background border border-border text-base lg:text-sm p-3 pr-14 lg:pr-10 focus:outline-none focus:border-text-muted resize-none custom-scrollbar rounded-none"
              rows={2}
              maxLength={500}
            />
            <button
              onClick={() => handleSend(input)}
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2 right-1 grid size-11 lg:bottom-3 lg:right-3 lg:size-auto place-items-center text-text-muted hover:text-accent disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Red Accent Bar */}
        <div className="h-[2px] w-full bg-accent shrink-0" />
      </motion.div>
    </dialog>
  );
};

