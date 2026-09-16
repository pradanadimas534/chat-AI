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
  assert.equal(pages.length, 1);
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
test("pages preserve whole sentences beyond the target length", () => {
  const first = "Halo Sensei, hari ini aku ingin mengajakmu keluar bersama untuk lari pagi.";
  const second = "Setelah itu kita bisa sarapan.";
  assert.deepEqual(paginateDialogue(`${first} ${second}`, 40), [
    { text: first, narration: false },
    { text: second, narration: false },
  ]);
  assert.equal(paginateDialogue("Aku ingin mengajakmu lari pagi", 10)[0].text,
    "Aku ingin mengajakmu lari pagi");
});
