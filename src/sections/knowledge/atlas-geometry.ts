import { ATLAS_BRIDGES, ATLAS_LINKS, ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, type AtlasPosition, type AtlasSkill, type Selection } from "./atlas-model";
import { reliefLens, type Camera, type Point } from "@/lib/knowledge-camera";

export const PERSPECTIVE = 1450;
export const lens = reliefLens(.62, -.17);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export function projection(p: AtlasPosition, perspective = PERSPECTIVE): Point {
  return lens.project(p,perspective);
}

export const atlasPeaks = ATLAS_TERRITORIES.map((r, index) => ({
  x: r.x, y: r.y,
  z: [80,143,107,101,53,92,63,130][index],
  rx: [142,154,145,139,130,147,132,153][index],
  ry: [101,112,122,111,102,113,112,117][index],
}));

const ridges = ATLAS_BRIDGES.map(({ from, to, count }) => {
  const a = atlasPeaks[from], b = atlasPeaks[to];
  const dx = b.x - a.x, dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  return { a, dx, dy, length, lift: clamp(7 + count * 5 - length * .014, 3, 29) };
});

export function heightField(x: number, y: number) {
  // A low continuous plain underlies both the knowledge regions and the distant terrain.
  const plain = -14 + Math.sin(x * .009 + y * .011) * 7
    + Math.cos(y * .014 - x * .006) * 5 + Math.sin(x * .025 - y * .018) * 2;
  if (Math.abs(x) > 910 || Math.abs(y) > 790) return { z: plain, relief: 0, region: 0 };
  let peaks = 0, weight = 0, region = 0;
  for (let i = 0; i < atlasPeaks.length; i++) {
    const p = atlasPeaks[i];
    const dx = (x - p.x) / p.rx, dy = (y - p.y) / p.ry;
    const influence = Math.exp(-1.35 * (dx * dx + dy * dy));
    if (influence > weight) { weight = influence; region = i; }
    peaks += p.z * influence;
  }
  let saddle = 0;
  for (const { a, dx, dy, length, lift } of ridges) {
    const u = x - a.x, v = y - a.y;
    const along = (u * dx + v * dy) / (length * length);
    if (along <= 0 || along >= 1) continue;
    const across = (u * dy - v * dx) / length;
    const width = Math.abs(across);
    if (width > 170) continue;
    saddle += lift * Math.sin(along * Math.PI) ** 2 * Math.exp(-across * across / 3650) * clamp((170 - width) / 28);
  }
  const extent = (1 - clamp((Math.abs(x) - 710) / 200)) * (1 - clamp((Math.abs(y) - 590) / 200));
  const relief = clamp((peaks + saddle * .7) / 120) * extent;
  return { z: plain + (peaks + saddle) * extent, relief, region };
}

