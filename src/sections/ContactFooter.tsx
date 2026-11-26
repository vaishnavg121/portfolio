"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

import { profile, socials } from "@/lib/profile";

export const ContactFooter = () => {
  const containerRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: containerRef.current, start: "top 82%", once: true } });
      tl.from(".contact-label, .contact-build, .contact-interesting, .contact-link", {
        opacity: 0.62, y: 12, duration: 0.46, stagger: 0.075, ease: "power3.out", clearProps: "transform,opacity",
      }).from(".contact-line", { scaleX: 0, duration: 0.55, ease: "power2.out" }, 0.12);
    }, containerRef);
    return () => media.revert();
  }, { scope: containerRef });

  const LINKS = [
    { name: "GitHub", display: <>github.com/<wbr />vaishnavg121</>, url: socials.github },
    { name: "LinkedIn", display: "Venkatanaga Vaishnav Gadamsetty", url: socials.linkedin }
  ];

  return (
    <footer className="contact-section portfolio-chapter chapter-divider relative overflow-hidden" id="contact" ref={containerRef}>
      <div className="portfolio-frame relative z-10 flex flex-col items-center text-center">

        <div className="mb-8 lg:mb-16 relative">
          <p
            className="contact-label text-text-muted font-mono text-sm tracking-widest uppercase relative z-10 mb-5 lg:mb-8"
            data-familiar-avoid
          >
            Initiate communication sequence
          </p>

          <h2 className="text-[clamp(1.9rem,8vw,3.5rem)] lg:text-7xl font-display font-medium mb-6 tracking-tight relative">
            <span
              className="contact-build inline-block relative z-10"
              data-familiar-avoid
            >
              LET&apos;S BUILD SOMETHING <br className="hidden md:block" />
            </span>

            <span
              className="contact-interesting text-accent italic font-serif inline-block relative z-10"
              data-familiar-avoid
            >
              INTERESTING.
            </span>
          </h2>

          <div data-familiar-anchor className="absolute top-1/2 -right-32 w-4 h-4 pointer-events-none" />
        </div>

        <div className="contact-line w-24 h-[1px] bg-border mb-7 lg:mb-16 origin-center" />

        <div className="contact-actions mb-10 lg:mb-16" data-familiar-avoid>
          {LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer" data-familiar-reaction="wave"
              aria-label={`${link.name} Profile`}
              className="contact-link portfolio-text-link contact-profile-link font-mono tracking-wide"
              data-cursor="VIEW"
            >
              <span className="inline-flex items-center gap-2 text-base font-medium">
                <span className="portfolio-link-label">{link.name}</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
              </span>
              <span className="break-words text-xs text-text-muted">{link.display}</span>
            </a>
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
