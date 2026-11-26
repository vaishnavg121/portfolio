import { atlasPeaks, clamp, heightField, landmarkPositions, mix, skillPose, skillPositions, territoryIndex, type SceneFrame } from "./atlas-geometry";
import { ATLAS_BRIDGES, ATLAS_LINKS, ATLAS_TERRITORIES, SKILLS, SKILLS_BY_ID, TERRITORIES_BY_ID, skillReferences, type AtlasPosition, type AtlasSkill, type Selection } from "./atlas-model";

type Anchor = { region: number; skill?: AtlasSkill; fixed?: AtlasPosition };
type Connection = { a: Anchor; b: Anchor; weight: number; energy: number; bridge: boolean };
const skillAnchor = (skill: AtlasSkill): Anchor => ({ region: TERRITORIES_BY_ID.get(skill.territoryId)!.index, skill });

const projectSkills = new Map<string, { label: string; skills: AtlasSkill[] }>();
const linksBySkill = new Map<string, string[]>();
for (const skill of SKILLS) {
  for (const { label, href } of skillReferences(skill)) {
    if (!href || !href.startsWith("/work/") && href !== "#robotics") continue;
    const record = projectSkills.get(href) ?? { label, skills: [] };
    record.skills.push(skill);
    projectSkills.set(href, record);
    const links = linksBySkill.get(skill.id) ?? [];
    links.push(href);
    linksBySkill.set(skill.id, links);
  }
}
export const PROJECT_ANCHORS = Array.from(projectSkills, ([href, { label, skills }], index) => {
  const poses = skills.map(skill => skillPositions.get(skill.id)!);
  const center = poses.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  const angle = .67 + index * 2.39996;
  const x = center.x / poses.length + Math.cos(angle) * 73;
  const y = center.y / poses.length + Math.sin(angle) * 73;
  return { href, label, position: { x, y, z: heightField(x, y).z + 44 } };
});
const projectsByHref = new Map(PROJECT_ANCHORS.map(project => [project.href, project]));

const projectsBySkill = new Map(Array.from(linksBySkill, ([id, links]) => {
  const focus = skillPositions.get(id)!;
  const distance = (p: AtlasPosition) => Math.hypot(p.x - focus.x, p.y - focus.y);
  const nearest = links.map(href => projectsByHref.get(href)!)
    .sort((a, b) => distance(a.position) - distance(b.position)).slice(0, 2);
  return [id, nearest];
}));

export function visibleProjects(selection: Selection | null) {
  return selection?.type === "skill" ? projectsBySkill.get(selection.id) ?? [] : [];
}

const allBridges = ATLAS_BRIDGES.map(({ from, to, count }) => {
  const length = Math.hypot(atlasPeaks[from].x - atlasPeaks[to].x, atlasPeaks[from].y - atlasPeaks[to].y);
  return { a: { region: from }, b: { region: to }, length, score: length / (1 + count * .28), bridge: true };
}).sort((a, b) => a.score - b.score);

// Show nearby bridges first. Longer links come forward when exploring their regions.
const regions = ATLAS_TERRITORIES.map(({ index }) => index);
const overviewBridges = allBridges.filter(({ a, b, length }) => {
  const left = regions[a.region], right = regions[b.region];
  if (left === right || length > 550) return false;
  regions.forEach((group, index) => { if (group === right) regions[index] = left; });
  return true;
});

export function connectionsFor(selection: Selection | null, hover: number): Connection[] {
  if (!selection) {
    const related = allBridges.filter(({ a, b }) => hover === a.region || hover === b.region).slice(0, 4);
    return [...new Set([...overviewBridges, ...related])].map((link, index) => ({
      ...link, weight: related.includes(link) ? .68 : .31, energy: related.includes(link) ? .76 : index < 3 ? .32 : 0,
    }));
  }
  const region = territoryIndex(selection);
  const domain = ATLAS_TERRITORIES[region];
  if (selection.type === "territory") {
    const spokes = domain.items.map(skill => ({ a: { region }, b: skillAnchor(skill), weight: .36, energy: 0, bridge: false }));
    return [...spokes, ...allBridges.filter(({ a, b }) => a.region === region || b.region === region).slice(0, 2)
      .map(link => ({ ...link, weight: .25, energy: .28 }))];
  }
  const focus = skillAnchor(SKILLS_BY_ID.get(selection.id)!);
  const relationships = ATLAS_LINKS.flatMap(({ a, b, bridge }) => {
    const other = a.id === selection.id ? b : b.id === selection.id ? a : undefined;
    return other ? [{ a: focus, b: skillAnchor(other), weight: bridge ? .36 : .61, energy: bridge ? .37 : .71, bridge }] : [];
  });
  return [
    { a: { region }, b: focus, weight: .30, energy: .25, bridge: false },
    ...relationships.filter(link => !link.bridge).slice(0, 6),
    ...relationships.filter(link => link.bridge).slice(0, 5),
    ...visibleProjects(selection).map(project => ({
      a: focus, b: { region, fixed: project.position }, weight: .57, energy: .58, bridge: false,
    })),
  ];
}

export function connectedSkillPose(skill: AtlasSkill, frame: SceneFrame): AtlasPosition {
  const region = TERRITORIES_BY_ID.get(skill.territoryId)!.index;
  if (frame.selection?.type === "skill" && region !== territoryIndex(frame.selection)) {
    return skillPositions.get(skill.id)!;
  }
  return skillPose(skill, frame.expansion[region]);
}

export function connectionEndpoint(anchor: Anchor, frame: SceneFrame) {
  return anchor.fixed ?? (anchor.skill ? connectedSkillPose(anchor.skill, frame) : landmarkPositions[anchor.region]);
}

export function routePoint(a: AtlasPosition, b: AtlasPosition, t: number, bridge: boolean): AtlasPosition {
  const dx = b.x - a.x, dy = b.y - a.y;
  const arch = clamp(Math.hypot(dx, dy) * (bridge ? .088 : .14), 6, bridge ? 44 : 23);
  const bend = Math.sin(Math.PI * t) * (bridge ? .042 : .10);
  return {
    x: mix(a.x, b.x, t) - dy * bend,
    y: mix(a.y, b.y, t) + dx * bend,
    z: mix(a.z, b.z, t) + arch * 4 * t * (1 - t),
  };
}
