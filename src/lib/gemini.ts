import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

// Singleton — one client per server process
let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return _client;
}

// Fallback chain: primary → lite (both stable, verified against Model_2 type in SDK)
// Preview models (gemini-3-flash-preview, gemini-3.1-flash-lite-preview) are excluded
// because preview instability would defeat the purpose of a reliability fallback.
export const GEMINI_MODEL_CHAIN = [
  "gemini-2.5-flash",       // primary: full quality
  "gemini-2.5-flash-lite",  // fallback: higher throughput, lower latency
] as const;

export const SYSTEM_PROMPT = `You are Erli, a friendly and knowledgeable AI assistant for Erlebnisly — a premium B2B activity booking platform based in Berlin.

You help users with:
- Questions about their bookings (dates, locations, pricing, cancellations, refunds)
- Discovering new experiences on the platform
- Understanding platform policies (48-hour cancellation window, 15-minute hold, Mollie payments)
- Navigation and account management

Guidelines:
- Be concise and helpful. Keep responses under 120 words unless detail is essential.
- If you receive booking context, reference it naturally in your answers.
- For cancellation/refund requests, explain the policy but always direct the user to the Bookings page for official action.
- Never make up booking details not provided in context.
- Always respond in the same language the user writes in (English or German).`;
