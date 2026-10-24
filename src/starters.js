// Dynamic scene initiation and emergency fallback for Sunaookami Shiroko.
// Scene openings are generated live by the AI backend with at most 2 choices.

export function buildOpeningPrompt(sceneTime) {
  const timeDescriptions = {
    morning: "pagi hari",
    day: "siang hari",
    evening: "sore hari",
    night: "malam hari",
    "night-lit": "larut malam",
  };

  const period = timeDescriptions[sceneTime] || "hari ini";

  return `Sebagai Shiroko di Abydos pada waktu ${period}, mulailah percakapan baru dengan Sensei secara bebas, alami, dan cerdas. Kamu bebas menentukan sendiri topik pembuka: apa yang sedang kamu pikirkan, amati, rencanakan, atau ingin kamu bicarakan bersama Sensei tanpa terpaku pada skenario kaku atau template tertentu.

Setelah menyusun perkataan Shiroko, baca kembali apa yang kamu katakan, lalu berikan 1 sampai 2 pilihan balasan untuk Sensei (maksimal 2 pilihan) yang nyambung dengan dialogmu:
[Pilihan]
1. (Pilihan respon Sensei A)
2. (Pilihan respon Sensei B - opsional)`;
}

// Emergency offline fallback in case the initial AI request fails (1-2 choices)
const EMERGENCY_FALLBACKS = [
  {
    text: "Nn, Sensei. Senang melihatmu mampir ke Abydos hari ini. Sedang senggang?",
    emotion: "Soft_Smile",
    choices: [
      "Iya, sengaja mampir ingin melihat keadaanmu, Shiroko.",
      "Ada hal menarik apa di Abydos hari ini?",
    ],
  },
  {
    text: "Nn, Sensei... Langkah kakimu terdengar sampai ke lorong. Ada yang ingin kamu diskusikan?",
    emotion: "Neutral_Calm",
    choices: [
      "Langkah kakiku ketahuan ya? Cuma ingin menyapamu saja.",
      "Bagaimana kabar anak-anak Satgas Penanggulangan hari ini?",
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
