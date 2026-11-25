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
  let scaleX = 1;
  let scaleY = 1;
  let redrawAll = true;
  let dirtyLeft = Infinity;
  let dirtyTop = Infinity;
  let dirtyRight = -Infinity;
  let dirtyBottom = -Infinity;
  x.set(homeX);
  y.set(homeY);

  function paint() {
    if (!context || (!redrawAll && dirtyLeft === Infinity)) return;

    // Pad for the dot radius and align the clip to the actual backing pixels.
    const left = redrawAll ? 0 : Math.floor((dirtyLeft - 1) * scaleX) / scaleX;
    const top = redrawAll ? 0 : Math.floor((dirtyTop - 1) * scaleY) / scaleY;
    const right = redrawAll ? columns : Math.ceil((dirtyRight + 1) * scaleX) / scaleX;
    const bottom = redrawAll ? rows : Math.ceil((dirtyBottom + 1) * scaleY) / scaleY;
    if (!redrawAll) {
      context.save();
      context.beginPath();
      context.rect(left, top, right - left, bottom - top);
      context.clip();
    }
    context.clearRect(left, top, right - left, bottom - top);

    for (const { indices, radius, ink } of styles) {
      context.beginPath();
      for (const index of indices) {
        const px = x[index];
        const py = y[index];
        if (px + radius >= left && px - radius <= right && py + radius >= top && py - radius <= bottom) {
          context.moveTo(px + radius, py);
          context.arc(px, py, radius, 0, Math.PI * 2);
        }
      }
      context.fillStyle = ink;
      context.fill();
    }
    if (!redrawAll) context.restore();
    redrawAll = false;
    dirtyLeft = dirtyTop = Infinity;
    dirtyRight = dirtyBottom = -Infinity;
  }

  return {
    resize(width: number, height: number) {
      const density = Math.min(window.devicePixelRatio || 1, 1.75);
      const pixelWidth = Math.max(1, Math.round(width * density));
      const pixelHeight = Math.max(1, Math.round(height * density));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      scaleX = pixelWidth / columns;
      scaleY = pixelHeight / rows;
      context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      redrawAll = true;
    },
    paint,
    scatter() {
      // A repeatable, small outward offset gives the opening one brief settling motion.
      for (let index = 0; index < length; index++) {
        const distance = ((index * 149) % 251) / 251;
        x[index] = homeX[index] + (homeX[index] - columns * 0.55) * distance * 0.085;
        y[index] = homeY[index] + (homeY[index] - rows * 0.44) * distance * 0.085;
      }
      redrawAll = true;
    },
    reset() {
      x.set(homeX);
      y.set(homeY);
      vx.fill(0);
      vy.fill(0);
      redrawAll = true;
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

        const previousX = x[index];
        const previousY = y[index];
        const gapX = targetX - previousX;
        const gapY = targetY - previousY;
        if (Math.abs(gapX) + Math.abs(gapY) + Math.abs(vx[index]) + Math.abs(vy[index]) < QUIET) {
          x[index] = targetX;
          y[index] = targetY;
          vx[index] = 0;
          vy[index] = 0;
        } else {
          vx[index] = (vx[index] + gapX * SPRING * step) * drag;
          vy[index] = (vy[index] + gapY * SPRING * step) * drag;
          x[index] += vx[index] * step;
          y[index] += vy[index] * step;
          moving = true;
        }

        if (!redrawAll && (previousX !== x[index] || previousY !== y[index])) {
          dirtyLeft = Math.min(dirtyLeft, previousX, x[index]);
          dirtyTop = Math.min(dirtyTop, previousY, y[index]);
          dirtyRight = Math.max(dirtyRight, previousX, x[index]);
          dirtyBottom = Math.max(dirtyBottom, previousY, y[index]);
        }
      }

      // One complete resting frame restores every backing pixel after partial repaints.
      if (!moving && !disturbance) redrawAll = true;
      return moving;
    },
  };
}