export const landmarkPositions = atlasPeaks.map(({x,y}) => ({ x, y, z: heightField(x,y).z + 9 }));
const landmarkProjection = landmarkPositions.map(point => projection(point));
export const PAN_BOUNDS = {
  left: Math.min(...landmarkProjection.map(p => p.x)) - 46,
  right: Math.max(...landmarkProjection.map(p => p.x)) + 46,
  top: Math.min(...landmarkProjection.map(p => p.y)) - 32,
  bottom: Math.max(...landmarkProjection.map(p => p.y)) + 32,
};
export const skillPositions = new Map<string, AtlasPosition>();
for (const region of ATLAS_TERRITORIES) {
  const peak = atlasPeaks[region.index];
  region.items.forEach((skill, i) => {
    const a = i * 2.39996 + region.index * 1.23;
    const r = i === 0 ? 24 : 50 + Math.sqrt(i / region.items.length) * 116;
    const x = peak.x + Math.cos(a) * r;
    const y = peak.y + Math.sin(a) * r * 1.03;
    skillPositions.set(skill.id, { x, y, z: heightField(x,y).z + 30 + (i % 3) * 8 });
  });
}
// Draw related skills slightly toward one another while preserving each region's spacing.
const layout = new Map(skillPositions);
for (const region of ATLAS_TERRITORIES) for (const skill of region.items) {
  const neighbors = ATLAS_LINKS.flatMap(({ a, b, bridge }) => {
    if (bridge) return [];
    const related = a.id === skill.id ? b : b.id === skill.id ? a : null;
    return related ? [layout.get(related.id)!] : [];
  });
  if (neighbors.length === 0) continue;
  const point = layout.get(skill.id)!;
  const average = neighbors.reduce((sum, neighbor) => ({ x: sum.x + neighbor.x, y: sum.y + neighbor.y }), { x: 0, y: 0 });
  const x = mix(point.x, average.x / neighbors.length, .12), y = mix(point.y, average.y / neighbors.length, .12);
  skillPositions.set(skill.id, { x, y, z: point.z - heightField(point.x, point.y).z + heightField(x, y).z });
}
export const OVERVIEW_BOUNDS = { left:-590, right:630, top:-300, bottom:249 };
export type SceneFrame = {
  camera: Camera; width: number; height: number; stretch: number; progress: number; selection: Selection | null;
  signal: number; time: number; perspective: number; hover: number; expansion: Float32Array;
  impulses: Float32Array; activeSkill: AtlasPosition | null; motion: boolean; quality: number; hoverStrength: number;
};
export type AtlasRenderer = { draw: (frame: SceneFrame) => void; dispose: () => void };

export function screenPoint(p: AtlasPosition, {camera,width,height,stretch,perspective}: Pick<SceneFrame,"camera"|"width"|"height"|"stretch"|"perspective">) {
  const pt = projection(p,perspective);
  return { x: width / 2 + camera.x + pt.x * camera.z, y: height / 2 + (camera.y + pt.y * camera.z) * stretch };
}

export function territoryIndex(selection: Selection | null) {
  if (!selection) return -1;
  const id = selection.type === "territory" ? selection.id : SKILLS_BY_ID.get(selection.id)?.territoryId;
  return id ? TERRITORIES_BY_ID.get(id)?.index ?? -1 : -1;
}

export function skillPose(skill: AtlasSkill, amount: number): AtlasPosition {
  const region = TERRITORIES_BY_ID.get(skill.territoryId)!;
  const peak = landmarkPositions[region.index];
  const target = skillPositions.get(skill.id)!;
  return { x:mix(peak.x,target.x,amount), y:mix(peak.y,target.y,amount), z:mix(peak.z,target.z,amount) };
}

export function visibleSkills(selection: Selection | null) {
  const region = territoryIndex(selection);
  if (region < 0) return [];
  const own = ATLAS_TERRITORIES[region].items;
  if (selection?.type !== "skill") return own;
  const focus = SKILLS_BY_ID.get(selection.id)!;
  const neighbors = ATLAS_LINKS.flatMap(({a,b}) => a.id === focus.id ? [b] : b.id === focus.id ? [a] : []);
  const ranked = [focus,...neighbors];
  return [...ranked, ...own.filter(skill=>!ranked.includes(skill))];
}

// Undo perspective along a camera ray, then find its first intersection with the heightfield.
export function pickSurface(point: Point, perspective: number): AtlasPosition | null {
  const at = (depth:number) => lens.rayPoint(point,depth,perspective);
  // Sample around the ray's intersection with the plain to include panning into the distance.
  const plane = point.y * lens.COS / (lens.SIN + point.y * lens.COS / perspective);
  const start = clamp(plane + 430, -2150, perspective * .78);
  const end = Math.max(-2390, plane - 180);
  for(let d=start;d>=end;d-=14) {
    const p=at(d);
    if(p.z>195||p.z< -44)continue;
    if(p.z>heightField(p.x,p.y).z)continue;
    let near=d+14,far=d;
    for(let i=0;i<5;i++) {
      const middle=(near+far)*.5;
      const candidate=at(middle);
      if(candidate.z>heightField(candidate.x,candidate.y).z)near=middle;
      else far=middle;
    }
    const hit=at(far);
    if(Math.abs(hit.z-heightField(hit.x,hit.y).z)<8)return hit;
  }
  return null;
}
