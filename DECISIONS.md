# DECISIONS.md — Hempac Sales Engine

Defaults chosen where the specs are silent, per DESIGN-BUILD-HANDOFF §8.
Behaviour authority: BUILD-SCOPE.md + SCOPE-ADDENDUM-v3.md · Design authority: DESIGN-BUILD-HANDOFF.md.

## Phase A1 (lo-fi wireframes)

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **BUILD-SCOPE.md is not in the repo.** Phase A proceeds on the handoff alone (it summarises the invariants: read-only WhatsApp, two consent gates, throughput cap, sprints). | Phase A is pure design; nothing here depends on unseen behavioural detail. The file must be added before Phase B kicks off. |
| 2 | Wireframes are built as the real Next.js 14 App Router scaffold (Tailwind, TypeScript strict, lucide), not a throwaway. | Handoff §0: the prototype component library becomes the production library. shadcn/ui + recharts join in A2 — lo-fi needs neither. |
| 3 | Both nav variants live behind a floating review toggle (bottom-left) instead of two separate builds. | One dataset, one set of screens, instant comparison for Kev. |
| 4 | Lo-fi shows layout structure only; loading skeletons / empty / error states and responsive breakpoints are an A2 deliverable (one empty state is annotated in the Review Queue as a spec note). | Standard lo-fi scope; §4's states requirement is a hi-fi concern. |
| 5 | Greeting persona is Emilia Chisango ("Good morning, Emilia 👋"), owner "EC", second user Tino Chisango "TC". | Taken from the demo dataset; §1.3 uses Emilia in its example. |
| 6 | Sample data extended with 8 pending suggestions across 5 schools (Greendale ×2, Northgate ×2, Highfield, Eastvale, Marlborough ×2), 6 tasks, 4 upcoming demos, per-school `following` flags. | Handoff §5 asks for ~8 suggestions across 5 schools; demos/tasks invented consistently with the deal stages in the demo data. |
| 7 | Engine throughput cap shown as "10 / day". | Placeholder; the real default comes from BUILD-SCOPE in Phase B. |
| 8 | Drag-and-drop, ⌘K palette, and drawer keyboard shortcuts are annotated but not functional in lo-fi. | Interaction fidelity belongs to A2. |
| 9 | Demo pricing "Offer" screen is kept as a sidebar entry (Variant A only, per the demo) but not built as a wireframe screen — it is not in §4's screen list. | §4 defines the 8 screens Phase A must cover. |

## Phase A2 (hi-fi prototype)

Kev's gate decisions: **nav Variant A (dark brand sidebar)**; A2 proceeds with BUILD-SCOPE.md to be added to the repo before Phase B.

| # | Decision | Rationale |
|---|----------|-----------|
| 10 | shadcn/ui adopted in its native form — components copied into `/components/ui` (button, chip, card, switch, popover, skeleton) on cva + radix primitives — rather than via the CLI. | Same idiom and file layout the CLI produces; zero config churn. |
| 11 | Soft fills use Tailwind's opacity scale `/10`–`/15` (spec says 10–14%). | `/12`–`/14` are not valid Tailwind utilities and were silently dropped. |
| 12 | Prototype state (accept/dismiss, kanban moves, follow, tasks) lives in a React context in client memory; it resets on hard reload. | §6 mandates purely client-side state; Convex replaces the store in Phase B behind the same component API. |
| 13 | A floating "Preview: Normal / Loading / Empty / Error" pill (bottom-left) lets the reviewer see every screen's states without contriving them. Review-only; removed in Phase B. | §4 requires all three states to exist and be reviewable. |
| 14 | "The Offer" sidebar button opens a popover ("engagement details shared separately") instead of a pricing screen. | The §4 screen list doesn't include it; an inert button would feel broken in a clickable prototype. |
| 15 | Fraunces loaded via `next/font/google`, used only in empty-state headlines (no auth screen exists in §4). Geist Sans via the `geist` package. | §1.3's constraint on where the serif may appear. |
| 16 | The Ask drawer's fourth quick prompt ("Draft a follow-up") shows the draft with the line "I draft — you send." | Reinforces the read-only WhatsApp invariant inside the chat surface. |
| 17 | Won-column sample deals (Kingsmead, Sunridge) are static and not draggable; live deals move through the same store the suggestions mutate. | They exist only to make Won look alive, per the demo dataset. |

