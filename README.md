 Deploy frontend (`frontend/`)

1. Di Vercel → **Add New Project** → import repo yang sama.
2. Set **Root Directory** ke `frontend`. Framework preset otomatis terdeteksi sebagai Vite.
3. Di tab **Environment Variables**, tambahkan:
   - `VITE_API_BASE` = URL backend dari step A (contoh: `https://ai-chat-backend-xxxx.vercel.app`, **tanpa** trailing slash)
4. Deploy. Catat URL frontend-nya, misal `https://ai-chat-xxxx.vercel.app`.
5. Balik ke project **backend** di Vercel → Settings → Environment Variables → update `ALLOWED_ORIGIN` jadi URL frontend ini → Redeploy backend (supaya CORS hanya izinkan domain frontend kamu, bukan `*`).
