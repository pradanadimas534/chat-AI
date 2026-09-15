const sprite = (id) => `/expressions/Shiroko_${id}.png`;
export const expressions = {
  neutral: { label: "Tenang", file: sprite("00") },
  happy: { label: "Senang", file: sprite("08") },
  angry: { label: "Marah", file: sprite("06") },
  sad: { label: "Sedih", file: sprite("17") },
  shy: { label: "Malu", file: sprite("09") },
  surprised: { label: "Kaget", file: sprite("07") },
  thinking: { label: "Berpikir", file: sprite("12") },
};
const aliases = {
  netral: "neutral",
  tenang: "neutral",
  senang: "happy",
  marah: "angry",
  sedih: "sad",
  malu: "shy",
  kaget: "surprised",
  terkejut: "surprised",
  berpikir: "thinking",
};
const normalize = (value) => {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  const emotion = aliases[key] || key;
  return Object.hasOwn(expressions, emotion) ? emotion : null;
};

export function resolveEmotion({ emotion, reply = "" }) {
  // Prefer the backend's contextual emotion. Legacy text inference is approximate.
  const explicit = normalize(emotion);
  if (explicit) return explicit;
  const text = reply.toLowerCase();
  const actions = text.match(/\*[^*]+\*/g)?.join(" ") || "";
  const rules = [
    [
      "angry",
      /\b(?:marah|kesal|angry|furious|mengernyit|menyipitkan mata)\b|😠|😡/u,
    ],
    [
      "sad",
      /\b(?:sedih|menangis|meneteskan air mata|terisak|kecewa|sad|crying)\b|😢|😭/u,
    ],
    ["shy", /\b(?:malu|tersipu|merona|memerah|blush(?:es|ing)?|shy)\b|😳/u],
    ["surprised", /\b(?:kaget|terkejut|terbelalak|surprised|shocked)\b|😲/u],
    [
      "happy",
      /\b(?:senang|bahagia|tersenyum|tertawa|gembira|happy|smil(?:e|es|ing))\b|😊|😄/u,
    ],
  ];
  const clean = (value) =>
    value.replace(
      /\b(?:tidak|nggak|gak|tak|bukan|jangan|not|don't)\s+(?:(?:merasa|lagi|sedang|jadi|be)\s+)?(?:marah|kesal|sedih|senang|malu|bahagia|angry|sad|happy)\b/g,
      "",
    );
  for (const [key, pattern] of rules)
    if (pattern.test(clean(actions))) return key;
  // Only infer from the speaker's mood, not mentions of the user's feelings.
  const self =
    text
      .match(
        /\b(?:aku|saya|i(?:'m| am)?)\s+(?:(?:tidak|nggak|gak|tak|not|merasa|sedang|jadi|sangat|begitu|really|feel)\s+){0,4}(?:marah|kesal|angry|furious|sedih|menangis|kecewa|sad|crying|malu|tersipu|merona|shy|kaget|terkejut|surprised|shocked|senang|bahagia|tersenyum|tertawa|gembira|happy)\b/g,
      )
      ?.join(" ") || "";
  for (const [key, pattern] of rules) if (pattern.test(clean(self))) return key;
  return "neutral";
}
