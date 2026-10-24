import test from "node:test";
import assert from "node:assert/strict";
import { getRandomStarter } from "../src/starters.js";

test("getRandomStarter returns a valid starter object across all times", () => {
  for (const time of ["morning", "day", "evening", "night", "night-lit"]) {
    const starter = getRandomStarter(time);
    assert.ok(starter.id);
    assert.equal(starter.role, "model");
    assert.ok(starter.text.length > 10);
    assert.ok(starter.emotion);
    assert.equal(starter.greeting, true);
    assert.equal(Array.isArray(starter.choices), true);
    assert.equal(starter.choices.length, 3);
    for (const choice of starter.choices) {
      assert.ok(choice.length > 3);
    }
  }
});
