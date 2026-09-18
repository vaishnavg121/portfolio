"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MagneticEffect } from "@/components/effects";
import { useSectionVisibility } from "@/lib/visibility";

import { profile, socials } from "@/lib/profile";

export const ContactFooter = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const { ref: visibilityRef, isVisible } = useSectionVisibility("200px");
  useEffect(() => {
    setMounted(true);
  }, []);
  useGSAP(() => {
    if (!mounted || !isVisible) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      });

      tl.fromTo('.contact-label',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
      .fromTo('.contact-build',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo('.contact-interesting',
        { opacity: 0, x: -40, skewX: 10 },
        { opacity: 1, x: 0, skewX: 0, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo('.contact-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo('.contact-link',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef, dependencies: [mounted, isVisible] });

  const LINKS = [
    { name: "GitHub", display: "github.com/vaishnavg121", url: socials.github },
    { name: "LinkedIn", display: "Venkatanaga Vaishnav Gadamsetty", url: socials.linkedin }
  ];

  return (
    <footer className="py-32 bg-surface relative overflow-hidden" id="contact" ref={(el) => { containerRef.current = el; visibilityRef(el); }}>
      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">

        <div className="mb-16 relative">
          <p
            className="contact-label text-text-muted font-mono text-sm tracking-widest uppercase relative z-10 mb-8 opacity-0"
            data-familiar-avoid
          >
            Initiate communication sequence
          </p>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium mb-6 tracking-tight relative">
            <span
              className="contact-build inline-block relative z-10 opacity-0"
              data-familiar-avoid
            >
              LET&apos;S BUILD SOMETHING <br className="hidden md:block" />
            </span>

            <span
              className="contact-interesting text-accent italic font-serif inline-block relative z-10 opacity-0"
              data-familiar-avoid
            >
              INTERESTING.
            </span>
          </h2>

          <div data-familiar-anchor className="absolute top-1/2 -right-32 w-4 h-4 pointer-events-none" />
        </div>

        <div className="contact-line w-24 h-[1px] bg-border mb-16 origin-center scale-x-0" />

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-32" data-familiar-avoid>
          {LINKS.map((link) => (
            <div key={link.name} className="contact-link opacity-0">
              <MagneticEffect intensity={0.4}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer" data-familiar-reaction="wave"
                  aria-label={`${link.name} Profile`}
                  className="text-text-primary hover:text-accent text-sm md:text-base font-mono tracking-wider transition-colors relative group block py-2 px-4 flex flex-col items-center gap-2"
                  data-cursor="VIEW"
                >
                  <span className="font-bold text-lg">{link.name} ↗</span>
                  <span className="text-xs text-text-muted">{link.display}</span>
                  <span className="absolute -bottom-0 left-0 w-full h-[1px] bg-accent scale-x-0 origin-left group-hover:scale-x-100 transition-transform" />
                </a>
              </MagneticEffect>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between font-mono text-xs text-text-muted tracking-widest uppercase">
          <div>{profile.displayName}</div>
          <div className="mt-4 md:mt-0">2026 // ALL SYSTEMS NOMINAL</div>
        </div>
      </div>
    </footer>
  );
};
