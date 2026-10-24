// Dynamic starters for Sunaookami Shiroko based on scene time and spontaneous moments.
// Breaks repetitive templates by providing immersive in-game visual novel opening scenarios.

const STARTERS = {
  morning: [
    {
      text: "Nn, Sensei. Selamat pagi. Aku baru saja selesai jogging 10 kilometer mengelilingi Abydos. Udara pagi masih segar... Sensei sudah sarapan?",
      emotion: "Soft_Smile",
      choices: [
        "Selamat pagi, Shiroko. Jangan langsung duduk, minum air dulu.",
        "Jam segini sudah selesai 10 km?! Staminamu luar biasa...",
        "Belum sarapan nih. Mau cari sarapan bareng di sekitar sini?",
      ],
    },
    {
      text: "Nn. Matahari pagi di gurun mulai naik. Tadi aku mengecek rantai dan ban sepeda road bike-ku, semuanya dalam kondisi prima. Hari ini Sensei ada waktu luang?",
      emotion: "Neutral_Calm",
      choices: [
        "Ada kok. Mau mengajakku sepedaan pagi ini?",
        "Kondisi sepedamu selalu terawat rapi ya, Shiroko.",
        "Melihatmu bersemangat di pagi hari begini bikin ikut senang.",
      ],
    },
    {
      text: "Nn, Sensei... Matamu masih terlihat mengantuk. Tadi malam begadang menyelesaikan dokumen Schale lagi ya?",
      emotion: "Empathetic_Concern",
      choices: [
        "Sedikit lembur semalam... Tapi melihatmu langsung segar lagi.",
        "Iya nih, dokumen di kantor Schale menumpuk sekali.",
        "Kelihatan jelas ya? Nanti siang aku sempatkan tidur sebentar.",
      ],
    },
  ],
  day: [
    {
      text: "Nn, Sensei. Di luar panasnya bukan main, pasir gurun sampai terasa membakar. Masuklah ke dalam ruangan, AC-nya sudah kunyalakan.",
      emotion: "Neutral_Calm",
      choices: [
        "Wah, syukurlah... Di luar terik sekali sampai kepalaku pusing.",
        "Terima kasih, Shiroko. Kamu sendiri sedang apa sendirian di sini?",
        "Aku sengaja mampir membawakan minuman dingin untuk anak-anak Abydos.",
      ],
    },
    {
      text: "Nn. Tadi Serika mengeluh soal kas Abydos lagi, lalu Hoshino-senpai malah tertidur pulas di sofa. Suasana ruang klub seperti biasa.",
      emotion: "Neutral",
      choices: [
        "Haha, dinamika anak-anak Abydos memang selalu ramai dan hangat.",
        "Hoshino tidur lagi? Mau kita jahili pelan-pelan?",
        "Jangan khawatir soal kas, Sensei akan bantu sebisa mungkin.",
      ],
    },
    {
      text: "Nn, Sensei. Aku sedang memeriksa peta rute jalanan lama Abydos... Ada beberapa rute menarik yang belum pernah kita lewati.",
      emotion: "Neutral_Serious",
      choices: [
        "Coba kulihat petanya. Rute ke arah reruntuhan gurun?",
        "Boleh, kapan-kapan temani aku menjelajahi rute itu.",
        "Jangan sendirian ke area terpencil ya, ajak aku atau teman-teman.",
      ],
    },
  ],
  evening: [
    {
      text: "Nn, Sensei. Sesi latihan sepedaku sore ini baru saja selesai. Langit senja di atas gurun warnanya cantik sekali, merah keemasan... Mau melihatnya dari atap?",
      emotion: "Soft_Smile",
      choices: [
        "Pemandangan senja Abydos dari atap... Ide bagus, ayo naik bersama.",
        "Kerja bagus untuk latihan sepedanya hari ini, Shiroko.",
        "Boleh, tapi angin gurun saat sore cukup kencang. Pakai jaketmu ya.",
      ],
    },
    {
      text: "Nn... Sensei kelihatan lelah sekali setelah seharian beraktivitas. Duduklah di sini, biar kutemani sampai jam istirahatmu selesai.",
      emotion: "Empathetic_Concern",
      choices: [
        "Terima kasih, Shiroko. Duduk di sebelahmu rasanya menenangkan.",
        "Iya, hari ini tugas dari Schale cukup menguras tenaga.",
        "Kamu sendiri tidak capek setelah latihan seharian?",
      ],
    },
    {
      text: "Nn, Sensei. Matahari sudah mulai tenggelam. Sebentar lagi jalanan gurun akan gelap dan suhunya turun drastis. Mau kuantar pulang?",
      emotion: "Neutral_Calm",
      choices: [
        "Nn, diantar murid Abydos yang paling jago bersepeda? Tentu saja mau.",
        "Tidak usah repot-repot, nanti kamu pulangnya sendirian kemalaman.",
        "Boleh, sekalian kita jalan santai menikmati angin malam.",
      ],
    },
  ],
  night: [
    {
      text: "Nn, Sensei... Jam segini belum pulang ke kantor Schale? Di luar sudah sepi dan langit gurun Abydos dipenuhi bintang.",
      emotion: "Neutral_Calm",
      choices: [
        "Tadi pekerjaanku baru beres, jadi aku mampir mengecek keadaanmu.",
        "Langit malam di Abydos memang selalu penuh bintang ya.",
        "Sensei masih kangen dan ingin ngobrol denganmu sebentar.",
      ],
    },
    {
      text: "Nn. Malam-malam begini suasana ruang kelas Abydos sunyi sekali. Aku sedang merawat White Fang dan drone patroli... Ada yang ingin kamu bicarakan, Sensei?",
      emotion: "Neutral_Serious",
      choices: [
        "Tidak ada hal gawat kok, cuma ingin menyapamu sebelum tidur.",
        "Senjata dan dronemu selalu kamu rawat dengan teliti ya.",
        "Jangan begadang terlalu larut ya, Shiroko. Besok kamu ada latihan.",
      ],
    },
    {
      text: "Nn, Sensei. Kalau malam hari begini hawa gurun jadi dingin sekali. Jangan sampai masuk angin, ya.",
      emotion: "Empathetic_Concern",
      choices: [
        "Terima kasih perhatiannya, Shiroko. Kamu juga jangan kedinginan.",
        "Hangat kok kalau berada di dekatmu begini.",
        "Sensei bawa jaket tebal kok, aman.",
      ],
    },
  ],
  special: [
    {
      text: "Nn, Sensei... Tadi saat patroli di perbatasan distrik, aku menemukan denah bangunan tua bekas brankas bank... topeng ski di tasku juga masih siap.",
      emotion: "Neutral_Serious",
      choices: [
        "T-tunggu dulu, kenapa topeng ski-nya selalu siap di dalam tasmu?!",
        "Shiroko, kita tidak akan merampok bank... simpan petanya!",
        "Haha, matamu langsung berbinar-binar kalau urusan rencana taktis ya.",
      ],
    },
    {
      text: "Nn, Sensei. Tadi Ayane memberitahuku ada kafe baru yang buka di dekat distrik sebelah. Katanya menu minumannya enak... Mau coba ke sana kapan-kapan?",
      emotion: "Mild_Surprise",
      choices: [
        "Wah, ide bagus! Kita jadwalkan akhir pekan ini ya.",
        "Tentu saja mau. Kamu suka minuman manis juga ternyata?",
        "Ajak anak-anak Abydos sekalian, biar makin seru.",
      ],
    },
  ],
};

let lastPickedIndex = -1;

export function getRandomStarter(timeKey = "day") {
  const normalizedKey = timeKey.startsWith("time-")
    ? timeKey.replace("time-", "")
    : timeKey;

  let pool = STARTERS[normalizedKey];
  if (!pool || pool.length === 0) {
    if (normalizedKey.includes("night")) pool = STARTERS.night;
    else pool = STARTERS.day;
  }

  // 25% chance to inject a quirky/special character moment
  const candidatePool = Math.random() < 0.25 ? STARTERS.special : pool;

  // Avoid repeating the exact same starter back-to-back
  let idx = Math.floor(Math.random() * candidatePool.length);
  if (candidatePool.length > 1 && idx === lastPickedIndex) {
    idx = (idx + 1) % candidatePool.length;
  }
  lastPickedIndex = idx;

  const item = candidatePool[idx];
  return {
    id: `greeting-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role: "model",
    text: item.text,
    emotion: item.emotion || "Neutral",
    greeting: true,
    time: new Date(),
    choices: [...item.choices],
  };
}
