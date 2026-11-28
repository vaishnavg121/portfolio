import type { StudioStationId } from "./studio-plan";

export type Port = "bus" | `${StudioStationId}:${"in" | "out"}`;
export type StudioView =
  | { kind: "overview" }
  | { kind: "station"; id: StudioStationId }
  | { kind: "object"; id: StudioObjectId }
  | { kind: "connection"; id: ScenarioId; run: number };

export type StudioObjectId = "desk" | "television" | "lounge" | "artwork";

type Transfer = { kind: "transfer"; from: Port; to: Port; duration: number; label: string };
type Process = { kind: "process"; at: StudioStationId; until: number; duration: number; label: string };
type Rest = { kind: "rest"; duration: number; label: string };
export type StudioBeat = Transfer | Process | Rest;
type Scenario = {
  title: string;
  pair: readonly [StudioStationId, StudioStationId];
  summary: string;
  beats: readonly StudioBeat[];
};

const transfer = (from: Port, to: Port, duration: number, label: string): Transfer => ({ kind: "transfer", from, to, duration, label });
const process = (at: StudioStationId, until: number, duration: number, label: string): Process => ({ kind: "process", at, until, duration, label });
const rest = (duration: number): Rest => ({ kind: "rest", duration, label: "The instruments settle" });

export const studioScenarios = {
  evidence: {
    title: "Data to intelligence",
    pair: ["learning", "agentic"],
    summary: "I use this route to show how a forecast could give an agent a lead to check against source material.",
    beats: [
      transfer("bus", "learning:in", 1.70, "Observations reach the model"),
      process("learning", 9.44, 6.34, "The model builds a forecast"),
      transfer("learning:out", "agentic:in", 2.75, "A forecast becomes a research lead"),
      process("agentic", 11.02, 7.52, "The agent retrieves and checks evidence"),
      rest(1.06),
    ],
  },
  risk: {
    title: "Intelligence and finance",
    pair: ["learning", "markets"],
    summary: "I’m interested in what happens to risk when a model changes one assumption. Here I use a hypothetical input to reprice a scenario.",
    beats: [
      process("learning", 9.44, 6.35, "The model prepares a scenario input"),
      transfer("learning:out", "markets:in", 2.03, "Scenario input reaches Finance"),
      process("markets", 6.92, 5.23, "The risk instrument reads the loss tail"),
      transfer("markets:out", "bus", 1.91, "The risk result returns to the lab"),
      rest(1.02),
    ],
  },
  feedback: {
    title: "Computation and robotics",
    pair: ["software", "agentic"],
    summary: "I use an imagined assembly check to show how a sensor reading could make its way back into a software review.",
    beats: [
      transfer("bus", "software:in", 1.59, "A test command reaches the controller"),
      process("software", 11.73, 9.76, "The arm fits and inspects the cassette"),
      transfer("software:out", "agentic:in", 2.25, "The inspection record moves to review"),
      process("agentic", 6.04, 4.45, "The agent organizes the inspection evidence"),
      rest(1.13),
    ],
  },
} as const satisfies Record<string, Scenario>;

export type ScenarioId = keyof typeof studioScenarios;
export const scenarioIds = Object.keys(studioScenarios) as ScenarioId[];
export const stationCycles = { learning: 9.85, agentic: 12.6, markets: 14, software: 18.6 } as const;
export type StationSignal = "idle" | "local" | "shared" | "settling";
export type StationClock = { time: number; signal: StationSignal };
export type ActiveBeat = { id: ScenarioId; index: number; progress: number; guided: boolean };
export type StudioActivity = { beat: Omit<ActiveBeat,"progress"> | null; completed: boolean; paused: boolean };
type Run = { id: ScenarioId; index: number; seconds: number; duration: number; guided: boolean };
const OVERVIEW: StudioView = { kind: "overview" };
const ids = Object.keys(stationCycles) as StudioStationId[];
const offsets = { learning: 1.1, agentic: 2.95, markets: 2.1, software: 3.8 } as const;

export function portStation(port: Port) {
  return port === "bus" ? null : port.split(":")[0] as StudioStationId;
}

export function createStudioDirector(ambient = true) {
  const station: Record<StudioStationId, StationClock> = {
    learning: { time: offsets.learning, signal: "local" },
    agentic: { time: offsets.agentic, signal: "local" },
    markets: { time: offsets.markets, signal: "local" },
    software: { time: offsets.software, signal: "local" },
  };
  let view = OVERVIEW;
  let run: Run | null = null;
  let wait = 1.15;
  let next = 0;
  let completed = false;
  let reduced = false;
  const beat: ActiveBeat = { id: "evidence", index: 0, progress: 0, guided: false };

  function end() {
    if (!run) return;
    const cue = studioScenarios[run.id].beats[run.index];
    if (cue.kind === "process") station[cue.at].signal = "local";
    run = null;
  }

  function enter(nextRun: Run) {
    const cue = studioScenarios[nextRun.id].beats[nextRun.index];
    nextRun.duration = cue.duration;
    if (cue.kind !== "process") return;
    const clock = station[cue.at];
    const cycle = stationCycles[cue.at];
    const remaining = (cue.until - clock.time + cycle) % cycle;
    nextRun.duration = remaining < .85 ? remaining + cycle : remaining;
    clock.signal = "shared";
  }

  function begin(id: ScenarioId, guided: boolean) {
    run = { id, index: 0, seconds: 0, duration: 0, guided };
    enter(run);
    completed = false;
  }

  function setView(nextView: StudioView) {
    if (nextView.kind === "overview" && view.kind === "overview") return;
    if (nextView.kind === "connection" || run?.guided) end();
    view = nextView;
    completed = false;
    wait = 1.55;
    if (view.kind === "connection" && !reduced) begin(view.id, true);
  }

  function setReduced(nextValue: boolean) {
    if (reduced === nextValue) return;
    reduced = nextValue;
    if (reduced) {
      end();
    } else {
      if (view.kind === "connection") begin(view.id, true);
      wait = .85;
    }
  }

  function advance(seconds: number) {
    for (const id of ids) {
      const clock = station[id];
      clock.time = (clock.time + seconds) % stationCycles[id];
    }
  }

  function update(seconds: number) {
    if (reduced || seconds <= 0) return;
    let remaining = seconds;
    while (remaining > 1e-8) {
      if (!run) {
        const step = view.kind === "connection" || !ambient ? remaining : Math.min(remaining, wait);
        advance(step);
        remaining -= step;
        if (view.kind === "connection" || !ambient) return;
        wait -= step;
        if (wait <= 1e-8) {
          begin(scenarioIds[next], false);
          next = (next + 1) % scenarioIds.length;
        }
        continue;
      }
      const { id, guided, index } = run;
      const current = studioScenarios[id].beats[index];
      const consumed = Math.min(remaining, run.duration - run.seconds);
      advance(consumed);
      remaining -= consumed;
      run.seconds += consumed;
      if (run.seconds < run.duration - 1e-8) break;
      if (current.kind === "process") station[current.at].signal = "local";
      run.index++;
      run.seconds = 0;
      if (run.index === studioScenarios[id].beats.length) {
        run = null;
        completed = guided;
        wait = 1.8;
      } else enter(run);
    }
  }

  return {
    station,
    setView,
    setReduced,
    update,
    get beat(): ActiveBeat | null {
      if (!run) return null;
      beat.id = run.id;
      beat.index = run.index;
      beat.guided = run.guided;
      beat.progress = run.seconds / run.duration;
      return beat;
    },
    get completed() { return completed; },
  };
}
