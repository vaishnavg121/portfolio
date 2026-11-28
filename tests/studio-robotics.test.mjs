import assert from "node:assert/strict";
import test from "node:test";
import { armAssembly, armFeeder, armGeometry, robotArmTarget, robotCues, robotGrip, robotPayload, solveRobotArm } from "../src/sections/research-studio/robotics-kinematics.ts";

const { pivot, upper, forearm, tool } = armGeometry;
const sample = (time) => {
  const target = { x: 0, y: 0, z: 0 };
  robotArmTarget(time, target);
  return target;
};

test("the full motion stays within the joint limits and reaches the commanded position", () => {
  const pose = { yaw: 0, shoulder: 0, elbow: 0, wrist: 0 };
  for (let t = 0; t <= robotCues.at(-1); t += .01) {
    const target = sample(t);
    assert.equal(solveRobotArm(target, pose), true, `Unreachable tool position at ${t.toFixed(2)}s`);
    const bend = pose.shoulder + pose.elbow;
    const radial = upper * Math.cos(pose.shoulder) + forearm * Math.cos(bend);
    const x = pivot.x + radial * Math.cos(pose.yaw);
    const z = pivot.z - radial * Math.sin(pose.yaw);
    const y = pivot.y + upper * Math.sin(pose.shoulder) + forearm * Math.sin(bend) - tool;
    assert.ok(Math.hypot(x - target.x, y - target.y, z - target.z) < 1e-8);
    assert.ok(Math.abs(bend + pose.wrist + Math.PI / 2) < 1e-8);
  }
});

test("pickup, placement, and return change ownership while the tool holds the payload at its seat", () => {
  const swaps = [
    [3.98, armFeeder, "feeder", "gripper"],
    [6.83, armAssembly, "gripper", "fixture"],
    [14.22, armAssembly, "fixture", "gripper"],
    [16.9, armFeeder, "gripper", "feeder"],
  ];
  for (const [time, seat, before, after] of swaps) {
    assert.deepEqual(sample(time), seat);
    assert.deepEqual(sample(time - .001), seat);
    assert.equal(robotPayload(time - .001), before);
    assert.equal(robotPayload(time), after);
    assert.equal(robotGrip(time), 1);
  }
});

test("the resting pose repeats cleanly and unreachable targets leave the joint state intact", () => {
  assert.deepEqual(sample(0), sample(robotCues.at(-1)));
  const pose = { yaw: 0, shoulder: 0, elbow: 0, wrist: 0 };
  assert.equal(solveRobotArm({ x: 4, y: 1, z: 4 }, pose), false);
  assert.deepEqual(pose, { yaw: 0, shoulder: 0, elbow: 0, wrist: 0 });
});
