"use client";

import { AtmosphereFilaments } from "@/components/AtmosphereFilaments";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Network, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { startStudio } from "./studio-runtime";
import { stationDetails, studioBays, studioObjects, type StudioStationId } from "./studio-plan";
import { studioScenarios, type ScenarioId, type StudioActivity, type StudioObjectId, type StudioView } from "./studio-choreography";
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
  const [hover, setHover] = useState<StudioStationId | StudioObjectId | null>(null);
  const [phase, setPhase] = useState<{ station: StudioStationId; index: number }>();
  const [activity, setActivity] = useState<StudioActivity | null>(null);
  const [panel, setPanel] = useState<"left" | "right">("right");
  const [channel, setChannel] = useState(0);
  const reducedMotion = useReducedMotion();
  const lastObjectControl = useRef<HTMLButtonElement | null>(null);
  const focused = view.kind === "station" ? view.id : null;
  const object = view.kind === "object" ? view.id : null;
  const connection = view.kind === "connection" ? view.id : null;
  const details = focused ? stationDetails[focused] : null;
  const objectDetails = object ? studioObjects[object] : null;
  const card = details ?? objectDetails;

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
        runtime.current = startStudio(surface, () => setReady(true), (station, index) => setPhase({station,index}), setActivity, setPanel);
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

  useEffect(() => {
    if (ready) runtime.current?.tune(channel);
  }, [channel, ready]);

  function inspect(id: StudioStationId | StudioObjectId) {
    if (id === focused || id === object) return;
    setView(Object.hasOwn(studioObjects,id)
      ? {kind:"object",id:id as StudioObjectId}
      : {kind:"station",id:id as StudioStationId});
  }

  function guide(id: ScenarioId) {
    setActivity(null);
    setView({kind:"connection",id,run:++run.current});
  }

  function reset() {
    setView(overview);
    setHover(null);
    runtime.current?.highlight(null);
    const original = focused ? controls.current?.querySelector<HTMLButtonElement>(`[data-inspect="${focused}"]`) : object ? lastObjectControl.current ?? explore.current : explore.current;
    original?.focus({preventScroll:true});
  }

  return (
    <section id="research-studio" className={styles.studio} aria-labelledby="studio-title"
      data-studio-renderer={ready ? "webgl" : "fallback"} data-studio-view={focused ? "focus" : object ? "object" : connection ? "connection" : "overview"}
      data-studio-station={focused ?? undefined} data-studio-connection={connection ?? undefined}
      data-studio-object={object ?? undefined}
      data-studio-beat={activity?.beat ? `${activity.beat.id}:${activity.beat.index}` : undefined}
      onKeyDown={event => { if (event.key === "Escape" && view.kind !== "overview") reset(); }}>
      <header className={styles.heading} data-familiar-yield>
        <div>
          <h2 id="studio-title">The Research Studio</h2>
          <p>I study Computer Science with a minor in Finance. This little room is full of things I enjoy learning about, building, and doing outside class.</p>
        </div>
        <button ref={explore} type="button" className={`portfolio-control ${styles.explore}`}
          aria-controls={connection ? "studio-connections" : undefined}
          onClick={() => view.kind === "overview" ? guide("evidence") : reset()}>
          {view.kind === "overview" ? <><Network size={14} aria-hidden />Explore connections</> : <><ArrowLeft size={14} aria-hidden />Overview</>}
        </button>
      </header>
      <div className={styles.stage} data-panel={card ? panel : undefined} data-studio-stage data-familiar-protect data-familiar-yield data-familiar-margin="8" data-hover={hover ?? undefined}>
        <AtmosphereFilaments zone="studio" />
        <div className={styles.viewport}>
        {!ready && <div className={styles.fallback}>
          <Image fill unoptimized src={`/images/research-studio/${object === "television" && channel === 1 ? "television-alt.webp" : card?.image ?? "overview.webp"}`}
            alt={object === "television" && channel === 1 ? "A television showing animated contour-inspired artwork" : card?.alt ?? "An architectural cutaway of four research workstations, a lounge, and a gaming desk"} />
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
              if (id) {
                lastObjectControl.current = null;
                if (id === "television" && object === id) setChannel(value => 1 - value);
                else inspect(id);
              }
            }
          }} />
        </div>
        <AnimatePresence initial={false}>
        {card && <motion.aside key="studio-details" id="studio-details" aria-labelledby="studio-card-title" className={styles.details}
          initial={reducedMotion ? false : {opacity:0,y:7,scale:.987}} animate={{opacity:1,y:0,scale:1}}
          exit={reducedMotion ? undefined : {opacity:0,y:3,transition:{duration:.12}}}
          transition={reducedMotion ? {duration:0} : {type:"spring",stiffness:385,damping:33}}
          data-familiar-protect data-familiar-yield>
          <div className={styles.cardHeading}>
            <h3 id="studio-card-title">{card.title}</h3>
            <button className={styles.close} type="button" aria-label="Close details" onClick={reset}><X size={15} aria-hidden /></button>
          </div>
          <p>{card.summary}</p>
          {details && <details className={styles.motionDetails}>
          <summary>What’s moving</summary>
          <ol className={styles.phases} aria-label={details.phaseLabel}>
            {details.phases.map((label, index) => (
              <li key={label} aria-current={ready && phase?.station === focused && phase.index === index ? "step" : undefined} data-studio-phase={index}>{label}</li>
            ))}
          </ol>
          </details>}
          <div className={styles.links}>
            {details?.projects.map(project => (
              <Link key={project.href} className="portfolio-text-link" href={project.href}>{project.label} <ArrowUpRight size={12} aria-hidden /></Link>
            ))}
            {object === "television" && <button type="button" className={styles.detailConnection} onClick={() => setChannel(value => 1 - value)}>Change scene</button>}
            {object === "television" && <span className={styles.channel} role="status">{channel === 0 ? "Evening ridge" : "Contour study"}</span>}
            {focused && <button type="button" className={styles.detailConnection} onClick={() => guide(relatedScenario[focused])}>View connection</button>}
          </div>
        </motion.aside>}
        </AnimatePresence>
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
      <details className={styles.roomObjects} data-familiar-protect data-familiar-yield>
        <summary>Explore the room</summary>
        <div role="group" aria-label="Personal objects">
          {(Object.keys(studioObjects) as StudioObjectId[]).map(id => (
            <button key={id} className={styles.detailConnection} type="button" data-object={id} aria-pressed={id === object}
              aria-controls={id === object ? "studio-details" : undefined}
              onClick={event => {lastObjectControl.current = event.currentTarget; inspect(id);}}>{studioObjects[id].title}</button>
          ))}
        </div>
      </details>
      {connection && <StudioConnections id={connection} activity={activity} ready={ready} select={guide} stop={reset} />}
    </section>
  );
}
