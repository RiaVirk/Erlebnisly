"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getGeminiClient, GEMINI_MODEL_CHAIN, SYSTEM_PROMPT } from "@/lib/gemini";

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(2000),
});

const ChatSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  context:  z.string().max(1000).optional(),
});

export type ChatMessage = z.infer<typeof MessageSchema>;

function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

export async function sendAiMessage(
  input: z.infer<typeof ChatSchema>
): Promise<{ reply: string; error?: never } | { reply?: never; error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const parsed = ChatSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { messages, context } = parsed.data;

  const ai = getGeminiClient();

  const systemInstruction = context
    ? `${SYSTEM_PROMPT}\n\n--- Booking Context ---\n${context}`
    : SYSTEM_PROMPT;

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  for (const model of GEMINI_MODEL_CHAIN) {
    // Up to 2 attempts per model (initial + 1 retry) before falling back
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens: 400,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        const reply = response.text ?? "I'm sorry, I couldn't generate a response.";
        return { reply };
      } catch (err: unknown) {
        if (isTransient(err)) {
          if (attempt === 0) {
            // Brief pause before retry on the same model
            await new Promise((r) => setTimeout(r, 1000));
            console.warn(`[Gemini AI] ${model} busy — retrying...`);
            continue;
          }
          // Exhausted retries for this model — try next in chain
          console.warn(`[Gemini AI] ${model} unavailable after retry — falling back`);
          break;
        }
        // Non-transient error (400 bad request, auth, etc.) — fail immediately
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Gemini AI] Non-transient error:", msg);
        return { error: "AI service temporarily unavailable. Please try again." };
      }
    }
  }

  console.error("[Gemini AI] All models in chain exhausted");
  return { error: "AI service is under high load. Please try again in a moment." };
}
