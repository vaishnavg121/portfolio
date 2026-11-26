import {
  cameraAt, constrainPan, fitCamera, moveCamera, resizeCamera, sampleGesture,
  type Camera, type GestureSample, type Point,
} from "@/lib/knowledge-camera";
import { ATLAS_BOUNDS, ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, type Selection } from "./atlas-model";
import { getVisibleSkills, screenPoint, type AtlasRenderer, type SceneFrame } from "./atlas-geometry";
import { makeCanvasAtlas } from "./atlas-canvas";

type AtlasElements = {
  stage: HTMLDivElement;
  webgl: HTMLCanvasElement;
  fallback: HTMLCanvasElement;
  labels: HTMLDivElement;
  scale: HTMLSpanElement;
};
type Marker = { element: HTMLButtonElement; width: number; visible: boolean };
type Motion = { start: number; from: Camera; to: Camera; duration: number };
type Pointer = { x: number; y: number; pointerId: number; pointerType: string };

const clamp = (n: number, lower: number, upper: number) => Math.max(lower, Math.min(upper, n));
const ease = (n: number) => n * n * (3 - n * 2);

export function createAtlasScene(
  { stage, webgl, fallback, labels, scale }: AtlasElements,
  leaveMap: () => void,
) {
  let world = { width: 1, height: 1, scale: 1 };
  let defaultView = fitCamera(ATLAS_BOUNDS, world);
  let camera = defaultView;
  let width = 1;
  let height = 1;
  let stretch = 1;
  let selection: Selection | null = null;
  let overview = true;
  let level = 0;
  let motion: Motion | null = null;
  let visible = false;
  let progress = 0;
  let formationStart = -1;
  let signalStart = -1;
  let frameId = 0;
  let selectionTime = 0;
  let disposed = false;
  let started = false;
  let renderer: AtlasRenderer | null = null;
  let rendererType = "pending";
  let setupWebGL: typeof import("./atlas-webgl")["makeWebGLAtlas"] | undefined;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(pointer: coarse)").matches;
  stage.toggleAttribute("data-atlas-touch", navigator.maxTouchPoints > 0);
  const marks = new Map<string, Marker>();
  const touches = new Map<number, Point>();
  let inputStart: Pointer | null = null;
  let lastGesture: GestureSample | null = null;
  let dragged = false;

  for (const element of labels.querySelectorAll<HTMLButtonElement>("[data-atlas-marker]")) {
    marks.set(element.dataset.atlasMarker!, { element, width: 0, visible: false });
  }

  const zoomLimits = () => [defaultView.z, Math.max(defaultView.z * 6, 3)] as const;
  const fit = () => {
    if (!selection) return defaultView;
    const skill = selection.type === "skill" ? SKILLS_BY_ID.get(selection.id) : null;
    const region = TERRITORIES_BY_ID.get(skill?.territoryId ?? selection.id);
    if (!region) return defaultView;
    const [min, max] = zoomLimits();
    if (skill) {
      const mobile = width < 640;
      const zoom = clamp(Math.min(width / (mobile ? 225 : 320), world.height / 208), min * 1.7, max);
      return cameraAt({ x: skill.anchor.x, y: skill.anchor.y + 22 / (zoom * stretch) }, zoom);
    }
    const points = region.items.map(item => item.anchor);
    const bounds = {
      left: Math.min(...points.map(p => p.x), region.marker.x) - 59,
      right: Math.max(...points.map(p => p.x), region.marker.x) + 59,
      top: Math.min(...points.map(p => p.y), region.marker.y) - 46,
      bottom: Math.max(...points.map(p => p.y), region.marker.y) + 53,
    };
    const target = fitCamera(bounds, world);
    const zoom = clamp(target.z, min * 1.26, Math.min(max, 2.55));
    return cameraAt({ x: -target.x / target.z, y: -target.y / target.z }, zoom);
  };

  const displayLabels = (state: SceneFrame) => {
    const visibleSkills = getVisibleSkills(selection, level);
    const candidates = visibleSkills.length
      ? visibleSkills.map(skill => ({ key: "skill-" + skill.id, position: skill.anchor, pinned: selection?.id === skill.id }))
      : ATLAS_TERRITORIES.map(region => ({ key: "territory-" + region.id, position: region.marker, pinned: false }));
    const accepted: {l:number; r:number; t:number; b:number}[] = [];
    const shown = new Set<string>();
    const earliest = selection?.type === "skill" ? .88 : .74;
    if (progress >= earliest) for (const target of candidates) {
      const mark = marks.get(target.key);
      if (!mark) continue;
      if (!mark.width) mark.width = mark.element.offsetWidth;
      const position = screenPoint(target.position, state);
      const region = target.key.startsWith("territory");
      // Keep labels close to their anchors. Prefer their previous arrangement as the camera passes thresholds.
      const offsets = region ? [[0, -24], [0, 21]] : [[0, -20], [0, 22], [13, 0], [-13, 0]];
      for (const [index, [dx, dy]] of offsets.entries()) {
        const x = position.x + dx + (index < 2 ? 0 : (index === 2 ? 0.5 : -0.5) * mark.width);
        const y = position.y + dy;
        const w = mark.width / 2;
        const h = (region ? 22 : 16) / 2;
        const rect = { l: x - w - 2, r: x + w + 2, t: y - h - 2, b: y + h + 2 };
        const edge = region ? 3 : 5;
        if (rect.l < edge || rect.r > width - edge || rect.t < edge || rect.b > height - edge) continue;
        if (!target.pinned && accepted.some(a => rect.l < a.r && rect.r > a.l && rect.t < a.b && rect.b > a.t)) continue;
        mark.element.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%)";
        mark.element.dataset.anchor = String(index);
        shown.add(target.key);
        accepted.push(rect);
        break;
      }
    }
    for (const [key, mark] of marks) {
      const show = shown.has(key);
      if (mark.visible === show) continue;
      mark.visible = show;
      mark.element.toggleAttribute("data-visible", show);
      mark.element.tabIndex = show ? 0 : -1;
      mark.element.inert = !show;
    }
  };

  function render(now: number) {
    frameId = 0;
    if (!visible || document.hidden || disposed || width < 2 || rendererType === "pending") return;
    if (formationStart === -1) formationStart = now;
    progress = reduced.matches || rendererType !== "webgl" ? 1 : clamp((now - formationStart) / 1120, 0, 1);
    if (motion) {
      const fraction = reduced.matches ? 1 : clamp((now - motion.start) / motion.duration, 0, 1);
      const t = ease(fraction);
      const {from,to} = motion;
      camera = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, z: from.z + (to.z - from.z) * t };
      if (fraction === 1) motion = null;
    }
    const relative = camera.z / defaultView.z;
    const next = relative > (level === 2 ? 2.60 : 2.94) ? 2 : relative > (level > 0 ? 1.35 : 1.58) ? 1 : 0;
    level = next;
    const signal = reduced.matches || signalStart < 0 || rendererType !== "webgl" ? -1 : (now - signalStart) / 940;
    const state = { camera, width, height, stretch, level, progress, selection, signal };
    renderer?.draw(state);
    displayLabels(state);
    const magnification = relative.toFixed(1) + "×";
    if (scale.textContent !== magnification) scale.textContent = magnification;
    stage.dataset.atlasLevel = String(level);
    stage.dataset.atlasFormation = progress < 1 ? "assembling" : "settled";
    if (motion || progress < 1 || (signal >= 0 && signal < 1)) schedule();
  }

  function schedule() {
    if (!frameId && visible && !document.hidden && !disposed) frameId = requestAnimationFrame(render);
  }

  function setRenderer(next: AtlasRenderer | null, type: string) {
    renderer = next;
    rendererType = type;
    stage.dataset.atlasRenderer = type;
    schedule();
  }

  function switchToFallback() {
    const fallbackRenderer = makeCanvasAtlas(fallback);
    setRenderer(fallbackRenderer, fallbackRenderer ? "canvas" : "labels");
  }

  const loseContext = (event: Event) => {
    event.preventDefault();
    renderer = null;
    switchToFallback();
  };

  const restoreContext = () => {
    if (!setupWebGL || disposed) return;
    const restored = setupWebGL(webgl, compact || width < 680);
    if (restored) {
      renderer?.dispose();
      setRenderer(restored, "webgl");
    }
  };

  async function setup() {
    if (started) return;
    started = true;
    try {
      setupWebGL = (await import("./atlas-webgl")).makeWebGLAtlas;
      if (disposed) return;
      const initial = setupWebGL(webgl, compact || width < 680);
      if (initial) {
        formationStart = -1;
        setRenderer(initial, "webgl");
        return;
      }
    } catch {
      if (disposed) return;
    }
    switchToFallback();
  }

  function measure() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h || (w === width && h === height)) return;
    const wasUnmeasured = width === 1;
    const oldStretch = stretch;
    width = w;
    height = h;
    stretch = width < 580 ? 1.40 : 1;
    world = { width, height: height / stretch, scale: 1 };
    defaultView = fitCamera(ATLAS_BOUNDS, world);
    if (selection && (overview || motion || !dragged)) camera = fit();
    else if (overview || wasUnmeasured) camera = defaultView;
    else {
      const [min,max] = zoomLimits();
      camera = constrainPan(resizeCamera(camera, oldStretch, stretch, min, max), ATLAS_BOUNDS, world);
    }
    motion = null;
    for (const mark of marks.values()) mark.width = 0;
    stage.dataset.atlasCompact = width < 580 || height < 320 ? "true" : "false";
    schedule();
  }

  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      measure();
      void setup();
      schedule();
    } else {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      clearGesture();
      if (formationStart >= 0) formationStart = -Infinity;
      leaveMap();
    }
  }, { threshold: 0.025 });
  intersection.observe(stage);

  const handleVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else schedule();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  reduced.addEventListener("change", schedule);
  webgl.addEventListener("webglcontextlost", loseContext);
  webgl.addEventListener("webglcontextrestored", restoreContext);

  function animateTo(target: Camera, duration = 590) {
    if (reduced.matches || !visible || rendererType !== "webgl") {
      camera = target;
      motion = null;
    } else motion = { from: camera, to: target, start: performance.now(), duration };
    schedule();
  }

  function local({x,y}: Point) {
    const rect = stage.getBoundingClientRect();
    return {x: x - rect.left - width / 2, y: (y - rect.top - height / 2) / stretch};
  }

  function move(from: GestureSample, to: GestureSample) {
    const [min,max] = zoomLimits();
    camera = constrainPan(moveCamera(camera, from, to, min, max), ATLAS_BOUNDS, world);
    overview = false;
    schedule();
  }

  function clearGesture() {
    const oldPointers = Array.from(touches.keys());
    touches.clear();
    inputStart = null;
    lastGesture = null;
    for (const id of oldPointers) if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  }

  measure();
  return {
    select(next: Selection | null) {
      const now = performance.now();
      if (next?.id === selection?.id && next?.type === selection?.type && now - selectionTime < 70) return;
      selection = next;
      selectionTime = now;
      dragged = false;
      overview = !next;
      signalStart = next ? now : -1;
      animateTo(fit(), next ? 610 : 560);
    },
    scaleBy(factor: number, point?: Point) {
      motion = null;
      const center = point ? local(point) : {x:0, y:0};
      move({center,span:100}, {center,span:100 * factor});
    },
    pan(x: number, y: number) {
      motion = null;
      move({center: { x:0,y:0 },span:0},{center:{ x,y:y / stretch },span:0});
    },
    down(pointer: Pointer, exploring: boolean) {
      if (!touches.size) {
        dragged = false;
      } else dragged = true;
      if (pointer.pointerType === "touch" && !exploring) return;
      motion = null;
      if (!touches.size) inputStart = pointer;
      touches.set(pointer.pointerId, local(pointer));
      lastGesture = sampleGesture(touches.values());
    },
    move(pointer: Pointer) {
      if (!touches.has(pointer.pointerId) || !inputStart) return;
      const position = local(pointer);
      touches.set(pointer.pointerId, position);
      if (!dragged && Math.hypot(pointer.x - inputStart.x, pointer.y - inputStart.y) < 5) return;
      dragged = true;
      if (!stage.hasPointerCapture(pointer.pointerId)) stage.setPointerCapture(pointer.pointerId);
      const sample = sampleGesture(touches.values());
      if (lastGesture && sample) move(lastGesture, sample);
      lastGesture = sample;
    },
    up(pointerId: number) {
      if (!touches.delete(pointerId)) return;
      if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
      lastGesture = sampleGesture(touches.values());
      if (!lastGesture) inputStart = null;
    },
    clearGesture,
    discardClick() { return dragged; },
    nearest(point: Point): Selection | null {
      const click = local(point);
      const candidates = getVisibleSkills(selection, level);
      const items = candidates.length ? candidates.map(skill => ({ type: "skill" as const, id: skill.id, anchor: skill.anchor }))
        : ATLAS_TERRITORIES.map(region => ({type:"territory" as const,id:region.id,anchor:region.marker}));
      let nearest: Selection | null = null;
      let distance = candidates.length ? 17 : 28;
      for (const item of items) {
        const delta = Math.hypot(item.anchor.x * camera.z + camera.x - click.x, (item.anchor.y * camera.z + camera.y - click.y) * stretch);
        if (delta >= distance) continue;
        distance = delta;
        nearest = {type:item.type,id:item.id};
      }
      return nearest;
    },
    dispose() {
      disposed = true;
      resize.disconnect();
      intersection.disconnect();
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", handleVisibility);
      webgl.removeEventListener("webglcontextlost", loseContext);
      webgl.removeEventListener("webglcontextrestored", restoreContext);
      cancelAnimationFrame(frameId);
      clearGesture();
      renderer?.dispose();
    },
  };
}
