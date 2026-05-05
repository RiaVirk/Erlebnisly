"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendAiMessage, type ChatMessage } from "@/lib/actions/ai";

interface Props {
  context: string; // booking details as plain text for the system prompt
}

export function BookingAiChat({ context }: Props) {
  const [expanded, setExpanded]   = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [expanded, messages]);

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
    <div className="bg-white rounded-ds-xl border border-ds-outline-variant overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-ds-surface-container-low transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="w-12 h-12 rounded-ds-md bg-ds-primary/10 flex items-center justify-center shrink-0 text-ds-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 26, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="type-body-sm font-semibold text-ds-on-surface">Need assistance?</p>
          <p className="type-body-sm text-ds-on-surface-variant">Ask Erli, our AI assistant — powered by Gemini</p>
        </div>
        <span className="material-symbols-outlined text-ds-outline shrink-0" style={{ fontSize: 20 }}>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Expandable chat area */}
      {expanded && (
        <>
          {/* Messages */}
          <div className="border-t border-ds-outline-variant bg-ds-surface-container-low px-4 py-4 space-y-3 max-h-64 overflow-y-auto">
            {messages.length === 0 && (
              <p className="type-body-sm text-ds-on-surface-variant text-center py-2">
                Ask me anything about your booking — cancellations, directions, what to bring…
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "model" && (
                  <span className="material-symbols-outlined text-ds-primary mr-2 mt-0.5 shrink-0" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-ds text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-ds-primary text-ds-on-primary rounded-br-none"
                    : "bg-white border border-ds-outline-variant text-ds-on-surface rounded-bl-none"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start items-center gap-2">
                <span className="material-symbols-outlined text-ds-primary" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
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
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
              placeholder="Type your question…"
              disabled={isPending}
              className="flex-1 bg-ds-surface-container-low border border-ds-outline-variant rounded-ds px-3 py-2 text-[13px] text-ds-on-surface placeholder:text-ds-outline outline-none focus:border-ds-primary focus:shadow-[0_0_0_3px_rgba(255,77,0,0.12)] transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="w-9 h-9 rounded-ds bg-ds-primary text-ds-on-primary flex items-center justify-center hover:opacity-90 disabled:opacity-40 shrink-0 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
