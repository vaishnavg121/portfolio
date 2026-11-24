const compactPortrait = "(width < 37rem)";
const reducedMotion = "(prefers-reduced-motion: reduce)";
const imageRoot = "/images/portrait/";

type Point = { x: number; y: number };
type Pulse = Point & { start: number };
type Frame = { width: number; height: number; dpr: number };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function connectPortrait(frameElement: HTMLElement, canvas: HTMLCanvasElement) {
  const context2d = canvas.getContext("2d", { alpha: true });
  if (!context2d) return;
  const context = context2d;

  const reduced = window.matchMedia(reducedMotion);
  const compact = window.matchMedia(compactPortrait);
  let frame: Frame | null = null;
  let target: Point | null = null;
  let position: Point = { x: 0, y: 0 };
  let pressure = 0;
  let pulse: Pulse | null = null;
  let velocity: Point = { x: 0, y: 0 };
  let touchId: number | null = null;
  let detail: HTMLImageElement | null = null;
  let animation = 0;
  let previousTime = 0;
  let visible = true;

  const clear = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    previousTime = 0;
    target = null;
    pulse = null;
    touchId = null;
    pressure = 0;
    canvas.removeAttribute("data-active");
  };

  const schedule = () => {
    if (!animation && visible && !reduced.matches && detail?.complete && detail.naturalWidth) {
      animation = requestAnimationFrame(draw);
    }
  };

  function draw(time: number) {
    animation = 0;
    if (!frame || !detail?.naturalWidth) return;
    const delta = previousTime ? Math.min(time - previousTime, 38) : 16.7;
    previousTime = time;
    const spring = 1 - Math.exp(-delta / 70);
    pressure += ((target ? 1 : 0) - pressure) * spring;
    if (target) {
      position.x += (target.x - position.x) * spring;
      position.y += (target.y - position.y) * spring;
    }
    velocity.x *= 1 - spring;
    velocity.y *= 1 - spring;

    const age = pulse ? (time - pulse.start) / 460 : 1;
    if (age >= 1) pulse = null;
    const travel = pulse ? age * 93 + 8 : 0;
    if (!target && !pulse && pressure < 0.022) {
      canvas.removeAttribute("data-active");
      previousTime = 0;
      pressure = 0;
      return;
    }

    const { width, height, dpr } = frame;
    const { naturalWidth, naturalHeight } = detail;
    const scale = Math.max(width / naturalWidth, height / naturalHeight);
    const imageX = (naturalWidth * scale - width) / 2;
    const imageY = (naturalHeight * scale - height) * (compact.matches ? 0.15 : 0.34);
    const cell = Math.max(6, Math.round(width / 57));
    const radius = clamp(width * 0.29, 64, 104);
    const reach = pulse ? Math.max(radius, travel + 18) : radius;
    const center = pulse ?? position;
    const left = Math.max(0, Math.floor((center.x - reach) / cell) * cell);
    const top = Math.max(0, Math.floor((center.y - reach) / cell) * cell);
    const right = Math.min(width, center.x + reach);
    const bottom = Math.min(height, center.y + reach);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    for (let y = top; y < bottom; y += cell) {
      for (let x = left; x < right; x += cell) {
        const dx = x + cell / 2 - center.x;
        const dy = y + cell / 2 - center.y;
        const distance = Math.hypot(dx, dy);
        const field = Math.max(0, 1 - distance / radius);
        const ripple = pulse ? Math.max(0, 1 - Math.abs(distance - travel) / 24) * (1 - age) : 0;
        const influence = Math.max(pressure * field, ripple);
        if (influence < 0.06) continue;
        const offsetX = (dx * 0.10 + velocity.x * 0.23) * influence;
        const offsetY = (dy * 0.10 + velocity.y * 0.23) * influence;
        const slice = cell / scale;
        const sx = clamp((x + imageX + offsetX) / scale, 0, Math.max(0, naturalWidth - slice));
        const sy = clamp((y + imageY + offsetY) / scale, 0, Math.max(0, naturalHeight - slice));
        context.globalAlpha = Math.min(0.95, influence * 1.38);
        context.drawImage(detail, sx, sy, slice, slice, x, y, cell, cell);
      }
    }
    context.globalAlpha = 1;
    canvas.dataset.active = "";
    schedule();
  }

  const resize = () => {
    const width = frameElement.clientWidth;
    const height = frameElement.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (!width || !height || (frame?.width === width && frame.height === height && frame.dpr === dpr)) return;
    clear();
    frame = { width, height, dpr };
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };

  const onDetailLoad = () => {
    if (pulse) pulse.start = performance.now();
    schedule();
  };

  const warmImage = () => {
    if (detail) return;
    detail = new Image();
    detail.decoding = "async";
    detail.addEventListener("load", onDetailLoad, { once: true });
    detail.src = imageRoot + (compact.matches ? "mobile.webp" : "desktop.webp");
  };

  const pointerPoint = (event: PointerEvent): Point => {
    const rect = frameElement.getBoundingClientRect();
    return { x: clamp(event.clientX - rect.left, 0, rect.width), y: clamp(event.clientY - rect.top, 0, rect.height) };
  };

  const move = (event: PointerEvent) => {
    if (reduced.matches || (event.pointerType === "touch" && event.pointerId !== touchId)) return;
    const point = pointerPoint(event);
    if (target) {
      velocity = { x: clamp(point.x - target.x, -20, 20), y: clamp(point.y - target.y, -20, 20) };
    } else if (pressure < 0.04) {
      position = { ...point };
    }
    target = point;
    warmImage();
    schedule();
  };

  const start = (event: PointerEvent) => {
    if (reduced.matches || event.pointerType !== "touch" || touchId !== null) return;
    touchId = event.pointerId;
    const point = pointerPoint(event);
    position = { ...point };
    pulse = { ...point, start: performance.now() };
    warmImage();
    schedule();
  };

  const stop = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      target = null;
    } else if (event.pointerId === touchId) {
      touchId = null;
      target = null;
    }
  };

  const cancelTouch = (event: PointerEvent) => {
    if (event.pointerId === touchId) clear();
  };
  const changeSource = () => {
    clear();
    detail?.removeEventListener("load", onDetailLoad);
    detail = null;
    resize();
  };
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) clear();
  });
  const sizes = new ResizeObserver(resize);
  resize();
  sizes.observe(frameElement);
  visibility.observe(frameElement);
  frameElement.addEventListener("pointerenter", move);
  frameElement.addEventListener("pointermove", move);
  frameElement.addEventListener("pointerdown", start);
  frameElement.addEventListener("pointerup", stop);
  frameElement.addEventListener("pointerleave", stop);
  frameElement.addEventListener("pointercancel", cancelTouch);
  reduced.addEventListener("change", clear);
  compact.addEventListener("change", changeSource);

  return () => {
    clear();
    visibility.disconnect();
    sizes.disconnect();
    detail?.removeEventListener("load", onDetailLoad);
    frameElement.removeEventListener("pointerenter", move);
    frameElement.removeEventListener("pointermove", move);
    frameElement.removeEventListener("pointerdown", start);
    frameElement.removeEventListener("pointerup", stop);
    frameElement.removeEventListener("pointerleave", stop);
    frameElement.removeEventListener("pointercancel", cancelTouch);
    reduced.removeEventListener("change", clear);
    compact.removeEventListener("change", changeSource);
  };
}
