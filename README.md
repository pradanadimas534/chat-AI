# MomoTalk — Shiroko

> Status sementara: karakter dikunci ke **Netral 1** (Shiroko_00.png) selama pengguna memperbaiki aset. Pergantian otomatis dan menu pratinjau ekspresi dinonaktifkan; aset dan resolver tetap disimpan untuk diaktifkan lagi nanti. Animasi pantulan awal balasan tetap aktif. Bagian dokumentasi 18 ekspresi di bawah menjelaskan fitur yang sementara dinonaktifkan.

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

## Tampilan visual novel

Desain mengikuti interaksi pada video referensi pengguna: scene memenuhi layar, Shiroko di depan latar ruangan, nama pembicara dan dialog transparan di bawah. Latar saat ini adalah ruang klub Abydos versi malam; sumber ada di `public/backgrounds/SOURCES.md`. Video pengguna tidak disertakan dalam repo/deployment.

- Ketuk **Balas** untuk membuka kolom ketik. Draf dipertahankan saat ditutup atau saat request gagal.
- Balasan muncul bertahap; ketuk dialog untuk menampilkan semua teks. Narasi dalam `*...*` ditampilkan miring pada halaman tersendiri, lalu **Lanjut** membuka ucapan berikutnya. Balasan panjang dibagi menjadi beberapa halaman tanpa memotong isinya.
- **Riwayat** menampilkan seluruh pesan asli. Menu kanan atas berisi pengaturan teks bertahap, **Lihat ekspresi** (18 aset), dan **Mulai chat baru**.
- Reset meminta konfirmasi karena menghapus riwayat sesi. Semua riwayat tetap hanya di memori selama halaman terbuka.
- Reduced motion menonaktifkan teks bertahap secara default. Dialog mendukung Escape, fokus keyboard, dan tampilan responsif; ukuran kolom balas mengikuti Visual Viewport.
- Karakter masih berupa sprite dengan transisi ekspresi, bukan model Live2D atau animasi gerak bibir.

Format API, arahan kepribadian frontend, dan pemetaan 18 ekspresi dipertahankan. Pengujian UI menggunakan balasan API tiruan; tidak bergantung pada migrasi Gemini backend yang masih berada di branch terpisah.
