"use client";

import { motion, type MotionValue } from "framer-motion";

type HeroBackgroundProps = {
  bgX: MotionValue<number>;
  bgY: MotionValue<number>;
  reduced: boolean | null;
};

export function HeroBackground({ bgX, bgY, reduced }: HeroBackgroundProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="hero-ambient pointer-events-none absolute -inset-6"
      style={{ x: reduced ? 0 : bgX, y: reduced ? 0 : bgY }}
    />
  );
}
