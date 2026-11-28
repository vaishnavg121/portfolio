"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./EntrySequence.module.css";

const duration = 960;
const deadline = 1380;
type Variant = "hybrid" | "lines" | "particles";
const clamp = (value: number) => Math.max(0, Math.min(1,value));
const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;
const noise = (seed: number) => ((Math.imul(seed + 17, 0x45d9f3b) ^ Math.imul(seed + 21, 0x119de1f3)) >>> 0) / 4294967296;

function glyphDots(font: string) {
  const stencil = document.createElement("canvas");
  stencil.width = 320;
  stencil.height = 153;
  const ink = stencil.getContext("2d", {willReadFrequently:true});
  if (!ink) return [];
  ink.font = `600 112px ${font}`;
  ink.textAlign = "center";
  ink.textBaseline = "middle";
  ink.fillText("VG",160,80);
  const pixels = ink.getImageData(0,0,320,153).data;
  const dots: {x:number;y:number}[] = [];
  for (let y=12;y<142;y+=4) for (let x=18;x<301;x+=4) {
    if (pixels[(y*320+x)*4+3] > 145) dots.push({x:x+140,y:y+99});
  }
  return dots;
}

export function EntrySequence() {
  const layer = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const overlay = layer.current, canvas = surface.current;
    if (!overlay || !canvas || location.pathname !== "/" || location.hash) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || document.hidden || scrollY > 24) return;
    const requested = process.env.NODE_ENV === "development" ? new URLSearchParams(location.search).get("entry") : null;
    const variant: Variant = requested === "particles" || requested === "lines" ? requested : "hybrid";
    const root = document.documentElement;
    const pending = root.dataset.entryPending;
    if (!pending) return;
    const start = Number(pending);
    if (performance.now() - start > 730 && !requested) {
      delete root.dataset.entryPending;
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) return;
    const theme = getComputedStyle(overlay);
    const font = theme.getPropertyValue("--portfolio-display").trim() || "sans-serif";
    const tint = theme.getPropertyValue("--accent-stone").trim();
    const rose = theme.getPropertyValue("--accent-petal").trim();
    const ivory = theme.getPropertyValue("--text-primary").trim();
    const dots = variant !== "lines" ? glyphDots(font) : [];
    let frame = 0, finishAt: number | undefined, stopped = false;
    let ready = !document.fonts || document.fonts.check(`600 48px ${font}`);
    if (!ready) void document.fonts.load(`600 48px ${font}`).then(() => { ready = true; }, () => { ready = true; });

    const close = (event?: Event) => {
      if (stopped) return;
      stopped = true;
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      delete overlay.dataset.signature;
      if (event?.type !== "entry-cleanup") delete root.dataset.entryPending;
      overlay.style.removeProperty("opacity");
      window.removeEventListener("pointerdown",close);
      window.removeEventListener("keydown",close);
      window.removeEventListener("scroll",close);
      document.removeEventListener("visibilitychange",visibility);
      preference.removeEventListener("change",close);
    };
    const visibility = () => { if (document.hidden) close(); };
    const timeout = window.setTimeout(close,Math.max(0,deadline-(performance.now()-start)));
    window.addEventListener("pointerdown",close,{passive:true});
    window.addEventListener("keydown",close);
    window.addEventListener("scroll",close,{passive:true});
    document.addEventListener("visibilitychange",visibility);
    preference.addEventListener("change",close);
    overlay.dataset.signature = variant;

    function paint(now: number) {
      const elapsed = now - start;
      if (finishAt === undefined && elapsed >= duration * .68 && (ready || elapsed >= deadline - 285)) finishAt = elapsed;
      const release = finishAt === undefined ? 0 : clamp((elapsed-finishAt)/275);
      if (release >= 1 || elapsed >= deadline) { close(); return; }
      overlay!.style.opacity = String(1 - ease(release));
      context!.clearRect(0,0,600,350);
      const arrival = ease(elapsed/545);
      if (variant !== "particles") {
        context!.strokeStyle = tint;
        context!.lineWidth = .65;
        for (let i=0;i<7;i++) {
          context!.beginPath();
          const width = 78 + ease((elapsed-i*18)/500)*(172+i*7);
          const spread = ease((elapsed-i*19)/430);
          context!.globalAlpha = spread*(.23-i*.018);
          const y = 185+i*7;
          context!.moveTo(300-width,y+42);
          context!.bezierCurveTo(240-i*8,y-94, 320+i*11,y+86,300+width,y-61);
          context!.stroke();
        }
        context!.strokeStyle = rose;
        context!.strokeRect(210,112,180,128);
      }
      for (const [index,dot] of dots.entries()) {
        const radius = noise(index*3+4);
        const angle = index*2.39996;
        const dx = Math.cos(angle)*(83 + radius*145), dy = Math.sin(angle)*(30 + radius*89);
        const take = ease((elapsed-noise(index+127)*200)/435);
        const drift = release*release*(index%13+9);
        const x = dot.x + dx*(1-take) + Math.cos(angle)*drift;
        const y = dot.y + dy*(1-take) + Math.sin(angle)*drift*.48;
        context!.fillStyle = index%7 ? ivory : rose;
        context!.globalAlpha = (.3+radius*.62) * (.42+.58*arrival);
        const size = .82+radius*.92;
        context!.fillRect(x,y,size,size);
      }
      context!.globalAlpha = ease((elapsed-350)/230)*.74;
      context!.font = variant === "lines" ? `600 84px ${font}` : `500 11px ${font}`;
      context!.fillStyle = ivory;
      context!.textAlign = "center";
      if (variant === "lines") context!.fillText("VG",300,200);
      if (variant === "hybrid") context!.fillText("VAISHNAV  GADAMSETTY",300,266);
      context!.globalAlpha = 1;
      frame = requestAnimationFrame(paint);
    }
    frame = requestAnimationFrame(paint);
    return () => close(new Event("entry-cleanup"));
  },[]);

  return <div ref={layer} className={styles.entry} aria-hidden="true"><canvas ref={surface} width={600} height={350} /></div>;
}
