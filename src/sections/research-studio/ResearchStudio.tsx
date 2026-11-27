"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, ScanLine } from "lucide-react";
import type { startStudio } from "./studio-runtime";
import { learningBay, learningPhases, studioBays } from "./studio-plan";
import styles from "./ResearchStudio.module.css";

type Stage = NonNullable<ReturnType<typeof startStudio>>;

export function ResearchStudio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const overview = useRef<HTMLButtonElement>(null);
  const runtime = useRef<Stage | null>(null);
  const touch = useRef<{ id: number; x: number; y: number; rotating: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface || !window.IntersectionObserver || !window.ResizeObserver) return;
    let seen = false, stopped = false, request = 0, starting = false;
    const reconcile = () => {
      runtime.current?.visible(seen && !document.hidden);
      if (!seen || document.hidden || runtime.current || starting) return;
      starting = true;
      const token = ++request;
      import("./studio-runtime").then(({ startStudio }) => {
        if (stopped || request !== token || !seen) return;
        runtime.current = startStudio(surface, () => setReady(true), setPhase);
        runtime.current?.visible(seen);
      }).catch(() => {
        if (!stopped) setReady(false);
      }).finally(() => {
        if (token === request) starting = false;
      });
    };
    const observe = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      reconcile();
    }, { threshold: .03 });
    observe.observe(surface);
    const lose = (event: Event) => {
      event.preventDefault();
      runtime.current?.dispose();
      runtime.current = null;
      setReady(false);
    };
    surface.addEventListener("webglcontextlost", lose);
    surface.addEventListener("webglcontextrestored", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      stopped = true;
      observe.disconnect();
      surface.removeEventListener("webglcontextlost", lose);
      surface.removeEventListener("webglcontextrestored", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      runtime.current?.dispose();
      runtime.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    runtime.current?.focus(focused);
  }, [focused, ready]);

  function inspect() {
    setFocused(true);
  }

  function reset() {
    setFocused(false);
    setHover(false);
    overview.current?.focus({ preventScroll: true });
  }

  return (
    <section id="research-studio" className={styles.studio} aria-labelledby="studio-title"
      data-studio-renderer={ready ? "webgl" : "fallback"} data-studio-view={focused ? "focus" : "overview"}
      onKeyDown={event => { if (event.key === "Escape" && focused) reset(); }}>
      <header className={styles.heading}>
        <div>
          <h2 id="studio-title">The Research Studio</h2>
          <p>Four disciplines, one shared laboratory.</p>
        </div>
        <button ref={overview} type="button" className={`portfolio-control ${styles.inspect}`} aria-expanded={focused}
          aria-controls="studio-details" onClick={focused ? reset : inspect}>
          {focused ? <ArrowLeft size={14} aria-hidden /> : <ScanLine size={14} aria-hidden />}
          {focused ? "Overview" : "Inspect AI / ML"}
        </button>
      </header>
      <div className={styles.stage} data-studio-stage data-hover={hover ? "" : undefined}>
        {!ready && <div className={styles.fallback}>
          <Image fill unoptimized
            src={focused ? "/images/research-studio/station.webp" : "/images/research-studio/overview.webp"}
            alt={focused ? "Forecasting workstation showing the sensor manifold, observation chamber, and plot planes"
              : "A four-bay architectural cutaway with a forecasting workstation in the front bay"} />
        </div>}
        <canvas ref={canvas} className={styles.canvas} data-studio-canvas aria-hidden
          onPointerMove={event => {
            if (!runtime.current) return;
            if (event.pointerType === "mouse") {
              const bounds = event.currentTarget.getBoundingClientRect();
              runtime.current.lean((event.clientX - bounds.left) / bounds.width * 2 - 1);
              const over = runtime.current.hit(event.clientX, event.clientY);
              runtime.current.highlight(over);
              setHover(value => value === over ? value : over);
            } else {
              const start = touch.current;
              if (start?.id !== event.pointerId) return;
              const dx = event.clientX - start.x, dy = event.clientY - start.y;
              if (Math.abs(dx) > 11 && Math.abs(dx) > Math.abs(dy) * 1.4) start.rotating = true;
              if (start.rotating) runtime.current.lean(Math.max(-.8, Math.min(.8, dx / 135)));
            }
          }}
          onPointerLeave={() => { runtime.current?.lean(0); runtime.current?.highlight(false); setHover(false); }}
          onPointerDown={event => {
            if (event.isPrimary && event.button === 0) touch.current = {
              id: event.pointerId, x: event.clientX, y: event.clientY, rotating: false,
            };
          }}
          onPointerCancel={() => { touch.current = null; runtime.current?.lean(0); }}
          onPointerUp={event => {
            const start = touch.current;
            touch.current = null;
            if (start?.rotating) runtime.current?.lean(0);
            if (!start?.rotating && start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 9
              && runtime.current?.hit(event.clientX, event.clientY)) inspect();
          }} />
        {focused && <aside id="studio-details" className={styles.details}>
          <p className={styles.kicker}>Conceptual sequence</p>
          <h3>Sensor to forecast</h3>
          <p>Follow observations through conditioning, model inference and a visibility forecast. The animation illustrates the pipeline.</p>
          <ol className={styles.phases} aria-label="Forecasting stages">
            {learningPhases.map((label, index) => (
              <li key={label} aria-current={ready && phase === index ? "step" : undefined} data-studio-phase={index}>{label}</li>
            ))}
          </ol>
          <div className={styles.links}>
            <Link className="portfolio-text-link" href="/work/imdpune">Vertical Visibility <ArrowUpRight size={12} aria-hidden /></Link>
            <Link className="portfolio-text-link" href="/work/windy">Windy <ArrowUpRight size={12} aria-hidden /></Link>
          </div>
        </aside>}
      </div>
      <ul className={styles.bays} aria-label="Studio workstations">
        {studioBays.map(bay => (
          <li key={bay.id} data-active={bay === learningBay ? "" : undefined}>
            <span aria-hidden />{bay.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
