"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function useSectionVisibility(rootMargin = "100px", threshold = 0.01) {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting || entry.intersectionRatio > threshold);
        });
      },
      { rootMargin, threshold: [0, threshold, 0.1, 0.5, 1] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref: setRef, isVisible };
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  return reduce;
}