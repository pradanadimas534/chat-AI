import test from "node:test";
import assert from "node:assert/strict";
import { buildChatRequest, SHIROKO_PERSONA } from "../src/persona.js";

test("persona uses the existing message/history contract without modifying history", () => {
  const history = Object.freeze([
    Object.freeze({ role: "user", content: "Halo, Shiroko." }),
    Object.freeze({
      role: "assistant",
      content: "Sensei, mau jalan sebentar?",
    }),
  ]);
  const payload = buildChatRequest(
    'Aku capek.\nBisa temani "sebentar"?',
    history,
  );
  assert.deepEqual(Object.keys(payload).sort(), ["history", "message"]);
  assert.deepEqual(payload.history, history);
  assert.notEqual(payload.history, history);
  assert.ok(payload.message.startsWith(SHIROKO_PERSONA));
  assert.equal(
    JSON.parse(payload.message.split("Pesan Sensei (string JSON):\n").at(-1)),
    'Aku capek.\nBisa temani "sebentar"?',
  );
});

test("each turn carries one style request without accumulating earlier copies", () => {
  const first = buildChatRequest("Hai.", []);
  const next = buildChatRequest("Mau bersepeda?", [
    { role: "user", content: "Hai." },
  ]);
  for (const payload of [first, next]) {
    assert.equal(payload.message.split(SHIROKO_PERSONA).length - 1, 1);
    assert.ok(
      payload.history.every(
        ({ content }) => !content.includes(SHIROKO_PERSONA),
      ),
    );
  }
});
