import { clamp, heightField, landmarkPositions, lens, skillPositions, type SceneFrame } from "./atlas-geometry";
import { ATLAS_TERRITORIES } from "./atlas-model";

const TILE_SIZE = 416;
const TILE_RADIUS = 3;
export const FOG_NEAR = 515;
export const FOG_FAR = TILE_SIZE * TILE_RADIUS - 120;
const STRIDE = 8;
const seed = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

export function terrainCenter({ camera, perspective }: SceneFrame) {
  const point = { x: -camera.x / camera.z, y: -camera.y / camera.z };
  // Intersect the view-center ray with the shared plain; avoid the perspective singularity.
  const depth = clamp(point.y * lens.COS / (lens.SIN + point.y * lens.COS / perspective), -1700, perspective * .68);
  return lens.rayPoint(point, depth, perspective);
}

export function createTerrainTiles(detailed: boolean) {
  const tiles = new Map<string, Float32Array>();
  const subdivisions = detailed ? 5 : 3;
  const cachedMargin = 18;
  const cellsPerTile = 20;
  const cellSize = TILE_SIZE / cellsPerTile;
  const step = cellSize / subdivisions;
  let windowX = Infinity, windowY = Infinity;
  let field: Float32Array<ArrayBuffer> = new Float32Array(0);

  function tile(tx: number, ty: number) {
    const key = tx + "/" + ty;
    const cached = tiles.get(key);
    if (cached) {
      tiles.delete(key);
      tiles.set(key, cached);
      return cached;
    }
    const points: number[] = [];
    for (let iy = 0; iy < cellsPerTile; iy++) for (let ix = 0; ix < cellsPerTile; ix++) {
      const gx = tx * cellsPerTile + ix, gy = ty * cellsPerTile + iy;
      const x = gx * cellSize - TILE_SIZE / 2, y = gy * cellSize - TILE_SIZE / 2;
      const hash = gx * 67.34 + gy * 191.47;
      const distance = Math.hypot(x / 565, y / 463);
      const detail = clamp((1.47 - distance) / .61);
      const samples = subdivisions ** 2;
      const first = Math.floor(seed(hash + 8) * samples);
      for (let i = 0; i < (detail > 0 ? samples : 1); i++) {
        const n = (first + i) % samples;
        const phase = seed(hash + n * 1.62 + 1);
        if (n !== first && phase > detail * .82) continue;
        const px = x + (n % subdivisions + seed(hash + n * 3.17 + 4)) * step;
        const py = y + (Math.floor(n / subdivisions) + seed(hash + n * 2.63 + 7)) * step;
        const { z, relief, region } = heightField(px, py);
        const contour = .5 + .5 * Math.cos(z * .20 + Math.sin(px * .018 + py * .021) * .68);
        const opacity = (.19 + relief * .43 + detail * .14) * (.62 + contour * .21 + phase * .38);
        const size = .86 + .81 * phase + (1 - detail) * .82;
        points.push(px, py, z, region, opacity, size, 0, phase);
      }
    }
    const values = new Float32Array(points);
    tiles.set(key, values);
    if (tiles.size > (TILE_RADIUS * 2 + 1) ** 2 + cachedMargin) tiles.delete(tiles.keys().next().value!);
    return values;
  }

  return (x: number, y: number) => {
    const positionX = x / TILE_SIZE, positionY = y / TILE_SIZE;
    // Keep a margin around each tile center so small pointer changes don't rebuild the field.
    const margin = .68;
    const tx = Math.abs(positionX - windowX) <= margin ? windowX : Math.round(positionX);
    const ty = Math.abs(positionY - windowY) <= margin ? windowY : Math.round(positionY);
    if (windowX === tx && windowY === ty) return field;
    windowX = tx;
    windowY = ty;
    const visible: Float32Array[] = [];
    for (let iy = ty - TILE_RADIUS; iy <= ty + TILE_RADIUS; iy++) {
      for (let ix = tx - TILE_RADIUS; ix <= tx + TILE_RADIUS; ix++) {
        const gapX = Math.max(0, Math.abs(ix - tx) - .5 - margin) * TILE_SIZE;
        const gapY = Math.max(0, Math.abs(iy - ty) - .5 - margin) * TILE_SIZE;
        if (Math.hypot(gapX, gapY) < FOG_FAR) visible.push(tile(ix, iy));
      }
    }
    const length = visible.reduce((sum, points) => sum + points.length, 0);
    field = new Float32Array(length);
    // Interleave every tile by phase so reducing the draw count thins the whole surface.
    const bands = 6;
    const bandFor = (phase: number) => {
      const value = phase * 851.147;
      return Math.floor((value - Math.floor(value)) * bands);
    };
    const counts = new Uint32Array(bands);
    for (const points of visible) {
      for (let i = 0; i < points.length; i += STRIDE) counts[bandFor(points[i + 7])]++;
    }
    const offsets = new Uint32Array(bands);
    for (let i = 1; i < bands; i++) offsets[i] = offsets[i - 1] + counts[i - 1] * STRIDE;
    for (const points of visible) {
      for (let i = 0; i < points.length; i += STRIDE) {
        const band = bandFor(points[i + 7]);
        for (let j = 0; j < STRIDE; j++) field[offsets[band] + j] = points[i + j];
        offsets[band] += STRIDE;
      }
    }
    return field;
  };
}

export function makeAtlasMarkers() {
  const particles: number[] = [];
  for (const region of ATLAS_TERRITORIES) {
    const summit = landmarkPositions[region.index];
    particles.push(summit.x, summit.y, summit.z, region.index, .42, 23, 1, 0);
    particles.push(summit.x, summit.y, summit.z, region.index, .98, 7.5, 1, 1);
    for (const skill of region.items) {
      const pose = skillPositions.get(skill.id)!;
      particles.push(pose.x, pose.y, pose.z, region.index, .78, 5, 2, 1);
      for (let k = 0; k < 19; k++) {
        const j = 401 + k + skill.rank * 389 + region.index * 2177;
        const angle = seed(j) * Math.PI * 2, radius = 4 + seed(j + 7) ** .62 * 12;
        const x = pose.x + Math.cos(angle) * radius, y = pose.y + Math.sin(angle) * radius;
        particles.push(x, y, pose.z + (seed(j + 13) - .5) * 10, region.index, .22 + seed(j + 22) * .45, .9 + seed(j + 43) * .63, 2, 0);
      }
    }
  }
  return new Float32Array(particles);
}
