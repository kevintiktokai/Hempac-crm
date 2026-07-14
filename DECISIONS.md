# DECISIONS.md — Hempac Sales Engine

Defaults chosen where the specs are silent, per DESIGN-BUILD-HANDOFF §8.
Behaviour authority: BUILD-SCOPE.md · Design authority: DESIGN-BUILD-HANDOFF.md.

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

## Phase A2 (hi-fi) — pending nav-variant choice
