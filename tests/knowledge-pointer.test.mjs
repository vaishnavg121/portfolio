import assert from "node:assert/strict";
import { test } from "node:test";
import { anchorRipple, createSurfacePointer } from "../src/sections/knowledge/atlas-motion.ts";

test("pointer influence tracks smoothly and releases to a stationary field", () => {
  const field = createSurfacePointer();
  field.track(0, 0, 2, 110, 0);
  field.advance(16, 16);
  const previousPressure = field.values[2];
  assert.ok(previousPressure > 0 && previousPressure < 1);
  field.track(40, 0, 0.8, 110, 16);
  field.advance(32, 16);
  assert.ok(field.values[0] > 0 && field.values[0] < 40);
  field.release();
  field.advance(48, 16);
  assert.ok(field.values[2] > 0);
  for (let time = 64; time < 600; time += 16) field.advance(time, 16);
  assert.equal(field.values[2], 0);
  assert.equal(field.advance(600, 16), false);
});

test("pointer deformation is bounded and supports reduced motion", () => {
  const frame = { motion: true, pointerField: Float32Array.of(0, 0, 1, 110), impulses: new Float32Array(16) };
  const center = { x: 0, y: 0, z: 66 };
  const distant = { x: 110, y: 0, z: 66 };
  assert.ok(Math.abs(anchorRipple(center, frame).z - center.z + 3.8) < 1e-6);
  assert.deepEqual(anchorRipple(distant, frame), distant);
  assert.deepEqual(anchorRipple(center, { ...frame, motion: false }), center);
});
