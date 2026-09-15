const sprite = (id) => `/expressions/Shiroko_${id}.png`;
// Labels follow the user's renamed assets, not inferred facial expressions.
export const expressions = {
  neutral: { label: "Netral 1", file: sprite("00") },
  neutral_alt: { label: "Netral 2", file: sprite("01") },
  talking: { label: "Sedang bicara", file: sprite("02") },
  happy: { label: "Tersenyum", file: sprite("03") },
  confused: { label: "Heran", file: sprite("04") },
  pouting: { label: "Cemberut", file: sprite("05") },
  angry: { label: "Marah sambil bicara", file: sprite("06") },
  surprised: { label: "Terkejut", file: sprite("07") },
  eyes_closed: { label: "Menutup mata", file: sprite("08") },
  sad: { label: "Sedih", file: sprite("09") },
  mildly_angry: { label: "Marah kecil", file: sprite("10") },
  annoyed: { label: "Kesal", file: sprite("11") },
  skeptical: { label: "Sinis 1", file: sprite("12") },
  skeptical_2: { label: "Sinis 2", file: sprite("13") },
  skeptical_3: { label: "Sinis 3", file: sprite("14") },
  unassigned: {
    label: "Belum ditentukan",
    file: sprite("15"),
    manualOnly: true,
  },
  crying_alt: { label: "Menangis 2", file: sprite("16") },
  crying: { label: "Menangis 1", file: sprite("17") },
  // Waiting is a UI status; no thinking sprite was chosen by the user.
  thinking: { label: "Berpikir", file: sprite("00") },
};
const aliases = {
  netral: "neutral",
  tenang: "neutral",
  "netral 1": "neutral",
  "netral 2": "neutral_alt",
  senang: "happy",
  tersenyum: "happy",
  heran: "confused",
  bingung: "confused",
  cemberut: "pouting",
  marah: "angry",
  "marah sambil ngomong": "angry",
  "marah sambil bicara": "angry",
  "marah kecil": "mildly_angry",
  kesal: "annoyed",
  "menutup mata": "eyes_closed",
  sedih: "sad",
  menangis: "crying",
  "menangis 1": "crying",
  "menangis 2": "crying_alt",
  menagis: "crying",
  "menagis part 2": "crying_alt",
  sinis: "skeptical",
  "mata sinis": "skeptical",
  "sinis part 2": "skeptical_2",
  "sinis part 3": "skeptical_3",
  "sedang bicara": "talking",
  "eskpresi saat ngomong": "talking",
  kaget: "surprised",
  terkejut: "surprised",
  tekejut: "surprised",
  berpikir: "thinking",
  // No shy sprite has been selected.
  malu: "neutral",
  shy: "neutral",
};
const normalize = (value) => {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  const emotion = Object.hasOwn(aliases, key) ? aliases[key] : key;
  return Object.hasOwn(expressions, emotion) && !expressions[emotion].manualOnly
    ? emotion
    : null;
};
const families = {
  neutral: ["neutral", "neutral_alt"],
  crying: ["crying", "crying_alt"],
  skeptical: ["skeptical", "skeptical_2", "skeptical_3"],
};
function nextVariant(emotion, previous) {
  const family = families[emotion];
  if (!family) return emotion;
  return family[(family.indexOf(previous) + 1) % family.length];
}
const rules = [
  ["crying", /\b(?:menangis|meneteskan air mata|terisak|crying)\b|😭/u],
  [
    "mildly_angry",
    /\b(?:marah kecil|sedikit marah|agak marah|mildly angry)\b/u,
  ],
  ["annoyed", /\b(?:kesal|jengkel|sebal|annoyed|irritated)\b/u],
  ["angry", /\b(?:marah|angry|furious)\b|😠|😡/u],
  ["sad", /\b(?:sedih|kecewa|sad)\b|😢/u],
  ["pouting", /\b(?:cemberut|mencemberutkan bibir|pout(?:s|ing)?)\b/u],
  ["skeptical", /\b(?:sinis|skeptis|menyipitkan mata|skeptical)\b/u],
  ["neutral", /\b(?:malu|tersipu|merona|memerah|blush(?:es|ing)?|shy)\b|😳/u],
  ["surprised", /\b(?:kaget|terkejut|terbelalak|surprised|shocked)\b|😲/u],
  ["confused", /\b(?:heran|bingung|confused|mengernyit)\b/u],
  [
    "happy",
    /\b(?:senang|bahagia|tersenyum|tertawa|gembira|happy|smil(?:e|es|ing))\b|😊|😄/u,
  ],
  [
    "eyes_closed",
    /\b(?:menutup mata|memejamkan mata|memejam|eyes closed|closes? (?:her )?eyes)\b/u,
  ],
  ["talking", /\b(?:berbicara|bicara|ngomong|talking|speaking)\b/u],
];
const clean = (value) =>
  value.replace(
    /\b(?:tidak|nggak|gak|tak|bukan|jangan|not|don't)\s+(?:(?:merasa|lagi|sedang|jadi|be|agak|sedikit|sangat)\s+){0,3}(?:marah|kesal|jengkel|sebal|sedih|senang|malu|bahagia|menangis|cemberut|sinis|skeptis|heran|bingung|kaget|terkejut|angry|sad|happy|crying|annoyed|confused|skeptical|surprised|menutup mata|memejamkan mata|berbicara)\b/g,
    "",
  );
export function resolveEmotion({ emotion, reply = "" }, previous = null) {
  // Explicit metadata is authoritative. Exact variant names never get cycled.
  const explicit = normalize(emotion);
  if (explicit) return nextVariant(explicit, previous);
  const text = typeof reply === "string" ? reply.toLowerCase() : "";
  const actions = text.match(/\*[^*]+\*/g)?.join(" ") || "";
  for (const [key, pattern] of rules)
    if (pattern.test(clean(actions))) return nextVariant(key, previous);
  // Only the speaker's feelings count, not mentions of Sensei's mood.
  const self =
    text
      .match(
        /\b(?:aku|saya|i(?:'m| am)?)\s+(?:(?:tidak|nggak|gak|tak|not|merasa|sedang|jadi|sangat|begitu|really|feel|agak|sedikit)\s+){0,4}(?:marah(?: kecil)?|kesal|jengkel|sebal|angry|furious|sedih|menangis|kecewa|sad|crying|malu|tersipu|merona|shy|kaget|terkejut|surprised|shocked|senang|bahagia|tersenyum|tertawa|gembira|happy|heran|bingung|confused|cemberut|sinis|skeptis|skeptical|annoyed|irritated)\b/g,
      )
      ?.join(" ") || "";
  for (const [key, pattern] of rules)
    if (pattern.test(clean(self))) return nextVariant(key, previous);
  return nextVariant("neutral", previous);
}
