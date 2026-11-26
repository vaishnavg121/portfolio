import { clamp, encodeFormation, formationAt, landmarkPositions, lens, mix, skillPositions, terrainSample, TERRAIN_STRIDE, type SceneFrame } from "./atlas-geometry";
import { ATLAS_TERRITORIES } from "./atlas-model";

const TILE_SIZE = 416;
const TILE_RADIUS = 3;
export const FOG_NEAR = 515;
export const FOG_FAR = TILE_SIZE * TILE_RADIUS - 120;
const STRIDE = TERRAIN_STRIDE;
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
        const jitterX = seed(hash + n * 3.17 + 4);
        const jitterY = seed(hash + n * 2.63 + 7);
        const sx = x + (n % subdivisions + mix(.13,.87,jitterX)) * step;
        const sy = y + (Math.floor(n / subdivisions) + mix(.24,.76,jitterY)) * step;
        // Warp the same global rows on either side of every tile boundary.
        const px = sx + 4.8 * Math.sin(sy * .027 + sx * .009);
        const py = sy + 5.4 * Math.sin(sx * .024 - sy * .011) + 2 * Math.cos(sx * .057);
        const { z, relief, region, tone, shade, rise, formation } = terrainSample(px, py);
        const contour = .5 + .5 * Math.cos(z * .255 + Math.sin(px * .014 + py * .021) * 1.18);
        if (i > 1 && phase > .64 + shade * .13 + contour * .09) continue;
        const emphasis = .12 * shade + .13 * contour ** 3;
        const opacity = (.24 + relief * .40 + detail * .12) * (.60 + phase * .36 + emphasis);
        const size = 1.06 + .67 * phase + (1 - detail) * .58 + .28 * emphasis;
        // The fractional region index and negative point kind carry continuous tone and slope.
        points.push(px, py, z, region + tone, opacity, size, -shade, phase, encodeFormation(formation,rise));
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
    particles.push(summit.x, summit.y, summit.z, region.index, .36, 20, 1, 0, 0);
    particles.push(summit.x, summit.y, summit.z, region.index, .98, 7.2, 1, 1, 0);
    for (const skill of region.items) {
      const pose = skillPositions.get(skill.id)!;
      const formation = formationAt(pose.x,pose.y);
      const rise = formation.region===region.index?formation.rise*.88:0;
      particles.push(pose.x, pose.y, pose.z, region.index, .88, 5.5, 2, 1, encodeFormation(region.index,rise));
      for (let k = 0; k < 27; k++) {
        const j = 401 + k + skill.rank * 389 + region.index * 2177;
        const angle = seed(j) * Math.PI * 2, radius = 4 + seed(j + 7) ** .62 * 12;
        const x = pose.x + Math.cos(angle) * radius, y = pose.y + Math.sin(angle) * radius;
        const sample = terrainSample(x,y);
        particles.push(x, y, sample.z + 1.5, region.index, .23 + seed(j + 22) * .49,
          1.1 + seed(j + 43) * .61, 2, 0, encodeFormation(sample.formation,sample.rise));
      }
    }
  }
  return new Float32Array(particles);
}
