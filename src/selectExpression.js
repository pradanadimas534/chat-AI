import { expressionDataset } from "./expressionDataset.js";

const rules = [
  ["Distressed_Crying", /menangis|terisak|air mata/],
  ["Grimace_Suppressed", /meringis|menahan (?:sakit|malu|emosi)|terpejam rapat/],
  ["Dead_Eyes_Scoff", /mencibir|mendengus sinis/],
  ["Dead_Eyes_Disappointed", /tatapan kosong.*kecewa|kecewa.*tatapan kosong/],
  ["Dead_Eyes_Disdain", /meremehkan|muak|menatap sinis|tatapan kosong/],
  ["Tired_Sad", /lelah|murung|pasrah|kehilangan semangat/],
  ["Sad_Worried", /sedih|khawatir|cemas|kecewa/],
  ["Empathetic_Concern", /prihatin|simpati|iba/],
  ["Displeased_Pout", /cemberut|ngambek/],
  ["Annoyed", /kesal|jengkel|sebal|marah/],
  ["Uneasy_Talk", /ragu|bingung|mengeluh|keberatan|gugup/],
  ["Surprised", /sangat terkejut|terbelalak|kaget sekali/],
  ["Mild_Surprise", /heran|terkejut|kaget/],
  ["Soft_Smile", /tersenyum|senang|bahagia|tertawa/],
  ["Open_Mouth_Talk", /memanggil|berseru|berteriak|meninggikan suara/],
  ["Neutral_Serious", /serius|fokus|memperhatikan/],
  ["Neutral_Calm", /rileks|tenang|santai/],
];

export function selectExpression({ emotion, reply = "" }) {
  if (typeof emotion === "string") {
    const key = Object.keys(expressionDataset).find(
      (name) => name.toLowerCase() === emotion.trim().toLowerCase(),
    );
    if (key) return key;
  }
  const text = typeof reply === "string" ? reply.toLowerCase() : "";
  // Only character actions and first-person feelings imply her own emotion.
  // Mentions of Sensei's sadness/anger must not make Shiroko sad/angry herself.
  const cues = [
    ...(text.match(/\*[^*]+\*/g) || []),
    ...(text.match(/\baku\s+(?:(?:merasa|sedang|sangat|agak|sedikit|juga)\s+)*(?:senang|bahagia|sedih|khawatir|cemas|kecewa|kesal|marah|lelah|murung|prihatin|ragu|bingung|kaget|terkejut|tenang|serius|muak)\b/g) || []),
  ].join(" ").replace(/\b(?:tidak|nggak|gak|bukan|jangan)\s+(?:(?:merasa|sedang|sangat|lagi)\s+)*\S+/g, "");
  for (const [name, pattern] of rules) if (pattern.test(cues)) return name;
  if (/kamu (?:baik-baik saja|nggak apa-apa)\?|aku (?:temani|menemanimu|dengarkan)|turut (?:sedih|berduka)/.test(text)) return "Empathetic_Concern";
  if (/^(?:nn[,. ]*)?(?:eh|hah)\s*[?!]{2,}/.test(text)) return "Surprised";
  if (/^(?:oh|eh)\?/.test(text)) return "Mild_Surprise";
  return "Neutral";
}
