// The Debater role: takes the OPPOSITE side and rebuts the user's argument.
import type { Turn } from "@prisma/client";
import { callLLM, type LLMMessage } from "./llm";

// Given the user's chosen side, return the opposing side the AI will argue.
export function oppositeSide(side: string): string {
  const s = side.trim().toLowerCase();
  if (s === "for" || s === "pro") return "against";
  if (s === "against" || s === "con") return "for";
  return `opposed to "${side}"`;
}

export async function generateRebuttal(params: {
  topic: string;
  aiSide: string;
  turns: Turn[]; // prior turns, oldest first
  userArgument: string;
}): Promise<string> {
  const { topic, aiSide, turns, userArgument } = params;

  const system: LLMMessage = {
    role: "system",
    content:
      `You are a sharp, fair debater arguing the "${aiSide}" side of the topic: "${topic}". ` +
      `Argue persuasively for your side and directly rebut the user's most recent point. ` +
      `Keep every reply to 2-4 sentences. Never concede or switch sides. ` +
      `Be respectful but firm. Do not break character or mention that you are an AI.`,
  };

  // Replay the conversation so the model has full context.
  const history: LLMMessage[] = turns.map((t) => ({
    role: t.speaker === "ai" ? "assistant" : "user",
    content: t.content,
  }));

  const messages: LLMMessage[] = [
    system,
    ...history,
    { role: "user", content: userArgument },
  ];

  return callLLM({ messages, maxTokens: 220, temperature: 0.8 });
}
