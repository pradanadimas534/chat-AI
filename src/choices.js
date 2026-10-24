export function extractDialogueAndChoices(rawText) {
  if (typeof rawText !== "string") {
    return { text: "", choices: [] };
  }
  const match = rawText.match(
    /(?:\[(?:Pilihan|Choices|Opsi)\]|Pilihan balasan:?)([\s\S]+)$/i,
  );
  if (match) {
    const text = rawText.slice(0, match.index).trim();
    const section = match[1];
    let lines = section
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s\d.*\-•]+|[“”"]/g, "").trim())
      .filter((line) => line.length > 2 && line.length < 120);

    // If newlines didn't work (e.g. inline numbering 1. ... 2. ...)
    if (lines.length < 2 && section.includes("1.") && section.includes("2.")) {
      lines = section
        .split(/(?:^|\s+)\d+[.)]\s*/)
        .map((item) => item.replace(/^[“”"]|[“”"]$/g, "").trim())
        .filter((item) => item.length > 2 && item.length < 120);
    }

    return {
      text: text || rawText.trim(),
      choices: lines.length > 0 ? lines.slice(0, 3) : [],
    };
  }
  return { text: rawText.trim(), choices: [] };
}

export function generateFallbackChoices(text) {
  const lower = (text || "").toLowerCase();
  if (lower.includes("sepeda") || lower.includes("lari") || lower.includes("jogging")) {
    return [
      "Wah, sudah menempuh berapa kilometer?",
      "Besok pagi aku mau ikut sepedaan bersamamu.",
      "Hebat seperti biasa. Jangan lupa istirahat, ya.",
    ];
  }
  if (lower.includes("rampok") || lower.includes("bank") || lower.includes("topeng")) {
    return [
      "T-tunggu dulu, kenapa solusinya selalu merampok bank?!",
      "K-kamu benar-benar sudah menyiapkan topengnya?!",
      "Nn, ayo kita cari cara lain yang lebih aman saja...",
    ];
  }
  if (lower.includes("lelah") || lower.includes("capek") || lower.includes("istirahat")) {
    return [
      "Terima kasih atas perhatianmu, Shiroko.",
      "Kamu sendiri bagaimana? Jangan terlalu lelah.",
      "Mau duduk di sampingku sebentar?",
    ];
  }
  if (lower.includes("makan") || lower.includes("lapar") || lower.includes("minum")) {
    return [
      "Mau kuajak makan ramen Shiba Seki bareng?",
      "Aku baru saja minum air hangat. Kamu mau juga?",
      "Sensei belum sempat makan siang nih...",
    ];
  }
  if (lower.includes("abydos") || lower.includes("patroli") || lower.includes("gurun")) {
    return [
      "Bagaimana situasi di Abydos hari ini?",
      "Aku akan selalu ada untuk membantu kalian.",
      "Hati-hati saat berpatroli di cuaca panas begini.",
    ];
  }
  return [
    "Nn, begitu ya. Ceritakan lebih banyak, Shiroko.",
    "Senang bisa ngobrol santai denganmu hari ini.",
    "Ada hal lain yang sedang kamu pikirkan?",
  ];
}
