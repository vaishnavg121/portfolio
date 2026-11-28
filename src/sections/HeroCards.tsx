"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';

// --- CUSTOM SYMBOLS (25-38% of card area, animated via CSS) ---

const IconWork = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-data-[active]:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Grid background */}
      <path d="M 12 12 L 36 12 M 12 24 L 36 24 M 12 36 L 36 36 M 12 12 L 12 36 M 24 12 L 24 36 M 36 12 L 36 36" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-30" />
      {/* Background Frame */}
      <rect x="10" y="14" width="22" height="16" fill="none" stroke="currentColor" className="group-data-[active]:-translate-x-1.5 group-data-[active]:-translate-y-1.5 transition-transform duration-500" />
      {/* Foreground Frame */}
      <rect x="16" y="18" width="22" height="16" fill="none" stroke="currentColor" className="group-data-[active]:translate-x-1.5 group-data-[active]:translate-y-1.5 transition-transform duration-500" />
      {/* Internal Rule */}
      <line x1="20" y1="26" x2="34" y2="26" stroke="currentColor" strokeDasharray="2 2" className="group-data-[active]:translate-x-1.5 group-data-[active]:translate-y-1.5 transition-transform duration-500" />
    </g>
    {/* Crimson Corner Marker */}
    <path d="M 38 18 L 40 18 L 40 20" fill="none" stroke="var(--accent)" strokeWidth="2" className="opacity-0 group-data-[active]:opacity-100 group-data-[active]:translate-x-1.5 group-data-[active]:translate-y-1.5 transition-all duration-500" />
    {/* Tiny Crimson Square */}
    <rect x="14" y="32" width="2" height="2" fill="var(--accent)" className="opacity-0 group-data-[active]:opacity-100 transition-opacity duration-500 delay-100" />
  </svg>
);

const IconKnowledge = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-data-[active]:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Graph network */}
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-50 group-data-[active]:scale-105 origin-center transition-transform duration-700" />
      {/* Topographic curves */}
      <path d="M 6 36 Q 16 28 26 36 T 46 28" fill="none" stroke="currentColor" />
      <path d="M 4 28 Q 18 16 30 28 T 48 16" fill="none" stroke="currentColor" strokeDasharray="4 2" />
      {/* Nodes */}
      <circle cx="16" cy="24" r="2" fill="currentColor" />
      <circle cx="34" cy="18" r="2" fill="currentColor" />
      <circle cx="26" cy="36" r="2" fill="currentColor" />
      <circle cx="38" cy="30" r="1.5" fill="currentColor" />
      {/* Connecting lines */}
      <line x1="16" y1="24" x2="26" y2="36" stroke="currentColor" strokeWidth="0.5" />
      <line x1="34" y1="18" x2="38" y2="30" stroke="currentColor" strokeWidth="0.5" />
    </g>
    {/* Highlighted route (crimson) */}
    <path d="M 16 24 L 34 18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="30" strokeDashoffset="30" className="opacity-0 group-data-[active]:opacity-100 group-data-[active]:[stroke-dashoffset:0] transition-all duration-[500ms]" />
    <circle cx="34" cy="18" r="3" fill="none" stroke="var(--accent)" className="opacity-0 group-data-[active]:opacity-100 transition-opacity duration-500 delay-200" />
  </svg>
);

const IconThriveForce = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-data-[active]:text-[#e8e4dc]/90 transition-colors duration-500 origin-center group-data-[active]:rotate-45">
      {/* Mechanical Axis / Hub */}
      <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" />
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeDasharray="1 2" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
      {/* Weapon Arc */}
      <path d="M 10 24 A 14 14 0 0 1 38 24" fill="none" stroke="currentColor" strokeDasharray="4 4" />
      {/* Crosshairs */}
      <line x1="24" y1="4" x2="24" y2="16" stroke="currentColor" />
      <line x1="24" y1="32" x2="24" y2="44" stroke="currentColor" />
      <line x1="4" y1="24" x2="16" y2="24" stroke="currentColor" />
      <line x1="32" y1="24" x2="44" y2="24" stroke="currentColor" />
    </g>
    {/* Impact Slash (crimson) */}
    <line x1="20" y1="20" x2="20" y2="20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" className="opacity-0 group-data-[active]:opacity-100 group-data-[active]:[x2:8] group-data-[active]:[y2:8] transition-all duration-[300ms]" />
    <circle cx="8" cy="8" r="1.5" fill="var(--accent)" className="opacity-0 group-data-[active]:opacity-100 transition-opacity duration-300 delay-200" />
  </svg>
);

