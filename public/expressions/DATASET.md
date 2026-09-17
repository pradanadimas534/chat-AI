# Corrected expression dataset — 2026-09-17

The user's corrected classification is authoritative. The machine-readable
mapping, Indonesian labels, categories, and descriptions are in
`src/expressionDataset.js`, keyed by the exact names below.

| Sprite | Expression | Category |
| --- | --- | --- |
| Shiroko_00 | Neutral | NEUTRAL |
| Shiroko_01 | Neutral_Calm | NEUTRAL |
| Shiroko_02 | Mild_Surprise | SURPRISE |
| Shiroko_03 | Soft_Smile | POSITIVE |
| Shiroko_04 | Neutral_Serious | NEUTRAL |
| Shiroko_05 | Annoyed | ANGER / DISPLEASURE |
| Shiroko_06 | Open_Mouth_Talk | TALKING |
| Shiroko_07 | Surprised | SURPRISE |
| Shiroko_08 | Grimace_Suppressed | SUPPRESSED |
| Shiroko_09 | Empathetic_Concern | EMPATHY |
| Shiroko_10 | Uneasy_Talk | TALKING |
| Shiroko_11 | Displeased_Pout | ANGER / DISPLEASURE |
| Shiroko_12 | Dead_Eyes_Disdain | DEAD EYES |
| Shiroko_13 | Dead_Eyes_Disappointed | DEAD EYES |
| Shiroko_14 | Dead_Eyes_Scoff | DEAD EYES |
| Shiroko_15 | Sad_Worried | SAD |
| Shiroko_16 | Tired_Sad | SAD |
| Shiroko_17 | Distressed_Crying | SAD |

12–14 share the `Dead_Eyes / Empty_Stare` family but have distinct meanings.
08 is discomfort, not a happy smile; 09 is empathy, not general sadness;
15 is now classified. Neither 05 nor 11 represents aggressive anger.

The application still uses only Neutral while the user reviews assets.
The older resolver in `src/expressions.js` is disabled and uses obsolete labels;
it must be migrated to this dataset before automatic selection is restored.
The old filenames in SOURCES.md are historical download provenance, not current labels.
