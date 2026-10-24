// Extraction and contextual generation for Visual Novel dialogue choices.
// Ensures next choices strictly align with the current conversation topic.

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

    // If choices were formatted inline (e.g. 1. ... 2. ... 3. ...)
    if (
      lines.length < 2 &&
      /\b1[.)]/.test(choicesPart) &&
      /\b2[.)]/.test(choicesPart)
    ) {
      lines = choicesPart
        .split(/(?:^|\s+)\d+[.)]\s*/)
        .map((item) => item.replace(/^[“”"]|[“”"]$/g, "").trim())
        .filter((item) => item.length > 2 && item.length < 140);
    }

    if (lines.length >= 2) {
      return {
        text: textPart || trimmed,
        choices: lines.slice(0, 3),
      };
    }
  }

  return { text: trimmed, choices: [] };
}

export function generateFallbackChoices(text) {
  const lower = (text || "").toLowerCase();

  // If Shiroko asks a direct question
  if (text && text.includes("?")) {
    if (lower.includes("sarapan") || lower.includes("makan") || lower.includes("minum")) {
      return [
        "Sudah kok. Kamu sendiri jangan lupa makan ya.",
        "Belum nih... Mau cari makanan enak bareng di sekitar sini?",
        "Tadi cuma minum kopi saja, belum sempat sarapan.",
      ];
    }
    if (lower.includes("lelah") || lower.includes("capek") || lower.includes("tidur") || lower.includes("istirahat")) {
      return [
        "Sedikit lelah, tapi mengobrol denganmu membuatku segar lagi.",
        "Sensei masih kuat kok! Jangan terlalu khawatir.",
        "Iya, nanti siang aku usahakan tidur sebentar.",
      ];
    }
    if (lower.includes("sepeda") || lower.includes("lari") || lower.includes("latihan") || lower.includes("jogging")) {
      return [
        "Boleh! Kapan kita mulai latihannya?",
        "Staminaku tidak sekuat kamu, tapi aku mau coba ikut pelan-pelan.",
        "Aku akan menyemangatimu dari pinggir jalan saja, haha.",
      ];
    }
    return [
      "Iya, aku setuju denganmu, Shiroko.",
      "Bagaimana kalau kita coba cara lain yang lebih santai?",
      "Menurutmu sendiri bagaimana, Shiroko?",
    ];
  }

  // Topic: Cycling, jogging, running
  if (lower.includes("sepeda") || lower.includes("lari") || lower.includes("jogging") || lower.includes("kilometer")) {
    return [
      "Wah, sudah menempuh berapa kilometer hari ini?",
      "Kapan-kapan ajak aku ikut rute sepedaanmu ya.",
      "Hebat sekali! Tapi jangan sampai lupa minum air, ya.",
    ];
  }

  // Topic: Bank, heist, ski mask, weapons, tactical
  if (lower.includes("rampok") || lower.includes("bank") || lower.includes("topeng") || lower.includes("senjata") || lower.includes("white fang")) {
    return [
      "T-tunggu dulu, kenapa solusinya selalu merampok bank?!",
      "Topeng ski-nya disimpan dulu ya, kita cari solusi yang aman!",
      "Haha, kamu kalau soal rencana taktis selalu bersemangat ya.",
    ];
  }

  // Topic: Caring, resting, fatigue
  if (lower.includes("lelah") || lower.includes("capek") || lower.includes("istirahat") || lower.includes("khawatir")) {
    return [
      "Terima kasih sudah begitu perhatian padaku, Shiroko.",
      "Kamu sendiri jangan terlalu memaksakan diri juga, ya.",
      "Duduk di sampingmu begini rasanya sangat menenangkan.",
    ];
  }

  // Topic: Friends / Abydos (Hoshino, Serika, Nonomi, Ayane)
  if (lower.includes("hoshino") || lower.includes("serika") || lower.includes("ayane") || lower.includes("nonomi") || lower.includes("abydos")) {
    return [
      "Haha, dinamika anak-anak Abydos memang selalu hangat dan ramai.",
      "Sensei akan selalu siap membantu kalau Abydos butuh sesuatu.",
      "Senang melihat kalian semua akrab seperti keluarga.",
    ];
  }

  // Topic: Weather, desert, sunset, stars
  if (lower.includes("panas") || lower.includes("senja") || lower.includes("bintang") || lower.includes("malam") || lower.includes("gurun")) {
    return [
      "Pemandangan di Abydos memang punya pesona tersendiri ya.",
      "Udara di luar cukup ekstrem, kita di dalam ruangan saja dulu.",
      "Menghabiskan waktu bersamamu di sini terasa damai sekali.",
    ];
  }

  // General conversational fallbacks
  return [
    "Nn, begitu ya. Ceritakan lebih banyak, Shiroko.",
    "Senang sekali bisa mengobrol santai denganmu hari ini.",
    "Aku selalu senang mendengarkan ceritamu, Shiroko.",
  ];
}
