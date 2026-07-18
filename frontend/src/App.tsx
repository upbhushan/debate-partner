import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Health = "checking..." | "unreachable" | string;

export default function App() {
  const [api, setApi] = useState<Health>("checking...");
  const [db, setDb] = useState<Health>("checking...");

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => r.json())
      .then((d) => setApi(d.status))
      .catch(() => setApi("unreachable"));

    fetch(`${API}/api/health/db`)
      .then((r) => r.json())
      .then((d) => setDb(d.db))
      .catch(() => setDb("unreachable"));
  }, []);

  const dot = (v: Health) =>
    v === "ok" || v === "connected"
      ? "#22c55e"
      : v === "checking..."
      ? "#eab308"
      : "#ef4444";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px 48px",
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(74,47,189,.12)",
          textAlign: "center",
          maxWidth: 460,
        }}
      >
        <div style={{ fontSize: 48 }}>🎭</div>
        <h1 style={{ color: "#4a2fbd", margin: "8px 0 4px" }}>
          AI Debate Partner
        </h1>
        <p style={{ color: "#6b6b8a", marginTop: 0 }}>Phase 0 — skeleton is live</p>

        <div style={{ textAlign: "left", marginTop: 24, fontSize: 15 }}>
          <Row label="Frontend" value="running" color="#22c55e" />
          <Row label="Backend API" value={api} color={dot(api)} />
          <Row label="Database" value={db} color={dot(db)} />
        </div>

        {db !== "connected" && (
          <p style={{ fontSize: 12, color: "#9a9ab0", marginTop: 20 }}>
            Database shows "{String(db)}" until you add DATABASE_URL and run
            <code style={{ color: "#4a2fbd" }}> npx prisma migrate dev</code>.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid #f0eefb",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 600, width: 120 }}>{label}</span>
      <span style={{ color: "#6b6b8a" }}>{value}</span>
    </div>
  );
}