const IconContact = () => (
  <svg viewBox="0 0 48 48" className="w-24 h-24 md:w-32 md:h-32 stroke-[1.5] transition-all duration-500">
    <g className="text-[#e8e4dc]/40 group-data-[active]:text-[#e8e4dc]/90 transition-colors duration-500">
      {/* Offset Connection Points */}
      <rect x="12" y="16" width="8" height="8" fill="none" stroke="currentColor" />
      <rect x="28" y="24" width="8" height="8" fill="none" stroke="currentColor" />
      {/* Signal rings */}
      <path d="M 8 12 A 20 20 0 0 1 36 12" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="group-data-[active]:-translate-y-2 transition-transform duration-700" />
      {/* Data traces */}
      <polyline points="16,24 16,32 28,32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    </g>
    {/* Directional Signal Line (crimson) */}
    <line x1="20" y1="20" x2="20" y2="20" stroke="var(--accent)" strokeWidth="1.5" className="opacity-0 group-data-[active]:opacity-100 group-data-[active]:[x2:28] group-data-[active]:[y2:28] transition-all duration-500" />
    {/* Terminal Pulse */}
    <circle cx="32" cy="28" r="2" fill="var(--accent)" className="opacity-0 group-data-[active]:opacity-100 transition-opacity duration-500 delay-200" />
    <rect x="30" y="26" width="4" height="4" fill="none" stroke="var(--accent)" className="opacity-0 group-data-[active]:opacity-100 transition-opacity duration-500 delay-300 scale-150" />
  </svg>
);

const CARDS = [
  { id: 'work', title: 'WORK', subtitle: 'SELECTED PROJECTS', num: '01', Icon: IconWork },
  { id: 'knowledge', title: 'KNOWLEDGE', subtitle: 'SKILLS LANDSCAPE', num: '02', Icon: IconKnowledge },
  { id: 'robotics', title: 'THRIVEFORCE', subtitle: 'ROBOTICS STORY', num: '03', Icon: IconThriveForce },
  { id: 'contact', title: 'CONTACT', subtitle: 'LET’S CONNECT', num: '04', Icon: IconContact }
];

// The original deck offset each card across the same stage and fanned its neighbors out on selection.
const RESTING_ROTATIONS = [-2, 1, -1, 2];
const SWIPE_DISTANCE = 36;

type TouchStart = { pointerId: number; x: number; y: number };

export const HeroCards = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const touchStart = useRef<TouchStart | null>(null);
  const wasSwipe = useRef(false);
  const active = hovered ?? focused ?? selected;
  const compactActive = active ?? 0;

  const selectCard = (index: number) => {
    setHovered(null);
    setFocused(null);
    setSelected(index);
  };

  const startTouch = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary) return;
    wasSwipe.current = false;
    if (event.pointerType === "touch") {
      touchStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    }
  };

  const finishTouch = (event: PointerEvent<HTMLElement>) => {
    const start = touchStart.current;
    if (start?.pointerId !== event.pointerId) return;
    touchStart.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.35) return;

    wasSwipe.current = true;
    const next = compactActive + (dx < 0 ? 1 : -1);
    selectCard(Math.max(0, Math.min(CARDS.length - 1, next)));
  };

  return (
    <nav
      className="hero-deck"
      aria-label="Quick Navigation"
      onPointerLeave={() => setHovered(null)}
      onPointerDown={startTouch}
      onPointerUp={finishTouch}
      onPointerCancel={event => {
        if (touchStart.current?.pointerId === event.pointerId) touchStart.current = null;
      }}
      onClickCapture={event => {
        if (event.detail === 0 || !wasSwipe.current) return;
        wasSwipe.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
      }}
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        setHovered(null);
        setFocused(null);
        setSelected(null);
      }}
    >
      {CARDS.map((card, index) => (
        <div
          key={card.id}
          className="hero-card group"
          data-active={active === index ? "" : undefined}
          data-direction={active === null ? undefined : Math.sign(index - active)}
          data-next={active !== null && index === active + 1 ? "" : undefined}
          data-compact-active={compactActive === index ? "" : undefined}
          data-compact-after={index > compactActive ? "" : undefined}
          style={{
            "--deck-order": index,
            "--deck-progress": index / (CARDS.length - 1),
            "--deck-turn": `${RESTING_ROTATIONS[index]}deg`,
            "--deck-settle": index % 2 === 0 ? "6px" : "10px",
          } as CSSProperties}
          onPointerMove={event => {
            if (event.pointerType === "mouse" && window.matchMedia("(width >= 43rem) and (hover: hover) and (pointer: fine)").matches) {
              setHovered(index);
              const card = event.currentTarget;
              const bounds = card.getBoundingClientRect();
              card.style.setProperty("--glint-x", ((event.clientX - bounds.left) / bounds.width * 100).toFixed(1) + "%");
              card.style.setProperty("--glint-y", ((event.clientY - bounds.top) / bounds.height * 100).toFixed(1) + "%");
            }
          }}
        >
          <div className="hero-card-heading">
            <span className="hero-card-number">{card.num}</span>
            <span className="hero-card-title">{card.title}</span>
          </div>
          <div className="hero-card-symbol" aria-hidden="true"><card.Icon /></div>
          <span className="hero-card-subtitle">{card.subtitle}</span>
          <button
            type="button"
            className="hero-card-select"
            aria-label={`Select ${card.title}`}
            aria-pressed={(selected ?? 0) === index}
            onFocus={event => {
              if (event.currentTarget.matches(":focus-visible")) {
                setHovered(null);
                setFocused(index);
              }
            }}
            onClick={() => selectCard(index)}
          />
          <Link
            className="hero-card-open"
            href={`#${card.id}`}
            aria-label={`Go to ${card.title}`}
            onFocus={event => {
              if (event.currentTarget.matches(":focus-visible")) {
                setHovered(null);
                setFocused(index);
              }
            }}
            onClick={() => {
              setHovered(null);
              setFocused(null);
            }}
          >
            <MoveRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ))}
    </nav>
  );
};
