"use client";

import { motion } from "framer-motion";

export const InkReveal = ({ children, delay = 0, maskAsset }: { children: React.ReactNode, delay?: number, maskAsset?: string }) => {
  return (
    <div className="relative group overflow-hidden">
      {/* Ink blot simulation using CSS radial gradients and motion */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply bg-background motion-reduce:hidden"
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        whileInView={{ clipPath: "circle(150% at 50% 50%)" }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{
          WebkitMaskImage: maskAsset ? `url(${maskAsset})` : "radial-gradient(circle, black 0%, transparent 100%)",
          WebkitMaskSize: maskAsset ? "cover" : "auto",
        }}
      />
      {children}
    </div>
  );
};
