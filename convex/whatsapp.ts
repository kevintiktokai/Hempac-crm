import { action, internalAction, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import type { ActionCtx } from "./_generated/server";

/**
 * Sprint 2 — read-only WhatsApp ingestion loop (BUILD-SCOPE §4.2, addendum §10).
 *
 * INVARIANTS
 * - READ-ONLY: this module only lists chats and messages. There is no send,
 *   react, or typing code path anywhere in the codebase.
 * - Inbox-wide tracking (client sign-off, Jul 2026): every business-line
 *   chat is ingested by default; any chat can be excluded per-conversation
 *   (`following: false`), and exclusions are respected at sync time —
 *   excluded chats' messages are never stored.
 * - Throttled: one sweep per cron tick, a hard cap on messages stored per
 *   sweep, no bursts — the footprint stays human-paced.
 *
 * CONNECTORS
 * - `stub` (default): deterministic simulated inbox so the whole loop is
 *   demonstrable before the business line is connected.
 * - `mcp`: the real connector, activated by setting WHATSAPP_MCP_URL (+
 *   optional WHATSAPP_MCP_API_KEY) via `npx convex env set`. Until the
 *   endpoint's exact shape is confirmed, it reports "awaiting credentials /
 *   endpoint mapping" rather than guessing.
 */

interface ConnectorChat {
  waChatId: string;
  phone: string;
  displayName: string;
  messages: { waMessageId: string; direction: "in" | "out"; text: string; sentAtLabel: string }[];
}

/**
 * Deterministic stub inbox. Waves unlock by sync count; stable waMessageIds
 * make re-syncs idempotent. Wave 2 includes an excluded-chat message
 * (Riverside) to prove exclusions are honoured.
 */
function stubInbox(syncCount: number): ConnectorChat[] {
  const waves: ConnectorChat[][] = [
    [
      {
        waChatId: "wa-263772104412", phone: "263772104412", displayName: "Greendale Group of Schools",
        messages: [
          { waMessageId: "gd-100", direction: "in", text: "Morning — PO number is PO-2214, raised this morning. Finance says funds release within the week.", sentAtLabel: "Fri 08:12" },
        ],
      },
      {
        waChatId: "wa-263779412855", phone: "263779412855", displayName: "Chisipite Senior School",
        messages: [
          { waMessageId: "ch-100", direction: "in", text: "Hello, we saw the boards at Northgate's open day. Could you send pricing for our senior block?", sentAtLabel: "Fri 09:03" },
        ],
      },
    ],
    [
      {
        waChatId: "wa-263773310290", phone: "263773310290", displayName: "Highfield Trust College",
        messages: [
          { waMessageId: "hf-100", direction: "in", text: "The bursar has the quote. He'd like the phased-delivery option costed too.", sentAtLabel: "Fri 10:41" },
        ],
      },
      {
        waChatId: "wa-263777740516", phone: "263777740516", displayName: "Riverside Day School",
        messages: [
          { waMessageId: "rv-100", direction: "in", text: "Thanks for the proposal, reviewing with alumni committee.", sentAtLabel: "Fri 11:20" },
        ],
      },
    ],
  ];
  return waves[syncCount] ?? [];
}

async function doSync(ctx: ActionCtx): Promise<{ mode: string; result: string }> {
  const state = await ctx.runQuery(api.whatsapp.getState);
  const mcpUrl = process.env.WHATSAPP_MCP_URL;

  let chats: ConnectorChat[];
  let mode: "stub" | "mcp";
  if (mcpUrl) {
    // Real connector: wire the endpoint's list-chats/list-messages calls
    // here once the business line is plugged in. Read-only by
    // construction — only GET/list operations belong in this branch.
    mode = "mcp";
    return {
      mode,
      result: await ctx.runMutation(internal.whatsapp.recordResult, {
        mode,
        result: "WHATSAPP_MCP_URL set — endpoint mapping pending; no data pulled",
      }),
    };
  } else {
    mode = "stub";
    chats = stubInbox(state?.syncCount ?? 0);
  }

  const summary: string = await ctx.runMutation(internal.whatsapp.ingest, { chats, mode });
  return { mode, result: summary };
}

/** Manual sweep — the Settings "Sync now" button. */
export const syncInbox = action({
  args: {},
  handler: async (ctx) => doSync(ctx),
});

/** Cron entry point. */
export const runSync = internalAction({
  args: {},
  handler: async (ctx) => {
    await doSync(ctx);
  },
});

export const getState = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("syncState").collect())[0] ?? null,
});

export const recordResult = internalMutation({
  args: { mode: v.union(v.literal("stub"), v.literal("mcp")), result: v.string() },
  handler: async (ctx, args) => {
    const state = (await ctx.db.query("syncState").collect())[0];
    if (state) {
      await ctx.db.patch(state._id, { mode: args.mode, lastSyncAt: Date.now(), lastResult: args.result });
    } else {
      await ctx.db.insert("syncState", {
        mode: args.mode, lastSyncAt: Date.now(), syncCount: 0,
        lastResult: args.result, messagesPerSyncCap: 30,
      });
    }
    return args.result;
  },
});

