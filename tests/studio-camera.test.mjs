import assert from "node:assert/strict";
import test from "node:test";
import { Box3, OrthographicCamera, Vector3 } from "three";
import { desktopStudioFit } from "../src/sections/research-studio/studio-camera.ts";

test("desktop framing reserves room for either popup without clipping the selection", () => {
  const bounds = new Box3(new Vector3(-2, 1, 3), new Vector3(1, 4, 5));
  const eye = new Vector3(7, 6, 12);
  const center = bounds.getCenter(new Vector3());
  for (const width of [810, 1170, 1460]) {
    const height = 480;
    const panel = Math.min(268, width * .265);
    for (const side of ["left", "right", null]) {
      const { span, offset } = desktopStudioFit(bounds, eye, width, height, side, panel);
      const breadth = span * width / height;
      const camera = new OrthographicCamera((-0.5 - offset) * breadth, (.5 - offset) * breadth, span / 2, -span / 2, .01, 100);
      camera.position.copy(center).add(eye);
      camera.lookAt(center);
      camera.updateMatrixWorld();
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new Vector3(x, y, z).project(camera);
        const px = (1 + projected.x) * width / 2;
        assert.ok(Math.abs(projected.y) <= .601);
        assert.ok(px > (side === "left" ? panel + 20 : 20));
        assert.ok(px < width - (side === "right" ? panel + 20 : 20));
      }
    }
  }
});
