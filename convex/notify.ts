import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sprint 1b reminders (addendum §5): a cron sweeps open tasks whose
 * remindAt has passed and raises an in-app notification for the assignee,
 * so "tomorrow" actually comes. Marking remindedAt keeps the sweep
 * idempotent.
 */

export const scanReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const open = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    let fired = 0;
    for (const t of open) {
      if (t.remindAt === undefined || t.remindAt > now || t.remindedAt !== undefined) continue;
      const school = t.schoolId ? await ctx.db.get(t.schoolId) : null;
      const dueIn = t.dueAt !== undefined ? Math.max(Math.round((t.dueAt - now) / 3600000), 0) : null;
      await ctx.db.insert("notifications", {
        userId: t.assignedTo,
        taskId: t._id,
        text: `Reminder: ${t.title}${school ? ` (${school.name})` : ""}${
          dueIn !== null ? ` — due in ~${dueIn}h` : ""
        }`,
        read: false,
      });
      await ctx.db.patch(t._id, { remindedAt: now });
      fired += 1;
    }
    return { fired };
  },
});

export const myNotifications = query({
  args: { initials: v.string() },
  handler: async (ctx, args) => {
    const user = (await ctx.db.query("users").collect()).find((u) => u.initials === args.initials);
    if (!user) return { unread: 0, items: [] };
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(12);
    return {
      unread: rows.filter((n) => !n.read).length,
      items: rows.map((n) => ({ _id: n._id, text: n.text, read: n.read })),
    };
  },
});

export const markAllRead = mutation({
  args: { initials: v.string() },
  handler: async (ctx, args) => {
    const user = (await ctx.db.query("users").collect()).find((u) => u.initials === args.initials);
    if (!user) return;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});
