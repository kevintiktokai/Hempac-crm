import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  AUDIT, DEALS, ORDERS, QUOTES, SCHOOLS, SUGGESTIONS, TASKS, USERS,
} from "../lib/sampleData";

/**
 * Sprint 0 seed: loads the approved prototype dataset into Convex so
 * Sprint 1 can wire the UI to real queries against familiar data.
 * Idempotent: wipes and re-inserts. Run with `npx convex run seed:run`.
 */
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // wipe (dev-only convenience; tables are small)
    for (const table of [
      "messages", "threads", "audit", "suggestions", "tasks", "orders",
      "quotes", "deals", "contacts", "schools", "users", "engine",
    ] as const) {
      const rows = await ctx.db.query(table).collect();
      await Promise.all(rows.map((r) => ctx.db.delete(r._id)));
    }

    const userIds = new Map<string, Id<"users">>();
    for (const u of USERS) {
      userIds.set(u.id, await ctx.db.insert("users", {
        name: u.name, initials: u.initials, role: u.role,
      }));
    }
    const uid = (key: string): Id<"users"> => {
      const id = userIds.get(key);
      if (!id) throw new Error(`unknown user ${key}`);
      return id;
    };

    const schoolIds = new Map<number, Id<"schools">>();
    for (const s of SCHOOLS) {
      const schoolId = await ctx.db.insert("schools", {
        name: s.name, type: s.type, region: s.region, enrolment: s.enrol,
        fitScore: s.fit, signal: s.signal, engineStage: s.eng, product: s.product,
        phone: s.phone, following: s.following, nextBestAction: s.next,
      });
      schoolIds.set(s.id, schoolId);

      await ctx.db.insert("contacts", { schoolId, name: s.head, role: s.headRole, phone: s.phone });
      if (s.bursar && s.bursar !== "—") {
        await ctx.db.insert("contacts", { schoolId, name: s.bursar, role: s.bursarRole });
      }

      if (s.wa.length > 0) {
        const threadId = await ctx.db.insert("threads", {
          schoolId, waChatId: `wa-${s.phone}`, following: s.following, lastSyncAt: Date.now(),
        });
        for (const m of s.wa) {
          await ctx.db.insert("messages", {
            threadId, direction: m.dir, text: m.text, sentAtLabel: m.time,
          });
        }
      }
    }
    const sid = (key: number): Id<"schools"> => {
      const id = schoolIds.get(key);
      if (!id) throw new Error(`unknown school ${key}`);
      return id;
    };

    const dealIds = new Map<string, Id<"deals">>();
    for (const d of DEALS) {
      dealIds.set(d.id, await ctx.db.insert("deals", {
        schoolId: sid(d.schoolId), pipelineType: d.pipeline, stage: d.stage,
        product: d.product, units: d.units, boardSize: d.boardSize, value: d.value,
        assignedTo: uid(d.assignedTo), createdBy: uid(d.createdBy),
        createdAtLabel: d.createdAt, note: d.note,
      }));
    }

    for (const q of QUOTES) {
      await ctx.db.insert("quotes", {
        schoolId: q.schoolId === null ? undefined : sid(q.schoolId),
        schoolName: q.schoolName,
        dealId: q.dealId ? dealIds.get(q.dealId) : undefined,
        pipelineType: q.pipeline, value: q.value, units: q.units,
        boardSize: q.boardSize, status: q.status, sentAtLabel: q.sentAt,
        ownerId: uid(q.ownerId),
      });
    }

    for (const o of ORDERS) {
      await ctx.db.insert("orders", {
        schoolId: o.schoolId === null ? undefined : sid(o.schoolId),
        schoolName: o.schoolName, product: o.product, boardSize: o.boardSize,
        units: o.units, value: o.value, soldAtLabel: o.soldAt, period: o.period,
        ownerId: uid(o.ownerId),
      });
    }

    for (const t of TASKS) {
      await ctx.db.insert("tasks", {
        schoolId: t.schoolId === null ? undefined : sid(t.schoolId),
        title: t.title, kind: t.kind, dueLabel: t.due, remindLabel: t.remind,
        assignedTo: uid(t.assignedTo), status: t.done ? "done" : "open",
      });
    }

    for (const s of SUGGESTIONS) {
      await ctx.db.insert("suggestions", {
        schoolId: sid(s.schoolId),
        dealId: s.dealId ? dealIds.get(s.dealId) : undefined,
        type: s.type, trigger: s.trigger, proposal: s.proposal,
        rationale: s.rationale, sourceSnippet: s.sourceSnippet,
        suggestedWording: s.suggestedWording, toStage: s.toStage,
        assignedTo: uid(s.assignedTo), status: s.status,
      });
    }

    for (const a of AUDIT) {
      const dealId = dealIds.get(a.dealId);
      if (!dealId) continue;
      await ctx.db.insert("audit", {
        entity: "deals", entityId: dealId, action: a.action,
        actorId: uid(a.actorId), atLabel: a.at,
      });
    }

    await ctx.db.insert("engine", {
      segments: ["Private", "Trust", "Mission"],
      regions: ["Harare", "Bulawayo", "Mutare", "Gweru"],
      productFocus: "Smart Boards",
      throughputCap: 10,
      active: true,
    });

    return {
      users: USERS.length, schools: SCHOOLS.length, deals: DEALS.length,
      quotes: QUOTES.length, orders: ORDERS.length, tasks: TASKS.length,
      suggestions: SUGGESTIONS.length,
    };
  },
});
