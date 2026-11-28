"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";

const profiles = {
  hero: { count: 7, curve: [299, 60, 397, 24], spacing: 13 },
  studio: { count: 4, curve: [387, 336, 269, 160], spacing: 15 },
  github: { count: 3, curve: [283, 368, 260, 181], spacing: 16 },
  work: { count: 5, curve: [122, 254, 302, 96], spacing: 21 },
  contact: { count: 6, curve: [320, 385, 153, 208], spacing: 18 },
} as const;

export function AtmosphereFilaments({ zone }: { zone: keyof typeof profiles }) {
  const field = useRef<HTMLDivElement>(null);
  const shade = "filament" + useId();
  const { count, curve, spacing } = profiles[zone];
  const [start, left, right, end] = curve;
  const pulse = Object.fromEntries([0, .2, .4, .6, .8, 1].map((time, index) => {
    const remaining = 1 - time;
    const weights = [remaining ** 3, 3 * remaining ** 2 * time, 3 * remaining * time ** 2, time ** 3];
    const x = weights[0] * -30 + weights[1] * 239 + weights[2] * 516 + weights[3] * 830;
    const y = weights[0] * (start + spacing) + weights[1] * (left + spacing * .66)
      + weights[2] * (right + spacing * 1.09) + weights[3] * (end + spacing);
    return [`--current-${index}`, `${x / 8}%, ${y / 4.8}%`];
  })) as CSSProperties;

  useEffect(() => {
    const layer = field.current;
    if (!layer || !("IntersectionObserver" in window)) return;
    if (process.env.NODE_ENV === "development") {
      const treatment = new URLSearchParams(location.search).get("atmosphere");
      if (treatment === "quiet" || treatment === "contour") layer.dataset.treatment = treatment;
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => layer.toggleAttribute("data-moving", visible && !document.hidden && !preference.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(layer);
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={field} aria-hidden="true" data-filaments={zone} className="atmosphere-filaments" style={pulse}>
      <svg focusable="false" width="0" height="0" viewBox="0 0 800 480" preserveAspectRatio="none">
        <defs>
          <linearGradient id={shade}>
            <stop offset="0" stopColor="var(--accent-mauve)" stopOpacity="0" />
            <stop offset=".38" stopColor="var(--accent-petal)" />
            <stop offset=".65" stopColor="var(--accent-stone)" />
            <stop offset="1" stopColor="var(--accent-stone)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke={`url(#${shade})`} fill="none">
          {Array.from({ length: count }, (_, index) => {
            const s = index * spacing;
            const d = `M -30 ${start+s} C 239 ${left+s*.66}, 516 ${right+s*1.09}, 830 ${end+s}`;
            return <path key={index} d={d} vectorEffect="non-scaling-stroke" />;
          })}
        </g>
      </svg>
      <span className="atmosphere-current" />
    </div>
  );
}