## Scope Addendum v3 (applied at the prototype layer)

BUILD-SCOPE.md and Convex credentials are still absent, so v3 is applied to the
clickable prototype (the UI contract) first; backend wiring follows in Phase B.

| # | Decision | Rationale |
|---|----------|-----------|
| 18 | Boards kanban renders all eight states as columns (Enquiry, Quotation Sent, the four buckets, Won, Lost); the four buckets are stored as the deal's stage. | §1 says a quoted deal sits in exactly one bucket; columns make bucket moves a drag, and the board scrolls horizontally per the responsive rules. |
| 19 | "Demo Booked" no longer exists as a boards stage — demos live as tasks/meetings (and the demos KPI). The Marlborough suggestion became a New-task suggestion accordingly. | The v3 boards pipeline defines the stage list exhaustively. |
| 20 | Greendale's in-chat suggestion now proposes **Awaiting Funds** ("committee approved, PO in process"). | Closest v3 bucket to the old "move to Procurement" story. |
| 21 | The second admin is named **Gracious Banda** (surname invented); reps Tino Chisango and Rudo Kanjanda fill the sample roster (4 of 10 seats). | Addendum names only "Gracious"; sample data needs full names. |
| 22 | §4 views: Global/Assigned-to-me is a toggle on the Pipeline board; All/Mine/Pending is a toggle on the rail's task list. "Assigned to me" = Emilia in the prototype (no auth in Phase A). | Views are filters over shared data, not pages; nav stays at 7 items with Reports added. |
| 23 | Follow-up rate and tasks-completed figures in Reports are fabricated sample numbers. | Phase B computes them from task history; the prototype shows the report shape. |
| 24 | wa.me links use fabricated +263 numbers per school and open in a new tab with the drafted text prefilled. | §10 "Open in WhatsApp" — the human sends; no send API anywhere. |
| 25 | Time-driven suggestions render with a small "timed" clock badge, the suggested wording block, an Open-in-WhatsApp action, and the assigned rep's initials. | §7: routed to the assigned rep with "the words to say". |
| 26 | Quotation-bucket, sent-vs-converted, and boards-sold dashboard cards compute live from the store/sample records (they follow kanban moves). | §8 headline views should demonstrably respond to pipeline changes at the review. |
| 27 | **BUILD-SCOPE.md is a labelled reconstruction**, assembled solely from the references in DESIGN-BUILD-HANDOFF v1 and SCOPE-ADDENDUM v3 (invariants, data model, modules, sprints). | The original v2 was never supplied to the session; the user asked for BUILD-SCOPE to be added. If the original is recovered it replaces this file verbatim and wins on any difference. |

## Phase B — Sprint 0 (Convex foundations)

| # | Decision | Rationale |
|---|----------|-----------|
| 28 | Dev deploy key lives only in gitignored `.env.local` (plus `NEXT_PUBLIC_CONVEX_URL=https://glorious-fox-328.convex.cloud`). The key must also be added to Vercel env vars and the remote-session environment settings — this container is ephemeral. | BUILD-SCOPE §2.5 secrets hygiene; only the public deployment URL may be NEXT_PUBLIC_. |
| 29 | Date-ish fields ship as display-string labels (`createdAtLabel`, `dueLabel`, `sentAtLabel`) in Sprint 0, matching the prototype dataset. Sprint 1b converts due/remind to real timestamps when notifications land. | Keeps the seed faithful to the approved UI while the tasks module is still prototype-side. |
| 30 | `convex/_generated` is committed so typecheck/build work without running the Convex CLI. | CI (Vercel) has no deploy key at build time. |
| 31 | The Convex client mounts behind a guard: without `NEXT_PUBLIC_CONVEX_URL` the app renders exactly as the Phase A prototype. UI reads stay on the client store until Sprint 1 migrates them. | Sprint 0 is foundations only; previews stay green before the env var is configured. |
| 32 | Seed (`seed:run`) is idempotent (wipe + insert) and mirrors the approved sample dataset; verified live — `crm:dashboardStats` returns the same numbers the prototype shows. | Sprint 1 wires screens to queries against familiar data. |

## Phase B — Sprint 1 (live CRM core)

