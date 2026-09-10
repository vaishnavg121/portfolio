"use client";

import { motion } from "framer-motion";
import { THEME_ASSETS } from "@/lib/assets";

const RULES = [
  {
    num: "RULE 01",
    text: "Never trust an unvalidated model output."
  },
  {
    num: "RULE 02",
    text: "If the evidence doesn't exist, don't invent it."
  },
  {
    num: "RULE 03",
    text: "Fail closed when the cost of being wrong is high."
  }
];

export const EngineeringNotes = () => {
  return (
    <section id="notes" className="py-32 relative flex justify-center overflow-hidden">
      {/* Global Grain */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 mix-blend-overlay" style={{ backgroundImage: `url(${THEME_ASSETS.global.paperGrain})`, backgroundSize: '300px' }} />
      
      <motion.div 
        initial={{ opacity: 0, rotate: -1, y: 30 }}
        whileInView={{ opacity: 1, rotate: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="w-[95%] max-w-3xl relative p-10 md:p-20 overflow-hidden min-h-[600px] flex flex-col justify-center"
      >
        {/* Notebook Frame Artwork */}
        <div className="absolute inset-0 pointer-events-none opacity-90" style={{
           backgroundImage: `url(${THEME_ASSETS.global.notebookInkFrame})`,
           backgroundSize: '100% 100%',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
        }} />
        
        <div className="relative z-20 md:px-10">
          <div className="text-[#cc3333]/80 font-mono text-[10px] tracking-[0.3em] mb-4 uppercase">
            {"//"} Personal Annotation
          </div>
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#e6e1d6] mb-12 border-b border-[#cc3333]/30 pb-6 tracking-wide">
            Engineering Notes
          </h2>
          
          <div className="flex flex-col gap-12">
            {RULES.map((rule, idx) => (
              <div key={idx} className="relative group">
                <div className="text-[#cc3333] font-mono text-xs tracking-widest mb-3 opacity-90 transition-opacity">
                  {rule.num}
                </div>
                <div className="text-xl md:text-3xl text-[#e6e1d6]/90 font-light leading-relaxed font-hand tracking-wide">
                  {rule.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
