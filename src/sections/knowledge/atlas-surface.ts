import { atlasPeaks, clamp, encodeFormation, formationAt, mix, terrainSample } from "./atlas-geometry";

const FIELD_EXTENT = { x: 752, y: 608 };
const edges = [[0, 1], [1, 2], [2, 3], [3, 0]] as const;

export function makeAtlasSurface(compact: boolean, target = -1) {
  const detailed = target >= 0;
  const extent = detailed ? { x: 200, y: 200 } : FIELD_EXTENT;
  const center = detailed ? atlasPeaks[target] : { x: 0, y: 0 };
  const interval = detailed ? (compact ? 8 : 6) : (compact ? 10 : 8);
  const columns = detailed ? (compact ? 41 : 60) : (compact ? 68 : 105);
  const rows = detailed ? columns : (compact ? 56 : 85);
  const stepX = extent.x * 2 / (columns - 1);
  const stepY = extent.y * 2 / (rows - 1);
  const samples = Array.from({ length: columns * rows }, (_, index) => {
    const x = center.x + index % columns * stepX - extent.x;
    const y = center.y + Math.floor(index / columns) * stepY - extent.y;
    const surface = terrainSample(x, y);
    const local = detailed && surface.formation === target ? surface.rise : 0;
    const radial = Math.hypot((x-center.x)/extent.x,(y-center.y+(detailed?0:14))/extent.y);
    const fade = clamp((1 - radial) / .39) * (detailed ? clamp(local / 9) : 1);
    return { x, y, ...surface, z: surface.z + local, fade: fade * fade * (3 - 2 * fade) };
  });
  type Sample = typeof samples[number];
  const lines: number[] = [];
  const veil: number[] = [];
  const write = (buffer: number[], x: number, y: number, z: number, style: Sample, opacity: number, grain = .5) => {
    buffer.push(x, y, z, style.region + style.tone, opacity, 1, -style.shade, grain, encodeFormation(style.formation,style.rise));
  };
  const writeVeil = (sample: Sample) => {
    const opacity = sample.fade * (.022 + sample.relief * .13 + sample.shade * .045);
    write(veil, sample.x, sample.y, sample.z, sample, opacity);
  };

  for (let row = 0; row < rows - 1; row++) {
    if (!detailed) {
      // Stitch adjacent rows with degenerate vertices so the veil is a single draw.
      if (row > 0) writeVeil(samples[row * columns]);
      for (let col = 0; col < columns; col++) {
        writeVeil(samples[row * columns + col]);
        writeVeil(samples[(row + 1) * columns + col]);
      }
      if (row < rows - 2) writeVeil(samples[(row + 2) * columns - 1]);
    }

    for (let col = 0; col < columns - 1; col++) {
      const start = row * columns + col;
      const cell = [samples[start], samples[start + 1], samples[start + columns + 1], samples[start + columns]];
      const low = Math.min(...cell.map(sample => sample.z));
      const high = Math.max(...cell.map(sample => sample.z));
      const floor = -20;
      if (high < floor || !cell.some(sample => sample.fade > .009)) continue;
      const first = Math.ceil((Math.max(low, floor) - floor) / interval);
      for (let index = first; floor + index * interval <= high; index++) {
        const level = floor + index * interval;
        const crossings: { a: Sample; b: Sample; t: number }[] = [];
        for (let side = 0; side < edges.length; side++) {
          const [i, j] = edges[side], a = cell[i], b = cell[j];
          if ((a.z < level) === (b.z < level)) continue;
          crossings.push({ a, b, t: (level - a.z) / (b.z - a.z) });
        }
        if (crossings.length === 4) {
          // The bilinear saddle decides which edges share the same isoline.
          const determinant = (cell[0].z - level) * (cell[2].z - level) - (cell[1].z - level) * (cell[3].z - level);
          if (determinant < 0) crossings.push(crossings.shift()!);
        }
        for (const { a, b, t } of crossings) {
          const style = {
            ...(t < .5 ? a : b), shade: mix(a.shade, b.shade, t), tone: mix(a.tone, b.tone, t),
          };
          const x = mix(a.x, b.x, t), y = mix(a.y, b.y, t);
          const bands = .5 + .5 * Math.sin(x * .018 - y * .014 + level * .13);
          const fade = mix(a.fade, b.fade, t);
          const major = index % 3 === 1;
          const crest = clamp((style.shade - .49) * 2.1) * bands;
          const strength = fade * (major ? .19 + bands * .16 : .052 + bands * .055)
            * (.45 + style.shade * .61) * (level < 0 ? .58 : 1) + fade * crest * (major ? .16 : .055);
          const relief=formationAt(x,y);
          style.rise=relief.rise*.88;
          style.formation=relief.region;
          const local=detailed&&style.formation===target?style.rise:0;
          write(lines, x, y, level-local, style, strength*(detailed?.88:1), crest * .76 + (major ? .24 : 0));
        }
      }
    }
  }
  return { contours: new Float32Array(lines), veil: new Float32Array(veil) };
}
