"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import "./beyond-code.css";

const interests = [
  { id: "robotics", name: "Robotics", detail: "Mechanical design, testing, and the iterative work behind a physical build.", href: "#robotics", action: "Explore ThriveForce" },
  { id: "gaming", name: "PC gaming", detail: "PC games are one of the ways I spend time away from technical work." },
  { id: "sketching", name: "Sketching", detail: "An interest in working through shapes and visual ideas with pencil and paper." },
  { id: "movies", name: "Movies", detail: "A space for stories told through framing, light, and timing." },
  { id: "photography", name: "Photography", detail: "An interest in framing and the small details a camera can bring into focus." },
  { id: "experiments", name: "Experiments", detail: "Small creative and technical studies, including the ideas explored in Engineering Notes.", href: "#notes", action: "Read Engineering Notes" },
] as const;
type Interest = typeof interests[number];

function ObjectDrawing({ name }: { name: Interest["id"] }) {
  if (name === "robotics") return <Image className="object-robot" src="/assets/robotics/velociraptor/renders/velociraptor-main.png"
    width={240} height={180} sizes="(width < 720px) 150px, 225px" alt="" />;
  let art: ReactNode;
  if (name === "gaming") art = <>
    <path d="M63 78 C42 81 31 104 28 131 C25 149 36 156 49 147 L76 126 H140 L167 148 C181 158 195 150 194 134 C192 107 180 84 160 79Z"
      fill="var(--object-dark)" stroke="var(--object-rim)" strokeWidth="2" />
    <path d="M65 63 C43 66 32 88 29 115 C26 134 37 140 51 131 L78 110 H142 L170 132 C184 142 196 134 194 117 C191 91 181 68 160 64Z"
      fill="url(#gaming-glass)" stroke="var(--object-rim)" strokeWidth="2" />
    <path d="M76 75 Q111 62 151 75 M48 115 Q61 122 69 111" stroke="var(--object-light)" fill="none" opacity=".7" />
    <path className="object-press-piece" d="M61 82 H69 V91 H78 V99 H69 V108 H61 V99 H52 V91 H61Z" fill="var(--object-light)" stroke="var(--object-rim)" />
    <g className="object-press-piece" fill="var(--object-light)" stroke="var(--object-rim)">
      <circle cx="158" cy="82" r="5" /><circle cx="149" cy="92" r="5" /><circle cx="168" cy="92" r="5" /><circle cx="158" cy="102" r="5" />
    </g>
    <path d="M93 87 H103 M119 87 H129" stroke="var(--object-light)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="94" cy="105" r="9" fill="var(--object-dark)" stroke="var(--object-rim)" /><circle cx="129" cy="105" r="9" fill="var(--object-dark)" stroke="var(--object-rim)" />
  </>;
  if (name === "sketching") art = <>
    <path d="M27 65 Q72 46 109 77 Q142 45 194 57 L187 132 Q146 125 109 149 Q68 125 32 140Z" fill="var(--object-dark)" stroke="var(--object-rim)" />
    <path d="M24 55 Q67 42 109 68 L109 140 Q70 114 28 128Z" fill="url(#sketching-glass)" stroke="var(--object-rim)" />
    <g className="object-page">
      <path d="M109 68 Q155 37 195 49 L190 120 Q146 116 109 140Z" fill="url(#sketching-glass)" stroke="var(--object-rim)" />
      <path d="M122 80 Q146 66 171 66 M122 88 Q143 76 166 76 M123 98 Q147 83 181 84" stroke="var(--object-light)" opacity=".46" fill="none" />
    </g>
    <path d="M41 68 Q68 62 93 80 M41 77 Q67 69 88 88 M44 95 Q54 76 74 98" stroke="var(--object-light)" opacity=".52" fill="none" />
    <path d="M139 139 L191 97 l5 5 -52 42 -11 2Z" fill="var(--object-rim)" /><path d="M139 139 l5 5 -11 2Z" fill="var(--text-primary)" />
    <path d="M109 68 V140" stroke="var(--object-light)" opacity=".48" />
  </>;
  if (name === "movies") art = <>
    <path d="M22 111 C35 64 66 48 106 63 S170 113 202 77 L194 121 C168 156 141 121 103 103 S47 104 30 144Z"
      fill="url(#movies-glass)" stroke="var(--object-rim)" />
    <path d="M26 119 C43 80 63 59 105 72 S171 124 198 88 M30 135 C48 96 66 72 103 93 S166 145 195 111"
      fill="none" stroke="var(--object-light)" strokeWidth="3" strokeDasharray="4 6" opacity=".62" />
    <g className="object-frames" fill="var(--object-light)" fillOpacity=".23" stroke="var(--object-light)" strokeOpacity=".42">
      <path d="M42 109 Q50 94 62 88 L70 75 Q58 78 48 89Z" />
      <path d="M79 82 Q90 81 109 91 L113 79 Q96 71 85 72Z" />
      <path d="M122 98 L142 110 L145 99 L126 88Z" />
      <path d="M151 115 Q164 123 177 116 L180 104 Q165 110 154 104Z" />
    </g>
  </>;
  if (name === "photography") art = <>
    <path d="M54 67 L73 47 H109 L121 61 H165 Q185 61 185 79 V127 Q185 141 166 141 H53 Q36 141 36 128 V83 Q36 67 54 67Z"
      fill="var(--object-dark)" stroke="var(--object-rim)" strokeWidth="2" />
    <path d="M52 60 L71 43 H106 L120 55 H162 Q180 55 180 73 V118 Q180 135 164 135 H52 Q36 135 36 117 V76 Q36 60 52 60Z"
      fill="url(#photography-glass)" stroke="var(--object-rim)" strokeWidth="2" />
    <path d="M46 70 H67 M144 65 H167 M45 117 H56" stroke="var(--object-light)" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
    <circle cx="107" cy="94" r="37" fill="var(--object-dark)" stroke="var(--object-rim)" strokeWidth="2" />
    <circle cx="107" cy="94" r="27" fill="url(#photography-glass)" stroke="var(--object-light)" opacity=".81" />
    <g className="object-aperture">
      <circle cx="107" cy="94" r="18" fill="var(--object-dark)" stroke="var(--object-rim)" />
      <path d="M107 76 l10 16 -8 17 -16 -1 -5 -13 12 -13Z M97 79 l11 15 17 -2" fill="var(--object-light)" fillOpacity=".19" stroke="var(--object-light)" strokeOpacity=".55" />
      <circle cx="101" cy="88" r="4" fill="var(--object-light)" opacity=".69" />
    </g>
    <rect x="143" y="74" width="21" height="11" rx="3" fill="var(--object-dark)" stroke="var(--object-rim)" />
  </>;
  if (name === "experiments") art = <>
    <ellipse cx="110" cy="139" rx="53" ry="11" fill="var(--object-dark)" stroke="var(--object-rim)" opacity=".75" />
    <g className="object-orbit">
      <path d="M109 26 C47 33 56 107 110 128 C173 116 171 48 109 26Z" fill="url(#experiments-glass)" stroke="var(--object-rim)" />
      <g fill="none" stroke="var(--object-light)">
        <ellipse cx="109" cy="78" rx="58" ry="25" transform="rotate(23 109 78)" opacity=".68" />
        <ellipse cx="109" cy="78" rx="53" ry="22" transform="rotate(-31 109 78)" opacity=".46" />
        <ellipse cx="109" cy="78" rx="18" ry="48" transform="rotate(-24 109 78)" opacity=".58" />
        <path d="M56 77 Q112 59 165 79 M83 42 Q113 91 139 115" opacity=".35" />
      </g>
      <circle cx="106" cy="78" r="5" fill="var(--object-light)" /><circle cx="145" cy="76" r="3" fill="var(--object-rim)" /><circle cx="76" cy="95" r="3" fill="var(--object-light)" />
    </g>
  </>;
  return <svg viewBox="0 0 220 172" aria-hidden="true">
    <defs><linearGradient id={name + "-glass"} x1="0" y1="0" x2="1" y2="1">
      <stop stopColor="var(--object-light)" stopOpacity=".8" />
      <stop offset=".49" stopColor="var(--object-rim)" stopOpacity=".51" />
      <stop offset="1" stopColor="var(--object-dark)" />
    </linearGradient></defs>{art}
  </svg>;
}

