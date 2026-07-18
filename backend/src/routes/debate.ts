import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getDemoUserId } from "../lib/demoUser";
import { generateRebuttal, oppositeSide } from "../services/debater";

const router = Router();

// POST /api/debate — start a new debate.
// body: { topic, userSide }  (userSide: "for" | "against")
router.post("/", async (req, res) => {
  try {
    const { topic, userSide } = req.body ?? {};
    if (!topic || !userSide) {
      return res.status(400).json({ error: "topic and userSide are required" });
    }
    const userId = await getDemoUserId();
    const aiSide = oppositeSide(userSide);
    const debate = await prisma.debate.create({
      data: { userId, topic, userSide, aiSide, status: "active" },
    });
    res.json({ id: debate.id, topic, userSide, aiSide });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/debate/:id/turn — user submits an argument, AI rebuts.
// body: { argument }
router.post("/:id/turn", async (req, res) => {
  try {
    const { id } = req.params;
    const argument: string = (req.body?.argument ?? "").trim();
    if (!argument) {
      return res.status(400).json({ error: "argument is required" });
    }

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: { turns: { orderBy: { turnNumber: "asc" } } },
    });
    if (!debate) return res.status(404).json({ error: "debate not found" });

    const nextNum = debate.turns.length + 1;

    // 1. Save the user's turn.
    await prisma.turn.create({
      data: { debateId: id, speaker: "user", content: argument, turnNumber: nextNum },
    });

    // 2. Ask the Debater (AI) for its rebuttal.
    const rebuttal = await generateRebuttal({
      topic: debate.topic,
      aiSide: debate.aiSide,
      turns: debate.turns, // prior turns only (before this user turn)
      userArgument: argument,
    });

    // 3. Save the AI's turn.
    const aiTurn = await prisma.turn.create({
      data: {
        debateId: id,
        speaker: "ai",
        content: rebuttal,
        turnNumber: nextNum + 1,
      },
    });

    res.json({ aiRebuttal: aiTurn.content, turnNumber: aiTurn.turnNumber });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/debate/:id — full transcript (used later for history).
router.get("/:id", async (req, res) => {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: { turns: { orderBy: { turnNumber: "asc" } } },
    });
    if (!debate) return res.status(404).json({ error: "debate not found" });
    res.json(debate);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
