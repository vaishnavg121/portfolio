"use client";

import { useEffect, useRef } from "react";
import { type MotionValue } from "framer-motion";

type HeroBackgroundProps = {
  bgX: MotionValue<number>;
  bgY: MotionValue<number>;
  reduced: boolean | null;
};

const nearDust = [
  [116, 93, 1, .38], [168, 57, .8, .43], [205, 103, 1.15, .52], [237, 150, .8, .31],
  [279, 179, .62, .43], [251, 213, 1.04, .47], [304, 224, .75, .54], [326, 245, .6, .3],
  [220, 269, .56, .37], [281, 291, .82, .38], [171, 277, .55, .42], [252, 315, 1.15, .48],
  [143, 304, .59, .36], [107, 328, .79, .45], [192, 316, .73, .4], [85, 303, .61, .35],
] as const;

const farDust = [
  [156, 92, .58, .36], [211, 41, .65, .38], [271, 85, .71, .43], [324, 147, .55, .3],
  [350, 212, .65, .38], [294, 270, .52, .35], [218, 309, .48, .37], [145, 344, .54, .32],
] as const;

export function HeroBackground({ bgX, bgY, reduced }: HeroBackgroundProps) {
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current, plane = field.current;
    if (!layer || !plane || !("IntersectionObserver" in window)) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let active = false;

    const translate = () => {
      if (active && pointer.matches) plane.style.translate = bgX.get().toFixed(1) + "px " + bgY.get().toFixed(1) + "px";
    };

    const reconcile = () => {
      active = visible && !document.hidden && !preference.matches && !reduced;
      layer.toggleAttribute("data-flowing", active);
      if (active && pointer.matches) translate();
      else plane.style.removeProperty("translate");
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    }, { threshold: .01 });
    observer.observe(plane);
    const detachX = bgX.on("change", translate), detachY = bgY.on("change", translate);
    preference.addEventListener("change", reconcile);
    pointer.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      observer.disconnect();
      detachX();
      detachY();
      preference.removeEventListener("change", reconcile);
      pointer.removeEventListener("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      layer.removeAttribute("data-flowing");
      plane.style.removeProperty("translate");
    };
  }, [bgX, bgY, reduced]);

  return (
    <div ref={root} aria-hidden="true" className="hero-ambient">
      <div ref={field} className="hero-ambient-field">
        <svg className="hero-ambient-dust" viewBox="0 0 390 372">
          <g className="dust-far">{farDust.map(([x, y, size, opacity]) => <circle key={x} cx={x} cy={y} r={size} opacity={opacity} />)}</g>
          <g className="dust-near">{nearDust.map(([x, y, size, opacity], index) => (
            <circle key={x} className={index % 3 === 1 ? "dust-wide" : undefined} cx={x} cy={y} r={size} opacity={opacity} />
          ))}</g>
        </svg>
      </div>
    </div>
  );
}
