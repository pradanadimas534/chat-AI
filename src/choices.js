// Extraction and contextual generation for Visual Novel dialogue choices.
// Enforces maximum of 2 choices (can be 1 or 2, max 2).

export function extractDialogueAndChoices(rawText) {
  if (typeof rawText !== "string") return { text: "", choices: [] };
  const trimmed = rawText.trim();

  // Pattern 1: Header tags on their own line like [Pilihan], **Pilihan:**, Pilihan respon Sensei:, etc.
  const headerMatch = trimmed.match(
    /(?:^|\r?\n)\s*(?:\[[^\]\n]*(?:pilihan|opsi|choices?)[^\]\n]*\]|[*_~-]{0,3}\s*(?:pilihan|opsi|rekomendasi|choices?)[^\n]*?[*_~-]{0,3}:?)\s*(?:\r?\n)([\s\S]+)$/i,
  );

  let textPart = trimmed;
  let choicesPart = "";

  if (headerMatch) {
    textPart = trimmed.slice(0, headerMatch.index).trim();
    choicesPart = headerMatch[1].trim();
  } else {
    // Pattern 2: Trailing list of numbered or bulleted lines (e.g. 1. "..." \n 2. "...")
    const listMatch = trimmed.match(
      /(?:\r?\n){2,}(\s*(?:1[.)]|-|\*|•)\s+[\s\S]+)$/,
    );
    if (listMatch) {
      textPart = trimmed.slice(0, listMatch.index).trim();
      choicesPart = listMatch[1].trim();
    }
  }

  if (choicesPart) {
    let lines = choicesPart
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s\d.*\-•#[\]()]+|[“”"]/g, "").trim())
      .filter((line) => line.length > 2 && line.length < 140);

    // If choices were formatted inline (e.g. 1. ... 2. ...)
    if (
      lines.length < 2 &&
      /\b1[.)]/.test(choicesPart)
    ) {
      lines = choicesPart
        .split(/(?:^|\s+)\d+[.)]\s*/)
        .map((item) => item.replace(/^[“”"]|[“”"]$/g, "").trim())
        .filter((item) => item.length > 2 && item.length < 140);
    }

    if (lines.length >= 1) {
      // Maximum 2 choices allowed (1 or 2, max 2)
      return {
        text: textPart || trimmed,
        choices: lines.slice(0, 2),
      };
    }
  }

  return { text: trimmed, choices: [] };
}

export function buildChoicesPrompt(dialogueText) {
  return `[SISTEM PILIHAN VISUAL NOVEL]
Berikut adalah dialog yang baru saja diucapkan oleh Shiroko:
"${dialogueText}"

Tugas: Bacalah kalimat dialog Shiroko di atas dengan teliti. Dari isi perkataan Shiroko tersebut, buatlah 1 sampai 2 pilihan balasan respon singkat untuk Sensei (bisa 1 atau 2 pilihan, mentok maksimal 2) yang NYAMBUNG LANGSUNG dan secara spesifik merespons apa yang baru saja dikatakan Shiroko.

Keluarkan dalam format:
[Pilihan]
1. (Respon pilihan Sensei A)
2. (Respon pilihan Sensei B - opsional)`;
}

export async function fetchAIChoices(dialogueText, apiBase = "", signal = null) {
  try {
    const prompt = buildChoicesPrompt(dialogueText);
    const res = await fetch(`${apiBase}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        history: [],
      }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.reply === "string") {
      const parsed = extractDialogueAndChoices(data.reply);
      if (parsed.choices.length > 0) {
        return parsed.choices.slice(0, 2);
      }
    }
  } catch {
    // Return null on network error, timeout, or abort
  }
  return null;
}
