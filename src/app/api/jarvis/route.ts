import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { apps, inventory, levels, profile } from "@/data/resume";

// Jarvis: the portfolio's guide. Answers from the resume data below and drives the 3D world
// through two client-side tools (go_to_level, show_screenshot). The route runs the tool loop,
// records each tool call as an action, and the page replays those actions after the reply.

const MODEL = "claude-opus-5";
const MAX_TURNS = 12; // history sent from the browser
const MAX_CHARS = 1000; // per message
const MAX_LOOPS = 4; // tool round-trips per question

export type JarvisAction = { type: "goto"; level: string } | { type: "screenshot"; app: string; index: number };

const portfolio = {
  profile,
  skills: inventory,
  levels: levels.map(({ id, tag, title, company, role, period, headline, points, stack, stat }) => ({
    id,
    tag,
    title,
    company,
    role,
    period,
    headline,
    points,
    stack,
    stat,
  })),
  apps: apps.map(({ id, name, tagline, level, screens, href }) => ({
    id,
    name,
    tagline,
    shownOnLevel: level,
    screenshots: screens.length,
    playStore: href,
  })),
};

// Stable across requests so it can be cached.
const SYSTEM = `You are Jarvis, the guide inside ${profile.name}'s (a.k.a. ${profile.alias}) interactive 3D portfolio. Visitors are usually recruiters, clients or other developers.

Answer questions about ${profile.alias}'s work using only the portfolio data below. Refer to him in the third person. If something isn't in the data, say you don't know and suggest emailing ${profile.email}.

Keep replies short and conversational: two to four sentences, plain text, no markdown headings or tables.

The portfolio is a side-scrolling world with one level per career stage. When a question is about a specific job, app or project, call go_to_level so the camera travels there, and use show_screenshot when a particular app screen would help. Don't mention the tools by name; just say something like "Taking you there now."

<portfolio>
${JSON.stringify(portfolio, null, 2)}
</portfolio>`;

const tools: Anthropic.Beta.BetaTool[] = [
  {
    name: "go_to_level",
    description:
      "Move the visitor's camera to a level of the portfolio world. Use it whenever the answer is about a specific job, app or side project.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        level: { type: "string", enum: levels.map((l) => l.id), description: "Level id from the portfolio data." },
      },
      required: ["level"],
      additionalProperties: false,
    },
  },
  {
    name: "show_screenshot",
    description:
      "Travel to an app's level and bring one of its screenshots forward. Index is 0-based and must be below the app's screenshot count.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        app: { type: "string", enum: apps.map((a) => a.id) },
        index: { type: "integer", description: "0-based screenshot index." },
      },
      required: ["app", "index"],
      additionalProperties: false,
    },
  },
];

function runTool(block: Anthropic.Beta.BetaToolUseBlock, actions: JarvisAction[]): string {
  const input = block.input as Record<string, unknown>;
  if (block.name === "go_to_level") {
    const level = levels.find((l) => l.id === input.level);
    if (!level) return `Unknown level "${String(input.level)}".`;
    actions.push({ type: "goto", level: level.id });
    return `Camera moved to ${level.tag} · ${level.title}.`;
  }
  if (block.name === "show_screenshot") {
    const app = apps.find((a) => a.id === input.app);
    const index = Number(input.index);
    if (!app) return `Unknown app "${String(input.app)}".`;
    if (!Number.isInteger(index) || index < 0 || index >= app.screens.length) {
      return `${app.name} has screenshots 0-${app.screens.length - 1}.`;
    }
    actions.push({ type: "screenshot", app: app.id, index });
    return `Showing ${app.name} screenshot ${index + 1} of ${app.screens.length}.`;
  }
  return `Unknown tool "${block.name}".`;
}

// Tiny per-instance rate limit so a public page can't run up the API bill.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Jarvis needs a short break. Try again in a few minutes." }, { status: 429 });
  }

  let history: { role: "user" | "assistant"; content: string }[];
  try {
    const body = await req.json();
    history = (Array.isArray(body.messages) ? body.messages : [])
      .filter(
        (m: unknown): m is { role: "user" | "assistant"; content: string } =>
          !!m &&
          typeof m === "object" &&
          ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
          typeof (m as { content?: unknown }).content === "string"
      )
      .slice(-MAX_TURNS)
      .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Ask Jarvis something first." }, { status: 400 });
  }

  // Deployed via env vars (Vercel / .env.local); without one there's nothing to call.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return NextResponse.json({ error: "Jarvis is offline: no Anthropic API key is configured." }, { status: 503 });
  }

  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = history;
  const actions: JarvisAction[] = [];

  try {
    for (let loop = 0; loop < MAX_LOOPS; loop++) {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4096,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" }, // short chat answers
        cache_control: { type: "ephemeral" },
        system: SYSTEM,
        tools,
        messages,
      });

      if (response.stop_reason === "refusal") {
        return NextResponse.json({ reply: "I can't help with that one. Ask me about Rizwan's work instead!", actions });
      }

      const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      if (response.stop_reason !== "tool_use" || !toolUses.length) {
        const reply = response.content
          .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        return NextResponse.json({ reply: reply || "Done. Have a look around!", actions });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: toolUses.map(
          (t): Anthropic.Beta.BetaToolResultBlockParam => ({ type: "tool_result", tool_use_id: t.id, content: runTool(t, actions) })
        ),
      });
    }
    return NextResponse.json({ reply: "Taking you there now.", actions });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Jarvis is offline: no Anthropic API key is configured." }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Jarvis is busy right now. Try again in a moment." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Jarvis API error ${error.status}:`, error.message);
      return NextResponse.json({ error: "Jarvis hit a snag. Try again." }, { status: 502 });
    }
    console.error("Jarvis error:", error);
    return NextResponse.json({ error: "Jarvis hit a snag. Try again." }, { status: 500 });
  }
}
