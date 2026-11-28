import assert from "node:assert/strict";
import test from "node:test";
import { createStudioDirector, portStation, scenarioIds, stationCycles, studioScenarios } from "../src/sections/research-studio/studio-choreography.ts";

const phaseDelta = (before, after, cycle) => (after - before + cycle) % cycle;

function advance(director, seconds = .025) {
  const before = Object.fromEntries(Object.entries(director.station).map(([id, clock]) => [id, clock.time]));
  director.update(seconds);
  for (const [id, clock] of Object.entries(director.station)) {
    assert.ok(Math.abs(phaseDelta(before[id], clock.time, stationCycles[id]) - seconds) < 1e-8, id);
  }
}

test("guided packets preserve beat order and depart at the source machine's output phase", () => {
  for (const id of scenarioIds) {
    const director = createStudioDirector(false);
    const expected = studioScenarios[id].beats;
    director.setView({ kind: "connection", id, run: 1 });
    const observed = [];
    for (let tick = 0; tick < 2800 && director.beat; tick++) {
      const index = director.beat.index;
      const step = expected[index];
      if (observed.at(-1) !== index) {
        observed.push(index);
        const previous = expected[index - 1];
        if (previous?.kind === "process") {
          assert.ok(phaseDelta(previous.until, director.station[previous.at].time, stationCycles[previous.at]) < .026);
        }
      }
      if (step.kind === "process") assert.equal(director.station[step.at].signal, "shared");
      if (step.kind === "transfer") {
        const destination = portStation(step.to);
        if (destination) assert.equal(director.station[destination].signal, "local");
      }
      advance(director);
    }
    assert.deepEqual(observed, expected.map((_, index) => index));
    assert.equal(director.completed, true);
    assert.equal(director.beat, null);
    advance(director);
  }
});

test("four offset clocks continue through workstation inspection, object inspection and cancellation", () => {
  const director = createStudioDirector(false);
  assert.equal(new Set(Object.values(director.station).map(clock => clock.time)).size, 4);
  director.setView({ kind: "connection", id: "feedback", run: 1 });
  director.update(4);
  assert.equal(director.station.software.signal, "shared");
  const arm = director.station.software.time;
  director.setView({ kind: "station", id: "learning" });
  assert.equal(director.beat, null);
  assert.equal(director.station.software.time, arm);
  assert.equal(director.station.software.signal, "local");
  advance(director);
  director.setView({ kind: "object", id: "desk" });
  advance(director);
  director.setView({ kind: "station", id: "software" });
  advance(director);
});

test("reduced motion suspends all clocks and replay starts a clean guided route", () => {
  const director = createStudioDirector(false);
  director.setView({ kind: "connection", id: "risk", run: 1 });
  director.update(3);
  director.setReduced(true);
  const states = structuredClone(director.station);
  director.update(60);
  assert.equal(director.beat, null);
  assert.deepEqual(director.station, states);
  director.setReduced(false);
  assert.equal(director.beat.id, "risk");
  assert.equal(director.beat.index, 0);
  director.setView({ kind: "connection", id: "evidence", run: 2 });
  assert.equal(director.beat.id, "evidence");
  director.setView({ kind: "overview" });
  advance(director);
  assert.equal(director.beat, null);
  assert.equal(director.completed, false);
});

test("ambient handoffs stay active while a station is inspected", () => {
  const director = createStudioDirector();
  director.update(1.16);
  assert.equal(director.beat.id, "evidence");
  assert.equal(director.beat.guided, false);
  director.setView({ kind: "station", id: "markets" });
  assert.equal(director.beat.id, "evidence");
  for (let tick = 0; tick < 1800 && director.beat; tick++) advance(director);
  assert.equal(director.beat, null);
  director.update(1.82);
  assert.equal(director.beat.id, "risk");
});
