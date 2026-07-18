// callLLM — the single, swappable gateway to the language model.
// Uses Hugging Face's OpenAI-compatible Chat Completions router so we can pass
// system/user/assistant messages directly (server-side chat templating).
// To swap providers later (Claude, local Ollama, etc.) only this file changes.

export type LLMRole = "system" | "user" | "assistant";
export interface LLMMessage {
  role: LLMRole;
  content: string;
}

interface CallOpts {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

const HF_URL = "https://router.huggingface.co/v1/chat/completions";

export async function callLLM({
  messages,
  maxTokens = 400,
  temperature = 0.7,
}: CallOpts): Promise<string> {
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || "meta-llama/Llama-3.3-70B-Instruct";

  if (!token) {
    throw new Error(
      "HF_TOKEN is not set in backend/.env — get a free token at https://huggingface.co/settings/tokens"
    );
  }

  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Hugging Face API error ${res.status}: ${body.slice(0, 300)}`
    );
  }

  const data = (await res.json()) as any;
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Hugging Face returned no content: " + JSON.stringify(data).slice(0, 300)
    );
  }

  return content.trim();
}
