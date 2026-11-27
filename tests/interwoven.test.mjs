import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { knots, matchRibbon, ribbonHeight, ribbonPosition, ribbons, ribbonStories } from "../src/sections/interwoven/ribbon-model.ts";

test("each project stop is positioned on its associated disciplines", () => {
  for (const knot of knots) {
    assert.equal(knot.streams.length, 2);
    for (const id of knot.streams) {
      const stream = ribbons.find(ribbon => ribbon.id === id);
      assert.ok(Math.abs(ribbonHeight(stream.heights, knot.t) - knot.y) < 1e-8, [knot.id,id].join("/"));
    }
    assert.ok(knot.links.length > 0);
  }
});

test("hits are localized and project URLs point to the existing portfolio", () => {
  const ai = ribbons[0];
  assert.equal(matchRibbon(ribbonPosition(.15), ribbonHeight(ai.heights,.15), .05), "ai");
  assert.equal(matchRibbon(0, .5, .1), null);
  for (const { links } of Object.values(ribbonStories)) {
    for (const { href } of links) {
      if (href.startsWith("/work/")) {
        assert.match(href, /^\/work\/(imdpune|windy|swaneeti|spenza)$/);
        assert.ok(existsSync(new URL("../src/app/work/[slug]/page.tsx",import.meta.url)));
      } else {
        assert.equal(href, "#robotics");
      }
    }
  }
});
