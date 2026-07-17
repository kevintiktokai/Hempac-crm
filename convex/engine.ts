import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Sprint 4 — the AI suggestion engine (BUILD-SCOPE §4.4, addendum §7).
 *
 * Two triggers, one gate:
 * - CONVERSATION-DRIVEN: after a sync stores new messages on a tracked
 *   thread, the thread is analysed and stage moves / tasks are PROPOSED.
 * - TIME-IN-PIPELINE: a daily sweep over deal age + bucket proposes
 *   follow-ups with suggested wording, routed to the assigned rep
 *   (e.g. Awaiting Term as the school term approaches).
 * Every proposal is a pending suggestion — Gate 2 (accept/dismiss) is the
 * only way anything applies. The engine never writes CRM state directly
 * and never sends messages.
 *
 * INTELLIGENCE — provider: OpenAI (client decision, Jul 2026).
 * Set OPENAI_API_KEY on the Convex deployment (`npx convex env set`) to
 * activate LLM analysis and wording (model via OPENAI_MODEL, default
 * gpt-4o-mini). Without the key, a small labelled heuristic covers obvious
 * conversational cues and the time sweep uses templated wording, so the
 * whole loop stays demonstrable.
 */

const SUGGESTIONS_PER_ANALYSIS = 2;
const THREADS_PER_SWEEP = 3;

/** Zimbabwe school-term starts (approx) for the Awaiting Term trigger. */
const TERM_STARTS: [month: number, day: number][] = [[0, 13], [4, 5], [8, 8]];
const TERM_WINDOW_DAYS = 28;
const NO_RESPONSE_NUDGE_DAYS = 0; // stage itself signals staleness
const AWAITING_FUNDS_STALE_DAYS = 14;

function daysUntilNextTerm(now: Date): { days: number; label: string } {
  const candidates = TERM_STARTS.flatMap(([m, d]) => [
    new Date(now.getFullYear(), m, d),
    new Date(now.getFullYear() + 1, m, d),
  ]).filter((t) => t.getTime() > now.getTime());
  const next = candidates.sort((a, b) => a.getTime() - b.getTime())[0];
  const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  const term = next.getMonth() === 0 ? "first" : next.getMonth() === 4 ? "second" : "third";
  return { days, label: `${term} term` };
}

export const aiStatus = query({
  args: {},
  handler: async () => ({
    provider: "openai" as const,
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  }),
});

/* ---------------- OpenAI (activated by OPENAI_API_KEY) ---------------- */

interface ProposedSuggestion {
  type: "Stage change" | "New task" | "Follow-up";
  proposal: string;
  rationale: string;
  toStage?: string;
  suggestedWording?: string;
  sourceSnippet?: string;
}

async function openaiPropose(system: string, user: string): Promise<ProposedSuggestion[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("openai error", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const parsed = JSON.parse(body.choices[0]?.message?.content ?? "{}") as {
      suggestions?: ProposedSuggestion[];
    };
    return (parsed.suggestions ?? []).slice(0, SUGGESTIONS_PER_ANALYSIS);
  } catch (e) {
    console.error("openai call failed", String(e).slice(0, 300));
    return null;
  }
}

const ANALYSIS_SYSTEM = `You are the suggestion engine of a school-sales CRM for Hempac Sport
(Zimbabwe; interactive smart boards + sports equipment; WhatsApp-first, USD).
Given a captured WhatsApp thread and the deal's current pipeline stage, propose
zero to two CRM updates. You NEVER act — a human accepts or dismisses each one.
Boards stages: Enquiry, Quotation Sent, Awaiting Response, Awaiting Term,
Awaiting Funds, No Response, Won, Lost. Sports stages: Enquiry, Interested,
Not Now, Won, Lost.
Respond as JSON: {"suggestions":[{"type":"Stage change"|"New task"|"Follow-up",
"proposal":"...","rationale":"...","toStage":"...optional, exact stage name",
"suggestedWording":"...optional WhatsApp reply draft, warm and concise",
"sourceSnippet":"...short quote from the thread"}]}.
Only propose what the messages clearly support. Prefer one good suggestion
over two weak ones. Empty list is fine.`;

/* ---------------- Heuristic fallback (no key) ---------------- */