| # | Decision | Rationale |
|---|----------|-----------|
| 33 | All screens read display-ready, server-joined payloads (`crm.ts` queries); Accept/Dismiss, kanban moves, task toggles and Follow write through `actions.ts` mutations, every write audit-logged. `usePrototype` shrank to UI-only state (drawer, preview control, view scope). | Same component API as the approved prototype; the store swap is invisible to the design. |
| 34 | Mutations take the acting user's initials from the client (Emilia) until the auth sprint adds real identity. | Shared visibility (§6) means no data restriction is bypassed; assignment/audit still record the actor. |
| 35 | The rail's activity feed now renders the audit trail (accepted/dismissed/moved), so team actions are visible live. | Addendum §3's accountability story, for free from the audit table. |
| 36 | The sandbox's headless browser cannot reach convex.cloud (egress resets it; curl/CLI work). Verification ran through a local relay (scratchpad only, not committed) forwarding HTTP+WebSocket to Convex; a test build pointed NEXT_PUBLIC_CONVEX_URL at it. Real browsers connect directly — this limitation is environment-only. | End-to-end proof: accept → stage applied + audit + survives hard reload; drag persists; follow persists. |
| 37 | Demos list, engine funnel counts, leads-this-month and demos-booked KPIs remain sample figures. | They belong to the meetings module (Sprint 1b) and the engine (Sprint 4). |

## Phase B — Sprint 1b (tasks, reminders & notifications)

| # | Decision | Rationale |
|---|----------|-----------|
| 38 | Tasks carry real `dueAt`/`remindAt` timestamps; due labels (Overdue/Today/Tomorrow/date) compute server-side at read time. Legacy label fields stay optional in the schema until old dev rows age out. | Addendum §5; schema pushes validate existing documents, so the migration is additive. |
| 39 | Reminders are a Convex cron (15-min sweep): open tasks whose `remindAt` passed raise an in-app notification for the assignee; `remindedAt` keeps it idempotent. The topbar bell shows unread count and marks read on open. | "Fire ahead of due time" with real infrastructure; push/email channels are a later add-on once the client chooses channels. |
| 40 | One reminder per task in v1 (addendum says `remindAt[]`); the dialog offers none / 1h / 1d before. | Covers both meeting patterns the client named; the array shape can come later without a breaking change. |
| 41 | Task creation is a dialog (title, optional school, kind, assignee, quick-pick due, reminder), reachable from the rail and any school page, and audit-logged ("Task logged: … (assigned X)"). | §5 "any user can log a task against a lead/deal or standalone". |
| 42 | Pipeline gains a rep filter (avatar chips) in global view, alongside Global/Assigned-to-me. | §4 "filter also by … rep". |

## Phase B — Sprint 2 (read-only WhatsApp ingestion loop)

| # | Decision | Rationale |
|---|----------|-----------|
| 43 | **Tracking scope: whole inbox (client sign-off, Jul 2026).** Every business-line chat is ingested by default; the per-conversation control remains as an exclusion — excluded chats' messages are never stored, enforced at sync time. This supersedes the per-conversation opt-in default; addendum §10's "do not broaden without sign-off" condition is met. | Kev's direction: "have the entire inbox being tracked… we can change it from there." |
| 44 | Connector abstraction with two modes: `stub` (deterministic simulated inbox — waves of new messages, a new unlinked chat, and an excluded-chat message to prove consent) and `mcp` (activated by `WHATSAPP_MCP_URL` via `npx convex env set`; reports "endpoint mapping pending" until the real endpoint's shape is confirmed rather than guessing it). | The loop is fully demonstrable pre-credentials; plugging in the business line is env-var + one mapping function. |
| 45 | Threads may be school-less (`schoolId` optional): chats from unknown numbers ingest as "not linked to a school" and appear in Data & consent with a `new chat` chip. Linking/promoting them to schools lands with the engine sprint. | Inbox-wide tracking necessarily ingests numbers the CRM doesn't know yet. |
| 46 | Sync runs on a 10-minute cron, hard-capped (30 messages/sweep), idempotent via `waMessageId`; Settings shows mode, last sync, cadence, cap, last-sweep result, and a manual "Sync now". | Addendum §10 throttling as a hard requirement; read-only by construction — no send/react/typing code path exists. |
| 47 | Reseeding resets `syncState` so the stub waves replay from the start. | The dev cron fires on deploy; without the reset a reseed desynced the wave counter (found in verification). |
