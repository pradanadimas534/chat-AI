# MomoTalk — Shiroko

Frontend React untuk obrolan satu karakter. Shiroko tampil besar dengan sprite ekspresi yang mengikuti balasan chat; tampilan menyesuaikan desktop dan HP.

## Menjalankan

```sh
npm install
npm run dev
```

PowerShell: gunakan `npm.cmd` jika skrip npm dibatasi. Build: `npm run build`.

## Ekspresi

Buka **Lihat ekspresi** untuk mencoba Tenang, Senang, Marah, Sedih, Malu, dan Kaget tanpa backend. Pilih **Otomatis** untuk kembali ke suasana balasan terakhir. Mengirim pesan juga mengakhiri pratinjau. Saat menunggu respons, karakter menampilkan ekspresi berpikir.

## API chat

Frontend tetap mengirim `POST /api/chat` dengan `{ message, history }`. Backend tidak disertakan. Proxy development di `vite.config.js` menuju `http://localhost:5000`; backend terpisah bisa memakai `VITE_API_BASE` sebelum build.

Respons yang disarankan:

```json
{ "reply": "Nn. Aku kesal, Sensei.", "emotion": "angry" }
```

Nilai `emotion`: `neutral`, `happy`, `angry`, `sad`, `shy`, `surprised`, atau `thinking`. Alias bahasa Indonesia juga diterima. Backend sebaiknya memilih emosi Shiroko berdasarkan konteks percakapan dan mengembalikannya bersama balasan. Metadata valid selalu diutamakan.

Respons lama `{ reply }` tetap didukung. Frontend mencoba membaca emosi dari tindakan `*tersenyum*` atau kalimat perasaan karakter. Ini heuristik sederhana, bukan pemahaman konteks AI; teks ambigu kembali ke netral. Riwayat hanya tersimpan selama halaman terbuka. Request gagal mengembalikan draf dan tidak masuk riwayat berikutnya; batas waktu 45 detik.

## Aset

Sprite game diunduh tanpa perubahan dari [Blue Archive Wiki — Shiroko/gallery](https://bluearchive.wiki/wiki/Shiroko/gallery). Referensi pengguna: [Fandom — Sunaookami Shiroko/Gallery](https://bluearchive.fandom.com/wiki/Sunaookami_Shiroko/Gallery). Fandom meminta verifikasi browser sehingga unduhan memakai galeri wiki alternatif.

Lihat `public/expressions/SOURCES.md` untuk asal dan pemetaan tiap sprite. Aset karakter yang dipakai di UI bukan hasil generasi AI. Karakter dan artwork Blue Archive milik pemegang hak terkait.

Avatar lama: https://schaledb.com/images/student/collection/10010.webp (`public/shiroko.webp`).
