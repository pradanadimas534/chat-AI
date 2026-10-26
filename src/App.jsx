import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { expressionDataset } from "./expressionDataset.js";
import { selectExpression } from "./selectExpression.js";
import { buildChatRequest } from "./persona.js";
import { paginateDialogue } from "./dialogue.js";
import { getSceneTime } from "./sceneTime.js";

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
    next: <path d="m9 5 7 7-7 7" />,
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

function Dialogue({ message, onFinished, onReply, animated }) {
  const pages = paginateDialogue(message.text, 120);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(0);
  const textRef = useRef(null);

  const content = pages[page] || { text: message.text, narration: false };
  const complete = !animated || visible >= content.text.length;

  useLayoutEffect(() => {
    if (textRef.current) textRef.current.scrollTop = 0;
  }, [page]);

  useEffect(() => {
    setVisible(0);
    if (!animated) {
      setVisible(content.text.length);
      return;
    }
    const timer = setInterval(
      () =>
        setVisible((value) => {
          if (value + 2 >= content.text.length) {
            clearInterval(timer);
            return content.text.length;
          }
          return value + 2;
        }),
      22,
    );
    return () => clearInterval(timer);
  }, [page, content.text, animated]);

  useEffect(() => {
    if (complete && page >= pages.length - 1) {
      onFinished?.();
    }
  }, [complete, page, pages.length, onFinished]);

  function advance(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!complete) {
      setVisible(content.text.length);
    } else if (page < pages.length - 1) {
      setVisible(0);
      setPage(page + 1);
    } else {
      onReply?.();
    }
  }

  const actionLabel = !complete
    ? "Ketuk untuk menampilkan semua"
    : page < pages.length - 1
      ? "Halaman berikutnya"
      : "Ketuk untuk membalas";

  return (
    <section
      className="dialogue"
      aria-label="Dialog Shiroko"
      aria-live="polite"
      onClick={advance}
    >
      <div className="dialogue__content">
        <header className="dialogue__header">
          <div className="dialogue__speaker">
            <span className="dialogue__accent-bar" aria-hidden="true" />
            <h1>Sunaookami Shiroko</h1>
            <span className="dialogue__affiliation">
              {content.narration ? "Narasi" : "Abydos · 対策委員会"}
            </span>
          </div>
          {pages.length > 1 && (
            <span className="dialogue__meta">
              {page + 1} / {pages.length}
            </span>
          )}
        </header>
        <div className="dialogue__divider" aria-hidden="true" />
        <p
          ref={textRef}
          className={`dialogue__text ${content.narration ? "narration" : ""}`}
        >
          {complete ? content.text : content.text.slice(0, visible)}
          <span className="text-cursor">{!complete ? "▍" : ""}</span>
        </p>
        <footer className="dialogue__footer">
          <span className="dialogue__hint">{actionLabel}</span>
          <button
            className="dialogue__next"
            type="button"
            onClick={advance}
            aria-label={actionLabel}
          >
            <span>{page < pages.length - 1 ? "Lanjut" : "Balas"}</span>
            <Icon name="next" />
          </button>
        </footer>
      </div>
    </section>
  );
}