export function BeyondCode() {
  const [selected, setSelected] = useState<Interest["id"] | null>(null);
  const shelf = useRef<HTMLDivElement>(null);
  const scrollTarget = useRef<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement>(null);
  const detail = interests.find(interest => interest.id === selected);
  const close = (restoreFocus = false) => {
    setSelected(null);
    if (restoreFocus) lastTrigger.current?.focus({ preventScroll: true });
  };
  const travel = (direction: number) => {
    const container = shelf.current;
    if (!container) return;
    const limit = container.scrollWidth - container.clientWidth;
    const padding = parseFloat(getComputedStyle(container).scrollPaddingInlineStart) || 0;
    const stops = Array.from(new Set(Array.from(container.children, item =>
      Math.max(0, Math.min(limit, (item as HTMLElement).offsetLeft - padding)),
    )));
    const position = scrollTarget.current ?? container.scrollLeft;
    const closest = stops.reduce((best, stop, index) => Math.abs(stop - position) < Math.abs(stops[best] - position) ? index : best, 0);
    const next = stops[Math.max(0, Math.min(stops.length - 1, closest + direction))];
    if (next === undefined) return;
    scrollTarget.current = next;
    container.scrollTo({
      left: next,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return <section id="beyond" className="portfolio-chapter passion-section" aria-labelledby="beyond-title"
    onKeyDown={event => { if (event.key === "Escape" && selected) close(true); }}>
    <div className="portfolio-frame">
      <header className="passion-header">
        <h2 id="beyond-title" className="chapter-heading">Beyond the Code</h2>
        <div className="passion-scroll" role="group" aria-label="Browse interests">
          <button type="button" className="portfolio-control" aria-label="Previous interests" onClick={() => travel(-1)}><ArrowLeft size={16} /></button>
          <button type="button" className="portfolio-control" aria-label="Next interests" onClick={() => travel(1)}><ArrowRight size={16} /></button>
        </div>
      </header>
      <div className="passion-shelf" ref={shelf} data-familiar-protect data-familiar-yield
        onPointerDown={() => { scrollTarget.current = null; }}
        onWheel={() => { scrollTarget.current = null; }}
        onScroll={event => {
          if (scrollTarget.current !== null && Math.abs(event.currentTarget.scrollLeft - scrollTarget.current) <= 1) scrollTarget.current = null;
        }}>
        {interests.map(interest => <button type="button" className="passion-object" key={interest.id}
          data-object={interest.id} aria-pressed={selected === interest.id} aria-controls="passion-details"
          onClick={event => {
            lastTrigger.current = event.currentTarget;
            setSelected(current => current === interest.id ? null : interest.id);
          }}>
          <span className="passion-art"><ObjectDrawing name={interest.id} /></span>
          <span className="passion-caption">{interest.name}</span>
        </button>)}
      </div>
      <div id="passion-details" className="passion-details" data-open={detail ? "" : undefined} aria-live="polite"
        data-familiar-protect data-familiar-yield>
        {detail ? <>
          <div><h3>{detail.name}</h3><p>{detail.detail}</p></div>
          {"href" in detail && <Link href={detail.href} className="portfolio-text-link">
            <span className="portfolio-link-label">{detail.action}</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
          </Link>}
          <button type="button" className="portfolio-control passion-close" aria-label="Close interest details"
            onClick={event => close(event.detail === 0)}><X size={16} aria-hidden="true" /></button>
        </> : <p>Select an object to see what it represents.</p>}
      </div>
    </div>
  </section>;
}
