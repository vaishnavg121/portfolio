import assert from "node:assert/strict";
import test from "node:test";
import { expenseExample, normalDensity, normalLossTail, protectedSharePnl } from "../src/sections/research-studio/markets-math.ts";

test("a protective put caps terminal losses, keeps the upside, and reprices before expiry", () => {
  const expiryFloor = protectedSharePnl(75, 0, .22);
  assert.equal(protectedSharePnl(95, 0, .31), expiryFloor);
  assert.equal(protectedSharePnl(130, 0, .22) - expiryFloor, 30);
  assert.equal(protectedSharePnl(100, .5, .22), 0);
  assert.ok(protectedSharePnl(100, .25, .30) > protectedSharePnl(100, .25, .20));
});

test("the upper-tail threshold captures 5% of standard-normal losses and the mean lies further into the tail", () => {
  const { threshold, probability, conditionalMean } = normalLossTail;
  const step = .001;
  let mass = 0, total = 0;
  for (let loss = threshold + step / 2; loss < 8; loss += step) {
    const weight = normalDensity(loss) * step;
    mass += weight;
    total += loss * weight;
  }
  assert.ok(Math.abs(mass - probability) < 1e-6);
  assert.ok(Math.abs(total / mass - conditionalMean) < 1e-6);
  assert.ok(conditionalMean > threshold);
});

test("every illustrated expense entry uses integer minor units and the ledger closes at zero", () => {
  const { total, credits } = expenseExample;
  assert.ok([total, ...credits].every(value => Number.isSafeInteger(value) && value > 0));
  assert.equal(credits.reduce((balance, credit) => balance - credit, total), 0);
});
