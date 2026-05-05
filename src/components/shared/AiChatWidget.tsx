"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendAiMessage, type ChatMessage } from "@/lib/actions/ai";

interface Props {
  /** Optional booking/page context injected into the system prompt */
  context?: string;
  /** Label shown on the open button tooltip */
  label?: string;
}

export function AiChatWidget({ context, label = "AI Assistant" }: Props) {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;

    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");

    startTransition(async () => {
      const result = await sendAiMessage({ messages: next, context });
      const replyText = result.error ? `⚠️ ${result.error}` : (result.reply ?? "No response received.");
      setMessages((prev) => [...prev, { role: "model" as const, text: replyText }]);
    });
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="fixed right-6 bottom-6 z-[200] w-[52px] h-[52px] rounded-full flex items-center justify-center text-ds-on-primary shadow-[0_4px_20px_rgba(255,77,0,0.35)] hover:scale-110 hover:shadow-[0_8px_32px_rgba(255,77,0,0.45)] transition-all bg-ds-primary"
        title={label}
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
        >
          {open ? "close" : "smart_toy"}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed right-6 bottom-[76px] z-[199] w-[340px] sm:w-[380px] bg-white rounded-ds-xl border border-ds-outline-variant shadow-[0_16px_48px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden"
          style={{ maxHeight: "min(520px, calc(100vh - 100px))" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-ds-outline-variant bg-ds-primary">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <div>
              <p className="type-body-sm font-bold text-white leading-tight">Erli — AI Assistant</p>
              <p className="text-[11px] text-white/70">Powered by Gemini 2.5 Flash</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-ds-surface-container-low">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-ds-outline text-4xl block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <p className="type-body-sm text-ds-on-surface-variant">Hi! I&apos;m Erli, your AI assistant.</p>
                <p className="type-body-sm text-ds-on-surface-variant mt-1">How can I help you today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "model" && (
                  <span className="material-symbols-outlined text-ds-primary mr-2 mt-0.5 shrink-0" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-ds text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-ds-primary text-ds-on-primary rounded-br-none"
                      : "bg-white border border-ds-outline-variant text-ds-on-surface rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <span className="material-symbols-outlined text-ds-primary mr-2 mt-0.5 shrink-0" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <div className="bg-white border border-ds-outline-variant px-3 py-2 rounded-ds rounded-bl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ds-outline animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-ds-outline animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-ds-outline animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-ds-outline-variant bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask me anything…"
              disabled={isPending}
              className="flex-1 bg-ds-surface-container-low border border-ds-outline-variant rounded-ds px-3 py-2 text-[13px] text-ds-on-surface placeholder:text-ds-outline outline-none focus:border-ds-primary focus:shadow-[0_0_0_3px_rgba(255,77,0,0.12)] transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="w-9 h-9 rounded-ds bg-ds-primary text-ds-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
