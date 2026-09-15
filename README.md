# MomoTalk — Shiroko

Frontend React untuk obrolan Shiroko, dengan 18 sprite ekspresi pilihan pengguna dan tampilan desktop/HP.

## Menjalankan

```sh
npm install
npm run dev
```

PowerShell: gunakan `npm.cmd` jika skrip npm dibatasi. Build: `npm run build`. Tes: `npm test`.

## Ekspresi

Buka **Lihat ekspresi** untuk mencoba semua 18 gambar tanpa mengirim chat. Pilih **Otomatis** untuk kembali ke balasan terakhir. Mengirim pesan juga mengakhiri pratinjau.

Pemetaan mengikuti nama file pengguna di `asset-review/shiroko`. Senyum memakai `tersenyum.png`, bukan `menutup mata.png`. Sedih dan menangis memakai aset berbeda. Netral, menangis, dan sinis bergantian antarvarian saat emosi tersebut muncul lagi berturut-turut. Emosi lainnya tetap memakai gambar yang sesuai; gambar tidak diacak lintas emosi.

Gambar `sya nggak tahu.png` tampil sebagai **Belum ditentukan** dan hanya bisa dipilih manual. Tidak ada aset malu/berpikir yang sudah ditentukan: `shy`/`malu` kembali ke netral; saat menunggu balasan, status berpikir juga memakai sprite netral. Sprite bicara dapat dipicu oleh tindakan `*berbicara*`; gambar ini bukan animasi gerak bibir.

## API chat

Frontend tetap mengirim `POST /api/chat` dengan `{ message, history }`. Backend berada di repo privat terpisah dan tidak diakses atau diubah dalam pengerjaan frontend ini. Proxy development di `vite.config.js` menuju `http://localhost:5000`; backend terpisah bisa memakai `VITE_API_BASE` sebelum build.

Respons lama `{ reply }` tetap didukung tanpa perubahan backend. Frontend membaca emosi dari tindakan `*cemberut*`, `*menutup mata*`, atau kalimat perasaan karakter seperti `Aku kesal`. Ini heuristik sederhana, bukan pemahaman konteks AI; teks ambigu kembali ke netral.

Metadata `emotion` opsional diutamakan bila ada, contoh:

```json
{ "reply": "Nn. Aku kesal, Sensei.", "emotion": "annoyed" }
```

Nilai tersedia: `neutral`, `neutral_alt`, `talking`, `happy`, `confused`, `pouting`, `angry`, `surprised`, `eyes_closed`, `sad`, `mildly_angry`, `annoyed`, `skeptical`, `skeptical_2`, `skeptical_3`, `crying`, `crying_alt`, serta status `thinking`. Alias bahasa Indonesia juga diterima. Emosi dasar `neutral`, `crying`, dan `skeptical` memakai rotasi varian; key varian khusus seperti `skeptical_2` memilih gambar tersebut. `unassigned` tidak digunakan otomatis.

Riwayat hanya tersimpan selama halaman terbuka. Request gagal mengembalikan draf dan tidak masuk riwayat berikutnya; batas waktu 45 detik.

## Aset

Sprite game diunduh tanpa perubahan dari [Blue Archive Wiki — Shiroko/gallery](https://bluearchive.wiki/wiki/Shiroko/gallery). Referensi pengguna: [Fandom — Sunaookami Shiroko/Gallery](https://bluearchive.fandom.com/wiki/Sunaookami_Shiroko/Gallery). Fandom meminta verifikasi browser sehingga unduhan memakai galeri wiki alternatif.

Lihat `public/expressions/SOURCES.md` untuk pemetaan lengkap dan URL setiap gambar. Aset karakter yang dipakai di UI bukan hasil generasi AI. Karakter dan artwork Blue Archive milik pemegang hak terkait.

Avatar lama: https://schaledb.com/images/student/collection/10010.webp (`public/shiroko.webp`).

## Kepribadian Shiroko

`src/persona.js` memberi arahan karakter berdasarkan bagian Profile/Personality dari referensi Fandom di atas: tenang dan lembut, peduli teman/Abydos, antusias olahraga, dengan humor datar dan reaksi cemberut yang sesuai konteks. Pilihan bahasa Indonesia, panjang jawaban, serta penanda tindakan merupakan adaptasi untuk aplikasi ini.

Frontend menyertakan arahan ini di dalam field `message` setiap request, diikuti pesan asli dalam format string JSON. Tampilan pesan, draf, dan riwayat frontend tetap memakai teks asli Sensei. Tidak ada field API atau role baru, dan repo backend tidak diakses. Penanda tindakan seperti `*tersenyum*` dapat memicu ekspresi yang sudah ada.

Ini arahan pada tingkat pesan pengguna, bukan perubahan system prompt backend. Efektivitasnya bergantung pada instruksi, pembatasan panjang, dan pemrosesan pesan di backend. Payload sedikit lebih panjang pada setiap request. Tes lokal memverifikasi pengiriman arahan dan integritas riwayat menggunakan respons tiruan; kesetiaan kepribadian dari model live belum diverifikasi.
