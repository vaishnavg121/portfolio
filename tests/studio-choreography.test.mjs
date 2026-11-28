import assert from "node:assert/strict";
import test from "node:test";
import { createStudioDirector, portStation, scenarioIds, stationCycles, studioScenarios } from "../src/sections/research-studio/studio-choreography.ts";

test("guided scenarios reach each destination before its machine processes the packet", () => {
  for (const id of scenarioIds) {
    const director = createStudioDirector();
    const expected = studioScenarios[id].beats;
    director.setView({kind:"connection",id,run:1});
    for (const [index, step] of expected.entries()) {
      assert.equal(director.beat.index, index);
      director.update(step.duration * .49);
      assert.equal(director.beat.index, index);
      if (step.kind === "transfer") {
        const destination = portStation(step.to);
        if (destination) assert.notEqual(director.station[destination].signal, "shared");
      } else if (step.kind === "process") {
        assert.equal(director.station[step.at].signal, "shared");
        assert.ok(Math.abs(director.station[step.at].time - step.until * .49) < 1e-8);
      }
      director.update(step.duration * .51);
    }
    assert.equal(director.completed, true);
    assert.equal(director.beat, null);
    director.update(40);
    assert.equal(director.beat, null);
    assert.ok(Object.values(director.station).every(clock => clock.signal === "idle"));
  }
});

test("switching stations lets a moving arm finish safely and keeps the new inspection independent", () => {
  const director = createStudioDirector();
  director.setView({kind:"connection",id:"feedback",run:1});
  director.update(studioScenarios.feedback.beats[0].duration + 4);
  const armTime = director.station.software.time;
  assert.ok(armTime > 3 && armTime < 7);
  director.setView({kind:"station",id:"learning"});
  assert.equal(director.beat, null);
  assert.equal(director.station.software.time, armTime);
  assert.equal(director.station.software.signal, "settling");
  director.update(.25);
  assert.ok(director.station.software.time > armTime);
  assert.equal(director.station.learning.time,.25);
  director.update(stationCycles.software);
  assert.deepEqual(director.station.software,{time:0,signal:"idle"});
});

test("selecting the machine already in motion preserves the current pose and its native clock", () => {
  const director = createStudioDirector(false);
  director.setView({kind:"connection",id:"feedback",run:1});
  director.update(studioScenarios.feedback.beats[0].duration + 5);
  const position = director.station.software.time;
  director.setView({kind:"station",id:"software"});
  assert.equal(director.station.software.time,position);
  director.update(.1);
  assert.ok(Math.abs(director.station.software.time - position - .1) < 1e-8);
  assert.equal(director.station.software.signal,"local");
});

test("cancel, reduced motion, replay, and overview have no latent sequence", () => {
  const director = createStudioDirector(false);
  director.setView({kind:"connection",id:"risk",run:1});
  director.update(3);
  director.setReduced(true);
  director.update(60);
  assert.equal(director.beat,null);
  assert.ok(Object.values(director.station).every(clock => clock.time === 0));
  director.setReduced(false);
  assert.equal(director.beat.id,"risk");
  assert.equal(director.beat.index,0);
  director.setView({kind:"connection",id:"evidence",run:2});
  assert.equal(director.beat.id,"evidence");
  director.setView({kind:"overview"});
  director.update(100);
  assert.equal(director.beat,null);
  assert.equal(director.completed,false);
});

test("ambient runs use the same plans with a calm interval between scenarios", () => {
  const director = createStudioDirector();
  director.update(.3);
  assert.equal(director.beat,null);
  director.update(.851);
  assert.equal(director.beat.id,"evidence");
  assert.equal(director.beat.guided,false);
  director.update(studioScenarios.evidence.beats.reduce((sum,step)=>sum+step.duration,0));
  assert.equal(director.beat,null);
  director.update(2);
  assert.equal(director.beat,null);
  director.update(1.1);
  assert.equal(director.beat.id,"risk");
});
