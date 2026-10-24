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

const INITIAL_GREETING = {
  id: "greeting-0",
  role: "model",
  text: "Nn, Sensei. Senang melihatmu. Ada yang ingin kamu bicarakan hari ini?",
  emotion: "Neutral",
  greeting: true,
  time: new Date(),
};

function Icon({ name }) {
  const paths = {
    close: <path d="m6 6 12 12M18 6 6 18" />,
    send: (
      <>
        <path d="m21 3-6 18-4-8-8-4 18-6Z" />
        <path d="m21 3-10 10" />
      </>
    ),
    chat: (
      <>
        <path d="M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 19 0Z" />
        <path d="M7 9h9M7 13h6" />
      </>
    ),
    history: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
        <path d="M12 7v5l3 2" />
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

function Dialogue({ message, onReply, animated, paused, autoPlay }) {
  const pages = paginateDialogue(message.text, 80);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(0);
  const textRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  const checkScroll = () => {
    const el = textRef.current;
    if (el) setAtBottom(el.scrollHeight - el.clientHeight - el.scrollTop < 4);
  };

  const content = pages[page] || { text: message.text, narration: false };
  const complete = !animated || visible >= content.text.length;

  useLayoutEffect(() => {
    if (textRef.current) textRef.current.scrollTop = 0;
    checkScroll();
  }, [page]);

  useLayoutEffect(checkScroll, [visible, animated, content.text]);

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
    if (!complete || !atBottom || paused) return;
    if (!autoPlay && page >= pages.length - 1) return;
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      timer = setTimeout(() => {
        if (page < pages.length - 1) {
          setVisible(0);
          setPage((current) => current + 1);
        }
      }, Math.max(2500, content.text.split(/\s+/).length * 280));
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [complete, atBottom, paused, page, pages.length, content.text, autoPlay]);

  function advance(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!complete) {
      setVisible(content.text.length);
    } else if (page < pages.length - 1) {
      setVisible(0);
      setPage(page + 1);
    } else {
      onReply();
    }
  }

  const action = !complete
    ? "Tampilkan seluruh teks"
    : page < pages.length - 1
      ? "Lanjut"
      : "Balas Shiroko";

  return (
    <section
      className="dialogue"
      aria-label="Dialog Shiroko"
      aria-live="polite"
      onClick={advance}
    >
      <img className="dialogue__panel" src="/ui/dialogue-box.png" alt="" />
      <div className="dialogue__content">
        <header className="dialogue__header">
          <h1>Sunaookami Shiroko</h1>
          <p>
            {content.narration ? "Narasi" : "Abydos High School · 対策委員会"}
            {pages.length > 1 ? ` (${page + 1}/${pages.length})` : ""}
          </p>
        </header>
        <img className="dialogue__rule" src="/ui/dialogue-rule.svg" alt="" />
        <p
          ref={textRef}
          onScroll={checkScroll}
          className={`dialogue__text ${content.narration ? "narration" : ""}`}
        >
          {complete ? content.text : content.text.slice(0, visible)}
          <span className="text-cursor">{!complete ? "▎" : ""}</span>
        </p>
      </div>
      <button
        className="dialogue__next"
        type="button"
        aria-label={action}
        onClick={advance}
      >
        <img src="/ui/dialogue-next.svg" alt="" />
      </button>
      <span className="sr-only" role="status">
        {content.text}
      </span>
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

  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assetError, setAssetError] = useState(false);
  const [panel, setPanel] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [animated, setAnimated] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const inputRef = useRef(null);
  const requestRef = useRef(null);

  const lastReply = [...messages].reverse().find((m) => m.role === "model");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
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

  async function sendMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    const text = input.trim();
    if (!text || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 70000);
    const id = makeId();
    setError(null);
    setInput("");
    setLoading(true);
    setPanel(null);
    setMessages((prev) => [
      ...prev,
      { id, role: "user", text, time: new Date() },
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
        body: JSON.stringify(buildChatRequest(text, history)),
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
          emotion: selectExpression(data),
          time: new Date(),
        },
      ]);
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "Balasannya terlalu lama. Coba kirim lagi, ya."
          : "Pesan belum terkirim. " + err.message,
      );
      setInput(text);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setPanel("compose");
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoading(false);
    }
  }

  function resetChat() {
    if (requestRef.current) return;
    setMessages([INITIAL_GREETING]);
    setError(null);
    setInput("");
    setPanel(null);
  }

  return (
    <main className={`scene novel-scene emotion-${emotion} time-${sceneTime}`} aria-label="Visual novel dialogue scene">
      {/* Dynamic Classroom Background (Kept as requested) */}
      <div className="room-background scene__background" aria-hidden="true" />
      <div className="scene-shade" aria-hidden="true" />

      {/* Shiroko Character Portrait with emotion switching (Kept as requested) */}
      <div
        key={lastReply?.id || "idle"}
        className={`scene__character character-layer ${lastReply ? "reply-bounce" : ""}`}
      >
        <img
          key={expression.file}
          className={`character-portrait ${assetError ? "fallback" : ""}`}
          src={assetError ? "/shiroko.webp" : expression.file}
          alt={`Shiroko — ${expression.label.toLowerCase()}`}
          onError={() => setAssetError(true)}
        />
      </div>

      {/* Top Right Scene Controls */}
      <div className="scene__controls" aria-label="Kontrol cerita">
        <button
          className={`scene__control ${autoPlay ? "scene__control--active" : ""}`}
          type="button"
          aria-pressed={autoPlay}
          onClick={() => setAutoPlay((prev) => !prev)}
        >
          Auto
        </button>
        <button
          className="scene__control"
          type="button"
          onClick={() => setPanel("history")}
        >
          Riwayat
        </button>
        <button
          className="scene__control"
          type="button"
          onClick={() => setPanel("menu")}
        >
          Menu
        </button>
      </div>

      {/* Visual Novel Choice Button to reply */}
      {!loading && (
        <button
          className="choice"
          type="button"
          onClick={() => setPanel("compose")}
          aria-label="Balas pesan Shiroko"
        >
          <img src="/ui/choice-box.png" alt="" />
          <span>“Balas Shiroko…”</span>
        </button>
      )}

      {/* Dialogue Box */}
      {loading ? (
        <section className="dialogue waiting" aria-live="polite">
          <img className="dialogue__panel" src="/ui/dialogue-box.png" alt="" />
          <div className="dialogue__content">
            <header className="dialogue__header">
              <h1>Sunaookami Shiroko</h1>
              <p>Abydos High School · 対策委員会</p>
            </header>
            <img className="dialogue__rule" src="/ui/dialogue-rule.svg" alt="" />
            <p className="dialogue__text">
              Shiroko sedang memikirkan balasan
              <span className="loading-dots">…</span>
            </p>
          </div>
        </section>
      ) : lastReply ? (
        <Dialogue
          key={lastReply.id}
          message={lastReply}
          onReply={() => setPanel("compose")}
          animated={animated}
          paused={panel !== null}
          autoPlay={autoPlay}
        />
      ) : null}

      {/* Compose Modal */}
      {panel === "compose" && (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="menu__card compose__card">
            <div className="modal-title-row">
              <h2 id="compose-title">Balas Shiroko</h2>
              <button
                className="menu-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={sendMessage}>
              <label className="sr-only" htmlFor="message">
                Pesan untuk Shiroko
              </label>
              <textarea
                id="message"
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesanmu, Sensei…"
                rows={4}
                maxLength={6000}
                disabled={loading}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing &&
                    !window.matchMedia("(pointer: coarse)").matches
                  ) {
                    e.preventDefault();
                    e.currentTarget.form.requestSubmit();
                  }
                }}
              />
              {error && (
                <div className="error-banner" role="alert">
                  {error}
                  <small>Drafmu tetap tersimpan. Kamu bisa kirim ulang.</small>
                </div>
              )}
              <div className="composer-footer">
                <span className="composer-hint">Shift+Enter untuk baris baru</span>
                <button
                  className="send-button"
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Kirim pesan"
                >
                  <span>Kirim</span>
                  <Icon name="send" />
                </button>
              </div>
            </form>
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
              <h2 id="history-title">Riwayat Percakapan</h2>
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
              <button type="button" onClick={() => setPanel(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
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
              <h2 id="menu-title">Menu</h2>
              <button
                className="menu-close-btn"
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Tutup menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPanel("compose")}
            >
              Balas Shiroko
            </button>
            <button
              type="button"
              onClick={() => setPanel("history")}
            >
              Riwayat Obrolan
            </button>
            <button
              type="button"
              onClick={() => setAnimated((prev) => !prev)}
            >
              Animasi Teks: {animated ? "Aktif" : "Nonaktif"}
            </button>
            <button
              type="button"
              className="danger-btn"
              onClick={() => setPanel("reset")}
            >
              Mulai Cerita Baru
            </button>
            <button
              type="button"
              className="resume-btn"
              onClick={() => setPanel(null)}
            >
              Lanjut
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {panel === "reset" && (
        <div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <div className="menu__card">
            <h2 id="reset-title">Mulai Cerita Baru?</h2>
            <p style={{ color: "#4c667c", lineHeight: "1.5" }}>
              Riwayat percakapan saat ini akan dibersihkan dan kembali ke percakapan awal.
            </p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setPanel(null)}>
                Batal
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={resetChat}
                disabled={loading}
              >
                Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
