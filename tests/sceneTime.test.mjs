import test from "node:test";
import assert from "node:assert/strict";
import { getSceneTime } from "../src/sceneTime.js";

test("scene follows local time at every boundary including midnight", () => {
  for (const [hour, minute, expected] of [
    [0, 0, "night"], [4, 59, "night"], [5, 0, "morning"],
    [10, 59, "morning"], [11, 0, "day"], [14, 59, "day"],
    [15, 0, "evening"], [17, 59, "evening"], [18, 0, "night-lit"],
    [21, 59, "night-lit"], [22, 0, "night"],
    [23, 59, "night"],
  ]) {
    assert.equal(getSceneTime(new Date(2026, 8, 16, hour, minute)), expected);
  }
});
