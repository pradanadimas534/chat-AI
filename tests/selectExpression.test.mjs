import test from "node:test";
import assert from "node:assert/strict";
import { selectExpression } from "../src/selectExpression.js";
import { expressionDataset } from "../src/expressionDataset.js";

test("all corrected expression names select their exact variant", () => {
  for (const emotion of Object.keys(expressionDataset)) {
    assert.equal(selectExpression({ emotion, reply: "Aku senang." }), emotion);
  }
});

test("character feelings use corrected sprites, not the old mapping", () => {
  for (const [reply, expected] of [
    ["*tersenyum* Aku senang.", "Soft_Smile"],
    ["*meringis*", "Grimace_Suppressed"],
    ["Aku sedih.", "Sad_Worried"],
    ["Aku kesal.", "Annoyed"],
    ["*cemberut*", "Displeased_Pout"],
    ["Aku temani. Kamu baik-baik saja?", "Empathetic_Concern"],
    ["Eh?!", "Surprised"],
    ["*mencibir*", "Dead_Eyes_Scoff"],
    ["*menangis*", "Distressed_Crying"],
    ["Kamu marah? Aku tidak marah.", "Neutral"],
    ["Jangan sedih, Sensei.", "Neutral"],
  ]) {
    assert.equal(selectExpression({ reply }), expected, reply);
  }
});

test("legacy emotion aliases map to valid canonical expressions", () => {
  assert.equal(selectExpression({ emotion: "happy" }), "Soft_Smile");
  assert.equal(selectExpression({ emotion: "angry" }), "Annoyed");
  assert.equal(selectExpression({ emotion: "pouting" }), "Displeased_Pout");
  assert.equal(selectExpression({ emotion: "sad" }), "Sad_Worried");
  assert.equal(selectExpression({ emotion: "surprised" }), "Surprised");
  assert.equal(selectExpression({ emotion: "crying" }), "Distressed_Crying");
  assert.equal(selectExpression({ emotion: "senang" }), "Soft_Smile");
});

test("natural in-game conversational dialogue triggers appropriate expressions", () => {
  assert.equal(
    selectExpression({ reply: "Nn, terima kasih banyak, Sensei." }),
    "Soft_Smile",
  );
  assert.equal(
    selectExpression({ reply: "Syukurlah kalau begitu, Sensei." }),
    "Soft_Smile",
  );
  assert.equal(
    selectExpression({
      reply: "Nn, istirahatlah Sensei, jangan memaksakan diri.",
    }),
    "Empathetic_Concern",
  );
  assert.equal(
    selectExpression({
      reply: "Nn... Sensei bicara apa sih, jangan menggodaku.",
    }),
    "Displeased_Pout",
  );
  assert.equal(
    selectExpression({ reply: "Nn, eh?! Beneran?!" }),
    "Surprised",
  );
  assert.equal(
    selectExpression({
      reply: "Nn. Kalau butuh dana, kita bisa rampok bank dengan topeng ski.",
    }),
    "Neutral_Serious",
  );
  assert.equal(
    selectExpression({ reply: "Nn, santai saja, Sensei." }),
    "Neutral_Calm",
  );
});
