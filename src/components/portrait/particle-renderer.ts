const SPRING = 0.125;
const DRAG = 0.73;
const QUIET = 0.018;

export type Disturbance = {
  x: number;
  y: number;
  strength: number;
};

export function createParticleRenderer(canvas: HTMLCanvasElement, data: ArrayBuffer) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;

  // The four-byte magic/version precedes the dimensions and the column, row, style triplets.
  const samples = new Uint8Array(data);
  const columns = samples[4];
  const rows = samples[5];
  const length = (samples.length - 6) / 3;
  if (samples[0] !== 68 || samples[1] !== 80 || samples[2] !== 1 || samples[3] !== 0 ||
    !columns || !rows || !Number.isInteger(length) || length < 1) {
    throw new Error("Invalid portrait samples");
  }

  const homeX = new Float32Array(length);
  const homeY = new Float32Array(length);
  const x = new Float32Array(length);
  const y = new Float32Array(length);
  const vx = new Float32Array(length);
  const vy = new Float32Array(length);
  const buckets = new Map<number, { indices: number[]; radius: number; ink: string }>();

  for (let index = 0; index < length; index++) {
    const offset = 6 + index * 3;
    homeX[index] = samples[offset] + 0.5;
    homeY[index] = samples[offset + 1] + 0.5;
    const style = samples[offset + 2];
    let bucket = buckets.get(style);
    if (!bucket) {
      const tone = (style >> 4) / 15;
      const coverage = (style & 15) / 15;
      const red = Math.round(161 + 79 * tone);
      const green = Math.round(155 + 77 * tone);
      const blue = Math.round(150 + 75 * tone);
      const alpha = (0.27 + 0.70 * tone) * coverage ** 0.78;
      bucket = {
        indices: [],
        radius: (0.125 + 0.30 * Math.sqrt(tone)) * (0.78 + 0.22 * coverage),
        ink: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
      };
      buckets.set(style, bucket);
    }
    bucket.indices.push(index);
  }

  const styles = [...buckets.values()];
  const reach = columns * 0.134;
  const reachSquared = reach * reach;
  x.set(homeX);
  y.set(homeY);

  function paint() {
    if (!context) return;
    context.clearRect(0, 0, columns, rows);
    for (const { indices, radius, ink } of styles) {
      context.beginPath();
      for (const index of indices) {
        context.moveTo(x[index] + radius, y[index]);
        context.arc(x[index], y[index], radius, 0, Math.PI * 2);
      }
      context.fillStyle = ink;
      context.fill();
    }
  }

  return {
    resize(width: number, height: number) {
      const density = Math.min(window.devicePixelRatio || 1, 1.75);
      const pixelWidth = Math.max(1, Math.round(width * density));
      const pixelHeight = Math.max(1, Math.round(height * density));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      context.setTransform(pixelWidth / columns, 0, 0, pixelHeight / rows, 0, 0);
    },
    paint,
    scatter() {
      // A repeatable, small outward offset gives the opening one brief settling motion.
      for (let index = 0; index < length; index++) {
        const distance = ((index * 149) % 251) / 251;
        x[index] = homeX[index] + (homeX[index] - columns * 0.55) * distance * 0.085;
        y[index] = homeY[index] + (homeY[index] - rows * 0.44) * distance * 0.085;
      }
    },
    reset() {
      x.set(homeX);
      y.set(homeY);
      vx.fill(0);
      vy.fill(0);
    },
    advance(step: number, disturbance: Disturbance | null) {
      const drag = DRAG ** step;
      const centerX = (disturbance?.x ?? -1) * columns;
      const centerY = (disturbance?.y ?? -1) * rows;
      const strength = (disturbance?.strength ?? 0) * columns * 0.053;
      let moving = false;

      for (let index = 0; index < length; index++) {
        let targetX = homeX[index];
        let targetY = homeY[index];
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const distanceSquared = dx * dx + dy * dy;
        if (strength > 0 && distanceSquared < reachSquared) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1 - distance / reach;
          const mobility = 0.32 + 0.68 * ((index * 97) % 127) / 127;
          const push = strength * falloff * falloff * mobility;
          targetX += distance > 0.001 ? dx / distance * push : push;
          targetY += distance > 0.001 ? dy / distance * push : 0;
        }

        const gapX = targetX - x[index];
        const gapY = targetY - y[index];
        if (Math.abs(gapX) + Math.abs(gapY) + Math.abs(vx[index]) + Math.abs(vy[index]) < QUIET) {
          x[index] = targetX;
          y[index] = targetY;
          vx[index] = 0;
          vy[index] = 0;
          continue;
        }

        vx[index] = (vx[index] + gapX * SPRING * step) * drag;
        vy[index] = (vy[index] + gapY * SPRING * step) * drag;
        x[index] += vx[index] * step;
        y[index] += vy[index] * step;
        moving = true;
      }

      return moving;
    },
  };
}
