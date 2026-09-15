import { useEffect, useRef, useState } from "react";
import { expressions, resolveEmotion } from "./expressions.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const makeId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
const greeting = () => ({
  id: makeId(),
  role: "model",
  text: "Nn. Sensei, akhirnya datang.\nMau mengobrol sebentar denganku?",
  emotion: "neutral",
  greeting: true,
  time: new Date(),
});
const timeLabel = (time) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);

function Icon({ name }) {
  const paths = {
    chat: (
      <>
        <path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z" />
        <path d="M7 9h8M7 13h5" />
      </>
    ),
    send: (
      <>
        <path d="m21 3-6 18-4-8-8-4 18-6Z" />
        <path d="m21 3-10 10" />
      </>
    ),
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
      </>
    ),
    sparkle: (
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  const [messages, setMessages] = useState(() => [greeting()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [assetError, setAssetError] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const lastReply = [...messages].reverse().find((m) => m.role === "model");
  const emotion = preview || (loading ? "thinking" : lastReply.emotion);
  const expression = expressions[emotion];
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduced ? "instant" : "smooth",
    });
  }, [messages, loading, error]);
  useEffect(() => {
    Object.values(expressions).forEach(({ file }) => {
      const img = new Image();
      img.src = file;
    });
    return () => requestRef.current?.abort();
  }, []);
  useEffect(() => {
    setAssetError(false);
  }, [emotion]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 45000);
    const userId = makeId();
    setPreview(null);
    setError(null);
    setInput("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text, time: new Date() },
    ]);
    try {
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
        signal: controller.signal,
      });
      const data = await res.json().catch(() => {
        throw new Error("Shiroko belum bisa membalas. Coba lagi sebentar, ya.");
      });
      if (!res.ok)
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Pesan belum terkirim. Coba lagi, ya.",
        );
      if (typeof data.reply !== "string" || !data.reply.trim())
        throw new Error("Balasannya kosong. Coba kirim lagi, ya.");
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "model",
          text: data.reply,
          emotion: resolveEmotion(data),
          time: new Date(),
        },
      ]);
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "Balasannya terlalu lama. Coba kirim lagi, ya."
          : err.message,
      );
      setInput(text);
      setMessages((prev) => prev.filter((m) => m.id !== userId));
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }
  function resetChat() {
    if (requestRef.current) return;
    setMessages([greeting()]);
    setError(null);
    setInput("");
    setPreview(null);
    inputRef.current?.focus();
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="brand" href="./" aria-label="MomoTalk beranda">
          <span className="brand-icon">
            <Icon name="chat" />
          </span>
          Momo<span>Talk</span>
          <span className="edition">SHIROKO</span>
        </a>
        <div className="sensei-badge">
          <span className="sensei-avatar">S</span>
          <span>
            Halo, Sensei<small>Senang kamu di sini.</small>
          </span>
        </div>
      </header>
      <main className="talk-window">
        <section
          className={`character-stage emotion-${emotion}`}
          aria-label="Karakter Shiroko"
        >
          <div className="scene-grid" aria-hidden="true" />
          <div className="scene-heading">
            <span className="eyebrow">A LITTLE CLOSER, EVERY DAY</span>
            <h1>
              Di sini,
              <br />
              bersamamu.
            </h1>
            <p>Satu teman. Banyak cerita.</p>
          </div>
          <span className="scene-japanese" aria-hidden="true">
            シロコ
          </span>
          <div className="portrait-wrap">
            <img
              key={expression.file}
              className={`character-portrait ${assetError ? "fallback" : ""}`}
              src={assetError ? "/shiroko.webp" : expression.file}
              alt={`Shiroko — ${expression.label.toLowerCase()}`}
              onError={() => setAssetError(true)}
            />
          </div>
          <div className="mood-pill" role="status">
            <span className="mood-dot" />
            {preview ? "Pratinjau: " : ""}
            {loading && !preview ? "Sedang berpikir…" : expression.label}
          </div>
          <div className="character-card">
            <div>
              <span className="eyebrow">ABYDOS HIGH SCHOOL</span>
              <h2>
                Sunaookami Shiroko <span>砂狼シロコ</span>
              </h2>
            </div>
            <span className="character-mark" aria-hidden="true">
              <Icon name="sparkle" />
            </span>
            <p>“Nn. Aku di sini, Sensei.”</p>
          </div>
          <details className="expression-preview">
            <summary>
              Lihat ekspresi <span>＋</span>
            </summary>
            <div className="expression-options">
              <button onClick={() => setPreview(null)} aria-pressed={!preview}>
                Otomatis
              </button>
              {Object.entries(expressions)
                .filter(([key]) => key !== "thinking")
                .map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setPreview(key)}
                    aria-pressed={preview === key}
                  >
                    {value.label}
                  </button>
                ))}
            </div>
          </details>
        </section>
        <section className="conversation" aria-label="Percakapan Shiroko">
          <header className="chat-header">
            <span className="avatar">
              <img src="/shiroko.webp" alt="" />
            </span>
            <div className="chat-title">
              <h2>
                Shiroko <span>シロコ</span>
              </h2>
              <p>
                <span className="status-dot" />
                {loading ? "Sedang menulis balasan…" : "Teman ngobrolmu"}
              </p>
            </div>
            <button
              className="reset-button"
              onClick={resetChat}
              disabled={loading}
              aria-label="Mulai chat baru"
            >
              <Icon name="reset" />
              <span>Chat baru</span>
            </button>
          </header>
          <div className="chat-area" ref={scrollRef}>
            <div className="day-divider">
              <span />
              Hari ini
              <span />
            </div>
            <div className="conversation-intro">
              <Icon name="sparkle" />
              <p>Cerita apa hari ini, Sensei?</p>
              <span>Hal kecil juga boleh diceritakan.</span>
            </div>
            <div
              className="message-list"
              role="log"
              aria-live="polite"
              aria-label="Pesan"
            >
              {messages.map((m) => (
                <div key={m.id} className={`bubble-row ${m.role}`}>
                  <div className="message-content">
                    <span className="message-author">
                      {m.role === "model" ? "Shiroko" : "Kamu"}
                    </span>
                    <div className={`bubble ${m.role}`}>{m.text}</div>
                    <div className="message-meta">
                      <time dateTime={m.time.toISOString()}>
                        {timeLabel(m.time)}
                      </time>
                      {m.role === "model" && (
                        <span>{expressions[m.emotion].label}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="bubble-row model">
                  <div className="message-content">
                    <span className="message-author">Shiroko</span>
                    <div
                      className="bubble model typing"
                      aria-label="Menunggu balasan"
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div className="error-banner" role="alert">
                {error}
                <small>Pesanmu sudah dikembalikan ke kolom chat.</small>
              </div>
            )}
          </div>
          <div className="composer-wrap">
            {messages.length === 1 && !loading && (
              <div className="suggestions" aria-label="Ide obrolan">
                {["Gimana harimu, Shiroko?", "Temani aku sebentar, ya."].map(
                  (text) => (
                    <button
                      key={text}
                      onClick={() => {
                        setInput(text);
                        inputRef.current?.focus();
                      }}
                    >
                      {text}
                      <span>↗</span>
                    </button>
                  ),
                )}
              </div>
            )}
            <form className="composer" onSubmit={sendMessage}>
              <input
                ref={inputRef}
                aria-label="Pesan untuk Shiroko"
                placeholder="Tulis sesuatu untuk Shiroko…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                maxLength={6000}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Kirim pesan"
              >
                <Icon name="send" />
              </button>
            </form>
            <div className="composer-caption">
              <span>Ruang kecil untukmu dan Shiroko.</span>
              <span>Enter untuk kirim ↵</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="page-footer">
        <span>
          MOMOTALK <span> / </span> SHIROKO EDITION
        </span>
        <span>
          Just you & Shiroko. <span>✧</span>
        </span>
      </footer>
    </div>
  );
}
