"use client";

import { useState } from "react";
import Image from "next/image";
import { Info } from "lucide-react";

export const VisualSlot = ({ src, alt, className = "", objectFit = "contain" }: { src: string, alt: string, className?: string, objectFit?: "cover" | "contain" }) => {
  const [captionOpen, setCaptionOpen] = useState(false);
  return (
    <div className={`relative w-full bg-[#030303] border border-white/5 overflow-hidden flex items-center justify-center group ${className}`} data-familiar-protect data-familiar-reaction="inspect">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)", backgroundSize: "4px 4px" }} />
      <div className="absolute inset-0 border border-accent/20 scale-[0.98] opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
      <span className="absolute bottom-4 left-4 font-mono text-[10px] text-text-muted tracking-widest z-10 uppercase mix-blend-difference pointer-events-none opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">{alt}</span>
      <button type="button" aria-label={"Toggle image caption: " + alt} aria-expanded={captionOpen} onClick={() => setCaptionOpen(!captionOpen)} className="absolute right-1 top-1 z-20 grid size-11 place-items-center border border-border bg-[#0a0a0a]/95 text-text-primary lg:hidden"><Info size={17} /></button>
      {captionOpen && <p className="absolute inset-x-0 bottom-0 z-10 bg-[#0a0a0a]/95 px-3 py-2 text-xs leading-relaxed text-text-primary lg:hidden">{alt}</p>}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className={`${objectFit === "cover" ? "object-cover" : "object-contain"} opacity-0 transition-opacity duration-700`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
        onLoad={(e) => {
          (e.target as HTMLElement).style.opacity = '1';
        }}
      />
    </div>
  );
};
