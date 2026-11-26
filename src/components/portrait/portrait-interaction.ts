import type { Disturbance } from "./particle-field";
import type { createParticleRenderer } from "./particle-renderer";

const FRAME_MS = 1000 / 60;
const TAP_MS = 290;
export const WIDE_PORTRAIT = "(min-width: 64rem)";
export const PORTRAIT_ASSETS = "/images/portrait-relief";

type Contact = {
  id: number;
  x: number;
  y: number;
  direction: "pending" | "horizontal" | "vertical";
};

export function enablePortraitMotion(root: HTMLElement, canvas: HTMLCanvasElement) {
  if (!window.IntersectionObserver || !window.ResizeObserver) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia(WIDE_PORTRAIT);
  const listeners = new AbortController();
  const { signal } = listeners;
  let visible = false;
  let presented = false;
  let assembled = false;
  let requested = "";
  let request: AbortController | undefined;
  let renderer: ReturnType<typeof createParticleRenderer> = null;
  let frame = 0;
  let lastFrame = 0;
  let contact: Contact | undefined;
  let pointer: Disturbance | null = null;
  let pointerSample: { x: number; y: number; time: number } | undefined;
  let tap: { point: Disturbance; until: number } | undefined;

  const canPresent = () => visible && !document.hidden && !reduced.matches;

  function schedule() {
    if (!frame && renderer && presented) frame = requestAnimationFrame(update);
  }

  function update(now: number) {
    frame = 0;
    if (!renderer || !presented) return;

    const step = lastFrame ? Math.min(2, (now - lastFrame) / FRAME_MS) : 1;
    lastFrame = now;
    if (tap && now >= tap.until) tap = undefined;
    let force = pointer;
    if (tap) {
      const progress = Math.max(0, 1 - (tap.until - now) / TAP_MS);
      force = { ...tap.point, strength: tap.point.strength * (1 - progress * progress), pulse: progress };
    }
    const moving = renderer.advance(step, force);
    renderer.paint();

    if (moving || tap) schedule();
    else lastFrame = 0;
  }

  function resetInput() {
    contact = undefined;
    pointer = null;
    pointerSample = undefined;
    tap = undefined;
  }

  function pause() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    presented = false;
    resetInput();
    renderer?.reset();
  }

  function showFallback() {
    pause();
    renderer?.dispose();
    renderer = null;
    delete root.dataset.dotReady;
  }

  function sizeCanvas() {
    if (!presented || !renderer) return;
    const { width, height } = root.getBoundingClientRect();
    renderer.resize(width, height);
    renderer.paint();
  }

  function present() {
    if (presented || !renderer || !canPresent()) return;
    presented = true;
    if (!assembled) renderer.scatter();
    sizeCanvas();
    root.dataset.dotReady = "";
    if (!assembled) schedule();
    assembled = true;
  }

  function reconcile() {
    if (reduced.matches) {
      request?.abort();
      requested = "";
      showFallback();
      return;
    }
    if (!canPresent()) {
      if (presented) pause();
      return;
    }

    const density = wide.matches ? "wide" : "compact";
    if (density === requested) {
      present();
      return;
    }

    request?.abort();
    showFallback();
    requested = density;
    const loading = new AbortController();
    request = loading;
    const data = fetch(`${PORTRAIT_ASSETS}/${density}.bin`, { signal: loading.signal, priority: "low" })
      .then((response) => {
        if (!response.ok) throw new Error("Portrait sample request failed");
        return response.arrayBuffer();
      });
    Promise.all([data, import("./particle-renderer")])
      .then(([samples, { createParticleRenderer }]) => {
        if (loading.signal.aborted || signal.aborted) return;
        renderer = createParticleRenderer(canvas, samples);
        present();
      })
      .catch(() => {
        if (!loading.signal.aborted) showFallback();
      })
      .finally(() => {
        if (request === loading) request = undefined;
      });
  }

  function onPageHide() {
    pause();
    request?.abort();
    if (!renderer) requested = "";
  }

  function onPageShow(event: PageTransitionEvent) {
    if (!event.persisted) return;
    const { top, right, bottom, left } = root.getBoundingClientRect();
    visible = top < window.innerHeight && right > 0 && bottom > 0 && left < window.innerWidth;
    if (!renderer) requested = "";
    reconcile();
  }

  function at(event: PointerEvent, strength: number, tilt = 0): Disturbance {
    const box = root.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
      strength,
      tilt,
    };
  }

  function onPress(event: PointerEvent) {
    if (!presented || !event.isPrimary) return;
    if (event.pointerType === "mouse") {
      if (event.button === 0) {
        tap = { point: at(event, 1.20, 0.85), until: performance.now() + TAP_MS };
        schedule();
      }
      return;
    }
    contact = { id: event.pointerId, x: event.clientX, y: event.clientY, direction: "pending" };
  }

  function onMove(event: PointerEvent) {
    if (!presented || !event.isPrimary) return;
    if (event.pointerType === "mouse") {
      const time = event.timeStamp;
      const speed = pointerSample
        ? Math.hypot(event.clientX - pointerSample.x, event.clientY - pointerSample.y) / Math.max(4, time - pointerSample.time)
        : 0;
      pointerSample = { x: event.clientX, y: event.clientY, time };
      pointer = at(event, 0.78 + Math.min(0.43, speed * 0.15), 1);
      schedule();
      return;
    }
    if (contact?.id !== event.pointerId) return;

    if (contact.direction === "pending") {
      const dx = Math.abs(event.clientX - contact.x);
      const dy = Math.abs(event.clientY - contact.y);
      if (dx >= 8 && dx > dy * 1.3) contact.direction = "horizontal";
      else if (dy >= 8 && dy >= dx) contact.direction = "vertical";
    }
    if (contact.direction === "horizontal") {
      tap = undefined;
      pointer = at(event, 0.92, 0.72);
      schedule();
    }
  }

  function onRelease(event: PointerEvent) {
    if (contact?.id !== event.pointerId) return;
    const travel = Math.hypot(event.clientX - contact.x, event.clientY - contact.y);
    if (contact.direction === "pending" && travel < 10) {
      tap = { point: at(event, 1.30), until: performance.now() + TAP_MS };
    }
    contact = undefined;
    pointer = null;
    schedule();
  }

  function onLeave(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    pointer = null;
    pointerSample = undefined;
    schedule();
  }

  function onCancel(event: PointerEvent) {
    if (event.pointerType !== "mouse" && contact?.id !== event.pointerId) return;
    resetInput();
    schedule();
  }

  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    reconcile();
  });
  view.observe(root);
  const size = new ResizeObserver(sizeCanvas);
  size.observe(root);

  const passive = { signal, passive: true };
  root.addEventListener("pointerdown", onPress, passive);
  root.addEventListener("pointermove", onMove, passive);
  root.addEventListener("pointerup", onRelease, passive);
  root.addEventListener("pointerleave", onLeave, passive);
  root.addEventListener("pointercancel", onCancel, passive);
  root.addEventListener("lostpointercapture", onCancel, passive);
  document.addEventListener("visibilitychange", reconcile, { signal });
  window.addEventListener("pagehide", onPageHide, { signal });
  window.addEventListener("pageshow", onPageShow, { signal });
  window.addEventListener("resize", sizeCanvas, passive);
  reduced.addEventListener("change", reconcile, { signal });
  wide.addEventListener("change", reconcile, { signal });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    request?.abort();
    showFallback();
  }, { signal });
  canvas.addEventListener("webglcontextrestored", () => {
    requested = "";
    reconcile();
  }, { signal });

  return () => {
    listeners.abort();
    request?.abort();
    view.disconnect();
    size.disconnect();
    showFallback();
  };
}
