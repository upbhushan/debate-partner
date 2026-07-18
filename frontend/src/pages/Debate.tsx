import { useEffect, useRef, useState } from "react";
import { takeTurn, type DebateInfo } from "../lib/api";

type Msg = { speaker: "user" | "ai"; content: string };

export default function Debate({
  debate,
  onExit,
}: {
  debate: DebateInfo;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const arg = input.trim();
    if (!arg || loading) return;
    setMessages((m) => [...m, { speaker: "user", content: arg }]);
    setInput("");
    setLoading(true);
    setErr("");
    try {
      const res = await takeTurn(debate.id, arg);
      setMessages((m) => [...m, { speaker: "ai", content: res.aiRebuttal }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={header}>
        <button onClick={onExit} style={backBtn}>← New</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#4a2fbd" }}>{debate.topic}</div>
          <div style={{ fontSize: 12, color: "#6b6b8a" }}>
            You: <b>{debate.userSide}</b> &nbsp;·&nbsp; AI: <b>{debate.aiSide}</b>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={feed}>
        {messages.length === 0 && (
          <p style={{ color: "#9a9ab0", textAlign: "center", marginTop: 40 }}>
            Make your opening argument for the <b>{debate.userSide}</b> side 👇
          </p>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {loading && (
          <div style={{ ...bubbleBase, ...aiBubble, color: "#9a9ab0" }}>AI is thinking…</div>
        )}
        {err && (
          <div style={{ ...bubbleBase, background: "#fde8e8", color: "#c0392b" }}>
            ⚠️ {err}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={inputBar}>
        <textarea
          style={textarea}
          rows={2}
          placeholder="Type your argument…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ ...sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.speaker === "user";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div style={{ ...bubbleBase, ...(mine ? userBubble : aiBubble) }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 3 }}>
          {mine ? "YOU" : "AI OPPONENT"}
        </div>
        {msg.content}
      </div>
    </div>
  );
}

const header: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "#fff", borderBottom: "1px solid #ece8fa", position: "sticky", top: 0 };
const backBtn: React.CSSProperties = { border: "1px solid #d8d4ee", background: "#fff", color: "#4a2fbd", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 };
const feed: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 800, margin: "0 auto", width: "100%" };
const bubbleBase: React.CSSProperties = { maxWidth: "78%", padding: "10px 14px", borderRadius: 14, lineHeight: 1.45, fontSize: 15, whiteSpace: "pre-wrap" };
const userBubble: React.CSSProperties = { background: "#4a2fbd", color: "#fff", borderBottomRightRadius: 4 };
const aiBubble: React.CSSProperties = { background: "#fff", color: "#1a1a2e", border: "1px solid #ece8fa", borderBottomLeftRadius: 4 };
const inputBar: React.CSSProperties = { display: "flex", gap: 10, padding: "14px 18px", background: "#fff", borderTop: "1px solid #ece8fa", maxWidth: 800, margin: "0 auto", width: "100%" };
const textarea: React.CSSProperties = { flex: 1, resize: "none", padding: "10px 12px", borderRadius: 10, border: "1px solid #d8d4ee", fontSize: 15, fontFamily: "inherit", outline: "none" };
const sendBtn: React.CSSProperties = { border: "none", background: "#4a2fbd", color: "#fff", borderRadius: 10, padding: "0 22px", fontWeight: 600, cursor: "pointer", fontSize: 15 };
