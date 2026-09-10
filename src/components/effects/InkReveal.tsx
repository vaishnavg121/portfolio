"use client";

import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

export const InkReveal = ({ children, delay = 0 }: { children?: React.ReactNode, delay?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[140%] opacity-80"
        style={{
          backgroundImage: `url(${THEME_ASSETS.global.inkBrushReveal})`,
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
        }}
        initial={{ x: "-20%", opacity: 0 }}
        whileInView={{ x: 0, opacity: [0, 0.5, 0.4] }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.5, delay, ease: "easeOut" }}
      />
      {children}
    </div>
  );
};
