import { useEffect, useRef, useState } from "react";

// Saat development lokal, biarkan kosong ("") — Vite proxy meneruskan
// /api ke backend lokal (lihat vite.config.js). Saat production/Vercel,
// isi VITE_API_BASE di .env dengan URL backend Vercel kamu.
const API_BASE = import.meta.env.VITE_API_BASE || "";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: makeId(),
      role: "model",
      greeting: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { id: makeId(), role: "user", text }]);
    setLoading(true);

    try {
      // Backend bersifat stateless (cocok untuk serverless/Vercel), jadi
      // kirim seluruh riwayat percakapan sejauh ini setiap request.
      const history = messages
        .filter((m) => !m.greeting)
        .map((m) => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text,
        }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan pada server");
      }

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "model", text: data.reply },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    // Backend stateless — riwayat percakapan hanya ada di state React ini,
    // jadi reset cukup bersihkan di sisi frontend, tidak perlu call API.
    setMessages([
      {
        id: makeId(),
        role: "model",
        text: "Riwayat chat sudah direset. Mulai percakapan baru!",
        greeting: true,
      },
    ]);
    setError(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-title">
          <span className="dot" />
          <h1>AI Chat</h1>
        </div>
        <button className="reset-btn" onClick={resetChat} type="button">
          Reset
        </button>
      </header>

      <main className="chat-area" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`bubble-row ${m.role}`}>
            <div className={`bubble ${m.role}`}>{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="bubble-row model">
            <div className="bubble model typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {error && <div className="error-banner">Error: {error}</div>}
      </main>

      <form className="composer" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Kirim
        </button>
      </form>
    </div>
  );
}
