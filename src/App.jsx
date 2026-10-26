import { useEffect, useRef, useState } from "react";
import { buildChatRequest } from "./persona.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const makeId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
const timeLabel = (time) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(time instanceof Date ? time : new Date(time));

function Icon({ name }) {
  const paths = {
    peach: (
      <>
        <path
          d="M12 4.5C9.5 2.5 5 3.8 4.2 7.6c-.9 4.2 2.9 9.1 7.8 12.9 4.9-3.8 8.7-8.7 7.8-12.9C19 3.8 14.5 2.5 12 4.5Z"
          fill="currentColor"
        />
        <path
          d="M12 4.2c.6-1.5 2.1-2.4 3.8-2.2-.4 1.4-1.6 2.3-3.8 2.2Z"
          fill="currentColor"
        />
      </>
    ),
    userTab: (
      <>
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path
          d="M4 20c0-3.8 3.6-6.5 8-6.5s8 2.7 8 6.5"
          fill="currentColor"
        />
      </>
    ),
    chatTab: (
      <path
        d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-5 4V7a2 2 0 0 1 2-2Z"
        fill="currentColor"
      />
    ),
    sort: (
      <>
        <path d="M4 7h10M4 12h7M4 17h4" />
        <path d="m17 7 0 11m0 0-3-3m3 3 3-3" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    send: (
      <>
        <path d="m21 3-6 18-4-8-8-4 18-6Z" />
        <path d="m21 3-10 10" />
      </>
    ),
    history: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);

  const requestRef = useRef(null);
  const inputRef = useRef(null);
  const feedEndRef = useRef(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () =>
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${viewport?.height || window.innerHeight}px`,
      );
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      requestRef.current?.abort();
      viewport?.removeEventListener("resize", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (!panel) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel]);

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    const textToSend = input.trim();
    if (!textToSend || loading || requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 70000);
    const id = makeId();
    setError(null);
    setLoading(true);
    setPanel(null);
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id, role: "user", text: textToSend, time: new Date() },
    ]);

    try {
      const history = messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildChatRequest(textToSend, history)),
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

      const cleanReply = data.reply.trim();

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "model",
          text: cleanReply,
          time: new Date(),
        },
      ]);
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "Balasan Shiroko memakan waktu terlalu lama. Silakan coba kirim lagi."
          : "Pesan belum terkirim: " + err.message,
      );
      setInput(textToSend);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="momotalk-stage">
      <main className="momotalk-window" aria-label="MomoTalk">
        <header className="momotalk-titlebar">
          <div className="momotalk-titlebar__left">
            <span className="momotalk-peach" aria-hidden="true">
              <Icon name="peach" />
            </span>
            <h1>MomoTalk</h1>
            <button
              type="button"
              className="momotalk-help-badge"
              onClick={() => setPanel("about")}
              aria-label="Tentang AI"
              title="Tentang AI"
            >
              ?
            </button>
          </div>

          <button
            className={`settings-trigger ${panel ? "settings-trigger--active" : ""}`}
            type="button"
            onClick={() => setPanel((prev) => (prev ? null : "menu"))}
            aria-label="Buka pengaturan"
            title="Pengaturan"
          >
            <Icon name="settings" />
          </button>
        </header>

        <div className="momotalk-body">
          <aside className="momotalk-rail" aria-label="Navigasi MomoTalk">
            <div className="momotalk-rail__item" aria-hidden="true">
              <Icon name="userTab" />
            </div>
            <div className="momotalk-rail__item momotalk-rail__item--active" aria-hidden="true">
              <Icon name="chatTab" />
              <span className="momotalk-rail__badge">1</span>
            </div>
          </aside>

          <aside className="momotalk-sidebar" aria-label="Daftar kontak">
            <div className="momotalk-sidebar__toolbar">
              <span className="momotalk-sidebar__count">Chat Aktif (1)</span>
              <div className="momotalk-sidebar__filters" aria-hidden="true">
                <span className="filter-pill">Newest</span>
                <span className="filter-icon">
                  <Icon name="sort" />
                </span>
              </div>
            </div>

            <div className="momotalk-contact-list">
              <div className="momotalk-contact momotalk-contact--active">
                <div className="momotalk-contact__info">
                  <div className="momotalk-contact__row">
                    <strong>Shiroko</strong>
                    <span className="momotalk-contact__school">Abydos</span>
                  </div>
                  <p className="momotalk-contact__preview">
                    {loading
                      ? "Sedang mengetik..."
                      : lastMessage
                        ? lastMessage.text
                        : "Ketuk kolom pesan untuk mulai chat"}
                  </p>
                </div>
                {messages.length === 0 && (
                  <span className="momotalk-unread-badge">1</span>
                )}
              </div>
            </div>
          </aside>

          <section className="momotalk-chat-pane" aria-label="Ruang obrolan Shiroko">
            <div
              className="momotalk-feed"
              role="log"
              aria-live="polite"
              aria-label="Pesan MomoTalk dengan Shiroko"
            >
              {messages.length === 0 && !loading && (
                <div className="momotalk-empty">
                  <p className="momotalk-empty__title">Shiroko (Abydos)</p>
                  <p className="momotalk-empty__desc">
                    Belum ada pesan. Tulis pesan pertama dari Sensei di bawah untuk mengobrol dengan Shiroko.
                  </p>
                </div>
              )}

              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                const prev = messages[idx - 1];
                const showSenderName = !isUser && (!prev || prev.role !== "model");
                return (
                  <article
                    key={m.id}
                    className={`momo-msg ${isUser ? "momo-msg--sensei" : "momo-msg--student"}`}
                  >
                    {showSenderName && (
                      <div className="momo-msg__header">
                        <strong className="momo-msg__name">Shiroko</strong>
                        <time className="momo-msg__time">{timeLabel(m.time)}</time>
                      </div>
                    )}
                    <div
                      className={`momo-bubble ${isUser ? "momo-bubble--sensei" : "momo-bubble--student"}`}
                    >
                      <p className="momo-bubble__text">{m.text}</p>
                      {isUser && (
                        <time className="momo-bubble__time-inline">
                          {timeLabel(m.time)}
                        </time>
                      )}
                    </div>
                  </article>
                );
              })}

              {loading && (
                <article className="momo-msg momo-msg--student" role="status">
                  <div className="momo-msg__header">
                    <strong className="momo-msg__name">Shiroko</strong>
                    <span className="momo-msg__time">Mengetik…</span>
                  </div>
                  <div className="momo-bubble momo-bubble--student momo-bubble--typing">
                    <p className="momo-bubble__text">•••</p>
                  </div>
                </article>
              )}

              <div ref={feedEndRef} />
            </div>

            {error && !loading && (
              <div className="momotalk-error" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  className="momotalk-error__close"
                  onClick={() => setError(null)}
                >
                  Tutup
                </button>
              </div>
            )}

            <footer className="momotalk-composer">
              <form className="composer-form" onSubmit={handleSendMessage}>
                <textarea
                  ref={inputRef}
                  className="composer-input"
                  aria-label="Tulis pesan untuk Shiroko"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !loading) handleSendMessage(e);
                    }
                  }}
                  placeholder="Kirim pesan ke Shiroko... (Tekan Enter untuk kirim)"
                  rows={1}
                  maxLength={500}
                  disabled={loading}
                />
                <button
                  className="composer-send"
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Kirim pesan"
                >
                  <span>Kirim</span>
                  <Icon name="send" />
                </button>
              </form>
            </footer>
          </section>
        </div>
      </main>

      {panel === "menu" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="menu-title">Pengaturan</h2>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup pengaturan"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="modal-menu-list">
              <button
                type="button"
                className="modal-menu-item"
                onClick={() => setPanel("history")}
              >
                <Icon name="history" />
                <span>Riwayat Chat</span>
              </button>
              <button
                type="button"
                className="modal-menu-item"
                onClick={() => setPanel("about")}
              >
                <Icon name="info" />
                <span>Tentang AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {panel === "history" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="modal-card modal-card--wide">
            <div className="modal-header">
              <h2 id="history-title">Riwayat Chat</h2>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup riwayat"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="history-list" role="log" aria-label="Daftar riwayat pesan">
              {messages.length === 0 ? (
                <p className="history-empty">
                  Belum ada riwayat obrolan. Kirim pesan pertama kepada Shiroko untuk memulai percakapan.
                </p>
              ) : (
                messages.map((m) => (
                  <article
                    className={`history-item ${m.role === "user" ? "history-item--user" : "history-item--ai"}`}
                    key={m.id}
                  >
                    <header>
                      <strong>{m.role === "user" ? "Sensei" : "Shiroko"}</strong>
                      <time>{timeLabel(m.time)}</time>
                    </header>
                    <p>{m.text}</p>
                  </article>
                ))
              )}
            </div>
            <div className="modal-actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="modal-btn modal-btn--secondary"
                  onClick={() => setMessages([])}
                >
                  Bersihkan Chat
                </button>
              )}
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => setPanel("menu")}
              >
                Kembali
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={() => setPanel(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {panel === "about" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h2 id="about-title">Tentang AI</h2>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup info"
              >
                <Icon name="close" />
              </button>
            </div>
            <dl className="about-list">
              <div className="about-item">
                <dt>Dibuat Oleh</dt>
                <dd>Dimas Pradana (pradanadimas534)</dd>
              </div>
              <div className="about-item">
                <dt>Repositori GitHub</dt>
                <dd>
                  <a
                    href="https://github.com/pradanadimas534/chat-AI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/pradanadimas534/chat-AI
                  </a>
                </dd>
              </div>
              <div className="about-item">
                <dt>Model AI</dt>
                <dd>Google Gemini (Karakter: Sunaookami Shiroko)</dd>
              </div>
            </dl>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => setPanel("menu")}
              >
                Kembali
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={() => setPanel(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
