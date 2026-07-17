import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

/**
 * Sprint 1 read API — display-ready, server-side-joined payloads for the
 * approved screens. No auth yet: shared visibility per addendum §6.
 */

const BOARD_SIZES = ["65\"", "75\"", "86\""] as const;
const QUOTE_BUCKETS = ["Awaiting Response", "Awaiting Term", "Awaiting Funds", "No Response"] as const;
const BOARDS_BAR_STAGES = ["Enquiry", "Quotation Sent", ...QUOTE_BUCKETS] as const;

async function userMap(ctx: QueryCtx): Promise<Map<Id<"users">, Doc<"users">>> {
  const users = await ctx.db.query("users").collect();
  return new Map(users.map((u) => [u._id, u]));
}

function enrichSuggestion(
  s: Doc<"suggestions">,
  school: Doc<"schools"> | null,
  assignee: Doc<"users"> | undefined
) {
  return {
    _id: s._id,
    schoolId: s.schoolId,
    schoolName: school?.name ?? "Unknown school",
    schoolPhone: school?.phone ?? "",
    dealId: s.dealId,
    type: s.type,
    trigger: s.trigger,
    proposal: s.proposal,
    rationale: s.rationale,
    sourceSnippet: s.sourceSnippet,
    suggestedWording: s.suggestedWording,
    toStage: s.toStage,
    assigneeInitials: assignee?.initials ?? "?",
    assigneeName: assignee?.name ?? "Unknown",
    status: s.status,
  };
}
export type EnrichedSuggestion = ReturnType<typeof enrichSuggestion>;

function enrichTask(s: Doc<"tasks">, school: Doc<"schools"> | null, assignee: Doc<"users"> | undefined) {
  return {
    _id: s._id,
    schoolId: s.schoolId,
    schoolName: school?.name,
    title: s.title,
    kind: s.kind,
    dueLabel: s.dueLabel,
    remindLabel: s.remindLabel,
    assigneeInitials: assignee?.initials ?? "?",
    done: s.status === "done",
  };
}
export type EnrichedTask = ReturnType<typeof enrichTask>;

export const listUsers = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").collect(),
});

export const listSchools = query({
  args: {},
  handler: async (ctx) => {
    const schools = await ctx.db.query("schools").collect();
    return schools.sort((a, b) => b.fitScore - a.fitScore);
  },
});

export const engineSettings = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("engine").collect())[0] ?? null,
});

export const pendingSuggestions = query({
  args: {},
  handler: async (ctx) => {
    const users = await userMap(ctx);
    const pending = await ctx.db
      .query("suggestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return Promise.all(
      pending.map(async (s) =>
        enrichSuggestion(s, await ctx.db.get(s.schoolId), users.get(s.assignedTo))
      )
    );
  },
});

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    const users = await userMap(ctx);
    const tasks = await ctx.db.query("tasks").collect();
    return Promise.all(
      tasks.map(async (t) =>
        enrichTask(t, t.schoolId ? await ctx.db.get(t.schoolId) : null, users.get(t.assignedTo))
      )
    );
  },
});

/** Recent team activity for the rail — accept/dismiss/move audit entries first. */
export const recentActivity = query({
  args: {},
  handler: async (ctx) => {
    const users = await userMap(ctx);
    const rows = await ctx.db.query("audit").order("desc").take(8);
    return rows.map((a) => ({
      _id: a._id,
      text: a.action,
      actorInitials: users.get(a.actorId)?.initials ?? "?",
      atLabel: a.atLabel,
      kind: a.action.startsWith("Accepted") ? ("accepted" as const)
        : a.action.startsWith("Dismissed") ? ("dismissed" as const)
        : ("moved" as const),
    }));
  },
});

