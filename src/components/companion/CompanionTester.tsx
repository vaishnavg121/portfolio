"use client";

import { useState } from "react";
import { CompanionState, CompanionDirection } from "./companion.types";
import { CompanionRenderer } from "./CompanionRenderer";

export const CompanionTester = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<CompanionState>("IDLE");
  const [direction, setDirection] = useState<CompanionDirection>("right");

  if (process.env.NODE_ENV !== "development") return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-white px-3 py-2 rounded text-xs border border-white/20 font-mono transition-opacity hover:opacity-100 opacity-50"
      >
        Mascot Tester
      </button>
    );
  }

  const states: CompanionState[] = [
    "IDLE", "WALK", "RUN", "SLEEP", "READ", "SURPRISED", "WIND_BLOWN", "INSPECT", "WAVE"
  ];

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 text-white p-4 rounded-xl border border-white/20 shadow-2xl flex flex-col gap-4 font-mono text-sm w-[280px]">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider">Mascot Tester</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white px-2">✕</button>
      </div>

      <div className="flex justify-center p-8 border border-white/10 rounded bg-white/5 min-h-[160px] relative items-end overflow-hidden">
        <CompanionRenderer state={state} direction={direction} intensity={0} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/50 uppercase">State</span>
        <select
          value={state}
          onChange={(e) => setState(e.target.value as CompanionState)}
          className="bg-[#1a1a1a] text-white border border-white/10 p-2 rounded outline-none w-full"
        >
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/50 uppercase">Direction</span>
        <div className="flex gap-2">
          <button
            onClick={() => setDirection("left")}
            className={`flex-1 py-1.5 rounded transition-colors text-xs border border-white/10 ${direction === "left" ? "bg-white/20 text-white" : "bg-[#1a1a1a] text-white/50 hover:text-white"}`}
          >
            Left
          </button>
          <button
            onClick={() => setDirection("right")}
            className={`flex-1 py-1.5 rounded transition-colors text-xs border border-white/10 ${direction === "right" ? "bg-white/20 text-white" : "bg-[#1a1a1a] text-white/50 hover:text-white"}`}
          >
            Right
          </button>
        </div>
      </div>
    </div>
  );
};
