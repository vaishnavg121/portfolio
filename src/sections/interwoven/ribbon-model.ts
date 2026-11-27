export const ribbons = [
  { id: "ai", name: "AI / ML", color: "--text-primary", heights: [.67,.2,.46,.68,.22,.57,.26], depth: .69 },
  { id: "agents", name: "Agentic AI", color: "--accent-mauve", heights: [.15,.42,.68,.48,.33,.61,.73], depth: .42 },
  { id: "systems", name: "Software & systems", color: "--accent-petal", heights: [.42,.68,.46,.48,.62,.36,.49], depth: .55 },
  { id: "finance", name: "Finance", color: "--accent-stone", heights: [.61,.51,.75,.6,.62,.76,.59], depth: .31 },
  { id: "robotics", name: "Robotics", color: "--accent-source", heights: [.85,.78,.61,.79,.69,.36,.18], depth: .61 },
] as const;

export type RibbonId = typeof ribbons[number]["id"];
type Link = { label: string; href: string };
type Story = { name: string; text: string; links: readonly Link[] };

const imd = { label: "Vertical Visibility", href: "/work/imdpune" };
const windy = { label: "Windy", href: "/work/windy" };
const neeti = { label: "Swa.Neeti", href: "/work/swaneeti" };
const spenza = { label: "Spenza", href: "/work/spenza" };
const thrive = { label: "ThriveForce", href: "#robotics" };

export const ribbonStories: Record<RibbonId, Story> = {
  ai: { name: "AI and machine learning", text: "Forecasting visibility and finding patterns in aviation weather observations.", links: [imd, windy] },
  agents: { name: "Agentic intelligence", text: "Retrieval and evidence checks for aviation analytics and legal research.", links: [windy, neeti] },
  systems: { name: "Software and systems engineering", text: "The pipelines, validation, and accounting that support usable applications.", links: [imd, windy, neeti, spenza] },
  finance: { name: "Finance", text: "Applying accounting invariants to real expense-sharing software.", links: [spenza] },
  robotics: { name: "Robotics and physical engineering", text: "Connecting mechanical design to CAD and engineering analysis.", links: [thrive] },
};

export const knots = [
  { id: "aviation", name: "Aviation analytics", streams: ["ai","systems"], t: 2/6, y: .46, text: "Machine learning meets sensor pipelines in aviation visibility and weather analysis.", links: [imd, windy] },
  { id: "retrieval", name: "Evidence retrieval", streams: ["agents","systems"], t: 3/6, y: .48, text: "Swa.Neeti connects retrieval with deterministic evidence validation for Indian legal research.", links: [neeti] },
  { id: "accounting", name: "Financial software", streams: ["finance","systems"], t: 4/6, y: .62, text: "Spenza brings double-entry accounting and reliable transaction logic to expense sharing.", links: [spenza] },
  { id: "mechanical", name: "Engineering analysis", streams: ["robotics","systems"], t: 5/6, y: .36, text: "ThriveForce applies CAD and computational analysis to mechanical design.", links: [thrive] },
] as const satisfies readonly (Story & { id: string; streams: readonly RibbonId[]; t:number; y:number })[];

export const GLYPH_MARGIN = .045;
export function ribbonPosition(t: number) { return GLYPH_MARGIN + (1 - 2 * GLYPH_MARGIN) * t; }

export function ribbonHeight(values: readonly number[], t: number) {
  const sample = Math.max(0, Math.min(values.length - 1, t * (values.length - 1)));
  const index = Math.min(values.length - 2, Math.floor(sample));
  const b = values[index], c = values[index + 1];
  const a = values[Math.max(0, index - 1)], d = values[Math.min(values.length - 1, index + 2)];
  const f = sample - index;
  return .5 * ((2 * b) + (c - a) * f + (2 * a - 5 * b + 4 * c - d) * f * f
    + (3 * b - a - 3 * c + d) * f * f * f);
}

export function matchRibbon(x: number, y: number, tolerance: number) {
  const t = (x - GLYPH_MARGIN) / (1 - 2 * GLYPH_MARGIN);
  if (t < 0 || t > 1) return null;
  let match: RibbonId | null = null;
  let radius = tolerance;
  for (const stream of ribbons) {
    const distance = Math.abs(y - ribbonHeight(stream.heights, t));
    if (distance >= radius) continue;
    match = stream.id;
    radius = distance;
  }
  return match;
}
