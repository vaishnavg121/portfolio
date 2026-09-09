"use client";

import { motion } from "framer-motion";

export const ContactFooter = () => {
  return (
    <footer className="py-32 bg-surface relative overflow-hidden" id="contact">
      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium mb-6 tracking-tight">
            LET&apos;S BUILD SOMETHING <br className="hidden md:block" />
            <span className="text-accent italic font-serif">INTERESTING.</span>
          </h2>
          <p className="text-text-muted font-mono text-sm tracking-widest uppercase">
            Initiate communication sequence
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mb-32"
        >
          {["GitHub", "LinkedIn", "Email", "Resume"].map((link) => (
            <a 
              key={link}
              href="#" 
              className="text-text-primary hover:text-accent text-sm md:text-base font-mono tracking-wider transition-colors relative group"
              data-cursor="VIEW"
            >
              {link}
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-accent scale-x-0 origin-left group-hover:scale-x-100 transition-transform" />
            </a>
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
