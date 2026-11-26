import { ATLAS_BRIDGES, ATLAS_LINKS, ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, type AtlasPosition, type AtlasSkill, type Selection } from "./atlas-model";
import { reliefLens, type Camera, type Point } from "@/lib/knowledge-camera";

export const PERSPECTIVE = 1450;
export const lens = reliefLens(.62, -.17);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export function projection(p: AtlasPosition, perspective = PERSPECTIVE): Point {
  return lens.project(p,perspective);
}

const profiles: Record<string, { height: number; width: number; depth: number; angle: number; shelf: number; rose: number }> = {
  cs: { height: 80, width: 146, depth: 107, angle: -.26, shelf: .62, rose: .29 },
  ai: { height: 133, width: 149, depth: 122, angle: .15, shelf: .32, rose: .76 },
  data: { height: 98, width: 165, depth: 100, angle: .28, shelf: .84, rose: .41 },
  agents: { height: 95, width: 132, depth: 113, angle: .74, shelf: .30, rose: .86 },
  web: { height: 63, width: 158, depth: 103, angle: .99, shelf: .73, rose: .57 },
  finance: { height: 85, width: 145, depth: 112, angle: -.19, shelf: .48, rose: .16 },
  infra: { height: 64, width: 164, depth: 90, angle: -.43, shelf: .65, rose: .23 },
  robotics: { height: 113, width: 154, depth: 115, angle: .52, shelf: .45, rose: .68 },
};

export const atlasPeaks = ATLAS_TERRITORIES.map(({ id, x, y }) => {
  const profile = profiles[id];
  return { x, y, ...profile, cos: Math.cos(profile.angle), sin: Math.sin(profile.angle) };
});

const ridges = ATLAS_BRIDGES.map(({ from, to, count }) => {
  const a = atlasPeaks[from], b = atlasPeaks[to];
  const dx = b.x - a.x, dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  return { a, dx, dy, length, lift: clamp(7 + count * 5 - length * .014, 3, 29) };
});

const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

// Offsets and spans are expressed in the rotated domain frame.
type Formation = [along: number, across: number, span: number, breadth: number, rise: number, bend: number];
const formations: Record<string, readonly Formation[]> = {
  cs: [[-.54,-.13,.64,.20,33,-.18],[-.19,.41,.84,.24,22,.10],[.31,-.16,.25,.27,18,.16]],
  ai: [[-.28,-.26,.49,.27,32,.29],[.35,.17,.69,.18,35,-.20],[.12,.68,.40,.19,25,.16]],
  data: [[-.42,-.36,.87,.20,27,.20],[.17,.31,.88,.21,33,-.34],[.22,-.03,.78,.17,-25,.16]],
  agents: [[-.40,-.12,.82,.18,33,-.39],[.22,.33,.86,.18,30,.50],[.42,-.42,.59,.17,31,-.36]],
  web: [[-.18,-.14,.94,.19,31,.22],[.25,.31,.68,.24,31,-.17],[.21,.04,.72,.14,-13,.24]],
  finance: [[-.40,-.16,.85,.34,26,.35],[.18,.39,.83,.33,23,-.36],[.66,.14,.35,.22,15,.16]],
  infra: [[-.33,-.28,.79,.30,29,-.16],[.11,.33,.94,.25,24,.16],[.51,.07,.43,.29,21,-.30]],
  robotics: [[-.55,-.22,.50,.18,42,.37],[.30,-.32,.43,.16,42,-.43],[.26,.36,.59,.22,34,.52],[.63,.09,.26,.15,27,-.21]],
};
const strata = ATLAS_TERRITORIES.map(({id})=>formations[id]);

