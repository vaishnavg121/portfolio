"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Crosshair, Hand, Minus, Plus, Search, X } from "lucide-react";
import { SKILL_DETAILS } from "@/lib/skill_details";
import {
  ATLAS_TERRITORIES, SKILLS, SKILLS_BY_ID, TERRITORIES_BY_ID, atlasSearch, relatedSkills, skillReferences,
  type AtlasTerritory, type AtlasSkill, type Selection,
} from "./knowledge/atlas-model";
import { PROJECT_ANCHORS } from "./knowledge/atlas-connections";
import { createAtlasScene } from "./knowledge/atlas-scene";
import "./knowledge/atlas.css";

type SelectAtlasItem = (selection: Selection, keyboard?: boolean, trigger?: HTMLElement) => void;

function ReferenceLinks({ references }: { references: ReturnType<typeof skillReferences> }) {
  return (
    <ul className="atlas-references">
      {references.map(reference => (
        <li key={reference.href ?? reference.label}>
          {reference.href ? (
            <Link className="portfolio-text-link" href={reference.href}>
              <span className="portfolio-link-label">{reference.label}</span>
              <ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
            </Link>
          ) : <span>{reference.label}</span>}
        </li>
      ))}
    </ul>
  );
}

function SkillList({ skills, bridges, select }: {
  skills: readonly AtlasSkill[];
  bridges?: Set<string>;
  select: SelectAtlasItem;
}) {
  return (
    <ul className="atlas-skill-list">
      {skills.map(skill => (
        <li key={skill.id}>
          <button type="button" onClick={event => select({type:"skill", id:skill.id}, event.detail === 0, event.currentTarget)}>
            <span className={bridges?.has(skill.id) ? "atlas-bridge-symbol" : "atlas-skill-symbol"} aria-hidden="true" />
            <span>{skill.label}</span>
            {bridges?.has(skill.id) && <small>{TERRITORIES_BY_ID.get(skill.territoryId)?.label}</small>}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const SkillsConstellation = () => {
  const stage = useRef<HTMLDivElement>(null);
  const webgl = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const scale = useRef<HTMLSpanElement>(null);
  const queryInput = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLUListElement>(null);
  const detail = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const scene = useRef<ReturnType<typeof createAtlasScene> | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [exploring, setExploring] = useState(false);
  const [query, setQuery] = useState("");
  const [more, setMore] = useState(false);
  const search = useMemo(() => atlasSearch(query).slice(0, 10), [query]);
  const skill = selection?.type === "skill" ? SKILLS_BY_ID.get(selection.id) : undefined;
  const territory = TERRITORIES_BY_ID.get(skill?.territoryId ?? selection?.id ?? "");
  const neighbors = useMemo(() => skill ? relatedSkills(skill.id) : [], [skill]);
  const references = useMemo(() => {
    if (skill) return skillReferences(skill);
    return Array.from(new Map((territory?.items ?? [])
      .flatMap(skillReferences).map(reference => [reference.href ?? reference.label, reference])).values());
  }, [skill,territory]);

  useEffect(() => {
    if (!stage.current || !webgl.current || !fallback.current || !labels.current || !scale.current || !detail.current) return;
    const element = stage.current;
    const controller = createAtlasScene({
      stage: element, webgl: webgl.current, fallback: fallback.current, labels: labels.current, scale: scale.current, popup: detail.current,
    }, () => setExploring(false));
    scene.current = controller;
    const selectRegion = (id: string | null) => {
      if (!id || !TERRITORIES_BY_ID.has(id)) return;
      const next = { type: "territory", id } as const;
      controller.select(next);
      setSelection(next);
    };
    const requested = new URLSearchParams(window.location.search).get("knowledge");
    selectRegion(requested);
    const jump = (event: Event) => selectRegion((event as CustomEvent<string>).detail);
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      controller.scaleBy(Math.exp(-event.deltaY * 0.009), {x:event.clientX,y:event.clientY});
    };
    window.addEventListener("portfolio:knowledge-region", jump);
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("portfolio:knowledge-region", jump);
      element.removeEventListener("wheel", wheel);
      controller.dispose();
      scene.current = null;
    };
  }, []);

  const choose = (next: Selection, keyboard = false, trigger?: HTMLElement) => {
    if (trigger) returnFocus.current = trigger;
    setSelection(next);
    setMore(false);
    setQuery("");
    scene.current?.select(next);
    if (detail.current) detail.current.scrollTop = 0;
    if (keyboard) {
      const focused = document.activeElement;
      requestAnimationFrame(() => {
        if (queryInput.current?.value || document.activeElement !== focused && document.activeElement !== document.body) return;
        closeButton.current?.focus({preventScroll:true});
      });
    }
  };

  const reset = () => {
    setSelection(null);
    setMore(false);
    setQuery("");
    scene.current?.select(null);
    if (detail.current) detail.current.scrollTop = 0;
  };

  const close = () => {
    reset();
    if (detail.current?.contains(document.activeElement)) requestAnimationFrame(() => {
      const trigger = returnFocus.current;
      if (trigger?.isConnected && !trigger.inert && trigger.getClientRects().length) trigger.focus({preventScroll:true});
      else queryInput.current?.focus({preventScroll:true});
    });
  };

  const toggleExploration = () => {
    if (exploring) scene.current?.clearGesture();
    setExploring(value => !value);
  };

  const startPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    scene.current?.down({
      pointerId:event.pointerId, pointerType:event.pointerType, x:event.clientX, y:event.clientY,
    }, exploring);
  };

  const mapKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const distance = 42;
    const moves: Record<string, [number, number]> = {ArrowLeft:[distance,0],ArrowRight:[-distance,0],ArrowUp:[0,distance],ArrowDown:[0,-distance]};
    if (moves[event.key]) {
      event.preventDefault();
      scene.current?.pan(...moves[event.key]);
    } else if (event.key === "+" || event.key === "-" || event.key === "Home") {
      event.preventDefault();
      if (event.key === "Home") reset();
      else scene.current?.scaleBy(event.key === "+" ? 1.26 : 1 / 1.26);
    }
  };

  const domainPanel = (region: AtlasTerritory) => (
    <>
      <p className="atlas-panel-copy">{region.description}</p>
      <h4>Skills in this region</h4>
      <SkillList skills={region.items} select={choose} />
      {references.length > 0 && <><h4>Projects & coursework</h4><ReferenceLinks references={references} /></>}
    </>
  );

  return (
    <section
      id="knowledge" aria-label="Knowledge Landscape" className="atlas-section portfolio-chapter"
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        if (query) { setQuery(""); queryInput.current?.focus(); }
        else if (exploring) { scene.current?.clearGesture(); setExploring(false); }
        else if (selection) close();
      }}
    >
      <div className="portfolio-frame">
        <header className="atlas-header">
          <h2 className="chapter-heading">Knowledge Landscape</h2>
          <p>Explore the connections between my skills and projects.</p>
        </header>
        <div className="atlas-toolbar" data-familiar-protect data-familiar-yield>
          <form role="search" className="atlas-search" onSubmit={event => {
            event.preventDefault();
            const match = atlasSearch(queryInput.current?.value ?? query)[0];
            // Keep typing focus in the search field when submitting it directly.
            if (match) choose(match, false, queryInput.current ?? undefined);
          }}>
            <div className="atlas-search-field">
              <Search aria-hidden="true" size={16} />
              <input type="search" ref={queryInput} aria-label="Search skills and regions" aria-controls="atlas-search-results"
                placeholder="Search atlas" value={query} onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "ArrowDown" && search.length) {
                    event.preventDefault();
                    results.current?.querySelector("button")?.focus();
                  }
                }} />
              {query && <button type="button" aria-label="Clear atlas search" onClick={() => {setQuery(""); queryInput.current?.focus();}}><X aria-hidden="true" size={15} /></button>}
            </div>
            <ul id="atlas-search-results" ref={results} className="atlas-search-results" hidden={!query.trim()}
              onKeyDown={event => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                const options = Array.from(results.current?.querySelectorAll("button") ?? []);
                const index = options.indexOf(document.activeElement as HTMLButtonElement);
                const next = index + (event.key === "ArrowDown" ? 1 : -1);
                if (next < 0) queryInput.current?.focus();
                else options[next]?.focus();
              }}>
              {search.map(result => (
                <li key={result.type + result.id}>
                  <button type="button" onClick={event => choose(result, event.detail === 0, queryInput.current ?? undefined)}>
                    <span>{result.label}</span><small>{result.context}</small><ArrowRight size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
              {query.trim() && search.length === 0 && <li className="atlas-no-match" role="status">No skills or regions match.</li>}
            </ul>
          </form>
          <div className="atlas-controls">
            <button className="atlas-explore" type="button" aria-controls="knowledge-map" aria-pressed={exploring}
              onClick={toggleExploration}><Hand size={15} aria-hidden="true" />{exploring ? "Finish exploring" : "Explore map"}</button>
            {selection && <button className="atlas-back" type="button" onClick={reset}><ArrowLeft size={15} aria-hidden="true" />Overview</button>}
            <div className="atlas-zoom" aria-label="Map controls" role="group">
              <button type="button" aria-label="Zoom out" onClick={() => scene.current?.scaleBy(1/1.31)}><Minus size={17} aria-hidden="true" /></button>
              <button type="button" aria-label="Zoom in" onClick={() => scene.current?.scaleBy(1.31)}><Plus size={17} aria-hidden="true" /></button>
              <button type="button" aria-label="Reset atlas view" onClick={reset}><Crosshair size={17} aria-hidden="true" /></button>
            </div>
          </div>
        </div>

        <div className="atlas-composition">
          <div className="atlas-main">
            <div
              className="atlas-map" id="knowledge-map" ref={stage} data-knowledge-canvas data-exploring={exploring || undefined}
              data-atlas-renderer="pending" data-familiar-protect data-familiar-margin="8" data-familiar-yield
              role="region" aria-label="Interactive knowledge map" aria-describedby="atlas-instructions" tabIndex={0}
              onKeyDown={mapKeys}
              onPointerDown={startPointer}
              onPointerMove={event => scene.current?.move({ pointerId:event.pointerId, pointerType:event.pointerType, x:event.clientX, y:event.clientY })}
              onPointerUp={event => scene.current?.up(event.pointerId)}
              onPointerLeave={event => {
                scene.current?.track(null);
                if (event.pointerType !== "touch" && !event.currentTarget.hasPointerCapture(event.pointerId)) scene.current?.up(event.pointerId);
              }}
              onPointerCancel={event => {scene.current?.up(event.pointerId);scene.current?.track(null);}}
              onLostPointerCapture={event => { if (event.target === event.currentTarget) scene.current?.up(event.pointerId); }}
              onClickCapture={event => {
                if (event.detail !== 0 && scene.current?.discardClick()) { event.preventDefault(); event.stopPropagation(); }
              }}
              onClick={event => {
                if (event.detail === 0 || (event.target as Element).closest("button,a")) return;
                const point = {x:event.clientX,y:event.clientY};
                scene.current?.impulse(point);
                const nearest = scene.current?.nearest(point);
                if (nearest) choose(nearest, false, event.currentTarget);
                else if (selection) reset();
              }}
            >
              <canvas ref={webgl} className="atlas-webgl" aria-hidden="true" />
              <canvas ref={fallback} className="atlas-fallback" aria-hidden="true" />
              <div className="atlas-markers" ref={labels}>
                {ATLAS_TERRITORIES.map(region => (
                  <button type="button" key={region.id} className="atlas-marker atlas-region-marker"
                    data-atlas-marker={"territory-" + region.id} aria-label={region.title} tabIndex={-1} inert
                    aria-pressed={territory?.id === region.id}
                    onPointerEnter={event => {if(event.pointerType==="mouse")scene.current?.preview(region.id);}}
                    onPointerLeave={() => scene.current?.preview(null)}
                    onFocus={() => scene.current?.preview(region.id)}
                    onBlur={() => scene.current?.preview(null)}
                    onClick={event => choose({type:"territory",id:region.id},event.detail === 0,event.currentTarget)}>
                    <span className="atlas-marker-wide">{region.label}</span>
                    <span className="atlas-marker-compact">{region.compactLabel ?? region.label}</span>
                  </button>
                ))}
                {SKILLS.map(item => (
                  <button type="button" key={item.id} className="atlas-marker atlas-skill-marker"
                    data-atlas-marker={"skill-" + item.id} aria-label={item.label} tabIndex={-1} inert aria-pressed={item.id === skill?.id}
                    onPointerEnter={event => {if(event.pointerType==="mouse")scene.current?.previewSkill(item.id);}}
                    onPointerLeave={() => scene.current?.previewSkill(null)}
                    onFocus={() => scene.current?.previewSkill(item.id)}
                    onBlur={() => scene.current?.previewSkill(null)}
                    onClick={event => choose({type:"skill", id:item.id},event.detail === 0,event.currentTarget)}>
                    {item.label}
                  </button>
                ))}
                {PROJECT_ANCHORS.map(project => (
                  <Link href={project.href} key={project.href} className="atlas-marker atlas-project-marker"
                    data-atlas-marker={"project-" + project.href} aria-label={"Open project " + project.label}
                    tabIndex={-1} inert prefetch={false}>
                    <span>{project.label}</span>
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="atlas-scale" aria-hidden="true"><span ref={scale}>1.0×</span></div>
            </div>
            <div className="atlas-map-caption">
              <p id="atlas-instructions">
                <span className="atlas-desktop-hint">Select a region · Drag to pan · + / − to zoom</span>
                <span className="atlas-mobile-hint">{exploring ? "Drag or pinch here · Scroll outside the terrain" : "Tap a region · Explore map to drag and pinch"}</span>
              </p>
            </div>
          </div>
          <aside className="atlas-inspector" aria-label="Atlas details" ref={detail} hidden={!territory}
            data-selection={selection?.type} data-familiar-protect data-familiar-margin="8" data-familiar-yield>
            {territory ? (
              <div className="atlas-detail-content" key={skill?.id ?? territory.id}>
                <div className="atlas-panel-head">
                  <div>
                    {skill && <p className="atlas-kicker">{territory.label}</p>}
                    <h3>{skill?.label ?? territory.title}</h3>
                  </div>
                  <button type="button" ref={closeButton} aria-label="Close landscape details"
                    onClick={close}><X size={18} aria-hidden="true" /></button>
                </div>
                {skill ? (
                  <>
                    {SKILL_DETAILS[skill.id] && <p className="atlas-panel-copy">{SKILL_DETAILS[skill.id].description}</p>}
                    <button type="button" className="atlas-more" aria-expanded={more} onClick={() => setMore(value=>!value)}>
                      {more ? "Show less" : "Projects and connections"}<ArrowRight size={14} aria-hidden="true" />
                    </button>
                    <div className="atlas-detail-links" data-open={more || undefined}>
                      {references.length > 0 && <><h4>Used in</h4><ReferenceLinks references={references} /></>}
                      <h4>Connected skills</h4>
                      {neighbors.length > 0 ? <SkillList skills={neighbors.map(entry => entry.skill)}
                        bridges={new Set(neighbors.filter(entry => entry.bridge).map(entry => entry.skill.id))} select={choose} />
                        : <p className="atlas-panel-copy">No direct relationships recorded.</p>}
                    </div>
                  </>
                ) : domainPanel(territory)}
              </div>
            ) : null}
          </aside>
        </div>
        <span className="sr-only" role="status">{skill ? skill.label + " skill details" : territory ? territory.title + " region details" : ""}</span>
      </div>
    </section>
  );
};
