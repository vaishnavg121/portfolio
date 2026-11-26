import { atlasPeaks, clamp, heightField, landmarkPositions, skillPose, skillPositions, territoryIndex, type SceneFrame } from "./atlas-geometry";
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

export function connectionsFor(selection: Selection | null): Connection[] {
  if (!selection) return [];
  const region = territoryIndex(selection);
  const domain = ATLAS_TERRITORIES[region];
  if (selection.type === "territory") {
    const spokes = domain.items.map((skill, index) => ({
      a: { region }, b: skillAnchor(skill), weight: .39, energy: index < 2 ? .44 : .18, bridge: false,
    }));
    return [...spokes, ...allBridges.filter(({ a, b }) => a.region === region || b.region === region).slice(0, 2)
      .map(link => ({
        ...link, a: link.a.region === region ? link.a : link.b, b: link.a.region === region ? link.b : link.a,
        weight: .24, energy: .31,
      }))];
  }
  const focus = skillAnchor(SKILLS_BY_ID.get(selection.id)!);
  const relationships = ATLAS_LINKS.flatMap(({ a, b, bridge }) => {
    const other = a.id === selection.id ? b : b.id === selection.id ? a : undefined;
    if (!other) return [];
    const destination = skillAnchor(other);
    if (bridge) destination.fixed = skillPositions.get(other.id);
    return [{ a: focus, b: destination, weight: bridge ? .36 : .64, energy: bridge ? .37 : .68, bridge }];
  });
  return [
    { a: focus, b: { region }, weight: .30, energy: .25, bridge: false },
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
  return anchor.fixed ?? (anchor.skill ? skillPose(anchor.skill, frame.expansion[anchor.region]) : landmarkPositions[anchor.region]);
}

export function routePoint(a: AtlasPosition, b: AtlasPosition, t: number, bridge: boolean): AtlasPosition {
  const dx = b.x - a.x, dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const arch = clamp(distance * (bridge ? .064 : .105), 0, bridge ? 30 : 20);
  const side = (bridge ? .075 : .15) * (b.y >= a.y ? 1 : -1);
  const first = 3 * (1 - t) ** 2 * t, second = 3 * (1 - t) * t * t;
  const bend = side * (first - .24 * second);
  return {
    x: a.x + dx * t - dy * bend,
    y: a.y + dy * t + dx * bend,
    z: a.z + (b.z - a.z) * t + arch * (first * 1.2 + second),
  };
}
