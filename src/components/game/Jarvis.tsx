"use client";

import { useEffect, useRef, useState } from "react";
import { levels } from "@/data/resume";
import { useGame } from "@/lib/store";
import type { JarvisAction } from "@/app/api/jarvis/route";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What's his tech stack?", "Show me TheNoor", "What did he build at Riverlens?", "Any side projects?"];

export default function Jarvis({ onGoto }: { onGoto: (level: number) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi, I'm Jarvis. Ask me anything about Rizwan's work and I'll take you there." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const setScreen = useGame((s) => s.setScreen);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  const apply = (actions: JarvisAction[]) => {
    for (const a of actions) {
      if (a.type === "goto") {
        const i = levels.findIndex((l) => l.id === a.level);
        if (i >= 0) onGoto(i);
      } else {
        setScreen(a.app, a.index);
      }
    }
  };

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // the greeting is UI-only; the API expects the conversation to start with the visitor
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data: { reply?: string; actions?: JarvisAction[]; error?: string } = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." }]);
      if (data.actions?.length) apply(data.actions);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the server. Try again?" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="pointer-events-auto fixed right-4 top-14 z-30 rounded border border-cyan-300/40 bg-black/50 px-3 py-1.5 font-display text-xs font-semibold tracking-wider text-cyan-200 backdrop-blur hover:border-cyan-300 sm:right-6"
      >
        {open ? "✕ CLOSE" : "◆ ASK JARVIS"}
      </button>

      {open && (
        <section
          aria-label="Jarvis assistant"
          className="fixed bottom-20 right-4 top-24 z-30 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-cyan-300/30 bg-[#0a0a14]/85 text-sm text-white shadow-2xl shadow-cyan-900/30 backdrop-blur-md sm:right-6"
        >
          <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            <span className="font-display text-xs font-bold tracking-[0.2em] text-cyan-200">JARVIS</span>
            <span className="text-xs text-white/40">portfolio guide</span>
          </header>

          {/* data-lenis-prevent: let the chat scroll instead of the page */}
          <div ref={list} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-cyan-500/15 px-3 py-2 text-cyan-50"
                    : "mr-8 rounded-lg bg-white/5 px-3 py-2 text-white/85"
                }
              >
                {m.content}
              </p>
            ))}
            {busy && <p className="mr-8 px-3 py-2 font-display text-xs tracking-wider text-cyan-200/70">thinking…</p>}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-cyan-300/60 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <input
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Ask about his work…"
              aria-label="Message Jarvis"
              className="min-w-0 flex-1 rounded border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded bg-cyan-500/80 px-3 font-display text-xs font-bold tracking-wider text-black disabled:opacity-40"
            >
              SEND
            </button>
          </form>
        </section>
      )}
    </>
  );
}
