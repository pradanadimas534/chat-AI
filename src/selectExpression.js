import { expressionDataset } from "./expressionDataset.js";

const LEGACY_ALIASES = {
  happy: "Soft_Smile",
  senang: "Soft_Smile",
  gembira: "Soft_Smile",
  smile: "Soft_Smile",
  soft_smile: "Soft_Smile",
  sad: "Sad_Worried",
  sedih: "Sad_Worried",
  worried: "Sad_Worried",
  khawatir: "Sad_Worried",
  cemas: "Sad_Worried",
  tired: "Tired_Sad",
  lelah: "Tired_Sad",
  capek: "Tired_Sad",
  angry: "Annoyed",
  marah: "Annoyed",
  annoyed: "Annoyed",
  kesal: "Annoyed",
  sebal: "Annoyed",
  mildly_angry: "Annoyed",
  pouting: "Displeased_Pout",
  pout: "Displeased_Pout",
  cemberut: "Displeased_Pout",
  ngambek: "Displeased_Pout",
  surprised: "Surprised",
  terkejut: "Surprised",
  kaget: "Surprised",
  mild_surprise: "Mild_Surprise",
  confused: "Uneasy_Talk",
  bingung: "Uneasy_Talk",
  ragu: "Uneasy_Talk",
  talking: "Open_Mouth_Talk",
  bicara: "Open_Mouth_Talk",
  eyes_closed: "Grimace_Suppressed",
  menutup_mata: "Grimace_Suppressed",
  skeptical: "Dead_Eyes_Disdain",
  skeptical_2: "Dead_Eyes_Disappointed",
  skeptical_3: "Dead_Eyes_Scoff",
  sinis: "Dead_Eyes_Disdain",
  crying: "Distressed_Crying",
  menangis: "Distressed_Crying",
  neutral: "Neutral",
  neutral_alt: "Neutral_Calm",
  neutral_calm: "Neutral_Calm",
  calm: "Neutral_Calm",
  serious: "Neutral_Serious",
  neutral_serious: "Neutral_Serious",
  empathy: "Empathetic_Concern",
  prihatin: "Empathetic_Concern",
};

const actionRules = [
  ["Distressed_Crying", /menangis|terisak|air mata/],
  ["Grimace_Suppressed", /meringis|menahan (?:sakit|malu|emosi)|terpejam rapat|tersipu|wajah memerah|salah tingkah/],
  ["Dead_Eyes_Scoff", /mencibir|mendengus sinis/],
  ["Dead_Eyes_Disappointed", /tatapan kosong.*kecewa|kecewa.*tatapan kosong|menghela napas panjang/],
  ["Dead_Eyes_Disdain", /meremehkan|muak|menatap sinis|tatapan kosong|menatap dingin/],
  ["Tired_Sad", /lelah|murung|pasrah|kehilangan semangat|menghela na[pf]as|kelelahan|lemas/],
  ["Sad_Worried", /sedih|khawatir|cemas|kecewa/],
  ["Empathetic_Concern", /prihatin|simpati|iba|mengusap kepala/],
  ["Displeased_Pout", /cemberut|ngambek|memalingkan (?:wajah|muka)|buang muka/],
  ["Annoyed", /kesal|jengkel|sebal|marah/],
  ["Uneasy_Talk", /ragu|bingung|mengeluh|keberatan|gugup|miringkan kepala|menggaruk pipi/],
  ["Surprised", /sangat terkejut|terbelalak|kaget sekali/],
  ["Mild_Surprise", /heran|terkejut|kaget/],
  ["Soft_Smile", /tersenyum|senang|bahagia|tertawa/],
  ["Open_Mouth_Talk", /memanggil|berseru|berteriak|meninggikan suara/],
  ["Neutral_Serious", /serius|fokus|memperhatikan|mengecek senjata|menyiapkan rencana/],
  ["Neutral_Calm", /rileks|tenang|santai|mengangguk/],
];

