import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema per BUILD-SCOPE §3 with the SCOPE-ADDENDUM-v3 §12 deltas.
 * Date-ish fields ("12 Jun", "Tue 09:41") stay display strings in Sprint 0
 * for parity with the approved prototype; Sprint 1b converts due/remind to
 * real timestamps when notifications land.
 */

const role = v.union(v.literal("admin"), v.literal("member"));
const pipelineType = v.union(v.literal("boards"), v.literal("sports"));
const boardSize = v.union(v.literal("65\""), v.literal("75\""), v.literal("86\""));
const product = v.union(v.literal("Smart Boards"), v.literal("Sports Equipment"), v.literal("Both"));

const dealStage = v.union(
  // boards (quotation-driven)
  v.literal("Enquiry"), v.literal("Quotation Sent"),
  v.literal("Awaiting Response"), v.literal("Awaiting Term"),
  v.literal("Awaiting Funds"), v.literal("No Response"),
  // sports (transactional)
  v.literal("Interested"), v.literal("Not Now"),
  // shared terminals
  v.literal("Won"), v.literal("Lost")
);

const engineStage = v.union(
  v.literal("Discovered"), v.literal("Scored"), v.literal("Contacted"),
  v.literal("Replied"), v.literal("In pipeline")
);

const suggestionType = v.union(
  v.literal("Stage change"), v.literal("Task done"),
  v.literal("New task"), v.literal("Follow-up")
);
const suggestionTrigger = v.union(v.literal("conversation"), v.literal("time_in_pipeline"));
const suggestionStatus = v.union(v.literal("pending"), v.literal("accepted"), v.literal("dismissed"));

const taskKind = v.union(
  v.literal("followup"), v.literal("meeting"), v.literal("call"),
  v.literal("whatsapp"), v.literal("other")
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    initials: v.string(),
    role,
  }),

  schools: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("Group"), v.literal("Private"), v.literal("Trust"),
      v.literal("Mission"), v.literal("Government")
    ),
    region: v.string(),
    enrolment: v.number(),
    fitScore: v.number(),
    signal: v.string(),
    engineStage,
    product,
    phone: v.string(),
    following: v.boolean(), // Gate 1 — per-conversation opt-in
    nextBestAction: v.string(),
  }).index("by_following", ["following"]),

  contacts: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    role: v.string(),
    phone: v.optional(v.string()),
  }).index("by_school", ["schoolId"]),

  deals: defineTable({
    schoolId: v.id("schools"),
    pipelineType,
    stage: dealStage,
    product,
    units: v.number(),
    boardSize: v.optional(boardSize),
    value: v.number(),
    assignedTo: v.id("users"),
    createdBy: v.id("users"),
    createdAtLabel: v.string(),
    note: v.optional(v.string()),
  })
    .index("by_school", ["schoolId"])
    .index("by_pipeline_stage", ["pipelineType", "stage"])
    .index("by_assignee", ["assignedTo"]),

  quotes: defineTable({
    schoolId: v.optional(v.id("schools")),
    schoolName: v.string(),
    dealId: v.optional(v.id("deals")),
    pipelineType,
    value: v.number(),
    units: v.number(),
    boardSize: v.optional(boardSize),
    status: v.union(v.literal("sent"), v.literal("won"), v.literal("lost")),
    sentAtLabel: v.string(),
    decidedAtLabel: v.optional(v.string()),
    ownerId: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_owner", ["ownerId"]),

  // Cumulative "what we've sold" record (addendum §2)
  orders: defineTable({
    schoolId: v.optional(v.id("schools")),
    schoolName: v.string(),
    dealId: v.optional(v.id("deals")),
    product,
    boardSize: v.optional(boardSize),
    units: v.number(),
    value: v.number(),
    soldAtLabel: v.string(),
    period: v.union(v.literal("month"), v.literal("quarter"), v.literal("year")),
    ownerId: v.id("users"),
  }).index("by_owner", ["ownerId"]),

  // Captured, read-only WhatsApp data (never written back).
  // Sprint 2: inbox-wide tracking (client sign-off) — every business-line
  // chat gets a thread, tracked by default; `following: false` excludes it.
  // schoolId is optional: chats from numbers the CRM doesn't know yet stay
  // unlinked until matched or promoted.
  threads: defineTable({
    schoolId: v.optional(v.id("schools")),
    waChatId: v.string(),
    phone: v.optional(v.string()),
    displayName: v.optional(v.string()),
    following: v.boolean(),
    lastSyncAt: v.number(),
  })
    .index("by_school", ["schoolId"])
    .index("by_waChatId", ["waChatId"]),

  messages: defineTable({
    threadId: v.id("threads"),
    direction: v.union(v.literal("in"), v.literal("out")),
    text: v.string(),
    sentAtLabel: v.string(),
    waMessageId: v.optional(v.string()),
  })
    .index("by_thread", ["threadId"])
    .index("by_waMessageId", ["waMessageId"]),

  // Sprint 2: ingestion state singleton — mode, throttle, last result.
  syncState: defineTable({
    mode: v.union(v.literal("stub"), v.literal("mcp")),
    lastSyncAt: v.optional(v.number()),
    syncCount: v.number(),
    lastResult: v.optional(v.string()),
    messagesPerSyncCap: v.number(),
  }),

  tasks: defineTable({
    schoolId: v.optional(v.id("schools")),
    dealId: v.optional(v.id("deals")),
    title: v.string(),
    kind: taskKind,
    // Sprint 1b: real timestamps. dueLabel/remindLabel are legacy display
    // strings kept optional until old rows age out of the dev deployment.
    dueAt: v.optional(v.number()),
    remindAt: v.optional(v.number()),
    remindedAt: v.optional(v.number()),
    dueLabel: v.optional(v.string()),
    remindLabel: v.optional(v.string()),
    assignedTo: v.id("users"),
    status: v.union(v.literal("open"), v.literal("done")),
    completedBy: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
  })
    .index("by_assignee_status", ["assignedTo", "status"])
    .index("by_school", ["schoolId"])
    .index("by_status", ["status"]),

  // Sprint 1b: in-app reminder notifications (addendum §5), produced by the
  // reminder cron when a task's remindAt passes.
  notifications: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    text: v.string(),
    read: v.boolean(),
  }).index("by_user_read", ["userId", "read"]),

  // Gate 2 — every AI-proposed change waits here for accept/dismiss
  suggestions: defineTable({
    schoolId: v.id("schools"),
    dealId: v.optional(v.id("deals")),
    type: suggestionType,
    trigger: suggestionTrigger,
    proposal: v.string(),
    rationale: v.string(),
    sourceSnippet: v.optional(v.string()),
    suggestedWording: v.optional(v.string()),
    toStage: v.optional(dealStage),
    assignedTo: v.id("users"),
    status: suggestionStatus,
  })
    .index("by_status", ["status"])
    .index("by_school_status", ["schoolId", "status"]),

  audit: defineTable({
    entity: v.string(),
    entityId: v.string(),
    action: v.string(),
    fromValue: v.optional(v.string()),
    toValue: v.optional(v.string()),
    actorId: v.id("users"),
    atLabel: v.string(),
  }).index("by_entity", ["entity", "entityId"]),

  // Engine settings singleton
  engine: defineTable({
    segments: v.array(v.string()),
    regions: v.array(v.string()),
    productFocus: v.string(),
    throughputCap: v.number(),
    active: v.boolean(),
  }),
});