export function heightField(x: number, y: number) {
  const fold = x * .009 + y * .011, basin = y * .013 - x * .006, grain = x * .027 - y * .018;
  const folds = Math.sin(fold), basins = Math.cos(basin), texture = Math.sin(grain);
  const plain = -17 + 10 * folds + 8 * basins + 2.6 * texture;
  let slope = .09 * Math.cos(fold) - .11 * Math.sin(basin) + .038 * Math.cos(grain);
  if (Math.abs(x) > 935 || Math.abs(y) > 820) return { z: plain, relief: 0, region: 0, tone: .31, shade: clamp(.54 - slope) };
  let peaks = 0, weight = 0, region = 0, warmth = .09, mass = .30, shoulder = 0, geology = 0;
  for (let i = 0; i < atlasPeaks.length; i++) {
    const p = atlasPeaks[i];
    const dx = x - p.x, dy = y - p.y;
    const aligned = (p.cos * dx + p.sin * dy) / p.width;
    const cross = (p.cos * dy - p.sin * dx) / p.depth;
    const u = aligned + cross * .16;
    const v = cross + .23 * aligned * Math.sin(aligned * 1.55 + p.angle);
    const q = u * u + v * v;
    if (q > 14) continue;
    const foothill = Math.exp(-q * .76);
    const cap = Math.exp(-(.96 + .17 * v) * q - .19 * q * q);
    const table = .57 * (1 - smooth(.19 + p.shelf * .26, .65 + p.shelf * .28, q))
      + .27 * (1 - smooth(.72, 1.24, q)) + .16 * foothill;
    const influence = mix(cap * .86 + foothill * .14, table, .76 * p.shelf);
    if (influence > weight) { weight = influence; region = i; }
    peaks += p.height * influence;
    const gradient = 2 * (u * (p.cos * .62 + p.sin * .78) / p.width + v * (p.cos * .78 - p.sin * .62) / p.depth);
    slope -= p.height * gradient * (cap * (.84 + .31 * q) + foothill * .108);
    if (q < 5) for (const [along, across, span, breadth, rise, bend] of strata[i]) {
      const axis = (u - along) / span;
      const bank = (v - across - bend * (u - along)) / breadth;
      const footprint = axis * axis + bank * bank;
      if (footprint >= 6) continue;
      const mask = (1 - footprint / 6) ** 2;
      const raised = Math.exp(-footprint * .74);
      const shelf = 1 - smooth(.24, 1.55, footprint);
      const form = mix(raised, shelf, .27 * p.shelf);
      geology += rise * form * mask;
      slope -= rise * bank * .048 * raised;
    }
    shoulder += foothill;
    warmth += p.rose * foothill;
    mass += foothill;
  }
  let saddle = 0;
  for (const { a, dx, dy, length, lift } of ridges) {
    const u = x - a.x, v = y - a.y;
    const along = (u * dx + v * dy) / (length * length);
    if (along <= 0 || along >= 1) continue;
    const across = (u * dy - v * dx) / length - 30 * Math.sin(along * Math.PI * 1.14);
    const width = Math.abs(across);
    if (width > 170) continue;
    saddle += lift * Math.sin(along * Math.PI) ** 2 * Math.exp(-across * across / 2860) * clamp((170 - width) / 28);
  }
  const blend = clamp((935 - Math.abs(x)) / 230) * clamp((820 - Math.abs(y)) / 230);
  const extent = blend * blend * (3 - 2 * blend);
  const channel = -43 - y * .31 + 82 * Math.sin(y * .008 - 1.3);
  const cut = (x - channel) / (62 + 13 * basins);
  const valley = 39 * Math.exp(-cut * cut) * (1 - weight * .91);
  // The foreground rolls out from the Finance and Robotics shoulders, opening around the valley.
  const front = (y - 333 - .19 * x - 33 * Math.sin(x * .009)) / 76;
  const flank = 1 - Math.exp(-cut * cut * .22);
  const foot = front + .68;
  const near = (52 * Math.exp(-front * front) + 19 * Math.exp(-foot * foot * 2.1))
    * flank * Math.exp(-x * x / 413000);
  const rear = (y + 406 + .13 * x + 30 * Math.sin(x * .009 + 1.3)) / 102;
  const far = 37 * Math.exp(-rear * rear - x * x / 512000);
  const terrace = (4.4 * Math.sin(fold * 2.3 + basins * 1.3) + 1.7 * texture) * clamp(shoulder) * (1 - weight * .73);
  const fabric = x * .076 + y * .047 + Math.sin(y * .031 - x * .018) * 1.48;
  const crease = Math.cos(fabric);
  const finer = Math.sin(y * .125 - x * .091 + folds * 2.8);
  const roughness = clamp(.24 + shoulder * .58);
  const textureRise = ((crease * crease - .43) * 5.7 + finer * 1.6) * roughness;
  slope += (-Math.sin(fabric) * crease * .49 + Math.cos(y * .125 - x * .091 + folds * 2.8) * .12) * roughness;
  const relief = clamp((peaks + geology + saddle * .8 + near + far - valley * .38) / 135) * extent;
  return {
    z: plain + (peaks + geology + saddle + terrace + near + far - valley + textureRise) * extent,
    relief, region, tone: mix(.31, warmth / mass, extent),
    shade: clamp(.55 - slope * .72),
  };
}

