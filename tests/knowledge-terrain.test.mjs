import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";

const sourceRoot = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/") || (specifier.startsWith(".") && context.parentURL?.startsWith(sourceRoot.href))) {
      const file = specifier.startsWith("@/")
        ? new URL(specifier.slice(2), sourceRoot)
        : new URL(specifier, context.parentURL);
      const typed = new URL(file.href + ".ts");
      if (existsSync(typed)) return next(typed.href, context);
    }
    return next(specifier, context);
  },
});

const { ATLAS_TERRITORIES } = await import("../src/sections/knowledge/atlas-model.ts");
const { heightField, landmarkPositions, skillPose, terrainHeight, terrainSample, TERRAIN_STRIDE } = await import("../src/sections/knowledge/atlas-geometry.ts");
const { connectionEndpoint, connectionsFor } = await import("../src/sections/knowledge/atlas-connections.ts");
const { createTerrainTiles } = await import("../src/sections/knowledge/atlas-terrain.ts");

test("each domain and skill uses the same permanent landform in overview and selection", () => {
  for (const domain of ATLAS_TERRITORIES) {
    const domainAnchor = landmarkPositions[domain.index];
    assert.equal(domainAnchor.z, terrainHeight(domainAnchor.x, domainAnchor.y) + 9);
    const selection = { type: "territory", id: domain.id };
    const routes = connectionsFor(selection);
    for (const skill of domain.items) {
      const point = skillPose(skill);
      const baseHeight = terrainHeight(point.x, point.y);
      assert.equal(terrainSample(point.x, point.y).z, baseHeight);
      assert.ok(baseHeight >= heightField(point.x, point.y).z + 20);
      assert.equal(point.z, baseHeight + 5);
      const domainRoute = routes.find(({ b }) => b.skill === skill);
      assert.equal(connectionEndpoint(domainRoute.b), point);
      assert.equal(connectionEndpoint(connectionsFor({ type: "skill", id: skill.id })[0].a), point);
      assert.equal(terrainHeight(point.x, point.y), baseHeight);
    }
  }
});

test("the particle buffer encodes the shared height and is reused across navigation states", () => {
  const tiles = createTerrainTiles(false);
  const overview = tiles(0, 0);
  for (let i = 0; i < overview.length; i += TERRAIN_STRIDE * 19) {
    const [x, y, z] = overview.subarray(i, i + 3);
    assert.ok(Math.abs(terrainHeight(x, y) - z) < 0.001);
  }
  for (const region of ATLAS_TERRITORIES) {
    connectionsFor({ type: "territory", id: region.id });
    assert.equal(tiles(0, 0), overview);
  }
  assert.equal(connectionsFor(null).length, 0);
});
