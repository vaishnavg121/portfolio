"use client";

import { useEffect } from "react";

const controls = ".portfolio-control, .tactile-quiet, .atlas-controls button, .portfolio-text-link, .hero-card-select, .hero-card-open";

export function TouchFeedback() {
  useEffect(() => {
    let press: { control: HTMLElement; id: number } | undefined;
    const release = () => {
      press?.control.removeAttribute("data-pressing");
      press = undefined;
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      if (!event.isPrimary) { release(); return; }
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(controls) : null;
      if (!target || target.matches(":disabled,[aria-disabled='true']")) return;
      release();
      press = { control: target, id: event.pointerId };
      target.toggleAttribute("data-pressing", true);
    };
    const onEnd = (event: PointerEvent) => {
      if (press?.id === event.pointerId) release();
    };

    // Feedback starts before browsers resolve the tap versus scroll gesture.
    const options = { passive: true, capture: true } as const;
    document.addEventListener("pointerdown", onDown, options);
    document.addEventListener("pointerup", onEnd, options);
    document.addEventListener("pointercancel", onEnd, options);
    document.addEventListener("visibilitychange", release);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
      document.removeEventListener("visibilitychange", release);
      release();
    };
  }, []);
  return null;
}
