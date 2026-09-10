"use client";

import { motion } from "framer-motion";

export const InkReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <div className="relative group overflow-hidden">
      {/* Ink blot simulation using CSS radial gradients and motion */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply bg-background"
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        whileInView={{ clipPath: "circle(150% at 50% 50%)" }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.5, delay, ease: [0.76, 0, 0.24, 1] }}
        style={{
          WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 100%)",
        }}
      />
      {children}
    </div>
  );
};
