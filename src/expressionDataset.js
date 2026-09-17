// Authoritative labels supplied by the user on 2026-09-17.
// Do not infer different emotions from earlier filenames or cycle variants
// with different meanings. Selection uses selectExpression.js.
const entries = [
  ["00", "Neutral", "NEUTRAL", "Netral", "Default; tenang tanpa emosi khusus."],
  ["01", "Neutral_Calm", "NEUTRAL", "Netral lembut", "Variasi idle yang sedikit lebih lembut."],
  ["02", "Mild_Surprise", "SURPRISE", "Sedikit terkejut", "Mulut o kecil; reaksi Oh? atau Eh?"],
  ["03", "Soft_Smile", "POSITIVE", "Senyum tipis", "Senang atau ramah secara halus, bukan senyum lebar."],
  ["04", "Neutral_Serious", "NEUTRAL", "Serius", "Fokus dan memperhatikan sesuatu."],
  ["05", "Annoyed", "ANGER / DISPLEASURE", "Kesal", "Ketidaksenangan ringan, bukan marah besar."],
  ["06", "Open_Mouth_Talk", "TALKING", "Bicara aktif", "Memanggil, protes, atau meninggikan suara; tidak selalu marah."],
  ["07", "Surprised", "SURPRISE", "Terkejut", "Reaksi lebih kuat dibanding Mild_Surprise."],
  ["08", "Grimace_Suppressed", "SUPPRESSED", "Menahan ketidaknyamanan", "Mata terpejam rapat dan wajah tegang; menahan sakit, malu, atau emosi. Bukan bahagia."],
  ["09", "Empathetic_Concern", "EMPATHY", "Prihatin", "Empati atau simpati terhadap keadaan lawan bicara."],
  ["10", "Uneasy_Talk", "TALKING", "Bicara ragu", "Mengeluh, ragu, bingung, atau sedikit keberatan."],
  ["11", "Displeased_Pout", "ANGER / DISPLEASURE", "Cemberut", "Ngambek atau keberatan, bukan marah agresif."],
  ["12", "Dead_Eyes_Disdain", "DEAD EYES", "Tatapan meremehkan", "Tatapan kosong dan dingin; meremehkan atau muak."],
  ["13", "Dead_Eyes_Disappointed", "DEAD EYES", "Tatapan kecewa", "Tatapan kosong; kecewa dan lelah menghadapi sesuatu."],
  ["14", "Dead_Eyes_Scoff", "DEAD EYES", "Tatapan mencibir", "Tatapan kosong dengan mulut sedikit terbuka; komentar mencibir."],
  ["15", "Sad_Worried", "SAD", "Sedih atau khawatir", "Sedih atau khawatir ringan, mata sayu dan mulut turun."],
  ["16", "Tired_Sad", "SAD", "Lelah dan murung", "Kehilangan energi atau pasrah; lebih murung dibanding Sad_Worried."],
  ["17", "Distressed_Crying", "SAD", "Tertekan atau menangis", "Emosi negatif paling kuat; hampir atau sedang menangis."],
];

export const expressionDataset = Object.fromEntries(
  entries.map(([id, name, category, label, description]) => [name, {
    id: `Shiroko_${id}`,
    file: `/expressions/Shiroko_${id}.png`,
    name, category, label, description,
    ...(category === "DEAD EYES" ? { family: "Dead_Eyes / Empty_Stare" } : {}),
  }]),
);
