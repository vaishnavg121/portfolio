"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Network } from "lucide-react";
import type { startStudio } from "./studio-runtime";
import { stationDetails, studioBays, type StudioStationId } from "./studio-plan";
import { studioScenarios, type ScenarioId, type StudioActivity, type StudioView } from "./studio-choreography";
import { StudioConnections } from "./StudioConnections";
import styles from "./ResearchStudio.module.css";

type Stage = NonNullable<ReturnType<typeof startStudio>>;
const overview: StudioView = {kind:"overview"};
const relatedScenario: Record<StudioStationId,ScenarioId> = {
  learning:"evidence", agentic:"evidence", markets:"risk", software:"feedback",
};

export function ResearchStudio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const explore = useRef<HTMLButtonElement>(null);
  const run = useRef(0);
  const runtime = useRef<Stage | null>(null);
  const touch = useRef<{ id: number; x: number; y: number; rotating: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<StudioView>(overview);
  const [hover, setHover] = useState<StudioStationId | null>(null);
  const [phase, setPhase] = useState<{ station: StudioStationId; index: number }>();
  const [activity, setActivity] = useState<StudioActivity | null>(null);
  const focused = view.kind === "station" ? view.id : null;
  const connection = view.kind === "connection" ? view.id : null;
  const details = focused ? stationDetails[focused] : null;
  const ambientBeat = view.kind === "overview" && activity?.beat && !activity.beat.guided ? activity.beat : null;

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
        runtime.current = startStudio(surface, () => setReady(true), (station, index) => setPhase({station,index}), setActivity);
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
      setActivity(null);
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
    runtime.current?.select(view);
  }, [view, ready]);

  function inspect(station: StudioStationId) {
    if (focused !== station) setView({kind:"station",id:station});
  }

  function guide(id: ScenarioId) {
    setActivity(null);
    setView({kind:"connection",id,run:++run.current});
  }

  function reset() {
    setView(overview);
    setHover(null);
    runtime.current?.highlight(null);
    const original = focused ? controls.current?.querySelector<HTMLButtonElement>(`[data-inspect="${focused}"]`) : explore.current;
    original?.focus({preventScroll:true});
  }

  return (
    <section id="research-studio" className={styles.studio} aria-labelledby="studio-title"
      data-studio-renderer={ready ? "webgl" : "fallback"} data-studio-view={focused ? "focus" : connection ? "connection" : "overview"}
      data-studio-station={focused ?? undefined} data-studio-connection={connection ?? undefined}
      data-studio-beat={activity?.beat ? `${activity.beat.id}:${activity.beat.index}` : undefined}
      onKeyDown={event => { if (event.key === "Escape" && view.kind !== "overview") reset(); }}>
      <header className={styles.heading} data-familiar-yield>
        <div>
          <h2 id="studio-title">The Research Studio</h2>
          <p>A miniature laboratory for the disciplines I work across.</p>
        </div>
        <button ref={explore} type="button" className={`portfolio-control ${styles.explore}`}
          aria-controls={connection ? "studio-connections" : undefined}
          onClick={() => view.kind === "overview" ? guide("evidence") : reset()}>
          {view.kind === "overview" ? <><Network size={14} aria-hidden />Explore connections</> : <><ArrowLeft size={14} aria-hidden />Overview</>}
        </button>
      </header>
      <div className={styles.stage} data-studio-stage data-familiar-protect data-familiar-yield data-familiar-margin="8" data-hover={hover ?? undefined}>
        {!ready && <div className={styles.fallback}>
          <Image fill unoptimized
            src={`/images/research-studio/${details?.image ?? "overview.webp"}`}
            alt={details?.alt ?? "A four-bay laboratory cutaway with forecasting, agentic retrieval, finance, and robotics workstations"} />
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
          onPointerLeave={() => { runtime.current?.lean(0); runtime.current?.highlight(null); setHover(null); }}
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
            if (!start?.rotating && start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 9) {
              const id = runtime.current?.hit(event.clientX, event.clientY);
              if (id) inspect(id);
            }
          }} />
        {details && <aside key={focused} id="studio-details" className={styles.details}>
          <p className={styles.kicker}>Conceptual sequence</p>
          <h3>{details.title}</h3>
          <p>{details.summary}</p>
          {"note" in details && <p className={styles.example}>{details.note}</p>}
          <ol className={styles.phases} aria-label={details.phaseLabel}>
            {details.phases.map((label, index) => (
              <li key={label} aria-current={ready && phase?.station === focused && phase.index === index ? "step" : undefined} data-studio-phase={index}>{label}</li>
            ))}
          </ol>
          <div className={styles.links}>
            {details.projects.map(project => (
              <Link key={project.href} className="portfolio-text-link" href={project.href}>{project.label} <ArrowUpRight size={12} aria-hidden /></Link>
            ))}
            {focused && <button type="button" className={styles.detailConnection} onClick={() => guide(relatedScenario[focused])}>View connection</button>}
          </div>
        </aside>}
      </div>
      <div ref={controls} className={styles.bays} role="group" aria-label="Inspect a workstation" data-familiar-yield>
        {studioBays.map(bay => (
          <button key={bay.id} type="button" className={styles.station} data-inspect={bay.id}
            data-highlight={bay.id === focused || bay.id === hover ? "" : undefined}
            data-related={connection && (studioScenarios[connection].pair as readonly StudioStationId[]).includes(bay.id) ? "" : undefined}
            aria-label={`Inspect ${stationDetails[bay.id].control}`}
            aria-expanded={focused === bay.id} aria-controls={focused === bay.id ? "studio-details" : undefined}
            onClick={() => inspect(bay.id)}>
            <span aria-hidden />{stationDetails[bay.id].control}
          </button>
        ))}
      </div>
      {view.kind === "overview" && <div className={styles.ambient} aria-hidden>{ambientBeat ? studioScenarios[ambientBeat.id].beats[ambientBeat.index].label : null}</div>}
      {connection && <StudioConnections id={connection} activity={activity} ready={ready} select={guide} stop={reset} />}
    </section>
  );
}
