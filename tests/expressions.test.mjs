import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { expressions, resolveEmotion } from "../src/expressions.js";

test("backend emotion wins over text and accepts Indonesian labels", () => {
  assert.equal(
    resolveEmotion({ reply: "Aku sedih.", emotion: "happy" }),
    "happy",
  );
  assert.equal(resolveEmotion({ reply: "Nn.", emotion: " Marah " }), "angry");
});
test("legacy replies use character actions and own feelings", () => {
  assert.equal(resolveEmotion({ reply: "*tersenyum* Nn, Sensei." }), "happy");
  assert.equal(resolveEmotion({ reply: "Aku kesal, Sensei." }), "angry");
  assert.equal(resolveEmotion({ reply: "Aku merasa sedih." }), "sad");
  assert.equal(resolveEmotion({ reply: "*tersipu* Terima kasih." }), "shy");
  assert.equal(resolveEmotion({ reply: "*terkejut* Eh?" }), "surprised");
});
test("neutral fallback handles unknown metadata and negated feelings", () => {
  assert.equal(
    resolveEmotion({ reply: "Nn.", emotion: "__proto__" }),
    "neutral",
  );
  assert.equal(resolveEmotion({ reply: "Aku tidak marah." }), "neutral");
  assert.equal(resolveEmotion({ reply: "Jangan sedih, Sensei." }), "neutral");
  assert.equal(resolveEmotion({ reply: "Kamu sedang marah?" }), "neutral");
  assert.equal(
    resolveEmotion({ reply: "Aku di sini kalau kamu sedih." }),
    "neutral",
  );
  assert.equal(resolveEmotion({ reply: "Nn.", emotion: {} }), "neutral");
});
test("all expressions point to local sprites", () => {
  for (const { file } of Object.values(expressions)) {
    assert.ok(existsSync(new URL(`../public${file}`, import.meta.url)), file);
  }
});
