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

test("extractDialogueAndChoices falls back when no [Pilihan] is present", () => {
  const raw = "Nn, Sensei. Selamat datang kembali.";
  const result = extractDialogueAndChoices(raw);
  assert.equal(result.text, raw);
  assert.equal(result.choices.length, 0);

  const fallback = generateFallbackChoices(raw);
  assert.equal(fallback.length, 3);
});

