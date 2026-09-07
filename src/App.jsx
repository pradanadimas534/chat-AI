import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const greeting = () => ({ id: makeId(), role: "model", text: "Nn. Sensei, akhirnya datang.\nMau mengobrol sebentar denganku?", greeting: true, time: new Date() });
const timeLabel = (time) => new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(time);

function Icon({ name }) {
  const paths = {
    chat: <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2V11.5A8.5 8.5 0 0 1 9.5 3h3a8.5 8.5 0 0 1 8.5 8.5Z" /><path d="M7 10h8M7 14h5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    arrow: <path d="m14 6-6 6 6 6" />,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="m22 2-11 11" /></>,
    reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Avatar({ large = false }) {
  return <span className={`avatar ${large ? "large" : ""}`}><img src="/shiroko.webp" alt="Shiroko" /></span>;
}

export default function App() {
  const [messages, setMessages] = useState(() => [greeting()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("messages");
  const [mobileChat, setMobileChat] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError(null); setInput("");
    setMessages((prev) => [...prev, { id: makeId(), role: "user", text, time: new Date() }]);
    setLoading(true);
    try {
      const history = messages.filter((m) => !m.greeting).map((m) => ({ role: m.role === "model" ? "assistant" : "user", content: m.text }));
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json().catch(() => { throw new Error("Server chat belum tersedia. Coba lagi sebentar, Sensei."); });
      if (!res.ok) throw new Error(data.error || "Pesan belum berhasil dikirim. Silakan coba lagi.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Balasan kosong. Silakan coba lagi.");
      setMessages((prev) => [...prev, { id: makeId(), role: "model", text: data.reply, time: new Date() }]);
    } catch (err) {
      setError(err.message); setInput(text);
      setMessages((prev) => prev.slice(0, -1));
    } finally { setLoading(false); }
  }
  function resetChat() {
    if (loading) return;
    setMessages([greeting()]); setError(null); setInput(""); inputRef.current?.focus();
  }

  return <div className="app-shell">
    <header className="masthead">
      <a className="brand" href="./" aria-label="MomoTalk beranda"><span className="brand-icon"><Icon name="chat" /></span><span>Momo<span className="brand-light">Talk</span><small>Just you & Shiroko.</small></span></a>
      <div className="sensei-badge"><span className="sensei-avatar">S</span><div>Sensei<small>Selamat datang kembali</small></div><span className="sparkle">✦</span></div>
    </header>
    <main className={`talk-window ${mobileChat ? "show-chat" : ""}`}>
      <nav className="rail" aria-label="Navigasi utama">
        <span className="rail-logo"><Icon name="chat" /></span>
        <button className={`rail-button ${tab === "students" ? "active" : ""}`} onClick={() => { setTab("students"); setMobileChat(false); }} aria-pressed={tab === "students"}><Icon name="user" /><span>Students</span></button>
        <button className={`rail-button ${tab === "messages" ? "active" : ""}`} onClick={() => { setTab("messages"); setMobileChat(false); }} aria-pressed={tab === "messages"}><Icon name="chat" /><span>Messages</span></button>
        <span className="rail-bottom">モモ<br />トーク</span>
      </nav>
      <aside className="student-panel">
        <div className="list-heading"><h1>{tab === "students" ? "Students" : "Messages"}<span>1</span></h1><p>{tab === "students" ? "Teman dari Akademi Abydos" : "Cerita kecil, setiap hari."}</p></div>
        <div className="list-label">{tab === "students" ? "SEMUA STUDENT" : "PERCAKAPAN"}</div>
        <button className="student-card" onClick={() => setMobileChat(true)} aria-label="Buka percakapan dengan Shiroko"><Avatar /><span className="student-copy"><span className="student-name">Shiroko <span className="pink-dot" /></span><span className="preview">{tab === "students" ? "Sunaookami Shiroko" : messages[messages.length - 1].text}</span><span className="school">ABYDOS</span></span></button>
        <div className="sidebar-note"><Icon name="heart" /><p>Satu teman.<br /><strong>Banyak cerita.</strong></p><span>Ruang kecil untukmu dan Shiroko.</span></div>
        <div className="sidebar-footer"><span className="status-dot" /> Hanya Shiroko, selalu.</div>
      </aside>
      <section className="conversation" aria-label="Percakapan Shiroko">
        <header className="chat-header"><button className="back-button" onClick={() => setMobileChat(false)} aria-label="Kembali ke daftar"><Icon name="arrow" /></button><Avatar /><div className="chat-title"><h2>Shiroko <span>シロコ</span></h2><p>SMA Abydos <span>·</span> Foreclosure Task Force</p></div><button className="reset-button" onClick={resetChat} disabled={loading} aria-label="Mulai chat baru"><Icon name="reset" /><span>Chat baru</span></button></header>
        <div className="chat-area" ref={scrollRef}>
          <div className="profile-intro"><div className="halo" /><Avatar large /><h3>Sunaookami Shiroko</h3><p>砂狼シロコ <span>·</span> Abydos</p><span className="profile-tag">“Nn. Aku di sini, Sensei.”</span></div>
          <div className="day-divider"><span />Hari ini<span /></div>
          <div className="message-list" role="log" aria-live="polite" aria-label="Pesan">
            {messages.map((m) => <div key={m.id} className={`bubble-row ${m.role}`}>
              {m.role === "model" && <Avatar />}
              <div className="message-content">{m.role === "model" && <span className="message-author">Shiroko</span>}<div className={`bubble ${m.role}`}>{m.text}</div><time className="message-time">{timeLabel(m.time)}</time></div>
            </div>)}
            {loading && <div className="bubble-row model"><Avatar /><div className="message-content"><span className="message-author">Shiroko sedang mengetik...</span><div className="bubble model typing" aria-label="Menunggu balasan"><span /><span /><span /></div></div></div>}
          </div>
          {error && <div className="error-banner" role="alert">{error}</div>}
        </div>
        <div className="composer-wrap"><form className="composer" onSubmit={sendMessage}><input ref={inputRef} aria-label="Pesan untuk Shiroko" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pesan untuk Shiroko..." disabled={loading} /><button type="submit" disabled={loading || !input.trim()} aria-label="Kirim pesan"><Icon name="send" /></button></form><div className="composer-caption"><span>Obrolan kecil bisa jadi hal yang berarti.</span><span>Enter untuk kirim ↵</span></div></div>
      </section>
    </main>
    <footer className="page-footer"><span>MOMO<span className="footer-heart">♡</span>TALK</span> A little closer, one message at a time.<span>SHIROKO EDITION</span></footer>
  </div>;
}
