"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

export const VisualSlot = ({ src, alt, className = "", objectFit = "contain" }: { src: string, alt: string, className?: string, objectFit?: "cover" | "contain" }) => {
  const [inspecting, setInspecting] = useState(false);
  const preview = useRef<HTMLDialogElement>(null);

  return (
    <div className={`case-visual relative w-full overflow-hidden flex items-center justify-center group ${className}`} data-familiar-protect data-familiar-reaction="inspect">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)", backgroundSize: "4px 4px" }} />
      <div className="absolute inset-0 border border-accent/20 scale-[0.98] opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
      <span className="absolute bottom-4 left-4 font-mono text-[10px] text-text-muted tracking-widest z-10 uppercase mix-blend-difference pointer-events-none opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500">{alt}</span>
      <button type="button" aria-label={"Inspect image: " + alt} aria-haspopup="dialog" aria-expanded={inspecting} onClick={() => {
        preview.current?.showModal();
        setInspecting(true);
      }} className="portfolio-control absolute right-2 top-2 z-20 grid size-11 place-items-center lg:right-3 lg:top-3">
        <Maximize2 size={17} aria-hidden="true" />
      </button>
      <dialog ref={preview} aria-label="Project image" className="case-image-dialog"
        onClose={() => setInspecting(false)}
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4">
          <p className="text-xs font-mono uppercase tracking-wider text-text-muted">Project image</p>
          <button type="button" aria-label="Close project image" onClick={() => preview.current?.close()} className="grid size-11 shrink-0 place-items-center"><X size={18} aria-hidden="true" /></button>
        </div>
        {inspecting && (
          <div className="p-3">
            <div className="relative h-[min(62dvh,42rem)] bg-background">
              <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-primary">{alt}</p>
            <a href={src} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Open full-size image</a>
          </div>
        )}
      </dialog>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1023px) 92vw, 56vw"
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
