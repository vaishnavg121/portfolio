import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraAt, constrainPan, fitCamera, moveCamera, resizeCamera, sampleGesture } from "../src/lib/knowledge-camera.ts";

const bounds = { left: -650, right: 700, top: -680, bottom: 135 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, String(actual));

test("overview fits the graph in both orientations", () => {
  for (const frame of [{ width: 280, height: 540, scale: 0.3375 }, { width: 718, height: 263, scale: 0.3 }]) {
    const camera = fitCamera(bounds, frame);
    for (const x of [bounds.left, bounds.right]) assert.ok(Math.abs(x * camera.z + camera.x) * frame.scale < frame.width / 2);
    for (const y of [bounds.top, bounds.bottom]) assert.ok(Math.abs(y * camera.z + camera.y) * frame.scale < frame.height / 2);
  }
});

test("one contact follows the full movement delta without zooming", () => {
  const camera = { x: 40, y: -25, z: 1.5 };
  const start = sampleGesture([{ x: 70, y: 30 }]);
  const next = sampleGesture([{ x: 20, y: 42 }]);
  assert.deepEqual(moveCamera(camera, start, next, 0.5, 3), { x: -10, y: -13, z: 1.5 });
});

test("a moving pinch anchors the same world point even at a zoom limit", () => {
  const camera = { x: -25, y: 40, z: 1 };
  const start = sampleGesture([{ x: 10, y: 20 }, { x: 50, y: 20 }]);
  const next = sampleGesture([{ x: -30, y: 70 }, { x: 90, y: 70 }]);
  const result = moveCamera(camera, start, next, 0.35, 2);
  assert.equal(result.z, 2);
  near((start.center.x - camera.x) / camera.z, (next.center.x - result.x) / result.z);
  near((start.center.y - camera.y) / camera.z, (next.center.y - result.y) / result.z);
});

test("pinch sampling is independent of contact order and rebases to a single contact", () => {
  const first = { x: 24, y: 45 };
  const second = { x: 68, y: 18 };
  assert.deepEqual(sampleGesture([first, second]), sampleGesture([second, first]));
  assert.deepEqual(sampleGesture([second]), { center: second, span: 0 });
  assert.equal(sampleGesture([]), null);
});

test("rotation keeps the world center and on-screen magnification", () => {
  const original = cameraAt({ x: -32, y: 100 }, 2);
  const result = resizeCamera(original, 0.3, 0.45, 0.25, 4);
  near(-result.x / result.z, -original.x / original.z);
  near(-result.y / result.z, -original.y / original.z);
  near(result.z * 0.45, original.z * 0.3);
});

test("panning at the limit keeps a map edge in the usable frame", () => {
  const frame = { width: 320, height: 240, scale: 0.3 };
  const result = constrainPan({ x: 4000, y: -4000, z: 2 }, bounds, frame);
  assert.ok(Math.abs((bounds.left * result.z + result.x) * frame.scale) < frame.width / 2);
  assert.ok(Math.abs((bounds.bottom * result.z + result.y) * frame.scale) < frame.height / 2);
});
