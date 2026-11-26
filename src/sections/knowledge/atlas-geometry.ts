import { ATLAS_LINKS, ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, type AtlasPosition, type AtlasSkill, type Selection } from "./atlas-model";
import { reliefLens, type Camera, type Point } from "@/lib/knowledge-camera";

export const PERSPECTIVE = 1450;
export const lens = reliefLens(.62, -.17);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const seed = (n: number) => {
  const a = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return a - Math.floor(a);
};
export function projection(p: AtlasPosition, perspective = PERSPECTIVE): Point {
  return lens.project(p,perspective);
}

export const atlasPeaks = ATLAS_TERRITORIES.map((r, index) => ({
  x: r.x, y: r.y,
  z: [80,143,107,101,53,92,63,130][index],
  rx: [142,154,145,139,130,147,132,153][index],
  ry: [101,112,122,111,102,113,112,117][index],
  tint: [.23,.66,.07,.36,.11,.49,.04,.43][index],
}));

export function heightField(x: number, y: number) {
  let mass = 0, peaks = 0, weight = 0, region = 0;
  for (let i=0;i<atlasPeaks.length;i++) {
    const p=atlasPeaks[i];
    const dx = (x-p.x)/p.rx, dy = (y-p.y)/p.ry;
    const g = Math.exp(-(dx*dx + dy*dy) * 1.65);
    if (g > weight) { weight = g; region = i; }
    mass += g;
    peaks += (p.z-16) * g ** 1.19;
  }
  const ripple = Math.sin(x*.039 + y*.023) * 4.1 + Math.cos(y*.052 - x*.019)*3.2 + Math.sin((x+y)*.079)*1.5;
  const outline = mass - .22 + (Math.sin(x*.028 + y*.016) + Math.cos(y*.037-x*.012))*.048;
  return { z: 14 * Math.min(1,mass) + peaks + ripple * clamp(mass*2.1), outline, region };
}

export const landmarkPositions = atlasPeaks.map(({x,y}) => ({ x, y, z: heightField(x,y).z + 9 }));
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
  return { x:mix(peak.x,target.x,amount), y:mix(peak.y,target.y,amount), z:mix(peak.z,target.z,amount) + Math.sin(amount*Math.PI) * 19 };
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

export function sceneRoutes(selection: Selection | null, hover: number) {
  const region = territoryIndex(selection);
  const overview = !selection;
  const links = ATLAS_LINKS.filter(({ a,b,overview: representative }) => {
    if (overview) return representative && hover >= 0 && (a.territoryId===ATLAS_TERRITORIES[hover].id || b.territoryId===ATLAS_TERRITORIES[hover].id);
    if (selection.type === "skill") return a.id===selection.id || b.id===selection.id;
    const id = ATLAS_TERRITORIES[region].id;
    return (a.territoryId === id && b.territoryId === id) || (representative && (a.territoryId === id || b.territoryId === id));
  });
  return links.slice(0,overview ? 3 : 16).map(({a,b,bridge}) => {
    const reverse = selection?.type==="skill" ? selection.id === b.id : (region >= 0 && b.territoryId===ATLAS_TERRITORIES[region].id);
    return { a: reverse ? b : a, b: reverse ? a : b, bridge };
  });
}
export function routePoint(a: AtlasPosition,b: AtlasPosition,t: number,bridge: boolean) {
  const arc = Math.sin(t * Math.PI);
  const swell = Math.sin(Math.PI * t * 2) * (bridge ? .018 : .035);
  return {
    x: mix(a.x,b.x,t) - (b.y-a.y) * swell,
    y: mix(a.y,b.y,t) + (b.x-a.x) * swell,
    z: mix(a.z,b.z,t) + (bridge ? 57 : 22) * arc,
  };
}

// One progressive field. Interleaving by a deterministic hash keeps both quality tiers spatially balanced.
export function makeTerrainParticles(high: boolean) {
  const vertices: number[][] = [];
  const step = high ? 4.1 : 6;
  const push = (x:number,y:number,z:number,region:number,alpha:number,size:number,kind:number,phase:number) => {
    vertices.push([x,y,z,region,alpha,size,kind,phase]);
  };
  let i = 0;
  for (let y=-410;y<439;y+=step) for (let x=-585;x<590;x+=step) {
    const sample = ++i;
    const px = x + (seed(sample+3)-.5)*step*.79;
    const py = y + (seed(sample+9)-.5)*step*.80;
    const {z,outline,region} = heightField(px,py);
    if (outline < -.105 || seed(sample+19) > clamp((outline+.105)*5.2)) continue;
    const softness = clamp((outline+.105)*4.5);
    const ridge = .49 + .51*Math.cos(z*.17 + .32*Math.sin(px*.035+py*.018));
    push(px,py,z,region, softness * (.20 + ridge*.34 + seed(sample+71)*.39), .79 + .71*seed(sample+46) + ridge*.28,0,seed(sample+61));
    if (seed(sample+24) < .098) {
      const shade = seed(sample+27);
      push(px + (seed(sample+26)-.5)*17,py + (seed(sample+44)-.5)*15,z - 14 - shade*48,region,softness*(.11+.17*(1-shade)),.59+shade*.51,0,seed(sample+80));
    }
  }
  for (const r of ATLAS_TERRITORIES) {
    const summit = landmarkPositions[r.index];
    for (let j=0;j<5;j++) for (let k=0;k<72;k++) {
      const a = k/72*Math.PI*2, radius=15 + j*4.6;
      const x = summit.x+Math.cos(a)*radius, y = summit.y+Math.sin(a)*radius;
      push(x,y,heightField(x,y).z+7,r.index,.31 + .31*(1-j/5),.95,1,seed(k+j*9));
    }
    for (const skill of r.items) {
      const s = skillPositions.get(skill.id)!;
      for (let k=0;k<85;k++) {
        const j = 401 + k + skill.rank*389 + r.index*2177;
        const a=seed(j)*Math.PI*2, radius=4.8+seed(j+7)**.62*(skill.rank===0?16:12);
        const x=s.x+Math.cos(a)*radius, y=s.y+Math.sin(a)*radius;
        push(x,y,s.z+(seed(j+13)-.5)*13,r.index,.37+seed(j+22)*.55,.93+seed(j+43)*.77,2,seed(j+477));
      }
    }
  }
  // Sorting by a stable hash avoids a visible density boundary when the adaptive draw range shrinks.
  const field = vertices.filter(v=>v[6]===0).sort((a,b)=>a[7]-b[7]);
  const markers = vertices.filter(v=>v[6]!==0);
  return { field: new Float32Array(field.flat()), markers: new Float32Array(markers.flat()) };
}

// Undo perspective along a camera ray, then find its first intersection with the heightfield.
export function pickSurface(point: Point, perspective: number): AtlasPosition | null {
  const at = (depth:number) => lens.rayPoint(point,depth,perspective);
  for(let d=590;d>=-530;d-=12) {
    const p=at(d);
    if(p.z>175||p.z< -16)continue;
    const sample=heightField(p.x,p.y);
    if(sample.outline<-.075||p.z>sample.z)continue;
    let near=d+12,far=d;
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