export const board = query({
  args: { pipelineType: v.union(v.literal("boards"), v.literal("sports")) },
  handler: async (ctx, args) => {
    const users = await userMap(ctx);
    const deals = (await ctx.db.query("deals").collect()).filter(
      (d) => d.pipelineType === args.pipelineType
    );
    const enriched = await Promise.all(
      deals.map(async (d) => {
        const school = await ctx.db.get(d.schoolId);
        const assignee = users.get(d.assignedTo);
        return {
          _id: d._id,
          schoolId: d.schoolId,
          schoolName: school?.name ?? "Unknown",
          stage: d.stage,
          product: d.product,
          units: d.units,
          boardSize: d.boardSize,
          value: d.value,
          note: d.note,
          assigneeInitials: assignee?.initials ?? "?",
          assigneeName: assignee?.name ?? "Unknown",
          assigneeRole: assignee?.role ?? "member",
        };
      })
    );
    // Historical wins (orders without a live deal) keep the Won column alive
    const orders = await ctx.db.query("orders").collect();
    const historicalWins = orders
      .filter((o) =>
        args.pipelineType === "boards"
          ? o.product === "Smart Boards" && o.schoolId === undefined
          : o.product === "Sports Equipment"
      )
      .map((o) => ({
        name: o.schoolName,
        detail: o.boardSize ? `${o.units} × ${o.boardSize}` : "kit order",
        value: o.value,
        ownerInitials: users.get(o.ownerId)?.initials ?? "?",
      }));
    return { deals: enriched, historicalWins };
  },
});

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();
    const quotes = await ctx.db.query("quotes").collect();
    const orders = await ctx.db.query("orders").collect();

    const open = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    const boards = deals.filter((d) => d.pipelineType === "boards");
    const sports = deals.filter((d) => d.pipelineType === "sports");

    const stageValue = (stage: string): number =>
      boards.filter((d) => d.stage === stage).reduce((a, d) => a + d.value, 0);

    const converted = quotes.filter((q) => q.status === "won");
    const boardsOrders = orders.filter((o) => o.product === "Smart Boards");

    return {
      pipelineValue: open.reduce((a, d) => a + d.value, 0),
      openDeals: open.length,
      wonThisQuarter: orders.filter((o) => o.period !== "year").reduce((a, o) => a + o.value, 0),
      barData: BOARDS_BAR_STAGES.map((s) => ({ label: s.replace("Awaiting ", "Aw. "), value: stageValue(s) })),
      buckets: QUOTE_BUCKETS.map((b) => ({
        bucket: b,
        value: stageValue(b),
        count: boards.filter((d) => d.stage === b).length,
      })),
      quotesSent: quotes.length,
      quotesSentValue: quotes.reduce((a, q) => a + q.value, 0),
      quotesWon: converted.length,
      quotesWonValue: converted.reduce((a, q) => a + q.value, 0),
      boardsSold: BOARD_SIZES.map((size) => ({
        size,
        units: boardsOrders.filter((o) => o.boardSize === size).reduce((a, o) => a + o.units, 0),
      })),
      boardsSoldUnits: boardsOrders.reduce((a, o) => a + o.units, 0),
      boardsSoldValue: boardsOrders.reduce((a, o) => a + o.value, 0),
      sports: {
        enquiry: sports.filter((d) => d.stage === "Enquiry").length,
        interested: sports.filter((d) => d.stage === "Interested").length,
        notNow: sports.filter((d) => d.stage === "Not Now").length,
        won:
          sports.filter((d) => d.stage === "Won").length +
          orders.filter((o) => o.product === "Sports Equipment").length,
      },
    };
  },
});

