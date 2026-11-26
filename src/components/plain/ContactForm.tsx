"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; to: string } | { kind: "error"; message: string };

const FIELD =
  "w-full rounded-lg border-2 border-oak/35 bg-[#fbf4e2] px-3 py-2.5 text-lg text-ink placeholder:text-ink-soft/70 transition-colors focus:border-heraldic focus:outline-none aria-[invalid=true]:border-[#9b2335]";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [touched, setTouched] = useState(false);
  const missing = {
    name: !form.name.trim(),
    email: !/^\S+@\S+\.\S+$/.test(form.email),
    message: !form.message.trim(),
  };

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.name || missing.email || missing.message) return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "");
      setStatus({ kind: "sent", to: form.email });
      setForm({ name: "", email: "", subject: "", message: "" });
      setTouched(false);
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error && err.message ? err.message : "The message didn't send." });
    }
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className="panel flex flex-col items-start gap-3 p-6 sm:p-8">
        <CircleCheck size={28} strokeWidth={2} className="text-heraldic" aria-hidden />
        <p className="font-display text-2xl font-bold">Message sent</p>
        <p className="text-lg text-ink-soft">Thanks. Mockie will reply to {status.to}.</p>
        <button onClick={() => setStatus({ kind: "idle" })} className="text-base font-medium text-heraldic underline underline-offset-4">
          Write another message
        </button>
      </div>
    );
  }

  const err = (k: keyof typeof missing) => touched && missing[k];

  return (
    <form onSubmit={submit} noValidate className="panel grid gap-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <label htmlFor="c-name" className="text-base font-bold">
            Your name
          </label>
          <input id="c-name" name="name" value={form.name} onChange={set} autoComplete="name" aria-invalid={err("name")} aria-describedby="c-name-err" className={FIELD} />
          {err("name") && (
            <p id="c-name-err" className="text-sm text-[#9b2335]">
              Add your name so Mockie knows who&apos;s writing.
            </p>
          )}
        </div>
        <div className="grid content-start gap-1.5">
          <label htmlFor="c-email" className="text-base font-bold">
            Email
          </label>
          <input id="c-email" name="email" type="email" value={form.email} onChange={set} autoComplete="email" aria-invalid={err("email")} aria-describedby="c-email-err" className={FIELD} />
          {err("email") && (
            <p id="c-email-err" className="text-sm text-[#9b2335]">
              Enter an email address Mockie can reply to.
            </p>
          )}
        </div>
      </div>
      <div className="grid content-start gap-1.5">
        <label htmlFor="c-subject" className="text-base font-bold">
          Subject <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input id="c-subject" name="subject" value={form.subject} onChange={set} className={FIELD} />
      </div>
      <div className="grid content-start gap-1.5">
        <label htmlFor="c-message" className="text-base font-bold">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={set}
          aria-invalid={err("message")}
          aria-describedby="c-message-err"
          placeholder="A role, a project, or just hello"
          className={`${FIELD} resize-y`}
        />
        {err("message") && (
          <p id="c-message-err" className="text-sm text-[#9b2335]">
            Write a message before sending.
          </p>
        )}
      </div>
      {status.kind === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border-2 border-[#9b2335]/40 bg-[#9b2335]/10 px-3 py-2 text-base text-[#7a1b2a]">
          <CircleAlert size={18} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />
          {status.message} Try again, or email directly.
        </p>
      )}
      <button type="submit" disabled={status.kind === "sending"} className="btn-heraldic inline-flex items-center justify-center gap-2 justify-self-start px-5 py-2.5 font-display text-lg font-bold disabled:opacity-70">
        {status.kind === "sending" ? <LoaderCircle size={18} strokeWidth={2} className="animate-spin" aria-hidden /> : <Send size={18} strokeWidth={2} aria-hidden />}
        {status.kind === "sending" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
