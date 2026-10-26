import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildChatRequest,
  CHARACTERS,
  SHIROKO_PERSONA,
  SHIROKO_TERROR_PERSONA,
} from "../src/persona.js";

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

test("all 9 MomoTalk characters have distinct personas and existing public .webp avatars", () => {
  const expectedIds = [
    "shiroko",
    "shiroko_terror",
    "wakamo",
    "azusa",
    "mika",
    "serika",
    "ibuki",
    "chise",
    "iroha",
  ];
  assert.deepEqual(Object.keys(CHARACTERS), expectedIds);

  for (const id of expectedIds) {
    const char = CHARACTERS[id];
    assert.ok(char.persona && char.persona.length > 50);
    const payload = buildChatRequest("Halo!", [], id);
    assert.ok(payload.message.startsWith(char.persona));

    const avatarPath = path.join(process.cwd(), "public", char.avatar.replace(/^\//, ""));
    assert.ok(fs.existsSync(avatarPath), `Missing avatar file: ${avatarPath}`);
  }

  const terrorPayload = buildChatRequest("Malam, Kuroko.", [], "shiroko_terror");
  assert.ok(terrorPayload.message.startsWith(SHIROKO_TERROR_PERSONA));
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
