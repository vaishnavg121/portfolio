"use client";

import { useEffect, useId, useRef } from "react";

const profiles = {
  hero: { count: 7, curve: [299, 60, 397, 24], spacing: 13 },
  studio: { count: 4, curve: [387, 336, 269, 160], spacing: 15 },
  github: { count: 3, curve: [283, 368, 260, 181], spacing: 16 },
  work: { count: 5, curve: [122, 254, 302, 96], spacing: 21 },
  contact: { count: 6, curve: [320, 385, 153, 208], spacing: 18 },
} as const;

export function AtmosphereFilaments({ zone }: { zone: keyof typeof profiles }) {
  const field = useRef<SVGSVGElement>(null);
  const shade = "filament" + useId();
  const { count, curve, spacing } = profiles[zone];
  const [start, left, right, end] = curve;

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
    <svg ref={field} aria-hidden="true" focusable="false" data-filaments={zone}
      className="atmosphere-filaments" width="0" height="0" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
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
      <g className="atmosphere-current" fill="none" stroke={`url(#${shade})`}>
        <path vectorEffect="non-scaling-stroke" pathLength="100" d={`M -30 ${start+spacing} C 239 ${left+spacing*.66}, 516 ${right+spacing*1.09}, 830 ${end+spacing}`} />
      </g>
    </svg>
  );
}
