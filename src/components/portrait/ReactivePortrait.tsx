"use client";

import { useEffect, useRef } from "react";
import { connectPortrait } from "./portrait-renderer";

export function ReactivePortrait() {
  const frame = useRef<HTMLDivElement>(null);
  const pixels = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (frame.current && pixels.current) return connectPortrait(frame.current, pixels.current);
  }, []);

  return (
    <figure className="hero-portrait" data-familiar-protect data-familiar-reaction="inspect">
      <div ref={frame} className="portrait-frame" data-portrait>
        <picture>
          <source media="(width < 37rem)" srcSet="/images/portrait/mobile-pixel.webp" width={442} height={520} />
          {/* The static crops are already optimized and must align exactly with the matching canvas source. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/portrait/desktop-pixel.webp" width={684} height={882} alt="Vaishnav Gadamsetty" fetchPriority="high" decoding="async" />
        </picture>
        <canvas ref={pixels} aria-hidden="true" className="portrait-pixels" />
      </div>
    </figure>
  );
}
