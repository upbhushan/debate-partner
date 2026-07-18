import { useState } from "react";
import { startDebate, type DebateInfo } from "../lib/api";

export default function Home({ onStart }: { onStart: (d: DebateInfo) => void }) {
  const [topic, setTopic] = useState("");
  const [side, setSide] = useState<"for" | "against">("for");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    if (!topic.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const d = await startDebate(topic.trim(), side);
      onStart(d);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 48, textAlign: "center" }}>🎭</div>
        <h1 style={{ color: "#4a2fbd", textAlign: "center", margin: "6px 0 2px" }}>
          AI Debate Partner
        </h1>
        <p style={{ color: "#6b6b8a", textAlign: "center", marginTop: 0 }}>
          Pick a topic and a side. The AI takes the opposite side.
        </p>

        <label style={label}>Debate topic</label>
        <input
          style={input}
          placeholder="e.g. Social media does more harm than good"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
        />

        <label style={label}>Your side</label>
        <div style={{ display: "flex", gap: 10 }}>
          <SideBtn active={side === "for"} onClick={() => setSide("for")} label="👍 For" />
          <SideBtn active={side === "against"} onClick={() => setSide("against")} label="👎 Against" />
        </div>
        {topic.trim() && (
          <p style={{ fontSize: 13, color: "#6b6b8a", marginTop: 10 }}>
            You argue <b>{side}</b>. The AI argues{" "}
            <b>{side === "for" ? "against" : "for"}</b>.
          </p>
        )}

        {err && <p style={{ color: "#ef4444", fontSize: 13 }}>{err}</p>}

        <button style={{ ...primaryBtn, opacity: loading || !topic.trim() ? 0.6 : 1 }}
          disabled={loading || !topic.trim()} onClick={go}>
          {loading ? "Starting…" : "Start Debate →"}
        </button>
      </div>
    </div>
  );
}

function SideBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: 600,
      border: active ? "2px solid #4a2fbd" : "2px solid #e0dcf2",
      background: active ? "#efeaff" : "#fff", color: active ? "#4a2fbd" : "#6b6b8a",
    }}>{label}</button>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const card: React.CSSProperties = { background: "#fff", padding: "36px 40px", borderRadius: 16, boxShadow: "0 10px 40px rgba(74,47,189,.12)", width: "100%", maxWidth: 460 };
const label: React.CSSProperties = { display: "block", fontWeight: 600, fontSize: 14, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d8d4ee", fontSize: 15, outline: "none" };
const primaryBtn: React.CSSProperties = { width: "100%", marginTop: 22, padding: "13px", borderRadius: 10, border: "none", background: "#4a2fbd", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" };
