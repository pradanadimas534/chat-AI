// Dynamic scene initiation and emergency fallback for Sunaookami Shiroko.
// Scene openings are generated live by the AI backend for endless variety.

export function buildOpeningPrompt(sceneTime) {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  const timeDescriptions = {
    morning: "pagi hari yang masih sejuk",
    day: "siang hari yang terik di tengah gurun",
    evening: "sore hari saat matahari terbenam keemasan di atas gurun",
    night: "malam hari yang tenang dan dingin di bawah langit bertabur bintang",
    "night-lit": "malam hari saat lampu ruang kelas Abydos menyala terang",
  };

  const period = timeDescriptions[sceneTime] || "hari ini";

  return `[ADEGAN PEMBUKA: Sensei baru saja melangkah masuk ke ruang kelas Abydos pada waktu ${period} (sekitar pukul ${timeStr}). Shiroko yang sedang berada di ruangan menyapa Sensei secara spontan dan alami berdasarkan apa yang sedang ia amati, pikirkan, atau lakukan saat ini. Sapa Sensei dan berikan 3 pilihan respon yang relevan untuk Sensei.]`;
}

// Emergency offline fallback in case the initial AI request fails
const EMERGENCY_FALLBACKS = [
  {
    text: "Nn, Sensei. Senang melihatmu mampir ke Abydos hari ini. Sedang senggang?",
    emotion: "Soft_Smile",
    choices: [
      "Iya, sengaja mampir ingin melihat keadaanmu, Shiroko.",
      "Baru saja selesai urusan di Schale, jadi langsung ke sini.",
      "Ada hal menarik apa di Abydos hari ini?",
    ],
  },
  {
    text: "Nn, Sensei... Langkah kakimu terdengar sampai ke lorong. Ada yang ingin kamu diskusikan?",
    emotion: "Neutral_Calm",
    choices: [
      "Langkah kakiku ketahuan ya? Cuma ingin menyapamu saja.",
      "Bagaimana kabar anak-anak Satgas Penanggulangan hari ini?",
      "Nn, cuma rindu mengobrol santai denganmu.",
    ],
  },
];

export function getRandomStarter(timeKey = "day") {
  const item = EMERGENCY_FALLBACKS[Math.floor(Math.random() * EMERGENCY_FALLBACKS.length)];
  return {
    id: `starter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: "model",
    text: item.text,
    emotion: item.emotion || "Neutral",
    greeting: true,
    time: new Date(),
    choices: [...item.choices],
  };
}
