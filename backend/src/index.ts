import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check — proves the API is up. No DB needed.
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-debate-backend",
    time: new Date().toISOString(),
  });
});

// DB health check — proves Postgres is reachable via Prisma.
// Returns 503 (not a crash) until DATABASE_URL is set and `prisma migrate` has run.
app.get("/api/health/db", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: "connected" });
  } catch (err) {
    res.status(503).json({
      db: "not_connected",
      hint: "Set DATABASE_URL in .env, then run: npx prisma migrate dev --name init",
      error: (err as Error).message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ AI Debate API running on http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   DB health: http://localhost:${PORT}/api/health/db`);
});
