import { ATLAS_LINKS, ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, terrainPoint, type AtlasPosition, type Selection } from "./atlas-model";
import type { Camera } from "@/lib/knowledge-camera";

export type SceneFrame = {
  camera: Camera;
  width: number;
  height: number;
  stretch: number;
  progress: number;
  level: number;
  selection: Selection | null;
  signal: number;
};
export type AtlasRenderer = { draw: (frame: SceneFrame) => void; dispose: () => void };
type Color = [number, number, number];
type Path = { points: AtlasPosition[]; bridge: boolean; active: boolean };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

export function screenPoint(point: {x: number; y: number}, frame: Pick<SceneFrame, "camera" | "width" | "height" | "stretch">) {
  const { camera, width, height, stretch } = frame;
  return {
    x: width / 2 + point.x * camera.z + camera.x,
    y: height / 2 + (point.y * camera.z + camera.y) * stretch,
  };
}

export function routePoint(a: AtlasPosition, b: AtlasPosition, t: number, bridge: boolean): AtlasPosition {
  // Lift bridges over the terrain; local paths trace nearer the associated surface points.
  const rise = bridge ? 34 : 14;
  const bend = bridge ? 0.08 : 0.028;
  const arc = Math.sin(t * Math.PI);
  return {
    x: mix(a.x, b.x, t) - (b.y - a.y) * bend * arc,
    y: mix(a.y, b.y, t) + (b.x - a.x) * bend * arc,
    z: mix(a.z, b.z, t) + rise * arc + 4,
  };
}

export function getSceneRoutes(selection: Selection | null, level: number): Path[] {
  const focus = selection?.type === "skill" ? SKILLS_BY_ID.get(selection.id) : null;
  const region = selection?.type === "territory" ? selection.id : focus?.territoryId;
  return ATLAS_LINKS.flatMap(({ a, b, bridge, overview }) => {
    const inside = a.territoryId === region || b.territoryId === region;
    const active = focus ? a.id === focus.id || b.id === focus.id : inside && (bridge || level > 0);
    if (!active && !(overview && !focus) && !(level > 0 && !region && !bridge)) return [];
    const reverse = focus?.id === b.id || (!focus && b.territoryId === region && a.territoryId !== region);
    const start = reverse ? b : a;
    const end = reverse ? a : b;
    const points = Array.from({length: 25}, (_, index) => routePoint(start.position, end.position, index / 24, bridge));
    return [{ points, bridge, active }];
  });
}

export function territoryIndex(selection: Selection | null) {
  if (!selection) return -1;
  const id = selection.type === "territory" ? selection.id : SKILLS_BY_ID.get(selection.id)?.territoryId;
  return id ? TERRITORIES_BY_ID.get(id)?.index ?? -1 : -1;
}

export function getVisibleSkills(selection: Selection | null, level: number) {
  if (selection?.type === "skill") {
    return [SKILLS_BY_ID.get(selection.id)!, ...ATLAS_LINKS.flatMap(({a,b}) => a.id === selection.id ? [b] : b.id === selection.id ? [a] : [])];
  }
  if (selection?.type === "territory") return TERRITORIES_BY_ID.get(selection.id)?.items ?? [];
  return ATLAS_TERRITORIES.flatMap(territory => territory.items.filter(skill => level > 1 || (level === 1 && skill.rank < 3)));
}

function colorOf(hex: string): Color {
  return [1, 3, 5].map(index => parseInt(hex.substring(index, index + 2), 16) / 255) as Color;
}
function vertex(output: number[], p: AtlasPosition, color: Color, alpha: number, region = -1) {
  output.push(p.x, p.y, p.z, ...color, alpha, region);
}

export function sampleAtlasTerrains(compact: boolean) {
  const segments = compact ? 44 : 64;
  const rings = compact ? 9 : 13;
  const terrains = ATLAS_TERRITORIES.map(region =>
    Array.from({length: rings + 1}, (_, r) =>
      Array.from({length: segments + 1}, (_, i) => terrainPoint(region, region.index, i / segments * Math.PI * 2, r / rings))),
  );
  return { segments, rings, terrains };
}

export function atlasGeometry(compact: boolean) {
  const surface: number[] = [];
  const triangles: number[] = [];
  const contours: number[] = [];
  const points: number[] = [];
  const grid: number[] = [];
  const { segments, rings, terrains } = sampleAtlasTerrains(compact);
  const gridColor: Color = [0.38, 0.33, 0.35];
  for (let x = -504; x <= 504; x += 36) {
    vertex(grid, {x, y: -345, z: -18}, gridColor, x % 144 === 0 ? .30 : .14);
    vertex(grid, {x, y: 349, z: -18}, gridColor, x % 144 === 0 ? .30 : .14);
  }
  for (let y = -345; y <= 351; y += 34) {
    vertex(grid, {x: -505, y, z: -18}, gridColor, y % 4 === 3 ? .26 : .14);
    vertex(grid, {x: 505, y, z: -18}, gridColor, y % 4 === 3 ? .26 : .14);
  }

  for (const region of ATLAS_TERRITORIES) {
    const tint = colorOf(region.color);
    const samples = terrains[region.index];
    const paint = (p: AtlasPosition, angle: number, radius: number, side = false) => {
      const light = 0.5 - Math.cos(angle - 0.98) * 0.5;
      const slope = Math.sin(Math.PI * radius);
      const amount = side ? 0.115 + light * 0.035 : 0.155 + light * slope * 0.22 + (1 - radius) * .05;
      const color = tint.map((channel, index) => mix([0.073, 0.061, 0.068][index], channel, amount)) as Color;
      vertex(surface, p, color, 1, region.index);
    };
    const base = surface.length / 8;
    const stride = segments + 1;
    for (let r = 0; r <= rings; r++) {
      for (let i = 0; i <= segments; i++) paint(samples[r][i], i / segments * Math.PI * 2, r / rings);
    }
    for (let r = 0; r < rings; r++) {
      for (let i = 0; i < segments; i++) {
        const a = base + r * stride + i;
        const b = a + stride;
        triangles.push(a, b, b + 1, a, b + 1, a + 1);
      }
    }
    for (let i = 0; i < segments; i++) {
      const a = samples[rings][i];
      const b = samples[rings][i + 1];
      const lowA = { ...a, z: -11 };
      const lowB = { ...b, z: -11 };
      const angle = i / segments * Math.PI * 2;
      const side = surface.length / 8;
      for (const p of [a, lowA, b, lowB]) paint(p, angle, 1, true);
      triangles.push(side, side + 1, side + 2, side + 2, side + 1, side + 3);
      for (const p of [lowA, lowB]) vertex(contours, p, tint, .22, region.index);
      for (let r = 2; r <= rings; r++) {
        const strength = r === rings ? .63 : r % 3 === 0 ? .48 : .27;
        for (const p of [samples[r][i], samples[r][i + 1]]) {
          vertex(contours, {...p, z:p.z + 1.15}, tint, strength, region.index);
        }
      }
    }
    const count = compact ? 215 : 450;
    for (let i = 0; i < count; i++) {
      const sample = i + region.index * 917;
      const angle = noise(sample) * Math.PI * 2;
      const radius = .045 + .91 * Math.sqrt(noise(sample + 132));
      const p = terrainPoint(region, region.index, angle, radius);
      vertex(points, {...p, z:p.z + 1.7 + noise(sample + 41) * 5.5}, tint, .19 + noise(sample + 8) * .60, region.index);
    }
  }
  return { surface, contours, points, grid, triangles: new Uint16Array(triangles) };
}
