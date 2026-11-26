import { CONNECTIONS, NODES } from "@/lib/skills_data";
import { SKILL_DETAILS, type SkillDetail } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

export type AtlasPosition = { x: number; y: number; z: number };

type Territory = {
  id: string;
  title: string;
  label: string;
  compactLabel?: string;
  color: string;
  x: number;
  y: number;
  description: string;
  skills: readonly string[];
};

export const TERRITORIES: readonly Territory[] = [
  {
    id: "cs", title: "Computer Science Fundamentals", label: "CS Fundamentals", compactLabel: "CS", color: "#baa18f",
    x: -348, y: -101,
    description: "Algorithms and data structures, programming languages, and the layers between operating systems and hardware.",
    skills: ["c__", "dsa", "c", "java", "oop", "operating_systems", "discrete_structures", "logic_in_cs", "microprocessors", "assembly", "digital_design"],
  },
  {
    id: "ai", title: "Artificial Intelligence & Machine Learning", label: "AI / ML", color: "#c1b599",
    x: -87, y: -231,
    description: "Python, feature engineering and time-series modeling, including aviation-weather forecasting and sensor analysis.",
    skills: ["machine_learning", "python", "feature_engineering", "time_series"],
  },
  {
    id: "data", title: "Databases & Data Engineering", label: "Data Engineering", compactLabel: "Data Eng.", color: "#a0b5aa",
    x: 214, y: -190,
    description: "Relational, analytical and vector data systems, alongside the tools used to work with structured data.",
    skills: ["postgresql", "database_systems", "duckdb", "sqlite", "vector_dbs", "data_analysis", "numpy", "pandas"],
  },
  {
    id: "agents", title: "LLMs, RAG & Agentic Systems", label: "Agentic AI", color: "#c59c96",
    x: 329, y: 27,
    description: "Language models, semantic retrieval and the stages that ground answers in retrieved evidence.",
    skills: ["rag", "agentic_systems", "embeddings", "semantic_search", "vector_retrieval", "llms"],
  },
  {
    id: "web", title: "Software & Systems Engineering", label: "Software Systems", compactLabel: "Software", color: "#aaa3b6",
    x: -44, y: 2,
    description: "The interfaces, services and typed application layers used across the portfolio’s software projects.",
    skills: ["fastapi", "next_js", "react", "typescript", "express", "prisma"],
  },
  {
    id: "finance", title: "Quantitative Finance", label: "Quant Finance", color: "#c2ad8a",
    x: -311, y: 198,
    description: "Finance-minor coursework in markets, derivatives and risk, with practical market-system experimentation.",
    skills: ["quant_finance", "derivatives", "risk_management", "financial_markets", "fundamentals"],
  },
  {
    id: "infra", title: "Tooling & Developer Infrastructure", label: "Infrastructure", compactLabel: "Infra", color: "#9caaa6",
    x: -7, y: 241,
    description: "Version control, automation, Linux and containers.",
    skills: ["linux", "git", "github_actions", "docker"],
  },
  {
    id: "robotics", title: "Robotics & Mechanical Engineering", label: "Robotics", color: "#c49e87",
    x: 294, y: 235,
    description: "The controls, CAD, simulation and fabrication work associated with Team ThriveForce.",
    skills: ["robotic_systems", "ros_2", "gazebo", "px4", "qgroundcontrol", "fusion_360", "fea"],
  },
];

const nodesById = new Map(NODES.map(node => [node.id, node]));
export const ATLAS_TERRITORIES = TERRITORIES.map((territory, index) => ({
  ...territory,
  index,
  items: territory.skills.map((id,rank)=>({ ...nodesById.get(id)!,territoryId:territory.id,rank })),
}));

export type AtlasTerritory = typeof ATLAS_TERRITORIES[number];
export type AtlasSkill = AtlasTerritory["items"][number];
export type Selection = { type: "territory" | "skill"; id: string };
export const SKILLS = ATLAS_TERRITORIES.flatMap(territory => territory.items);
export const SKILLS_BY_ID = new Map(SKILLS.map(skill => [skill.id, skill]));
export const TERRITORIES_BY_ID = new Map(ATLAS_TERRITORIES.map(territory => [territory.id, territory]));

const projectNames = new Map<string, { label: string; href?: string }>(
  projects.flatMap(project => [[project.slug, { label: project.title, href: "/work/" + project.slug }]]),
);
projectNames.set("thriveforce", { label: "Team ThriveForce", href: "#robotics" });

const projectAliases: Record<string, string> = {
  "IMD forecasting": "imdpune", "IMD Pune": "imdpune", "India Meteorological Department": "imdpune", "Team ThriveForce": "thriveforce",
};
const tagAliases: Record<string, string> = { time_series: "Time-Series", embeddings: "NVIDIA Embeddings" };

export function skillReferences(skill: AtlasSkill): SkillDetail["usedIn"] {
  const result = new Map<string, SkillDetail["usedIn"][number]>();
  for (const reference of SKILL_DETAILS[skill.id]?.usedIn ?? []) {
    const project = projectNames.get(projectAliases[reference.label]);
    const entry = project ? { ...reference, href: project.href } : reference;
    result.set(entry.href ?? entry.label, entry);
  }
  for (const project of projects) {
    const tag = tagAliases[skill.id] ?? skill.label;
    if (project.tags.some(value => value.toLowerCase() === tag.toLowerCase())) {
      const href = "/work/" + project.slug;
      if (!result.has(href)) result.set(href, { label: project.title, href });
    }
  }
  return Array.from(result.values());
}

const bridgePairs = new Set<string>();
export const ATLAS_LINKS = CONNECTIONS.map(([from, to]) => {
  const a = SKILLS_BY_ID.get(from)!;
  const b = SKILLS_BY_ID.get(to)!;
  const bridge = a.territoryId !== b.territoryId;
  const pair = [a.territoryId, b.territoryId].sort().join("/");
  const overview = bridge && !bridgePairs.has(pair);
  if (overview) bridgePairs.add(pair);
  return { a, b, bridge, overview };
});

export function relatedSkills(skillId: string) {
  return ATLAS_LINKS.flatMap(({ a, b, bridge }) => {
    if (a.id === skillId) return [{ skill: b, bridge }];
    if (b.id === skillId) return [{ skill: a, bridge }];
    return [];
  });
}

export function atlasSearch(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const matches = (value: string) => terms.every(term => value.toLowerCase().includes(term));
  return [
    ...SKILLS.map(skill => ({
      id: skill.id, type: "skill" as const, label: skill.label,
      context: TERRITORIES_BY_ID.get(skill.territoryId)!.label,
      text: [skill.label, skill.id.replaceAll("_", " "), SKILL_DETAILS[skill.id]?.title, tagAliases[skill.id]].filter(Boolean).join(" "),
    })),
    ...ATLAS_TERRITORIES.map(territory => ({
      id: territory.id, type: "territory" as const, label: territory.title, context: "Region",
      text: territory.title + " " + territory.label,
    })),
  ].filter(entry => matches(entry.text)).sort((a, b) => {
    const exact = (label: string) => label.toLowerCase().startsWith(query.trim().toLowerCase()) ? 0 : 1;
    return exact(a.label) - exact(b.label);
  });
}
