import { useEffect, useRef, useState } from "react";
import { buildChatRequest, CHARACTERS } from "./persona.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const CHARACTER_LIST = Object.values(CHARACTERS);
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

function CharacterAvatar({ character, className }) {
  const [src, setSrc] = useState(character.avatar);
  useEffect(() => {
    setSrc(character.avatar);
  }, [character.avatar]);

  return (
    <img
      className={className}
      src={src}
      alt={`Foto profil ${character.name}`}
      onError={() => {
        if (character.fallbackAvatar && src !== character.fallbackAvatar) {
          setSrc(character.fallbackAvatar);
        }
      }}
    />
  );
}

export default function App() {
  const [activeCharId, setActiveCharId] = useState("shiroko");
  const [threads, setThreads] = useState(() =>
    Object.fromEntries(CHARACTER_LIST.map((c) => [c.id, []])),
  );
  const [input, setInput] = useState("");
  const [loadingCharId, setLoadingCharId] = useState(null);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);

  const requestRef = useRef(null);
  const inputRef = useRef(null);
  const feedEndRef = useRef(null);

  const activeChar = CHARACTERS[activeCharId] || CHARACTERS.shiroko;
  const messages = threads[activeChar.id] || [];
  const loading = loadingCharId === activeChar.id;

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
  }, [messages, loading, activeCharId]);

  useEffect(() => {
    if (!panel) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel]);

  function handleSelectCharacter(charId) {
    if (charId === activeCharId) return;
    setError(null);
    setActiveCharId(charId);
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    const textToSend = input.trim();
    if (!textToSend || loadingCharId || requestRef.current) return;

    const targetChar = activeChar;
    const currentMessages = threads[targetChar.id] || [];

    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 70000);
    const id = makeId();
    setError(null);
    setLoadingCharId(targetChar.id);
    setPanel(null);
    setInput("");

    setThreads((prev) => ({
      ...prev,
      [targetChar.id]: [
        ...(prev[targetChar.id] || []),
        { id, role: "user", text: textToSend, time: new Date() },
      ],
    }));

    try {
      const history = currentMessages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildChatRequest(textToSend, history, targetChar.id),
        ),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => {
        throw new Error(
          `${targetChar.name} belum bisa membalas. Coba lagi sebentar, ya.`,
        );
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

      setThreads((prev) => ({
        ...prev,
        [targetChar.id]: [
          ...(prev[targetChar.id] || []),
          {
            id: makeId(),
            role: "model",
            text: cleanReply,
            time: new Date(),
          },
        ],
      }));
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? `Balasan ${targetChar.name} memakan waktu terlalu lama. Silakan coba kirim lagi.`
          : "Pesan belum terkirim: " + err.message,
      );
      setInput(textToSend);
      setThreads((prev) => ({
        ...prev,
        [targetChar.id]: (prev[targetChar.id] || []).filter((m) => m.id !== id),
      }));
    } finally {
      clearTimeout(timer);
      requestRef.current = null;
      setLoadingCharId(null);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }

  const unreadCount = CHARACTER_LIST.filter(
    (c) => (threads[c.id] || []).length === 0,
  ).length;

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
        </header>

        <div className="momotalk-body">
          <aside className="momotalk-rail" aria-label="Navigasi MomoTalk">
            <button
              type="button"
              className={`momotalk-rail__item ${panel ? "momotalk-rail__item--active" : ""}`}
              onClick={() => setPanel((prev) => (prev ? null : "menu"))}
              aria-label="Buka menu pengaturan dan riwayat"
              title="Pengaturan & Riwayat"
            >
              <Icon name="userTab" />
            </button>
            <button
              type="button"
              className={`momotalk-rail__item ${!panel ? "momotalk-rail__item--active" : ""}`}
              onClick={() => setPanel(null)}
              aria-label="Ruang chat"
              title="Chat"
            >
              <Icon name="chatTab" />
              {unreadCount > 0 && (
                <span className="momotalk-rail__badge">{unreadCount}</span>
              )}
            </button>
          </aside>

          <aside className="momotalk-sidebar" aria-label="Daftar siswa">
            <div className="momotalk-sidebar__toolbar">
              <span className="momotalk-sidebar__count">
                Chat Aktif ({CHARACTER_LIST.length})
              </span>
              <div className="momotalk-sidebar__filters" aria-hidden="true">
                <span className="filter-pill">Newest</span>
                <span className="filter-icon">
                  <Icon name="sort" />
                </span>
              </div>
            </div>

            <div className="momotalk-contact-list" role="listbox" aria-label="Pilih karakter">
              {CHARACTER_LIST.map((char) => {
                const charMessages = threads[char.id] || [];
                const lastMsg = charMessages[charMessages.length - 1];
                const isSelected = char.id === activeChar.id;
                const isTyping = loadingCharId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`momotalk-contact ${isSelected ? "momotalk-contact--active" : ""}`}
                    onClick={() => handleSelectCharacter(char.id)}
                  >
                    <CharacterAvatar
                      character={char}
                      className="momotalk-contact__avatar"
                    />
                    <div className="momotalk-contact__info">
                      <div className="momotalk-contact__row">
                        <strong>{char.name}</strong>
                        <span className="momotalk-contact__school">
                          {char.school}
                        </span>
                      </div>
                      <p className="momotalk-contact__preview">
                        {isTyping
                          ? "Sedang mengetik..."
                          : lastMsg
                            ? lastMsg.text
                            : "Ketuk untuk mulai chat"}
                      </p>
                    </div>
                    {charMessages.length === 0 && (
                      <span className="momotalk-unread-badge">1</span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section
            className="momotalk-chat-pane"
            aria-label={`Ruang obrolan ${activeChar.name}`}
          >
            {/* Mobile / Tablet Character Switcher Bar */}
            <div className="momotalk-mobile-switcher" aria-label="Pilih karakter">
              {CHARACTER_LIST.map((char) => {
                const isSelected = char.id === activeChar.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    className={`mobile-char-pill ${isSelected ? "mobile-char-pill--active" : ""}`}
                    onClick={() => handleSelectCharacter(char.id)}
                  >
                    <CharacterAvatar
                      character={char}
                      className="mobile-char-pill__avatar"
                    />
                    <span>{char.name}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="momotalk-feed"
              role="log"
              aria-live="polite"
              aria-label={`Pesan MomoTalk dengan ${activeChar.name}`}
            >
              {messages.length === 0 && !loading && (
                <div className="momotalk-empty">
                  <CharacterAvatar
                    character={activeChar}
                    className="momotalk-empty__avatar"
                  />
                  <p className="momotalk-empty__title">
                    {activeChar.fullName}
                  </p>
                  <p className="momotalk-empty__sub">
                    {activeChar.affiliation}
                  </p>
                  <p className="momotalk-empty__desc">
                    Belum ada pesan. Tulis pesan pertama dari Sensei di bawah untuk mengobrol dengan {activeChar.name}.
                  </p>
                </div>
              )}

              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                const prev = messages[idx - 1];
                const isFirstInGroup = !prev || prev.role !== m.role;
                return (
                  <article
                    key={m.id}
                    className={`momo-msg ${isUser ? "momo-msg--sensei" : "momo-msg--student"}`}
                  >
                    {!isUser ? (
                      <div className="momo-msg__avatar-col">
                        {isFirstInGroup ? (
                          <CharacterAvatar
                            character={activeChar}
                            className="momo-avatar"
                          />
                        ) : (
                          <div className="momo-avatar-spacer" aria-hidden="true" />
                        )}
                      </div>
                    ) : null}

                    <div className="momo-msg__content">
                      {isFirstInGroup && (
                        <div
                          className={`momo-msg__header ${isUser ? "momo-msg__header--sensei" : ""}`}
                        >
                          <strong className="momo-msg__name">
                            {isUser ? "Sensei" : activeChar.name}
                          </strong>
                          <time className="momo-msg__time">{timeLabel(m.time)}</time>
                        </div>
                      )}
                      <div
                        className={`momo-bubble ${isUser ? "momo-bubble--sensei" : "momo-bubble--student"}`}
                      >
                        <p className="momo-bubble__text">{m.text}</p>
                      </div>
                    </div>

                    {isUser ? (
                      <div className="momo-msg__avatar-col">
                        {isFirstInGroup ? (
                          <div
                            className="momo-avatar momo-avatar--blank"
                            title="Sensei"
                            aria-label="Foto profil kosong Sensei"
                          >
                            <Icon name="userTab" />
                          </div>
                        ) : (
                          <div className="momo-avatar-spacer" aria-hidden="true" />
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}

              {loading && (
                <article className="momo-msg momo-msg--student" role="status">
                  <div className="momo-msg__avatar-col">
                    <CharacterAvatar
                      character={activeChar}
                      className="momo-avatar"
                    />
                  </div>
                  <div className="momo-msg__content">
                    <div className="momo-msg__header">
                      <strong className="momo-msg__name">{activeChar.name}</strong>
                      <span className="momo-msg__time">Mengetik…</span>
                    </div>
                    <div className="momo-bubble momo-bubble--student momo-bubble--typing">
                      <p className="momo-bubble__text">•••</p>
                    </div>
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
                  aria-label={`Tulis pesan untuk ${activeChar.name}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !loadingCharId) handleSendMessage(e);
                    }
                  }}
                  placeholder={`Kirim pesan ke (Tekan Enter untuk kirim)`}
                  rows={1}
                  maxLength={500}
                  disabled={Boolean(loadingCharId)}
                />
                <button
                  className="composer-send"
                  type="submit"
                  disabled={Boolean(loadingCharId) || !input.trim()}
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
                <span>Riwayat Chat ({activeChar.name})</span>
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
              <h2 id="history-title">Riwayat Chat · {activeChar.name}</h2>
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
                  Belum ada riwayat obrolan dengan {activeChar.name}.
                </p>
              ) : (
                messages.map((m) => (
                  <article
                    className={`history-item ${m.role === "user" ? "history-item--user" : "history-item--ai"}`}
                    key={m.id}
                  >
                    <header>
                      <strong>
                        {m.role === "user" ? "Sensei" : activeChar.name}
                      </strong>
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
                  onClick={() =>
                    setThreads((prev) => ({ ...prev, [activeChar.id]: [] }))
                  }
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
                <dd>
                  Google Gemini (Karakter: Shiroko, Shiroko Terror, Wakamo, Azusa, Mika, Serika, Ibuki, Chise & Iroha)
                </dd>
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
