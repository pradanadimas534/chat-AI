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

  // 1. Topic: AC, seating, cool room, shelter from weather
  if (
    lower.includes("duduk") ||
    lower.includes("ac") ||
    lower.includes("sejuk") ||
    lower.includes("teduh") ||
    lower.includes("masuklah") ||
    lower.includes("kursi") ||
    lower.includes("sofa")
  ) {
    return [
      "Terima kasih, Shiroko. Di luar memang terik dan panas sekali.",
      "Wah sejuknya... Boleh aku duduk di sampingmu?",
      "Kamu sendiri sudah minum? Jangan sampai dehidrasi ya.",
    ];
  }

  // 2. Topic: Direct question from Shiroko
  if (text && text.includes("?")) {
    if (
      lower.includes("sarapan") ||
      lower.includes("makan") ||
      lower.includes("minum") ||
      lower.includes("lapar") ||
      lower.includes("haus")
    ) {
      return [
        "Sudah kok. Kamu sendiri jangan lupa makan tepat waktu ya.",
        "Belum nih... Mau cari makanan enak bareng di sekitar sini?",
        "Tadi cuma minum kopi saja, belum sempat sarapan.",
      ];
    }
    if (
      lower.includes("lelah") ||
      lower.includes("capek") ||
      lower.includes("tidur") ||
      lower.includes("istirahat")
    ) {
      return [
        "Sedikit lelah, tapi mengobrol denganmu membuatku segar lagi.",
        "Sensei masih kuat kok! Jangan terlalu cemas.",
        "Iya, nanti siang aku usahakan tidur sebentar.",
      ];
    }
    if (
      lower.includes("sepeda") ||
      lower.includes("lari") ||
      lower.includes("latihan") ||
      lower.includes("jogging")
    ) {
      return [
        "Boleh! Kapan kita mulai latihannya?",
        "Staminaku tidak sekuat kamu, tapi aku mau coba ikut pelan-pelan.",
        "Aku akan menyemangatimu dari pinggir jalan saja, haha.",
      ];
    }
    return [
      "Iya, tentu saja. Sensei setuju denganmu.",
      "Bagaimana kalau kita coba cara lain yang lebih santai?",
      "Menurutmu sendiri sebaiknya bagaimana, Shiroko?",
    ];
  }

  // 3. Topic: Cycling, jogging, running, physical stamina
  if (
    lower.includes("sepeda") ||
    lower.includes("road bike") ||
    lower.includes("lari") ||
    lower.includes("jogging") ||
    lower.includes("kilometer") ||
    lower.includes("km") ||
    lower.includes("stamina")
  ) {
    return [
      "Wah, sudah menempuh berapa kilometer hari ini?",
      "Kapan-kapan ajak aku ikut rute sepedaanmu ya.",
      "Hebat sekali! Tapi jangan sampai lupa minum air putih.",
    ];
  }

  // 4. Topic: Bank, heist, ski mask, weapons, tactical
  if (
    lower.includes("rampok") ||
    lower.includes("bank") ||
    lower.includes("topeng") ||
    lower.includes("senjata") ||
    lower.includes("white fang") ||
    lower.includes("brankas") ||
    lower.includes("drone")
  ) {
    return [
      "T-tunggu dulu, kenapa solusinya selalu merampok bank?!",
      "Topeng ski-nya disimpan dulu ya, kita cari cara yang aman!",
      "Haha, kamu kalau soal rencana taktis selalu bersemangat ya.",
    ];
  }

  // 5. Topic: Caring, resting, fatigue, health
  if (
    lower.includes("lelah") ||
    lower.includes("capek") ||
    lower.includes("istirahat") ||
    lower.includes("khawatir") ||
    lower.includes("begadang") ||
    lower.includes("kesehatan")
  ) {
    return [
      "Terima kasih sudah begitu perhatian padaku, Shiroko.",
      "Kamu sendiri jangan terlalu memaksakan diri juga, ya.",
      "Duduk di sampingmu begini rasanya sangat menenangkan.",
    ];
  }

  // 6. Topic: Food / Drinks / Meals
  if (
    lower.includes("makan") ||
    lower.includes("minum") ||
    lower.includes("lapar") ||
    lower.includes("haus") ||
    lower.includes("ramen") ||
    lower.includes("kafe")
  ) {
    return [
      "Kebetulan aku juga lapar, mau cari makan bareng?",
      "Terima kasih minumannya, segar sekali.",
      "Nanti siang Sensei yang traktir ya, pesan apa saja yang kamu mau.",
    ];
  }

  // 7. Topic: Friends / Abydos (Hoshino, Serika, Nonomi, Ayane)
  if (
    lower.includes("hoshino") ||
    lower.includes("serika") ||
    lower.includes("ayane") ||
    lower.includes("nonomi") ||
    lower.includes("abydos") ||
    lower.includes("satgas")
  ) {
    return [
      "Haha, dinamika anak-anak Abydos memang selalu hangat dan ramai.",
      "Sensei akan selalu siap membantu kalau Abydos butuh sesuatu.",
      "Senang melihat kalian semua akrab seperti keluarga.",
    ];
  }

  // 8. Topic: Weather, desert, sunset, stars, heat
  if (
    lower.includes("panas") ||
    lower.includes("senja") ||
    lower.includes("bintang") ||
    lower.includes("malam") ||
    lower.includes("gurun") ||
    lower.includes("terik")
  ) {
    return [
      "Pemandangan di Abydos memang punya pesona tersendiri ya.",
      "Udara di luar cukup ekstrem, kita di dalam ruangan saja dulu.",
      "Menghabiskan waktu bersamamu di sini terasa damai sekali.",
    ];
  }

  // 9. Topic: Teasing, praise, blushing
  if (
    lower.includes("menggoda") ||
    lower.includes("bicara apa") ||
    lower.includes("bikin malu") ||
    lower.includes("tersipu") ||
    lower.includes("cantik") ||
    lower.includes("manis")
  ) {
    return [
      "Haha, habisnya reaksimu menggemaskan sekali saat tersipu.",
      "Aku sungguh-sungguh kok, kamu sangat berharga untukku.",
      "Senang melihatmu tersenyum begitu, Shiroko.",
    ];
  }

  // 10. General conversational fallbacks (Never use Shiroko's 'Nn' catchphrase for Sensei!)
  return [
    "Begitu ya... Senang bisa mengobrol santai denganmu hari ini.",
    "Sensei akan selalu ada di sini kalau kamu ingin bercerita.",
    "Ada hal lain yang sedang kamu pikirkan akhir-akhir ini?",
  ];
}
