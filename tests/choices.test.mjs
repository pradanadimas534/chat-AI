import test from "node:test";
import assert from "node:assert/strict";
import { extractDialogueAndChoices, generateFallbackChoices } from "../src/choices.js";

test("extractDialogueAndChoices parses [Pilihan] block correctly", () => {
  const raw = `Nn, Abydos hari ini cerah sekali. Aku baru selesai sepedaan.

[Pilihan]
1. "Wah, sudah sepedaan berapa kilometer?"
2. "Mau kuambilkan minuman dingin?"
3. "Jangan lupa istirahat ya, Shiroko."`;

  const result = extractDialogueAndChoices(raw);
  assert.equal(result.text, "Nn, Abydos hari ini cerah sekali. Aku baru selesai sepedaan.");
  assert.equal(result.choices.length, 3);
  assert.equal(result.choices[0], "Wah, sudah sepedaan berapa kilometer?");
  assert.equal(result.choices[1], "Mau kuambilkan minuman dingin?");
  assert.equal(result.choices[2], "Jangan lupa istirahat ya, Shiroko.");
});

test("extractDialogueAndChoices parses alternative header tags", () => {
  const raw1 = `Nn, Sensei. Rute gurun aman.

Pilihan respon Sensei:
1. Kerja bagus hari ini, Shiroko!
2. Mau makan siang bareng sekarang?
3. Hati-hati di jalan ya.`;

  const res1 = extractDialogueAndChoices(raw1);
  assert.equal(res1.text, "Nn, Sensei. Rute gurun aman.");
  assert.equal(res1.choices.length, 3);
  assert.equal(res1.choices[0], "Kerja bagus hari ini, Shiroko!");

  const raw2 = `Nn. Jangan memaksakan diri, Sensei.

**Pilihan:**
- "Terima kasih, Shiroko."
- "Aku tidak apa-apa kok."
- "Mau temani aku istirahat?"`;

  const res2 = extractDialogueAndChoices(raw2);
  assert.equal(res2.text, "Nn. Jangan memaksakan diri, Sensei.");
  assert.equal(res2.choices.length, 3);
  assert.equal(res2.choices[0], "Terima kasih, Shiroko.");
});

test("generateFallbackChoices generates relevant choices for seating and AC", () => {
  const raw = "Duduklah dulu, AC di sini lumayan sejuk kok.";
  const fallback = generateFallbackChoices(raw);
  assert.equal(fallback.length, 3);
  assert.ok(fallback[0].toLowerCase().includes("panas") || fallback[0].toLowerCase().includes("terima kasih"));
  assert.ok(fallback[1].toLowerCase().includes("duduk"));
  // Ensure Sensei does not say "Nn"
  for (const choice of fallback) {
    assert.ok(!choice.startsWith("Nn"));
  }
});

test("extractDialogueAndChoices falls back when no choices section exists", () => {
  const raw = "Nn, Sensei. Sudah sarapan belum?";
  const result = extractDialogueAndChoices(raw);
  assert.equal(result.text, raw);
  assert.equal(result.choices.length, 0);

  const fallback = generateFallbackChoices(raw);
  assert.equal(fallback.length, 3);
  assert.ok(fallback[0].toLowerCase().includes("sudah") || fallback[0].toLowerCase().includes("makan"));
});
