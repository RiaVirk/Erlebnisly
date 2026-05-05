"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getGeminiClient, GEMINI_MODEL, SYSTEM_PROMPT } from "@/lib/gemini";

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(2000),
});

const ChatSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  context:  z.string().max(1000).optional(),
});

export type ChatMessage = z.infer<typeof MessageSchema>;

export async function sendAiMessage(
  input: z.infer<typeof ChatSchema>
): Promise<{ reply: string; error?: never } | { reply?: never; error: string }> {
  // Auth check — never expose AI to unauthenticated requests
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  // Zod validation — mandatory per AGENTS.md
  const parsed = ChatSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { messages, context } = parsed.data;

  try {
    const ai = getGeminiClient();

    // Build system instruction (inject booking context if provided)
    const systemInstruction = context
      ? `${SYSTEM_PROMPT}\n\n--- Booking Context ---\n${context}`
      : SYSTEM_PROMPT;

    // Map to Gemini content format
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 400,
        temperature: 0.7,
        // Disable extended thinking — budget=0 means instant chat responses.
        // Default thinking on gemini-2.5-flash causes multi-second hangs in chat UI.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const reply = response.text ?? "I'm sorry, I couldn't generate a response.";
    return { reply };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Gemini AI] Error:", msg);
    return { error: "AI service temporarily unavailable. Please try again." };
  }
}
