import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { ASSISTANT_SYSTEM } from "@/content/assistant-kb";
import { assistantReply } from "@/server/ai";
import { getCurrentAccount } from "@/server/auth";
import { run } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";
import { callerKey } from "@/server/request-identity";

/**
 * The help assistant's one endpoint. It answers from the knowledge file and does nothing
 * else: no account access, no actions, no tools. Every exchange is logged with the visitor
 * id and, for signed-in users, their account name, because the founder reads the questions
 * to find where people get stuck. That logging is disclosed in the widget itself and in the
 * privacy policy, and rows expire on the retention schedule.
 */

const MAX_QUESTION = 1000;
const MAX_TURNS = 8;

export async function POST(request: NextRequest) {
  const limited = rateLimit("assistantByIp", await callerKey());
  if (!limited.allowed) {
    return NextResponse.json(
      { answer: "That's a lot of questions at once. Give it a few minutes." },
      { status: 429 }
    );
  }

  let body: { messages?: { role?: string; content?: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ answer: "That request didn't parse." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_QUESTION) }));

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ answer: "Ask a question and I'll do my best." }, { status: 400 });
  }

  const answer = await assistantReply(ASSISTANT_SYSTEM, history);
  if (!answer) {
    return NextResponse.json(
      { answer: "The assistant isn't available right now. hello@disruptajob.com reaches a human." },
      { status: 503 }
    );
  }

  // The research log: who asked what. Never blocks the reply.
  try {
    const account = await getCurrentAccount();
    const jar = await cookies();
    run(
      `INSERT INTO assistant_message (id, visitor, account_name, question, answer, created_at)
       VALUES (?,?,?,?,?,?)`,
      randomUUID(),
      jar.get("dj_v")?.value ?? "unknown",
      account?.displayName ?? null,
      lastUser.content,
      answer.slice(0, 2000),
      new Date().toISOString()
    );
  } catch {
    // Logging must never break answering.
  }

  return NextResponse.json({ answer });
}
