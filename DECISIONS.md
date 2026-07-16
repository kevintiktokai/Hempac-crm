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
