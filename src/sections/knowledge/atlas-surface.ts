import { clamp, heightField, mix } from "./atlas-geometry";

const FIELD_EXTENT = { x: 752, y: 608 };
const CONTOUR_INTERVAL = 15;
const edges = [[0, 1], [1, 2], [2, 3], [3, 0]] as const;

export function makeAtlasSurface(compact: boolean) {
  const columns = compact ? 58 : 90;
  const rows = compact ? 49 : 74;
  const stepX = FIELD_EXTENT.x * 2 / (columns - 1);
  const stepY = FIELD_EXTENT.y * 2 / (rows - 1);
  const samples = Array.from({ length: columns * rows }, (_, index) => {
    const x = index % columns * stepX - FIELD_EXTENT.x;
    const y = Math.floor(index / columns) * stepY - FIELD_EXTENT.y;
    const surface = heightField(x, y);
    const radial = Math.hypot(x / FIELD_EXTENT.x, (y + 14) / FIELD_EXTENT.y);
    const fade = clamp((1 - radial) / .39);
    return { x, y, ...surface, fade: fade * fade * (3 - 2 * fade) };
  });
  type Sample = typeof samples[number];
  const lines: number[] = [];
  const veil: number[] = [];
  const write = (buffer: number[], x: number, y: number, z: number, style: Sample, opacity: number) => {
    const grain = .5 + .5 * Math.sin(x * .013 + y * .017);
    buffer.push(x, y, z, style.region + style.tone, opacity, 1, -style.shade, grain);
  };
  const writeVeil = (sample: Sample) => {
    const opacity = sample.fade * (.022 + sample.relief * .13 + sample.shade * .045);
    write(veil, sample.x, sample.y, sample.z, sample, opacity);
  };

  for (let row = 0; row < rows - 1; row++) {
    // Stitch adjacent rows with degenerate vertices so the veil is a single draw.
    if (row > 0) writeVeil(samples[row * columns]);
    for (let col = 0; col < columns; col++) {
      writeVeil(samples[row * columns + col]);
      writeVeil(samples[(row + 1) * columns + col]);
    }
    if (row < rows - 2) writeVeil(samples[(row + 2) * columns - 1]);

    for (let col = 0; col < columns - 1; col++) {
      const start = row * columns + col;
      const cell = [samples[start], samples[start + 1], samples[start + columns + 1], samples[start + columns]];
      const low = Math.min(...cell.map(sample => sample.z));
      const high = Math.max(...cell.map(sample => sample.z));
      if (high < 11 || !cell.some(sample => sample.fade > .009)) continue;
      const first = 10 + Math.ceil((Math.max(low, 10) - 10) / CONTOUR_INTERVAL) * CONTOUR_INTERVAL;
      for (let level = first; level <= high; level += CONTOUR_INTERVAL) {
        const crossings: { a: Sample; b: Sample; t: number }[] = [];
        for (let side = 0; side < edges.length; side++) {
          const [i, j] = edges[side], a = cell[i], b = cell[j];
          if ((a.z < level) === (b.z < level)) continue;
          crossings.push({ a, b, t: (level - a.z) / (b.z - a.z) });
        }
        if (crossings.length === 4) {
          const center = cell.reduce((sum, p) => sum + p.z, 0) * .25;
          if ((center < level) === (cell[0].z < level)) crossings.push(crossings.shift()!);
        }
        for (const { a, b, t } of crossings) {
          const style = {
            ...(t < .5 ? a : b), shade: mix(a.shade, b.shade, t), tone: mix(a.tone, b.tone, t),
          };
          const x = mix(a.x, b.x, t), y = mix(a.y, b.y, t);
          const bands = .5 + .5 * Math.sin(x * .018 - y * .014 + level * .13);
          const fade = mix(a.fade, b.fade, t);
          const strength = fade * (.035 + .25 * bands ** 2) * (.30 + style.shade * .71);
          write(lines, x, y, level, style, strength);
        }
      }
    }
  }
  return { contours: new Float32Array(lines), veil: new Float32Array(veil) };
}
