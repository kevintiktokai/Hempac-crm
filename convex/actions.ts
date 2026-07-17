import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id, Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

/**
 * Sprint 1 write API. Every mutation is audit-logged (addendum §3).
 * No auth yet — the caller passes the acting user's initials; a real
 * identity replaces this in the auth sprint. Gate 2 lives here: suggestion
 * effects only apply through acceptSuggestion.
 */

const dealStage = v.union(
  v.literal("Enquiry"), v.literal("Quotation Sent"),
  v.literal("Awaiting Response"), v.literal("Awaiting Term"),
  v.literal("Awaiting Funds"), v.literal("No Response"),
  v.literal("Interested"), v.literal("Not Now"),
  v.literal("Won"), v.literal("Lost")
);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${hh}:${mm}`;
}

async function actor(ctx: MutationCtx, initials: string): Promise<Doc<"users">> {
  const user = (await ctx.db.query("users").collect()).find((u) => u.initials === initials);
  if (!user) throw new Error(`Unknown actor ${initials}`);
  return user;
}

async function applyStageMove(
  ctx: MutationCtx,
  dealId: Id<"deals">,
  stage: Doc<"deals">["stage"],
  actorId: Id<"users">
): Promise<void> {
  const deal = await ctx.db.get(dealId);
  if (!deal || deal.stage === stage) return;
  const school = await ctx.db.get(deal.schoolId);
  await ctx.db.patch(dealId, { stage });
  await ctx.db.insert("audit", {
    entity: "deals",
    entityId: dealId,
    action: `${school?.name ?? "Deal"} moved: ${deal.stage} → ${stage}`,
    fromValue: deal.stage,
    toValue: stage,
    actorId,
    atLabel: nowLabel(),
  });
}

export const moveDeal = mutation({
  args: { dealId: v.id("deals"), stage: dealStage, actorInitials: v.string() },
  handler: async (ctx, args) => {
    const user = await actor(ctx, args.actorInitials);
    await applyStageMove(ctx, args.dealId, args.stage, user._id);
  },
});

export const acceptSuggestion = mutation({
  args: { suggestionId: v.id("suggestions"), actorInitials: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.suggestionId);
    if (!s || s.status !== "pending") return;
    const user = await actor(ctx, args.actorInitials);

    if (s.type === "Stage change" && s.dealId && s.toStage) {
      await applyStageMove(ctx, s.dealId, s.toStage, user._id);
    } else if (s.type === "Task done") {
      const open = (
        await ctx.db.query("tasks").withIndex("by_school", (q) => q.eq("schoolId", s.schoolId)).collect()
      ).find((t) => t.status === "open");
      if (open) {
        await ctx.db.patch(open._id, {
          status: "done", completedBy: user._id, completedAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("tasks", {
        schoolId: s.schoolId,
        dealId: s.dealId,
        title: s.proposal,
        kind: s.type === "Follow-up" ? "whatsapp" : "followup",
        dueAt: Date.now() + 3 * 24 * 3600 * 1000,
        assignedTo: s.assignedTo,
        status: "open",
      });
    }

    await ctx.db.patch(args.suggestionId, { status: "accepted" });
    await ctx.db.insert("audit", {
      entity: "suggestions",
      entityId: args.suggestionId,
      action: `Accepted: ${s.proposal}`,
      actorId: user._id,
      atLabel: nowLabel(),
    });
  },
});

export const dismissSuggestion = mutation({
  args: { suggestionId: v.id("suggestions"), actorInitials: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.suggestionId);
    if (!s || s.status !== "pending") return;
    const user = await actor(ctx, args.actorInitials);
    await ctx.db.patch(args.suggestionId, { status: "dismissed" });
    await ctx.db.insert("audit", {
      entity: "suggestions",
      entityId: args.suggestionId,
      action: `Dismissed: ${s.proposal}`,
      actorId: user._id,
      atLabel: nowLabel(),
    });
  },
});

export const toggleTask = mutation({
  args: { taskId: v.id("tasks"), actorInitials: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return;
    const user = await actor(ctx, args.actorInitials);
    if (task.status === "open") {
      await ctx.db.patch(args.taskId, {
        status: "done", completedBy: user._id, completedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.taskId, {
        status: "open", completedBy: undefined, completedAt: undefined,
      });
    }
  },
});

/** Log a task/reminder against a school or standalone (addendum §5). */
export const createTask = mutation({
  args: {
    title: v.string(),
    kind: v.union(
      v.literal("followup"), v.literal("meeting"), v.literal("call"),
      v.literal("whatsapp"), v.literal("other")
    ),
    schoolId: v.optional(v.id("schools")),
    assigneeInitials: v.string(),
    dueAt: v.number(),
    remindAt: v.optional(v.number()),
    actorInitials: v.string(),
  },
  handler: async (ctx, args) => {
    const creator = await actor(ctx, args.actorInitials);
    const assignee = await actor(ctx, args.assigneeInitials);
    const taskId = await ctx.db.insert("tasks", {
      schoolId: args.schoolId,
      title: args.title,
      kind: args.kind,
      dueAt: args.dueAt,
      remindAt: args.remindAt,
      assignedTo: assignee._id,
      status: "open",
    });
    await ctx.db.insert("audit", {
      entity: "tasks",
      entityId: taskId,
      action: `Task logged: ${args.title} (assigned ${assignee.name.split(" ")[0]})`,
      actorId: creator._id,
      atLabel: nowLabel(),
    });
    return taskId;
  },
});

/** Gate 1 — per-conversation tracking opt-in, mirrored onto the thread. */
export const toggleFollow = mutation({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) return;
    const following = !school.following;
    await ctx.db.patch(args.schoolId, { following });
    const thread = await ctx.db
      .query("threads").withIndex("by_school", (q) => q.eq("schoolId", args.schoolId)).first();
    if (thread) await ctx.db.patch(thread._id, { following });
  },
});
