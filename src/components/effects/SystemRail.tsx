"use client";

import { motion, useScroll } from "framer-motion";

export const SystemRail = () => {
  const { scrollYProgress } = useScroll();

  return (
    <>
      <motion.div aria-hidden="true" className="fixed top-[calc(3rem+env(safe-area-inset-top))] left-0 right-0 z-[46] h-px origin-left bg-accent pointer-events-none lg:hidden" style={{ scaleX: scrollYProgress }} />
      <div aria-hidden="true" className="fixed inset-y-6 right-6 z-40 hidden w-px bg-border pointer-events-none lg:block">
        <motion.div className="h-full origin-top bg-text-muted/50" style={{ scaleY: scrollYProgress }} />
      </div>
    </>
  );
};
