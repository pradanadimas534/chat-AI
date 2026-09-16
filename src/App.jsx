import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { expressions } from "./expressions.js";
import { buildChatRequest } from "./persona.js";
import { paginateDialogue } from "./dialogue.js";

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
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
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
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Modal({ title, kind, onClose, children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useLayoutEffect(() => {
    const modal = ref.current;
    const previous = document.activeElement;
    modal.showModal();
    modal.querySelector("[data-autofocus]")?.focus();
    return () => {
      modal.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${kind}`}
      aria-labelledby={`${kind}-title`}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <div className="modal-surface">
        <header className="modal-header">
          <h2 id={`${kind}-title`}>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

function Dialogue({ message, onReply, animated }) {
  const pages = paginateDialogue(message.text);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(0);
  const content = pages[page];
  const complete = !animated || visible >= content.text.length;
  useEffect(() => {
    setVisible(0);
    if (!animated) return;
    const timer = setInterval(
      () =>
        setVisible((value) => {
          if (value + 2 >= content.text.length) clearInterval(timer);
          return Math.min(value + 2, content.text.length);
        }),
      22,
    );
    return () => clearInterval(timer);
  }, [page, content.text, animated]);
  function advance() {
    if (!complete) setVisible(content.text.length);
    else if (page < pages.length - 1) {
      setVisible(0);
      setPage(page + 1);
    } else onReply();
  }
  const action = !complete
    ? "Tampilkan seluruh teks"
    : page < pages.length - 1
      ? "Lanjut"
      : "Balas Shiroko";
  return (
    <section className="dialogue" aria-label="Dialog Shiroko">
      <div className="speaker-name">
        Sunaookami Shiroko<span>砂狼シロコ</span>
      </div>
      <button
        className={`dialogue-box ${content.narration ? "narration" : ""}`}
        onClick={advance}
        aria-label={action}
      >
        <span className="dialogue-text" aria-hidden="true">
          {complete ? content.text : content.text.slice(0, visible)}
          <span className="text-cursor">{!complete ? "▎" : ""}</span>
        </span>
        <span className="dialogue-bottom">
          <span>
            {content.narration ? "Narasi" : "Shiroko"}
            {pages.length > 1 ? ` · ${page + 1}/${pages.length}` : ""}
          </span>
          <span>
            {!complete
              ? "Ketuk untuk tampilkan semua"
              : page < pages.length - 1
                ? "Lanjut"
                : "Balas"}
            <Icon name="next" />
          </span>
        </span>
      </button>
      <span className="sr-only" role="status">
        {content.text}
      </span>
    </section>
  );
}

export default function App() {
  const [messages, setMessages] = useState(() => [greeting()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assetError, setAssetError] = useState(false);
  const [panel, setPanel] = useState(null);
  const [animated, setAnimated] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const lastReply = [...messages].reverse().find((m) => m.role === "model");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  // Temporarily fixed while the expression assets are being reviewed.
  const emotion = "neutral";
  const expression = expressions[emotion];
  useEffect(() => {
    const img = new Image();
    img.src = expressions.neutral.file;
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
    e.preventDefault();
    const text = input.trim();
    if (!text || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 45000);
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
          emotion: "neutral",
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
    setMessages([greeting()]);
    setError(null);
    setInput("");
    setPanel(null);
  }

  return (
    <main className={`novel-scene emotion-${emotion}`}>
      <div className="room-background" aria-hidden="true" />
      <div className="scene-shade" aria-hidden="true" />
      <div
        key={lastReply.id}
        className={`character-layer ${lastReply.greeting ? "" : "reply-bounce"}`}
      >
        <img
          key={expression.file}
          className={`character-portrait ${assetError ? "fallback" : ""}`}
          src={assetError ? "/shiroko.webp" : expression.file}
          alt={`Shiroko — ${expression.label.toLowerCase()}`}
          onError={() => setAssetError(true)}
        />
      </div>
      <header className="scene-header">
        <div className="scene-brand">
          Momo<span>Talk</span>
          <small>SHIROKO · ABYDOS</small>
        </div>
        <button
          className="menu-button"
          aria-label="Buka menu"
          onClick={() => setPanel("menu")}
        >
          <Icon name="menu" />
        </button>
      </header>
      <div className="scene-location">
        <span />
        Ruang klub · Abydos
      </div>
      <div className="scene-bottom">
        {lastUser && (
          <button className="last-message" onClick={() => setPanel("history")}>
            <span>Sensei</span>
            <span>{lastUser.text}</span>
          </button>
        )}
        {loading ? (
          <section className="dialogue waiting" role="status">
            <div className="speaker-name">Shiroko</div>
            <div className="dialogue-box">
              <p>
                Shiroko sedang memikirkan balasan
                <span className="loading-dots">…</span>
              </p>
            </div>
          </section>
        ) : (
          <Dialogue
            key={lastReply.id}
            message={lastReply}
            onReply={() => setPanel("compose")}
            animated={animated}
          />
        )}
        <nav className="scene-controls" aria-label="Kontrol obrolan">
          <button onClick={() => setPanel("history")}>
            <Icon name="history" />
            Riwayat
          </button>
          <span className="mood-label">{expression.label}</span>
          <button
            className="reply-button"
            onClick={() => setPanel("compose")}
            disabled={loading}
          >
            <Icon name="chat" />
            Balas
          </button>
        </nav>
      </div>

      {panel === "compose" && (
        <Modal
          title="Balas Shiroko"
          kind="compose-modal"
          onClose={() => setPanel(null)}
        >
          <form onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="message">
              Pesan untuk Shiroko
            </label>
            <textarea
              id="message"
              ref={inputRef}
              data-autofocus
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
              <span>Obrolan kecil, cerita baru.</span>
              <button
                className="send-button"
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Kirim pesan"
              >
                <Icon name="send" />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {panel === "menu" && (
        <Modal
          title="Ruang obrolan"
          kind="menu-modal"
          onClose={() => setPanel(null)}
        >
          <p className="menu-caption">Hanya kamu dan Shiroko.</p>
          <div className="menu-actions">
            <button onClick={() => setPanel("history")}>
              <Icon name="history" />
              Riwayat percakapan
              <Icon name="next" />
            </button>
            <label className="motion-setting">
              <span>Teks muncul bertahap</span>
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
              />
            </label>
          </div>
          <button
            className="reset-button"
            onClick={() => setPanel("reset")}
            disabled={loading}
          >
            Mulai chat baru
          </button>
          <p className="menu-footnote">MomoTalk / Shiroko edition</p>
        </Modal>
      )}
      {panel === "history" && (
        <Modal
          title="Riwayat percakapan"
          kind="history-modal"
          onClose={() => setPanel(null)}
        >
          <div className="message-list" role="log" aria-label="Pesan">
            {messages.map((m) => (
              <article className={`history-message ${m.role}`} key={m.id}>
                <header>
                  <strong>{m.role === "model" ? "Shiroko" : "Sensei"}</strong>
                  <time>{timeLabel(m.time)}</time>
                </header>
                <p>{m.text}</p>
                {m.role === "model" && (
                  <small>{expressions[m.emotion].label}</small>
                )}
              </article>
            ))}
            {loading && <p role="status">Shiroko sedang menulis…</p>}
          </div>
        </Modal>
      )}
      {panel === "reset" && (
        <Modal
          title="Mulai cerita baru?"
          kind="reset-modal"
          onClose={() => setPanel(null)}
        >
          <p>Riwayat percakapan saat ini akan dibersihkan.</p>
          <div className="confirm-actions">
            <button onClick={() => setPanel(null)}>Kembali</button>
            <button onClick={resetChat} disabled={loading}>
              Mulai chat baru
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