export const getSchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) return null;
    const users = await userMap(ctx);

    const contacts = await ctx.db
      .query("contacts").withIndex("by_school", (q) => q.eq("schoolId", args.schoolId)).collect();

    const thread = await ctx.db
      .query("threads").withIndex("by_school", (q) => q.eq("schoolId", args.schoolId)).first();
    const messages = thread
      ? await ctx.db.query("messages").withIndex("by_thread", (q) => q.eq("threadId", thread._id)).collect()
      : [];

    const deals = await ctx.db
      .query("deals").withIndex("by_school", (q) => q.eq("schoolId", args.schoolId)).collect();

    const quotes = (await ctx.db.query("quotes").collect()).filter(
      (q) => q.schoolId === args.schoolId
    );

    const audit = (
      await Promise.all(
        deals.map((d) =>
          ctx.db.query("audit")
            .withIndex("by_entity", (q) => q.eq("entity", "deals").eq("entityId", d._id))
            .collect()
        )
      )
    ).flat();

    const suggestions = (
      await ctx.db.query("suggestions")
        .withIndex("by_school_status", (q) => q.eq("schoolId", args.schoolId).eq("status", "pending"))
        .collect()
    ).map((s) => enrichSuggestion(s, school, users.get(s.assignedTo)));

    const tasks = (
      await ctx.db.query("tasks").withIndex("by_school", (q) => q.eq("schoolId", args.schoolId)).collect()
    ).map((t) => enrichTask(t, school, users.get(t.assignedTo)));

    return {
      school,
      contacts,
      messages: messages.map((m) => ({ dir: m.direction, text: m.text, time: m.sentAtLabel })),
      deals: deals.map((d) => ({
        _id: d._id,
        pipelineType: d.pipelineType,
        stage: d.stage,
        product: d.product,
        units: d.units,
        boardSize: d.boardSize,
        value: d.value,
        createdAtLabel: d.createdAtLabel,
        assigneeInitials: users.get(d.assignedTo)?.initials ?? "?",
        assigneeFirstName: (users.get(d.assignedTo)?.name ?? "?").split(" ")[0],
        assigneeRole: users.get(d.assignedTo)?.role ?? "member",
        creatorInitials: users.get(d.createdBy)?.initials ?? "?",
      })),
      quotes: quotes.map((q) => ({
        _id: q._id,
        units: q.units,
        boardSize: q.boardSize,
        value: q.value,
        status: q.status,
        sentAtLabel: q.sentAtLabel,
        ownerInitials: users.get(q.ownerId)?.initials ?? "?",
      })),
      audit: audit.map((a) => ({
        _id: a._id,
        action: a.action,
        actorInitials: users.get(a.actorId)?.initials ?? "?",
        atLabel: a.atLabel,
      })),
      suggestions,
      tasks,
    };
  },
});

/** Reports & leaderboard (addendum §9). Follow-up rate stays a sample figure until task history is real (Sprint 1b). */
const FOLLOWUP_RATE: Record<string, number> = { EC: 86, GB: 91, TC: 74, RK: 63 };

export const reports = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const quotes = await ctx.db.query("quotes").collect();
    const orders = await ctx.db.query("orders").collect();
    const tasks = await ctx.db.query("tasks").collect();

    const rows = users
      .map((u) => {
        const sent = quotes.filter((q) => q.ownerId === u._id);
        const won = sent.filter((q) => q.status === "won");
        return {
          userId: u._id,
          name: u.name,
          initials: u.initials,
          role: u.role,
          sent: sent.length,
          sentValue: sent.reduce((a, q) => a + q.value, 0),
          won: won.length,
          wonValue: won.reduce((a, q) => a + q.value, 0),
          soldValue: orders.filter((o) => o.ownerId === u._id).reduce((a, o) => a + o.value, 0),
          followUp: FOLLOWUP_RATE[u.initials] ?? 70,
          tasksDone: tasks.filter((t) => t.assignedTo === u._id && t.status === "done").length,
        };
      })
      .sort((a, b) => b.soldValue - a.soldValue);

    const boardsOrders = orders.filter((o) => o.product === "Smart Boards");
    return {
      rows,
      boardsBySize: BOARD_SIZES.map((size) => ({
        size,
        units: boardsOrders.filter((o) => o.boardSize === size).reduce((a, o) => a + o.units, 0),
        value: boardsOrders.filter((o) => o.boardSize === size).reduce((a, o) => a + o.value, 0),
      })),
    };
  },
});
