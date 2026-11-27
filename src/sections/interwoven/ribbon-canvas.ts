import { ribbonHeight, ribbonPosition, ribbons, type RibbonId } from "./ribbon-model";

export type RibbonStudy = "particles" | "glass" | "hybrid";
type RibbonState = { hot: readonly RibbonId[]; mode: RibbonStudy };

const STEPS = 60;
const TAU = 2 * Math.PI;
const ramp = (value: number) => Math.sin(Math.PI * value) ** .66;

export function runRibbonCanvas(canvas: HTMLCanvasElement, state: () => RibbonState) {
  const context = canvas.getContext("2d");
  if (!context) return { refresh() {}, dispose() {} };
  const ctx = context;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const stage = canvas.parentElement!;
  const probe = document.createElement("span");
  probe.hidden = true;
  stage.append(probe);
  const pigmentFor = (token: string) => {
    probe.style.color = "var(" + token + ")";
    return getComputedStyle(probe).color;
  };
  const streams = [...ribbons].sort((a, b) => a.depth - b.depth).map((ribbon, index) => ({
    ...ribbon,
    pigment: pigmentFor(ribbon.color),
    tone: index,
    x: new Float32Array(STEPS + 1),
    base: Float32Array.from({ length: STEPS + 1 }, (_, i) => ribbonHeight(ribbon.heights, i / STEPS)),
    y: new Float32Array(STEPS + 1),
    edge: new Float32Array(STEPS + 1),
    arc: new Float32Array(STEPS + 1),
    gradient: null as CanvasGradient | null,
  }));
  probe.remove();
  let width = 1, height = 1, dpr = 1;
  let visible = false;
  let raf = 0, timer = 0;
  let time = 0, last = 0;

  function resize() {
    const nextWidth = stage.clientWidth, nextHeight = stage.clientHeight;
    if (nextWidth < 1 || nextHeight < 1) return;
    width = nextWidth;
    height = nextHeight;
    dpr = Math.min(devicePixelRatio || 1, width < 560 ? 1.35 : 1.65);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    for (const stream of streams) {
      stream.gradient = ctx.createLinearGradient(0, 0, width, 0);
      stream.gradient.addColorStop(0, "transparent");
      stream.gradient.addColorStop(.16, stream.pigment);
      stream.gradient.addColorStop(.84, stream.pigment);
      stream.gradient.addColorStop(1, "transparent");
      for (let i = 0; i <= STEPS; i++) {
        stream.x[i] = ribbonPosition(i / STEPS) * width;
        if (i > 0) stream.arc[i] = stream.arc[i - 1] + Math.hypot(stream.x[i] - stream.x[i - 1], (stream.base[i] - stream.base[i - 1]) * height);
      }
    }
    paint();
  }

  function paint() {
    const { hot, mode } = state();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (const stream of streams) {
      const active = hot.includes(stream.id);
      const strength = active ? 1.48 : hot.length ? .37 : 1;
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const drift = Math.sin(t * 19 - time * .76 + stream.tone * 1.37);
        const pin = Math.sin(t * Math.PI * 6) ** 2;
        stream.y[i] = stream.base[i] * height + drift * pin * ramp(t) * height * .036;
        const twist = Math.cos(t * TAU * 1.48 + time * .46 + stream.tone * .98);
        stream.edge[i] = ramp(t) * (.29 + .72 * Math.abs(twist)) * (stream.depth * 12 + 3) * Math.min(1, width / 550);
      }
      const trace = (side: number, reverse = false) => {
        for (let j = 0; j <= STEPS; j++) {
          const i = reverse ? STEPS - j : j;
          const x = stream.x[i], y = stream.y[i] + stream.edge[i] * side;
          if (!reverse && j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };
      const pigment = stream.gradient ?? stream.pigment;
      if (mode !== "particles") {
        ctx.beginPath();
        trace(-1); trace(1, true); ctx.closePath();
        ctx.fillStyle = pigment;
        ctx.globalAlpha = .11 * strength;
        ctx.fill();
        ctx.strokeStyle = pigment;
        for (let strip = -2; strip <= 2; strip++) {
          ctx.beginPath();
          trace(strip / 2);
          ctx.lineWidth = strip === 0 ? .89 : .5;
          ctx.globalAlpha = (strip === 0 ? .55 : .25) * strength;
          ctx.stroke();
        }
      }
      if (mode !== "glass") {
        const count = width < 530 ? 37 : 67;
        const length = stream.arc[STEPS];
        ctx.fillStyle = stream.pigment;
        for (let dot = 0; dot < count; dot++) {
          const phase = (dot * .61803398875 + stream.depth * .73 + time * (.031 + stream.depth * .038)) % 1;
          const distance = phase * length;
          let low = 0, high = STEPS;
          while (high - low > 1) {
            const middle = (high + low) >> 1;
            if (stream.arc[middle] < distance) low = middle;
            else high = middle;
          }
          const segment = (distance - stream.arc[low]) / Math.max(.001, stream.arc[high] - stream.arc[low]);
          const x = stream.x[low] + (stream.x[high] - stream.x[low]) * segment;
          const offset = .76 * Math.sin(dot * 2.3999 + stream.tone);
          const y = stream.y[low] + (stream.y[high] - stream.y[low]) * segment + stream.edge[low] * offset;
          const radius = (.48 + (dot % 7) * .09) * (active ? 1.23 : 1);
          ctx.globalAlpha = Math.min(.88, (.29 + (dot % 5) * .103) * ramp(phase) * strength);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, TAU);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (!canvas.hasAttribute("data-ribbons-ready")) canvas.toggleAttribute("data-ribbons-ready", true);
  }

  function stop() {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    raf = timer = last = 0;
  }

  function tick(now: number) {
    raf = 0;
    if (last) time += Math.min(.06, (now - last) / 1000);
    last = now;
    paint();
    timer = window.setTimeout(() => {
      timer = 0;
      if (canMove()) raf = requestAnimationFrame(tick);
    }, width < 560 ? 40 : 24);
  }

  const canMove = () => visible && !document.hidden && !reduced.matches;
  function configure() {
    stop();
    if (visible) paint();
    if (canMove()) raf = requestAnimationFrame(tick);
  }

  const inView = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    configure();
  });
  const resizing = new ResizeObserver(resize);
  inView.observe(stage);
  resizing.observe(stage);
  reduced.addEventListener("change", configure);
  document.addEventListener("visibilitychange", configure);
  resize();
  return {
    refresh() { if (visible && !canMove()) paint(); },
    dispose() {
      stop();
      inView.disconnect();
      resizing.disconnect();
      reduced.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", configure);
      canvas.removeAttribute("data-ribbons-ready");
      canvas.width = canvas.height = 1;
    },
  };
}