function heuristicPropose(
  messages: { direction: string; text: string }[],
  deal: Doc<"deals"> | null
): ProposedSuggestion[] {
  const lastIn = [...messages].reverse().find((m) => m.direction === "in");
  if (!lastIn || !deal) return [];
  const text = lastIn.text.toLowerCase();
  const snippet = lastIn.text.slice(0, 90);

  if (/(po number|po raised|purchase order|funds release|payment (sent|made)|paid)/.test(text)) {
    const toStage = deal.stage === "Awaiting Funds" || deal.stage === "Won" ? "Won" : "Awaiting Funds";
    if (deal.stage !== toStage) {
      return [{
        type: "Stage change",
        proposal: `Move to ${toStage} — payment signals in the chat`,
        rationale: "The conversation mentions a purchase order / funds being released. (Heuristic — connect OpenAI for full analysis.)",
        toStage,
        sourceSnippet: snippet,
      }];
    }
  }
  if (/(quote|pricing|price|cost)/.test(text) && (deal.stage === "Enquiry" || deal.stage === "Interested")) {
    return [{
      type: "New task",
      proposal: "Send the requested pricing/quote",
      rationale: "The school asked for pricing in the chat. (Heuristic — connect OpenAI for full analysis.)",
      sourceSnippet: snippet,
    }];
  }
  return [];
}

/* ---------------- Insert with dedupe (Gate 2 entry point) ---------------- */

export const insertProposals = internalMutation({
  args: {
    schoolId: v.id("schools"),
    dealId: v.optional(v.id("deals")),
    trigger: v.union(v.literal("conversation"), v.literal("time_in_pipeline")),
    assignedTo: v.id("users"),
    proposals: v.array(
      v.object({
        type: v.union(v.literal("Stage change"), v.literal("New task"), v.literal("Follow-up")),
        proposal: v.string(),
        rationale: v.string(),
        toStage: v.optional(v.string()),
        suggestedWording: v.optional(v.string()),
        sourceSnippet: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const VALID_STAGES = new Set([
      "Enquiry", "Quotation Sent", "Awaiting Response", "Awaiting Term",
      "Awaiting Funds", "No Response", "Interested", "Not Now", "Won", "Lost",
    ]);
    const pending = await ctx.db
      .query("suggestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    let inserted = 0;
    for (const p of args.proposals) {
      // One pending suggestion of a given type per school — no piling on.
      const dupe = pending.some((s) => s.schoolId === args.schoolId && s.type === p.type);
      if (dupe) continue;
      const toStage = p.toStage && VALID_STAGES.has(p.toStage) ? (p.toStage as Doc<"deals">["stage"]) : undefined;
      await ctx.db.insert("suggestions", {
        schoolId: args.schoolId,
        dealId: args.dealId,
        type: p.type,
        trigger: args.trigger,
        proposal: p.proposal,
        rationale: p.rationale,
        sourceSnippet: p.sourceSnippet,
        suggestedWording: p.suggestedWording,
        toStage: p.type === "Stage change" ? toStage : undefined,
        assignedTo: args.assignedTo,
        status: "pending",
      });
      inserted += 1;
    }
    return inserted;
  },
});

/** Conversation-driven analysis — scheduled by the sync for threads with new messages. */
export const analyzeThread = internalAction({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.engine.threadContextInternal, { threadId: args.threadId });
    if (!context || !context.deal) return;

    let proposals =
      (await openaiPropose(
        ANALYSIS_SYSTEM,
        JSON.stringify({
          school: context.schoolName,
          pipeline: context.deal.pipelineType,
          currentStage: context.deal.stage,
          dealNote: context.deal.note,
          thread: context.messages,
        })
      )) ?? heuristicPropose(context.messages, context.deal);

    if (proposals.length === 0) return;
    await ctx.runMutation(internal.engine.insertProposals, {
      schoolId: context.schoolId,
      dealId: context.deal._id,
      trigger: "conversation",
      assignedTo: context.deal.assignedTo,
      proposals,
    });
  },
});

export const threadContextInternal = internalQuery({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args): Promise<{
    schoolId: Id<"schools">;
    schoolName: string;
    deal: Doc<"deals"> | null;
    messages: { direction: string; text: string }[];
  } | null> => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread || !thread.schoolId || !thread.following) return null;
    const school = await ctx.db.get(thread.schoolId);
    if (!school) return null;
    const messages = await ctx.db
      .query("messages").withIndex("by_thread", (q) => q.eq("threadId", args.threadId)).collect();
    const deal = await ctx.db
      .query("deals").withIndex("by_school", (q) => q.eq("schoolId", thread.schoolId!)).first();
    return {
      schoolId: school._id,
      schoolName: school.name,
      deal,
      messages: messages.slice(-10).map((m) => ({ direction: m.direction, text: m.text })),
    };
  },
});