export const skillPositions = new Map<string, AtlasPosition>();
for (const region of ATLAS_TERRITORIES) {
  const peak = atlasPeaks[region.index];
  region.items.forEach((skill, i) => {
    const a = i * 2.39996 + region.index * 1.23;
    const r = i === 0 ? 44 : 56 + Math.sqrt(i / region.items.length) * 87;
    const u = Math.cos(a) * r, v = Math.sin(a) * r * .9;
    const x = peak.x + u * peak.cos - v * peak.sin;
    const y = peak.y + u * peak.sin + v * peak.cos;
    skillPositions.set(skill.id, { x, y, z: 0 });
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
  skillPositions.set(skill.id, { x, y, z: 0 });
}
// Related skills share an orientation and may overlap into a small chain of shelves.
const LANDMARK_CELL = 72;
const reliefCell = (x: number, y: number) => (Math.floor(x / LANDMARK_CELL) + 2048) * 4096 + Math.floor(y / LANDMARK_CELL) + 2048;
type Spur = { x: number; y: number; dx: number; dy: number; length: number; width: number; rise: number; shelf: number };
const skillSpurs = new Map<number, Spur[]>();
for (const territory of ATLAS_TERRITORIES) for (const skill of territory.items) {
  const p = skillPositions.get(skill.id)!;
  const profile = atlasPeaks[territory.index];
  const related = ATLAS_LINKS.flatMap(({ a, b, bridge }) => {
    if (bridge) return [];
    const other = a.id === skill.id ? b : b.id === skill.id ? a : undefined;
    return other ? [skillPositions.get(other.id)!] : [];
  });
  const nearest = related.sort((a, b) => Math.hypot(a.x-p.x,a.y-p.y) - Math.hypot(b.x-p.x,b.y-p.y))[0];
  const angle = nearest ? Math.atan2(nearest.y-p.y,nearest.x-p.x) : profile.angle + Math.sin(skill.rank * 1.9) * .65;
  const spur = {
    x:p.x, y:p.y, dx:Math.cos(angle), dy:Math.sin(angle),
    length:39 + territory.index % 4 * 4, width:25 + (skill.rank % 3) * 3,
    rise:24 + (skill.rank % 3) * 4, shelf:profile.shelf,
  };
  for (let y = Math.floor((p.y-88)/LANDMARK_CELL); y <= Math.floor((p.y+88)/LANDMARK_CELL); y++) {
    for (let x = Math.floor((p.x-88)/LANDMARK_CELL); x <= Math.floor((p.x+88)/LANDMARK_CELL); x++) {
      const cell = reliefCell(x*LANDMARK_CELL,y*LANDMARK_CELL);
      const entries = skillSpurs.get(cell) ?? [];
      entries.push(spur);
      skillSpurs.set(cell,entries);
    }
  }
}

function formationAt(x: number, y: number) {
  let strongest = 0, second = 0;
  for (const p of skillSpurs.get(reliefCell(x,y)) ?? []) {
    const dx=x-p.x, dy=y-p.y;
    const along=(dx*p.dx+dy*p.dy)/p.length;
    const across=(dy*p.dx-dx*p.dy)/p.width-.27*along*along;
    const q=along*along+across*across;
    if(q>=1.85)continue;
    const shoulders=1-smooth(.18,1.85,q);
    const steps=.65*(1-smooth(.18,.94,q))+.35*shoulders;
    const amount=p.rise*mix(shoulders,steps,p.shelf);
    if (amount > strongest) {
      second = strongest;
      strongest = amount;
    } else second = Math.max(second, amount);
  }
  // Nearby spurs share a shoulder without summing into narrow peaks.
  return strongest + .19 * second;
}

export function terrainSample(x: number, y: number) {
  const sample = heightField(x, y);
  const rise = formationAt(x, y);
  return { ...sample, z: sample.z + rise, relief: clamp(sample.relief + rise / 180) };
}

export function terrainHeight(x: number, y: number) {
  return heightField(x, y).z + formationAt(x, y);
}

export const TERRAIN_STRIDE = 8;

export const landmarkPositions = atlasPeaks.map(({ x, y }) => ({ x, y, z: terrainHeight(x, y) + 9 }));
const landmarkProjection = landmarkPositions.map(point => projection(point));
export const PAN_BOUNDS = {
  left: Math.min(...landmarkProjection.map(p => p.x)) - 46,
  right: Math.max(...landmarkProjection.map(p => p.x)) + 46,
  top: Math.min(...landmarkProjection.map(p => p.y)) - 32,
  bottom: Math.max(...landmarkProjection.map(p => p.y)) + 32,
};

for (const point of skillPositions.values()) point.z=terrainHeight(point.x,point.y)+5;

export const OVERVIEW_BOUNDS = { left:-590, right:630, top:-300, bottom:249 };
export type SceneFrame = {
  camera: Camera; width: number; height: number; stretch: number; progress: number; selection: Selection | null;
  time: number; perspective: number; hover: number; selectionLight: Float32Array;
  impulses: Float32Array; activeSkill: AtlasPosition | null; motion: boolean; quality: number; hoverStrength: number;
  hoverPoint: AtlasPosition | null; rippling: boolean;
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

export function skillPose(skill: AtlasSkill): AtlasPosition {
  return skillPositions.get(skill.id)!;
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
    if(p.z>260||p.z< -78)continue;
    if(p.z>terrainHeight(p.x,p.y))continue;
    let near=d+14,far=d;
    for(let i=0;i<5;i++) {
      const middle=(near+far)*.5;
      const candidate=at(middle);
      if(candidate.z>terrainHeight(candidate.x,candidate.y))near=middle;
      else far=middle;
    }
    const hit=at(far);
    if(Math.abs(hit.z-terrainHeight(hit.x,hit.y))<8)return hit;
  }
  return null;
}
