import test from "node:test";
import assert from "node:assert/strict";
import { selectExpression } from "../src/selectExpression.js";
import { expressionDataset } from "../src/expressionDataset.js";
test("all corrected expression names select their exact variant", () => {
  for (const emotion of Object.keys(expressionDataset)) {
    assert.equal(selectExpression({emotion, reply:"Aku senang."}), emotion);
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
  ]) assert.equal(selectExpression({reply}), expected, reply);
});
