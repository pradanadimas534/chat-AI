import test from "node:test";
import assert from "node:assert/strict";
import { paginateDialogue } from "../src/dialogue.js";
test("narration is separate from dialogue without losing words", () => {
  assert.deepEqual(paginateDialogue("*tersenyum* Nn, Sensei.\nMau jalan?"), [
    { text: "tersenyum", narration: true },
    { text: "Nn, Sensei.\nMau jalan?", narration: false },
  ]);
});
test("long replies paginate without dropping words, including no-space text", () => {
  const text = Array.from({ length: 100 }, (_, i) => "kata" + i).join(" ");
  const pages = paginateDialogue(text);
  assert.equal(pages.map((p) => p.text).join(" "), text);
  assert.ok(pages.every((p) => p.text.length <= 240));
  const noSpaces = "あ".repeat(600);
  assert.equal(
    paginateDialogue(noSpaces)
      .map((p) => p.text)
      .join(""),
    noSpaces,
  );
});
test("empty and unmatched narration remain renderable", () => {
  assert.equal(paginateDialogue(" ")[0].text, "…");
  assert.equal(paginateDialogue("*belum selesai")[0].text, "*belum selesai");
});
