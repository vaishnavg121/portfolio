"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function useCaseMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".hero-elem", {
        y: 13, opacity: 0.64, duration: 0.55, stagger: 0.05,
        ease: "power3.out", clearProps: "transform,opacity",
      });
      for (const heading of gsap.utils.toArray<HTMLElement>(".case-section-header")) {
        gsap.from(heading, {
          y: 12, opacity: 0.72, duration: 0.48, ease: "power2.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: heading, start: "top 89%", once: true },
        });
      }
    }, scope);
    return () => media.revert();
  }, { scope });
}
