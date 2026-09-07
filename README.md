# MomoTalk — Shiroko

Frontend React dengan desain terinspirasi MomoChat, khusus satu karakter: Shiroko.

## Menjalankan

```sh
npm install
npm run dev
```

Build produksi: `npm run build`. Pada PowerShell yang membatasi skrip, gunakan `npm.cmd`.

## API chat

Frontend mengirim `POST /api/chat` dengan `{ message, history }` dan mengharapkan `{ reply }`. Lihat `vite.config.js` untuk proxy backend lokal. Untuk backend terpisah, atur `VITE_API_BASE` sebelum build.

Backend tidak disertakan. Persona balasan Shiroko perlu diatur pada system prompt backend; perubahan ini mengatur desain, profil, dan sapaan awal. Riwayat disimpan selama halaman terbuka dan dapat dibersihkan lewat tombol Chat baru.

## Referensi

- Referensi tampilan: https://www.momochat.app/
- Gambar Shiroko: https://schaledb.com/images/student/collection/10010.webp (disimpan di `public/shiroko.webp`). Karakter Blue Archive milik pemegang hak terkait.
