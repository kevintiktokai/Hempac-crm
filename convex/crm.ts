import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sprint 0 starter queries — prove the schema end-to-end. Sprint 1 grows
 * these into the full read API behind the approved UI.
 */

export const listSchools = query({
  args: {},
  handler: async (ctx) => {
    const schools = await ctx.db.query("schools").collect();
    return schools.sort((a, b) => b.fitScore - a.fitScore);
  },
});

export const listDeals = query({
  args: { pipelineType: v.optional(v.union(v.literal("boards"), v.literal("sports"))) },
  handler: async (ctx, args) => {
    const deals = await ctx.db.query("deals").collect();
    return args.pipelineType ? deals.filter((d) => d.pipelineType === args.pipelineType) : deals;
  },
});

export const pendingSuggestions = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("suggestions").withIndex("by_status", (q) => q.eq("status", "pending")).collect(),
});

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const deals = await ctx.db.query("deals").collect();
    const quotes = await ctx.db.query("quotes").collect();
    const orders = await ctx.db.query("orders").collect();
    const open = deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost");
    const won = quotes.filter((q) => q.status === "won");
    return {
      pipelineValue: open.reduce((a, d) => a + d.value, 0),
      openDeals: open.length,
      quotesSent: quotes.length,
      quotesSentValue: quotes.reduce((a, q) => a + q.value, 0),
      quotesWon: won.length,
      quotesWonValue: won.reduce((a, q) => a + q.value, 0),
      boardsSoldUnits: orders
        .filter((o) => o.product === "Smart Boards")
        .reduce((a, o) => a + o.units, 0),
    };
  },
});
