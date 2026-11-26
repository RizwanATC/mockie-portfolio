"use client";

import { useEffect, useRef, useState } from "react";
import { levels } from "@/data/resume";
import { useGame } from "@/lib/store";
import type { JarvisAction } from "@/app/api/jarvis/route";
import { Feather, Send, X } from "lucide-react";
import { STROKE } from "./icons";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What's his tech stack?", "Show me TheNoor", "What did he build at Riverlens?", "Any side projects?"];

export default function Jarvis({ onGoto }: { onGoto: (level: number) => void }) {
  const open = useGame((s) => s.jarvisOpen);
  const setOpen = useGame((s) => s.setJarvis);
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
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? data.error ?? "Jarvis couldn't answer that. Try asking again." }]);
      if (data.actions?.length) apply(data.actions);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Jarvis couldn't reach the server. Check your connection and ask again." }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  return (
    <section
      aria-label="Jarvis, your guide"
      className="panel animate-unfurl pointer-events-auto fixed bottom-36 right-3 top-[4.25rem] z-30 flex w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden sm:bottom-32 sm:right-5 sm:top-20"
    >
      <header className="flex items-center gap-2.5 border-b border-oak/25 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-oak-deep bg-heraldic text-vellum">
          <Feather size={16} strokeWidth={STROKE} aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-bold leading-none">Jarvis</p>
          <p className="text-sm text-ink-soft">Your guide to Mockie&rsquo;s work</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close Jarvis"
          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-vellum-deep hover:text-ink"
        >
          <X size={18} strokeWidth={STROKE} aria-hidden />
        </button>
      </header>

      {/* data-lenis-prevent: let the chat scroll instead of the page */}
      <div ref={list} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-base leading-snug" aria-live="polite">
        {messages.map((m, i) => (
          <p
            key={i}
            className={
              m.role === "user"
                ? "ml-10 rounded-xl rounded-br-sm bg-heraldic px-3 py-2 text-vellum"
                : "mr-10 rounded-xl rounded-bl-sm border border-oak/20 bg-vellum-deep/45 px-3 py-2 text-ink"
            }
          >
            {m.content}
          </p>
        ))}
        {busy && (
          <p className="mr-10 inline-flex items-center gap-1.5 px-3 py-2 text-ink-soft">
            <span className="sr-only">Jarvis is writing</span>
            {[0, 1, 2].map((d) => (
              <span key={d} aria-hidden className="h-1.5 w-1.5 animate-bounce rounded-full bg-oak" style={{ animationDelay: `${d * 120}ms` }} />
            ))}
          </p>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-oak/40 px-3 py-1 text-sm text-ink transition-colors hover:border-heraldic hover:bg-heraldic/10"
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
        className="flex gap-2 border-t border-oak/25 p-3"
      >
        <input
          ref={field}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about his work"
          aria-label="Message Jarvis"
          className="min-w-0 flex-1 rounded-lg border-2 border-oak/40 bg-[#f7ead0] px-3 py-2 text-base text-ink placeholder:text-ink-soft/80 focus:border-heraldic focus:outline-none"
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="btn-heraldic grid w-11 place-items-center disabled:opacity-45">
          <Send size={18} strokeWidth={STROKE} aria-hidden />
        </button>
      </form>
    </section>
  );
}
