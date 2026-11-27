import { clamp, CONTOUR_FLOOR, contourInterval, mix, terrainSample } from "./atlas-geometry";

const EXTENT = { x: 752, y: 608 };
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0]] as const;
const GLOW_WAVELENGTH = 320;
export const CONTOUR_STRIDE = 12;

type SurfacePoint = { x: number; y: number; z: number; region: number; tone: number; shade: number };
type Crossing = SurfacePoint & { opacity: number; crest: number; adjacent: Crossing[] };

function writePoint(buffer: number[], point: SurfacePoint, opacity: number, crest: number) {
  buffer.push(point.x, point.y, point.z, point.region + point.tone, opacity, 1, -point.shade, crest);
}

function writeRibbon(ribbons: number[], path: Crossing[], closed: boolean) {
  const last = path.length - 1;
  if (last < 1) return;
  const distance = new Float32Array(path.length);
  for (let i = 1; i <= last; i++) distance[i] = distance[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  const length = distance[last];
  if (length < .01) return;
  // A closed contour completes a whole number of light waves at its seam.
  const rate = closed ? Math.max(1, Math.round(length / GLOW_WAVELENGTH)) / length : 1 / GLOW_WAVELENGTH;
  const offsets = path.map((_, index) => {
    const a = path[index === 0 && closed ? last - 1 : Math.max(0, index - 1)];
    const b = path[index === last && closed ? 1 : Math.min(last, index + 1)];
    const dx = b.x - a.x, dy = b.y - a.y;
    const magnitude = Math.hypot(dx, dy) || 1;
    return [dx / magnitude, dy / magnitude] as const;
  });
  const vertex = (index: number, edge: number) => {
    const point = path[index];
    writePoint(ribbons, point, point.opacity, point.crest);
    ribbons.push(...offsets[index], edge, distance[index] * rate + point.z * .024);
  };
  if (ribbons.length) {
    ribbons.push(...ribbons.slice(-CONTOUR_STRIDE));
    vertex(0, -1);
  }
  for (let i = 0; i <= last; i++) {
    vertex(i, -1);
    vertex(i, 1);
  }
}

export function makeAtlasSurface(compact: boolean) {
  const interval = contourInterval(compact);
  const columns = compact ? 76 : 111;
  const rows = compact ? 63 : 91;
  const stepX = EXTENT.x * 2 / (columns - 1);
  const stepY = EXTENT.y * 2 / (rows - 1);
  const samples = Array.from({ length: columns * rows }, (_, index) => {
    const x = index % columns * stepX - EXTENT.x;
    const y = Math.floor(index / columns) * stepY - EXTENT.y;
    const surface = terrainSample(x, y);
    const fade = clamp((1 - Math.hypot(x / EXTENT.x, (y + 14) / EXTENT.y)) / .39);
    return { x, y, ...surface, fade: fade * fade * (3 - 2 * fade) };
  });
  const veil: number[] = [];
  const lines: number[] = [];
  const ribbons: number[] = [];
  const major = new Map<number, Crossing>();
  const writeVeil = (sample: typeof samples[number]) => {
    writePoint(veil, sample, sample.fade * (.019 + sample.relief * .077 + sample.shade * .032), .5);
  };

  for (let row = 0; row < rows - 1; row++) {
    // Join successive rows into one triangle strip.
    if (row > 0) writeVeil(samples[row * columns]);
    for (let col = 0; col < columns; col++) {
      writeVeil(samples[row * columns + col]);
      writeVeil(samples[(row + 1) * columns + col]);
    }
    if (row < rows - 2) writeVeil(samples[(row + 2) * columns - 1]);

    for (let col = 0; col < columns - 1; col++) {
      const start = row * columns + col;
      const cell = [start, start + 1, start + columns + 1, start + columns];
      const [a, b, c, d] = cell.map(index => samples[index]);
      const low = Math.max(CONTOUR_FLOOR, Math.min(a.z, b.z, c.z, d.z));
      const high = Math.max(a.z, b.z, c.z, d.z);
      if (high < low || Math.max(a.fade, b.fade, c.fade, d.fade) < .009) continue;
      const first = Math.ceil((low - CONTOUR_FLOOR) / interval);
      for (let index = first; CONTOUR_FLOOR + index * interval <= high; index++) {
        const level = CONTOUR_FLOOR + index * interval;
        const isMajor = index % 3 === 1;
        const crossings: Crossing[] = [];
        for (const [i, j] of EDGES) {
          const startIndex = cell[i], endIndex = cell[j];
          const from = samples[startIndex], to = samples[endIndex];
          if ((from.z < level) === (to.z < level)) continue;
          const axis = Math.abs(startIndex - endIndex) === 1 ? 0 : 1;
          const edgeKey = (index * samples.length + Math.min(startIndex, endIndex)) * 2 + axis;
          const cached = isMajor ? major.get(edgeKey) : undefined;
          if (cached) {
            crossings.push(cached);
            continue;
          }
          const t = (level - from.z) / (to.z - from.z);
          const x = mix(from.x, to.x, t), y = mix(from.y, to.y, t);
          const shade = mix(from.shade, to.shade, t);
          const fade = mix(from.fade, to.fade, t);
          const crest = clamp((shade - .37) * 1.44);
          const opacity = fade * (isMajor ? .25 + .19 * crest : .070 + .062 * crest) * (level < 0 ? .58 : 1);
          const point = {
            x, y, z: level, shade, opacity, crest, region: t < .5 ? from.region : to.region,
            tone: mix(from.tone, to.tone, t), adjacent: [],
          };
          if (isMajor) major.set(edgeKey, point);
          crossings.push(point);
        }
        if (crossings.length === 4 && (a.z - level) * (c.z - level) < (b.z - level) * (d.z - level)) {
          crossings.push(crossings.shift()!);
        }
        if (isMajor) {
          for (let i = 0; i + 1 < crossings.length; i += 2) {
            const from = crossings[i], to = crossings[i + 1];
            from.adjacent.push(to);
            to.adjacent.push(from);
          }
        } else {
          for (const point of crossings) writePoint(lines, point, point.opacity, point.crest);
        }
      }
    }
  }

  const visited = new Set<Crossing>();
  const trace = (start: Crossing) => {
    if (visited.has(start)) return;
    const path = [start];
    visited.add(start);
    let head = start;
    let previous: Crossing | undefined;
    while (true) {
      const next = head.adjacent.find(point => point !== previous);
      if (!next) break;
      path.push(next);
      if (visited.has(next)) break;
      visited.add(next);
      previous = head;
      head = next;
    }
    writeRibbon(ribbons, path, path.at(-1) === start);
  };
  for (const point of major.values()) if (point.adjacent.length === 1) trace(point);
  for (const point of major.values()) trace(point);
  return { contours: new Float32Array(lines), ribbons: new Float32Array(ribbons), veil: new Float32Array(veil) };
}