/* ---------------- Time-in-pipeline sweep (daily cron) ---------------- */

export const timeSweep = internalAction({
  args: {},
  handler: async (ctx) => {
    const candidates = await ctx.runQuery(internal.engine.timeCandidates);
    let raised = 0;
    for (const c of candidates) {
      let wording = c.templateWording;
      const llm = await openaiPropose(
        `You draft short, warm WhatsApp follow-ups for a Zimbabwean school-sales
rep (smart boards / sports equipment). Respond as JSON:
{"suggestions":[{"type":"Follow-up","proposal":"...","rationale":"...",
"suggestedWording":"the message to send"}]}. One suggestion only.`,
        JSON.stringify({ school: c.schoolName, contact: c.contactName, situation: c.situation })
      );
      const first = llm?.[0];
      if (first?.suggestedWording) wording = first.suggestedWording;
      raised += await ctx.runMutation(internal.engine.insertProposals, {
        schoolId: c.schoolId,
        dealId: c.dealId,
        trigger: "time_in_pipeline",
        assignedTo: c.assignedTo,
        proposals: [{
          type: "Follow-up",
          proposal: c.proposal,
          rationale: c.rationale,
          suggestedWording: wording,
        }],
      });
    }
    return { raised };
  },
});

export const timeCandidates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const term = daysUntilNextTerm(now);
    const deals = await ctx.db.query("deals").collect();
    const out: {
      schoolId: Id<"schools">; dealId: Id<"deals">; assignedTo: Id<"users">;
      schoolName: string; contactName: string; situation: string;
      proposal: string; rationale: string; templateWording: string;
    }[] = [];
    for (const d of deals) {
      const school = await ctx.db.get(d.schoolId);
      if (!school || !school.following) continue;
      const ageDays = Math.floor((Date.now() - d._creationTime) / 86400000);
      const contact = await ctx.db
        .query("contacts").withIndex("by_school", (q) => q.eq("schoolId", d.schoolId)).first();
      const head = contact?.name ?? "the head";
      if (d.stage === "Awaiting Term" && term.days <= TERM_WINDOW_DAYS) {
        out.push({
          schoolId: d.schoolId, dealId: d._id, assignedTo: d.assignedTo,
          schoolName: school.name, contactName: head,
          situation: `${term.label} starts in ${term.days} days; they were waiting for the new term/budget cycle.`,
          proposal: `${term.label[0].toUpperCase() + term.label.slice(1)} is ${term.days} days away — re-open ${school.name}`,
          rationale: `${school.name} has been in Awaiting Term; their trigger (the new term) is now ${term.days} days out.`,
          templateWording: `Good morning — ${term.label} is around the corner and I remember timing was the constraint. Shall we pencil in delivery so the boards are in before classes start?`,
        });
      } else if (d.stage === "No Response" && ageDays >= NO_RESPONSE_NUDGE_DAYS) {
        out.push({
          schoolId: d.schoolId, dealId: d._id, assignedTo: d.assignedTo,
          schoolName: school.name, contactName: head,
          situation: `Quote sent, no reply. The deal has sat unanswered.`,
          proposal: `${school.name} hasn't replied to the quote — send a nudge`,
          rationale: `The deal sits in No Response. A short, warm check-in beats letting it go cold.`,
          templateWording: `Good day — just checking the smart-board quote reached you well. Happy to adjust sizes or phase the order if that helps.`,
        });
      } else if (d.stage === "Awaiting Funds" && ageDays >= AWAITING_FUNDS_STALE_DAYS) {
        out.push({
          schoolId: d.schoolId, dealId: d._id, assignedTo: d.assignedTo,
          schoolName: school.name, contactName: head,
          situation: `Approved but waiting on funds for ${ageDays} days.`,
          proposal: `${school.name} has waited on funds ${ageDays} days — check in`,
          rationale: `Awaiting Funds for ${ageDays} days; a gentle status check keeps the deal warm without pressure.`,
          templateWording: `Good morning — no rush at all, just keeping our delivery slot warm for you. Any movement on the funds side we should plan around?`,
        });
      }
    }
    return out;
  },
});
