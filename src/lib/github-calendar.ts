export interface GithubContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubCalendarData {
  grid: GithubContribution[][];
  totalContributions: number;
  mostActiveDay?: GithubContribution;
  activeWeeks: number;
  currentYear: number;
}

export const calendarDate = (date: string) => new Date(date + "T00:00:00Z");
const keySteps: Partial<Record<string, number>> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };

export function calendarKeyIndex(index: number, count: number, key: string) {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const move = keySteps[key];
  return move === undefined ? null : Math.max(0, Math.min(count - 1, index + move));
}

const baseHeight = .115;
const heightRange = 2.62;

export function contributionColumns(weeks: GithubContribution[][]) {
  const maximum = weeks.reduce((peak, week) => week.reduce((value, day) => Math.max(value, day.count), peak), 1);
  return weeks.flatMap((week, x) => week.map(day => {
    const intensity = Math.sqrt(day.count / maximum);
    return { day, x, z: calendarDate(day.date).getUTCDay(), intensity, height: baseHeight + intensity * heightRange };
  }));
}

export type ContributionColumn = ReturnType<typeof contributionColumns>[number];

// A rolled orthographic camera keeps the chronological axis horizontal.
const eyeLength = Math.hypot(.30, .69, .66);
const upLength = Math.hypot(.69, .66);
const eye = { x: -.30 / eyeLength, y: .69 / eyeLength, z: .66 / eyeLength };
const up = { x: 0, y: .66 / upLength, z: -.69 / upLength };
const right = { x: up.y * eye.z - up.z * eye.y, y: up.z * eye.x, z: -up.y * eye.x };
export const contributionView = { eye, up, right, left: 1.0, floor: 5.43, tail: 3.48 };

export function contributionAnchor(column: ContributionColumn) {
  const y = column.height * .68;
  return {
    x: contributionView.left + column.x + (right.y * y + right.z * column.z) / right.x,
    y: -contributionView.floor - (up.y * y + up.z * column.z) / right.x,
  };
}

const attribute = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

export function parsePublicCalendar(html: string): GithubCalendarData | null {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const forId = attribute(match[1], "for");
    if (!forId?.startsWith("contribution-day-component-")) continue;
    const count = /^\s*(No|[\d,]+)\s+contributions?\b/i.exec(match[2])?.[1];
    if (count) counts.set(forId, count.toLowerCase() === "no" ? 0 : Number(count.replaceAll(",", "")));
  }

  const days = new Map<string, GithubContribution>();
  for (const match of html.matchAll(/<td\b[^>]*\sdata-date="\d{4}-\d{2}-\d{2}"[^>]*>/g)) {
    const date = attribute(match[0], "data-date")!;
    const id = attribute(match[0], "id");
    const level = Number(attribute(match[0], "data-level"));
    const count = id ? counts.get(id) : undefined;
    if (!id?.startsWith("contribution-day-component-")) continue;
    if (count === undefined || !Number.isSafeInteger(count) || !Number.isInteger(level) || level < 0 || level > 4) return null;
    days.set(date, { date, count, level: level as GithubContribution["level"] });
  }
  const dated = Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (!dated.length) return null;

  const weeks: GithubContribution[][] = [];
  let mostActiveDay = dated[0];
  let totalContributions = 0;
  for (const day of dated) {
    if (weeks.length === 0 || calendarDate(day.date).getUTCDay() === 0) weeks.push([]);
    weeks.at(-1)!.push(day);
    totalContributions += day.count;
    if (day.count > mostActiveDay.count) mostActiveDay = day;
  }
  return {
    grid: weeks, totalContributions, mostActiveDay,
    activeWeeks: weeks.filter(week => week.some(day => day.count > 0)).length,
    currentYear: calendarDate(dated.at(-1)!.date).getUTCFullYear(),
  };
}
