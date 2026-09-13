"use client";

import { motion } from "framer-motion";
import { MagneticEffect } from "@/components/effects";

export const ContactFooter = () => {
  return (
    <footer className="py-32 bg-surface relative overflow-hidden" id="contact">
      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        
        <div className="mb-16 relative">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium mb-6 tracking-tight relative">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="inline-block relative z-10"
              data-familiar-avoid
            >
              LET&apos;S BUILD SOMETHING <br className="hidden md:block" />
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, x: -30, skewX: 10 }}
              whileInView={{ opacity: 1, x: 0, skewX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-accent italic font-serif inline-block relative z-10"
              data-familiar-avoid
            >
              INTERESTING.
            </motion.span>
          </h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-text-muted font-mono text-sm tracking-widest uppercase relative z-10"
            data-familiar-avoid
          >
            Initiate communication sequence
          </motion.p>
          <div data-familiar-anchor className="absolute top-1/2 -right-32 w-4 h-4 pointer-events-none" />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mb-32"
          data-familiar-avoid
        >
          {["GitHub", "LinkedIn", "Email", "Resume"].map((link) => (
            <MagneticEffect key={link} intensity={0.4}>
              <a 
                href="#" 
                className="text-text-primary hover:text-accent text-sm md:text-base font-mono tracking-wider transition-colors relative group block py-2 px-4"
                data-cursor="VIEW"
              >
                {link}
                <span className="absolute -bottom-0 left-0 w-full h-[1px] bg-accent scale-x-0 origin-left group-hover:scale-x-100 transition-transform" />
              </a>
            </MagneticEffect>
          ))}
        </motion.div>

        <div className="w-full border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-text-muted tracking-widest uppercase">
          <div>Vaishnav Gadamsetty</div>
          <div className="mt-4 md:mt-0">2026 // ALL SYSTEMS NOMINAL</div>
        </div>
      </div>
    </footer>
  );
};