export function selectExpression({ emotion, reply = "" }) {
  if (typeof emotion === "string") {
    const raw = emotion.trim().toLowerCase();
    const key = Object.keys(expressionDataset).find(
      (name) => name.toLowerCase() === raw,
    );
    if (key) return key;
    if (LEGACY_ALIASES[raw]) return LEGACY_ALIASES[raw];
  }

  const text = typeof reply === "string" ? reply.toLowerCase() : "";

  // 1. Check explicit character actions (*...*) and first-person declarations
  const cues = [
    ...(text.match(/\*[^*]+\*/g) || []),
    ...(text.match(/\baku\s+(?:(?:merasa|sedang|sangat|agak|sedikit|juga)\s+)*(?:senang|bahagia|sedih|khawatir|cemas|kecewa|kesal|marah|lelah|murung|prihatin|ragu|bingung|kaget|terkejut|tenang|serius|muak)\b/g) || []),
  ].join(" ").replace(/\b(?:tidak|nggak|gak|bukan|jangan)\s+(?:(?:merasa|sedang|sangat|lagi)\s+)*\S+/g, "");

  for (const [name, pattern] of actionRules) {
    if (pattern.test(cues)) return name;
  }

  // 2. Natural dialogue speech cues (caring, gratitude, flustered, deadpan, etc.)
  // Negation filter: check if the sentence is stating "aku tidak marah" or "jangan sedih, Sensei"
  const positiveText = text.replace(/\b(?:tidak|nggak|gak|bukan|jangan)\s+(?:(?:merasa|sedang|sangat|lagi)\s+)*\S+/g, "");

  // Care / Empathy for Sensei
  if (
    /kamu (?:baik-baik saja|nggak apa-apa)\?|aku (?:temani|menemanimu|dengarkan)|turut (?:sedih|berduka)/.test(text) ||
    /(?:jangan (?:terlalu )?(?:memaksakan diri|lelah|capek)|istirahatlah|sudah makan\??|minum air|biar kuambilkan|sensei (?:baik-baik saja|tidak apa-apa)\?|ada yang sakit\??)/.test(text)
  ) {
    return "Empathetic_Concern";
  }

  // Warmth / Gratitude / Happiness
  if (
    /(?:terima kasih(?: banyak)?,? sensei|syukurlah|senang mendengarnya|aku ikut senang|selamat ya|sangat menyenangkan|aku bangga|terasa hangat)/.test(positiveText)
  ) {
    return "Soft_Smile";
  }

  // Flustered / Pouting at teasing
  if (
    /(?:jangan menggodaku|bicara apa sih|sensei nakal|bikin malu|jangan meledek)/.test(text)
  ) {
    return "Displeased_Pout";
  }

  // Strong surprise
  if (
    /^(?:nn[,. ]*)?(?:eh|hah)\s*[?!]{2,}/.test(text) ||
    /(?:kaget sekali|sangat terkejut|mana mungkin|beneran\?!)/.test(text)
  ) {
    return "Surprised";
  }

  // Mild surprise
  if (
    /^(?:nn[,. ]*)?(?:oh|eh)\?/.test(text) ||
    /^(?:oh|eh)\?/.test(text) ||
    /(?:benarkah\?|begitukah\?)/.test(text)
  ) {
    return "Mild_Surprise";
  }

  // Deadpan tactical / Serious Abydos planning
  if (
    /(?:rampok bank|topeng ski|rencana taktis|denah bank|patroli gurun|rute sepedaan 40km)/.test(text)
  ) {
    return "Neutral_Serious";
  }

  // Hesitant speech
  if (
    /\b(?:anoo?|etou?)\b|aku agak ragu|entahlah|sedikit bingung/.test(text)
  ) {
    return "Uneasy_Talk";
  }

  // Calm conversation
  if (
    /\b(?:santai saja|tenang saja|tidak apa-apa|hari yang tenang)\b/.test(text)
  ) {
    return "Neutral_Calm";
  }

  return "Neutral";
}
