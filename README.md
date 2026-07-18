# 🎭 AI Debate Partner

Pick any topic → the AI takes the opposite side and debates you in real time, scores
your arguments, flags logical fallacies, and gives improvement tips.

Full technical plan: **AI_Debate_Partner_Plan.pdf**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TypeScript (`frontend/`) |
| Backend | Node.js + Express + TypeScript (`backend/`) |
| AI | Hugging Face Inference (open LLM) — backend only |
| Database | PostgreSQL + Prisma (Neon free tier) |
| Voice | Web Speech API |
| Auth | JWT |

---

## Project status: Phase 0 ✅ (skeleton)

Frontend ↔ backend ↔ database wiring is in place. Health-check endpoints work.

---

## Run it locally

### 1. Backend
```bash
cd backend
npm install
npm run dev        # → http://localhost:4000
```
- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/health/db` → DB status (shows `not_connected` until you add a DB — see below)

### 2. Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```
Open http://localhost:5173 — you'll see live status dots for Frontend / Backend / Database.

---

## Connect the database (when ready)

1. Create a free Postgres DB at **https://neon.tech** and copy the connection string.
2. Paste it into `backend/.env` as `DATABASE_URL=...`.
3. Run the migration:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
4. Restart `npm run dev` — `GET /api/health/db` now returns `{ "db": "connected" }`.

---

## Credentials needed (see `backend/.env.example`)

| Var | Where | When |
|---|---|---|
| `DATABASE_URL` | neon.tech (free) | to connect the DB |
| `HF_TOKEN` | huggingface.co/settings/tokens (free) | Phase 1 (AI) |
| `HF_MODEL` | e.g. `meta-llama/Llama-3.3-70B-Instruct` | Phase 1 |
| `JWT_SECRET` | any long random string | Phase 3 (auth) |

`.env` is gitignored. Never commit secrets. `.env.example` documents what's needed.

---

## Next phases

- **Phase 1** — core text debate (`callLLM` + Debater, chat UI, take-turn endpoint)
- **Phase 2** — scoring + fallacy detection (the differentiator)
- **Phase 3** — auth + saved debate history
- **Phase 4** — voice mode (Web Speech API)
- **Phase 5** — polish + deploy (Vercel + Render + Neon)
