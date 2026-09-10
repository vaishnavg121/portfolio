"use client";

import { motion } from "framer-motion";

export const SlashTransition = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* The Slash Line */}
      <motion.div
        className="absolute top-0 left-[-20%] w-[150%] h-[1px] bg-accent rotate-[-15deg] origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: [0, 1, 0] }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "circIn" }}
      />
      {/* The Displacement / Shadow trail */}
      <motion.div
        className="absolute top-0 left-[-20%] w-[150%] h-[20px] bg-gradient-to-b from-transparent to-background rotate-[-15deg] origin-left opacity-30"
        initial={{ scaleX: 0, y: 0 }}
        whileInView={{ scaleX: 1, y: 10 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "circOut", delay: 0.1 }}
      />
    </div>
  );
};
