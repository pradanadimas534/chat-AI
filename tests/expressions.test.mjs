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
  assert.equal(resolveEmotion({ reply: "Aku kesal, Sensei." }), "annoyed");
  assert.equal(resolveEmotion({ reply: "Aku merasa sedih." }), "sad");
  assert.equal(resolveEmotion({ reply: "*tersipu* Terima kasih." }), "neutral");
  assert.equal(resolveEmotion({ reply: "*menangis* Sensei..." }), "crying");
  assert.equal(resolveEmotion({ emotion: "shy" }), "neutral");
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

test("all 18 user-labelled sprites are available and smile is not closed eyes", () => {
  const selectable = Object.entries(expressions).filter(
    ([key]) => key !== "thinking",
  );
  assert.equal(selectable.length, 18);
  assert.equal(new Set(selectable.map(([, item]) => item.file)).size, 18);
  assert.equal(expressions.happy.file, "/expressions/Shiroko_03.png");
  assert.equal(expressions.eyes_closed.file, "/expressions/Shiroko_08.png");
  assert.equal(expressions.sad.file, "/expressions/Shiroko_09.png");
});

test("specific actions distinguish the new expressions", () => {
  for (const [reply, expected] of [
    ["*cemberut* Nn.", "pouting"],
    ["*menutup mata* Nn.", "eyes_closed"],
    ["*tersenyum sambil menutup mata* Nn.", "happy"],
    ["Aku heran.", "confused"],
    ["Aku sedikit marah.", "mildly_angry"],
    ["*menatap sinis* Nn.", "skeptical"],
    ["*berbicara* Nn.", "talking"],
    ["Aku tidak kesal.", "neutral"],
    ["Aku tidak menangis.", "neutral"],
    ["Aku tidak sedikit marah.", "neutral"],
  ])
    assert.equal(resolveEmotion({ reply }), expected, reply);
});

test("variants rotate only inside the same emotion family", () => {
  assert.equal(resolveEmotion({ reply: "Nn." }, "neutral"), "neutral_alt");
  assert.equal(resolveEmotion({ reply: "Nn." }, "neutral_alt"), "neutral");
  assert.equal(resolveEmotion({ reply: "*menangis*" }, "crying"), "crying_alt");
  assert.equal(
    resolveEmotion({ reply: "*menatap sinis*" }, "skeptical"),
    "skeptical_2",
  );
  assert.equal(
    resolveEmotion({ reply: "*menatap sinis*" }, "skeptical_2"),
    "skeptical_3",
  );
  assert.equal(resolveEmotion({ reply: "Aku senang." }, "happy"), "happy");
  assert.equal(
    resolveEmotion({ emotion: "skeptical_2" }, "skeptical_2"),
    "skeptical_2",
  );
  assert.equal(resolveEmotion({ emotion: "unassigned" }), "neutral");
});
