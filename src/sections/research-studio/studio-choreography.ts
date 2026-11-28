import type { StudioStationId } from "./studio-plan";

export type Port = "bus" | `${StudioStationId}:${"in" | "out"}`;
export type StudioView =
  | { kind: "overview" }
  | { kind: "station"; id: StudioStationId }
  | { kind: "connection"; id: ScenarioId; run: number };

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
    summary: "A model organizes observations. Its output becomes a lead an agent can investigate against source material.",
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
    summary: "An illustrative model output becomes an input for scenario pricing. The risk instrument examines the loss tail.",
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
    summary: "Software runs an assembly check. Its inspection record travels to an agent that can bring it into a review.",
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
type Run = { id: ScenarioId; index: number; seconds: number; guided: boolean };
const OVERVIEW: StudioView = { kind: "overview" };
const ids = Object.keys(stationCycles) as StudioStationId[];

export function portStation(port: Port) {
  return port === "bus" ? null : port.split(":")[0] as StudioStationId;
}

export function createStudioDirector(ambient = true) {
  const station: Record<StudioStationId, StationClock> = {
    learning: { time: 0, signal: "idle" },
    agentic: { time: 0, signal: "idle" },
    markets: { time: 0, signal: "idle" },
    software: { time: 0, signal: "idle" },
  };
  let view = OVERVIEW;
  let run: Run | null = null;
  let wait = 1.15;
  let next = 0;
  let completed = false;
  let reduced = false;
  const beat: ActiveBeat = { id: "evidence", index: 0, progress: 0, guided: false };

  function leave(id: StudioStationId, nextStation?: StudioStationId | null) {
    if (id === nextStation) return;
    const clock = station[id];
    clock.signal = clock.time <= .001 ? "idle" : "settling";
  }

  function end(nextStation: StudioStationId | null) {
    if (!run) return;
    const cue = studioScenarios[run.id].beats[run.index];
    if (cue.kind === "process") leave(cue.at, nextStation);
    run = null;
  }

  function begin(id: ScenarioId, guided: boolean) {
    run = { id, index: 0, seconds: 0, guided };
    completed = false;
  }

  function setView(nextView: StudioView) {
    if (nextView.kind === "overview" && view.kind === "overview") return;
    const nextStation = nextView.kind === "station" ? nextView.id : null;
    if (view.kind === "station") leave(view.id, nextStation);
    end(nextStation);
    view = nextView;
    completed = false;
    wait = 1.55;
    if (view.kind === "station") station[view.id].signal = "local";
    if (view.kind === "connection" && !reduced) begin(view.id, true);
  }

  function setReduced(nextValue: boolean) {
    if (reduced === nextValue) return;
    reduced = nextValue;
    if (reduced) {
      end(view.kind === "station" ? view.id : null);
      for (const id of ids) {
        station[id].signal = view.kind === "station" && view.id === id ? "local" : "idle";
        station[id].time = 0;
      }
    } else {
      if (view.kind === "connection") begin(view.id, true);
      wait = .85;
    }
  }

  function update(seconds: number) {
    if (reduced || seconds <= 0) return;
    for (const id of ids) {
      const clock = station[id];
      if (clock.signal === "local") clock.time = (clock.time + seconds) % stationCycles[id];
      if (clock.signal === "settling") {
        clock.time += seconds * 1.52;
        if (clock.time >= stationCycles[id]) {
          clock.time = 0;
          clock.signal = "idle";
        }
      }
    }
    if (view.kind === "overview" && !run && ambient) {
      wait -= seconds;
      if (wait <= 0) {
        begin(scenarioIds[next], false);
        next = (next + 1) % scenarioIds.length;
      }
    }
    if (!run) return;
    let remaining = seconds;
    while (run && remaining > 0) {
      const { id, guided, index } = run;
      const current = studioScenarios[id].beats[index];
      if (current.kind === "process" && run.seconds === 0 && station[current.at].signal === "settling") break;
      const consumed = Math.min(remaining, current.duration - run.seconds);
      remaining -= consumed;
      run.seconds += consumed;
      if (current.kind === "process") {
        const clock = station[current.at];
        clock.signal = "shared";
        clock.time = current.until * (run.seconds / current.duration);
      }
      if (run.seconds < current.duration - 1e-8) break;
      if (current.kind === "process") leave(current.at);
      run.index++;
      run.seconds = 0;
      if (run.index === studioScenarios[id].beats.length) {
        run = null;
        completed = guided;
        wait = 3.05;
      }
    }
  }

  return {
    station,
    setView,
    setReduced,
    update,
    get beat(): ActiveBeat | null {
      if (!run) return null;
      const runBeat = studioScenarios[run.id].beats[run.index];
      beat.id = run.id;
      beat.index = run.index;
      beat.guided = run.guided;
      beat.progress = run.seconds / runBeat.duration;
      return beat;
    },
    get completed() { return completed; },
  };
}