export const ingest = internalMutation({
  args: {
    mode: v.union(v.literal("stub"), v.literal("mcp")),
    chats: v.array(
      v.object({
        waChatId: v.string(),
        phone: v.string(),
        displayName: v.string(),
        messages: v.array(
          v.object({
            waMessageId: v.string(),
            direction: v.union(v.literal("in"), v.literal("out")),
            text: v.string(),
            sentAtLabel: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const state = (await ctx.db.query("syncState").collect())[0];
    const cap = state?.messagesPerSyncCap ?? 30;
    const schools = await ctx.db.query("schools").collect();

    let newMessages = 0;
    let newChats = 0;
    let skippedExcluded = 0;

    for (const chat of args.chats) {
      let thread = await ctx.db
        .query("threads")
        .withIndex("by_waChatId", (q) => q.eq("waChatId", chat.waChatId))
        .first();

      if (!thread) {
        // Inbox-wide default: new chats are tracked from the start; link to
        // a school when the phone matches, otherwise stay unlinked.
        const school = schools.find((s) => s.phone === chat.phone);
        const threadId = await ctx.db.insert("threads", {
          schoolId: school?._id,
          waChatId: chat.waChatId,
          phone: chat.phone,
          displayName: chat.displayName,
          following: true,
          lastSyncAt: Date.now(),
        });
        thread = await ctx.db.get(threadId);
        newChats += 1;
        // Unknown number → propose extracting a lead (Gate 2: the lead is
        // only created if a human accepts).
        if (!school && thread) {
          const founder = (await ctx.db.query("users").collect()).find((u) => u.initials === "EC");
          if (founder) {
            await ctx.db.insert("suggestions", {
              threadId: thread._id,
              type: "New lead",
              trigger: "conversation",
              proposal: `Create lead from new chat: ${chat.displayName}`,
              rationale: "New conversation on the business line from a number the CRM doesn't know yet.",
              sourceSnippet: chat.messages[0]?.text,
              assignedTo: founder._id,
              status: "pending",
            });
          }
        }
      }
      if (!thread) continue;

      if (!thread.following) {
        // Per-conversation exclusion: never store excluded chats' messages.
        skippedExcluded += chat.messages.length;
        continue;
      }

      for (const m of chat.messages) {
        if (newMessages >= cap) break;
        const existing = await ctx.db
          .query("messages")
          .withIndex("by_waMessageId", (q) => q.eq("waMessageId", m.waMessageId))
          .first();
        if (existing) continue;
        await ctx.db.insert("messages", {
          threadId: thread._id,
          direction: m.direction,
          text: m.text,
          sentAtLabel: m.sentAtLabel,
          waMessageId: m.waMessageId,
        });
        newMessages += 1;
      }
      await ctx.db.patch(thread._id, { lastSyncAt: Date.now() });
    }

    const result = `+${newMessages} messages, +${newChats} chats${
      skippedExcluded ? `, ${skippedExcluded} skipped (excluded chats)` : ""
    }`;
    if (state) {
      await ctx.db.patch(state._id, {
        mode: args.mode,
        lastSyncAt: Date.now(),
        syncCount: state.syncCount + (newMessages > 0 || newChats > 0 ? 1 : 0),
        lastResult: result,
      });
    } else {
      await ctx.db.insert("syncState", {
        mode: args.mode, lastSyncAt: Date.now(),
        syncCount: newMessages > 0 || newChats > 0 ? 1 : 0,
        lastResult: result, messagesPerSyncCap: 30,
      });
    }
    return result;
  },
});

/** Chat list for the Inbox section and Settings → Data & consent. */
export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    const threads = await ctx.db.query("threads").collect();
    const rows = await Promise.all(
      threads.map(async (t) => {
        const school = t.schoolId ? await ctx.db.get(t.schoolId) : null;
        const messages = await ctx.db
          .query("messages").withIndex("by_thread", (q) => q.eq("threadId", t._id)).collect();
        const last = messages[messages.length - 1];
        return {
          _id: t._id,
          name: school?.name ?? t.displayName ?? t.phone ?? "Unknown chat",
          linked: school !== null,
          schoolId: t.schoolId,
          phone: t.phone,
          following: t.following,
          messageCount: messages.length,
          lastMessage: last ? `${last.direction === "out" ? "You: " : ""}${last.text}` : "No messages yet",
          lastAt: last?._creationTime ?? t.lastSyncAt,
        };
      })
    );
    return rows.sort((a, b) => b.lastAt - a.lastAt);
  },
});

/** One conversation for the Inbox reading pane — read-only, always. */
export const getThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;
    const school = thread.schoolId ? await ctx.db.get(thread.schoolId) : null;
    const messages = await ctx.db
      .query("messages").withIndex("by_thread", (q) => q.eq("threadId", args.threadId)).collect();
    const pendingLead = (
      await ctx.db.query("suggestions").withIndex("by_status", (q) => q.eq("status", "pending")).collect()
    ).find((s) => s.threadId === args.threadId && s.type === "New lead");
    return {
      thread: {
        _id: thread._id,
        name: school?.name ?? thread.displayName ?? thread.phone ?? "Unknown chat",
        phone: thread.phone,
        following: thread.following,
        linked: school !== null,
        schoolId: thread.schoolId,
      },
      messages: messages.map((m) => ({ dir: m.direction, text: m.text, time: m.sentAtLabel })),
      pendingLeadSuggestionId: pendingLead?._id ?? null,
    };
  },
});