export default function App() {
  const [sceneTime, setSceneTime] = useState(() => getSceneTime());
  useEffect(() => {
    const update = () => setSceneTime(getSceneTime());
    const timer = setInterval(update, 1000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assetError, setAssetError] = useState(false);
  const [panel, setPanel] = useState(null);
  const animated = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const requestRef = useRef(null);
  const inputRef = useRef(null);

  const lastReply = [...messages].reverse().find((m) => m.role === "model");
  const emotion = lastReply?.emotion || "Neutral";
  const expression = expressionDataset[emotion] || expressionDataset.Neutral;

  useEffect(() => {
    const img = new Image();
    img.src = expressionDataset.Neutral.file;
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

  useEffect(() => setAssetError(false), [emotion]);

  useEffect(() => {
    if (isReplying) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isReplying]);

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
    setIsReplying(false);
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
          emotion: selectExpression({ emotion: data.emotion, reply: cleanReply }),
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
      setIsReplying(true);
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoading(false);
    }
  }

  return (
    <main
      className={`scene novel-scene emotion-${emotion} time-${sceneTime}`}
      aria-label="Visual novel dialogue scene"
    >
      {/* Background with real-time lighting */}
      <div className="scene__background room-background" aria-hidden="true" />
      <div className="scene-shade" aria-hidden="true" />

      {/* Shiroko Character Portrait (Centered) */}
      <div className="scene__character" aria-hidden="true">
        <img
          key={`${emotion}-${lastReply?.id}`}
          className={`character-portrait ${assetError ? "fallback" : "reply-bounce"}`}
          src={expression.file}
          alt={`Ekspresi Shiroko: ${expression.label}`}
          onError={() => setAssetError(true)}
        />
      </div>

      {/* Single Compact Settings Button at Top Right */}
      <div className="scene__controls">
        <button
          className={`settings-trigger ${panel ? "settings-trigger--active" : ""}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPanel((prev) => (prev ? null : "menu"));
          }}
          aria-label="Buka pengaturan"
          title="Pengaturan"
        >
          <Icon name="settings" />
        </button>
      </div>

      {/* Interactive UI Container */}
      <div className="ui-interactive-layer">
        {/* Error notification banner if request fails */}
        {error && !loading && (
          <div className="scene-error-toast" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="toast-retry-btn"
              onClick={() => setError(null)}
            >
              Tutup
            </button>
          </div>
        )}

        {/* Bottom Docked Dialogue & Reply Panel */}
        <div className="dialogue-dock">
          {loading ? (
            <section className="dialogue waiting" aria-live="polite">
              <div className="dialogue__content">
                <header className="dialogue__header">
                  <div className="dialogue__speaker">
                    <span className="dialogue__accent-bar" aria-hidden="true" />
                    <h1>Sunaookami Shiroko</h1>
                    <span className="dialogue__affiliation">
                      Abydos · 対策委員会
                    </span>
                  </div>
                  <span className="dialogue__meta">Mengetik…</span>
                </header>
                <div className="dialogue__divider" aria-hidden="true" />
                <p className="dialogue__text">
                  Shiroko sedang memikirkan balasan…
                </p>
              </div>
            </section>
          ) : isReplying || !lastReply ? (
            <section
              className="dialogue dialogue--reply"
              aria-label="Kolom balasan Sensei"
            >
              <div className="dialogue__content">
                <header className="dialogue__header">
                  <div className="dialogue__speaker">
                    <span
                      className="dialogue__accent-bar dialogue__accent-bar--sensei"
                      aria-hidden="true"
                    />
                    <h1>Sensei</h1>
                    <span className="dialogue__affiliation">
                      Schale · Penasihat
                    </span>
                  </div>
                  <span className="dialogue__meta">{input.length}/400</span>
                </header>
                <div className="dialogue__divider" aria-hidden="true" />
                <form
                  className="dialogue__reply-form"
                  onSubmit={handleSendMessage}
                >
                  <textarea
                    ref={inputRef}
                    className="dialogue__reply-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !loading) handleSendMessage(e);
                      }
                    }}
                    placeholder="Tulis pesan untuk Shiroko di sini... (Tekan Enter untuk kirim)"
                    rows={2}
                    maxLength={400}
                    disabled={loading}
                  />
                  <div className="dialogue__reply-actions">
                    {lastReply && (
                      <button
                        type="button"
                        className="dialogue__cancel-btn"
                        onClick={() => setIsReplying(false)}
                      >
                        Lihat Dialog Shiroko
                      </button>
                    )}
                    <button
                      className="dialogue__send-btn"
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label="Kirim balasan"
                    >
                      <span>Kirim Pesan</span>
                      <Icon name="send" />
                    </button>
                  </div>
                </form>
              </div>
            </section>
          ) : (
            <Dialogue
              key={lastReply.id}
              message={lastReply}
              onReply={() => setIsReplying(true)}
              animated={animated}
            />
          )}
        </div>
      </div>

      {/* Settings Menu Modal (Only Riwayat Chat & Tentang AI) */}
      {panel === "menu" && (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="menu__card">
            <div className="modal-title-row">
              <h2 id="menu-title">Pengaturan</h2>
              <button
                className="menu-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup pengaturan"
              >
                <Icon name="close" />
              </button>
            </div>
            <button
              type="button"
              className="menu__item-btn"
              onClick={() => setPanel("history")}
            >
              <Icon name="history" />
              <span>Riwayat Chat</span>
            </button>
            <button
              type="button"
              className="menu__item-btn"
              onClick={() => setPanel("about")}
            >
              <Icon name="info" />
              <span>Tentang AI</span>
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {panel === "history" && (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="menu__card history__card">
            <div className="modal-title-row">
              <h2 id="history-title">Riwayat Chat</h2>
              <button
                className="menu-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup riwayat"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="message-list" role="log" aria-label="Pesan">
              {messages.length === 0 && !loading && (
                <p className="history-empty">
                  Belum ada riwayat obrolan. Kirim pesan pertama kepada Shiroko untuk memulai percakapan.
                </p>
              )}
              {messages.map((m) => (
                <article className={`history-message ${m.role}`} key={m.id}>
                  <header>
                    <strong>{m.role === "model" ? "Shiroko" : "Sensei"}</strong>
                    <time>{timeLabel(m.time)}</time>
                  </header>
                  <p>{m.text}</p>
                  {m.role === "model" && m.emotion && (
                    <small>
                      {(expressionDataset[m.emotion] || expressionDataset.Neutral).label}
                    </small>
                  )}
                </article>
              ))}
              {loading && (
                <p role="status" className="history-waiting">
                  Shiroko sedang memikirkan balasan…
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setPanel("menu")}>
                Kembali
              </button>
              <button type="button" className="resume-btn" onClick={() => setPanel(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About AI Modal */}
      {panel === "about" && (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="menu__card about__card">
            <div className="modal-title-row">
              <h2 id="about-title">Tentang AI</h2>
              <button
                className="menu-close-btn"
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
              <button type="button" onClick={() => setPanel("menu")}>
                Kembali
              </button>
              <button type="button" className="resume-btn" onClick={() => setPanel(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
