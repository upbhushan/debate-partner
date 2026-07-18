const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface DebateInfo {
  id: string;
  topic: string;
  userSide: string;
  aiSide: string;
}

async function post(path: string, body: unknown) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
  return data;
}

export function startDebate(topic: string, userSide: string): Promise<DebateInfo> {
  return post("/api/debate", { topic, userSide });
}

export function takeTurn(
  debateId: string,
  argument: string
): Promise<{ aiRebuttal: string; turnNumber: number }> {
  return post(`/api/debate/${debateId}/turn`, { argument });
}
