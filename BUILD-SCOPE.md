# BUILD-SCOPE — Hempac Sales Engine (functional spec, v2)
*Internal · LayerSync · behaviour authority together with SCOPE-ADDENDUM-v3.md · design authority: DESIGN-BUILD-HANDOFF.md*

> **⚠️ RECONSTRUCTED DOCUMENT.** The original BUILD-SCOPE v2 file was not
> supplied to the build session. This file is reconstructed from every
> reference to it in DESIGN-BUILD-HANDOFF v1 and SCOPE-ADDENDUM v3 so the
> repo carries a complete behaviour spec. If the original v2 document is
> recovered, replace this file with it verbatim — where they differ, the
> original wins. Reconstructed sections are conservative: nothing here
> invents behaviour beyond what the two authoritative documents state or
> directly imply.

---

## 1. Product

A school-sales CRM plus WhatsApp lead-generation engine for **Hempac Sport**
(Zimbabwe): selling interactive **smart boards** to schools, with a
**sports-equipment cross-sell** to the same buyer. The Lookeron School is the
live reference/demo site and features in outreach copy. Users are the founder
(Emilia Chisango) and her sales reps (~10 seats; see ADDENDUM §6).

The product's job (per discovery): **visibility + follow-up + accountability**
— no lead gets a "noted" and then silence.

## 2. Non-negotiable invariants

1. **WhatsApp is READ-ONLY.** Ingestion runs over a WhatsApp MCP connection
   with send/react/typing capabilities disabled. The system never sends a
   message. Outreach is AI-drafted, human-sent (v3: via "Open in WhatsApp"
   `wa.me` prefill links). Business line only — never a personal number.
2. **Two consent gates.**
   - *Gate 1 — per-conversation Follow*: only chats the user has opted in
     ("Do you want to track this chat?") are read and tracked. Per-conversation
     opt-in is the model; do not broaden without sign-off (ADDENDUM §10).
   - *Gate 2 — accept/dismiss*: every AI-proposed change (stage move, task
     completion, new task, follow-up) is a suggestion card the user accepts or
     dismisses. Nothing writes silently. The Ask chat obeys the same gate for
     any mutation it proposes.
3. **Engine throughput cap** on outreach drafting/discovery activity
   (default 10/day) and human-paced, throttled WhatsApp read activity to keep
   the number's footprint low (ADDENDUM §10).
4. **Locale defaults:** +263 phone format, USD currency, WhatsApp-first
   communication.
5. **Secrets hygiene:** no secrets in `NEXT_PUBLIC_*`; API keys and MCP
   credentials live server-side only.

## 3. Data model (Convex)

Base tables (v2), with the v3 deltas applied per ADDENDUM §12:

```
users        id, name, email, initials, role ('admin'|'member')
schools      id, name, type, region, enrolment, fitScore, signal,
             engineStage ('discovered'|'scored'|'contacted'|'replied'|'in_pipeline'),
             phone, following (Gate 1), createdAt
contacts     id, schoolId, name, role, phone
deals        id, schoolId, pipelineType ('boards'|'sports'), stage,
             quoteBucket?, product, units, boardSize?, value,
             assignedTo, createdBy, createdAt
quotes       id, schoolId, dealId, lineItems[{product, qty, unitPrice, size?}],
             value, status ('sent'|'won'|'lost'), sentAt, decidedAt, ownerId
orders       id, schoolId?, dealId?, product, boardSize?, units, value,
             soldAt, ownerId                      # cumulative sold record
threads      id, schoolId, waChatId, following, lastSyncAt
messages     id, threadId, direction ('in'|'out'), text, sentAt   # captured, read-only
tasks        id, schoolId?, dealId?, title, kind, dueAt, remindAt[],
             assignedTo, status ('open'|'done'), completedBy, completedAt
suggestions  id, schoolId, dealId?, type, trigger ('conversation'|'time_in_pipeline'),
             proposal, rationale, sourceMessageId?, suggestedWording?,
             toStage?, assignedTo, status ('pending'|'accepted'|'dismissed')
audit        id, entity, entityId, action, fromValue, toValue, actorId, at
engine       settings singleton: segments[], regions[], productFocus,
             throughputCap, active
```

## 4. Modules

### 4.1 CRM core
Schools directory (fit-ranked, filters), deals across **two pipelines**
(ADDENDUM §1), first-class quotations and the orders/sold record (ADDENDUM
§2), assignment + audit trail (ADDENDUM §3), views/filters (ADDENDUM §4),
tasks/reminders/notifications (ADDENDUM §5), dashboard per ADDENDUM §8,
reports + leaderboard (ADDENDUM §9).

### 4.2 WhatsApp read-only ingestion loop
- Connect the business line through the WhatsApp MCP server with send, react
  and typing **disabled**; surface the connection as a read-only badge with
  last-sync time in Settings.
- Sync only **followed** conversations (Gate 1), on a throttled, human-paced
  schedule; store captured messages against the school's thread.
- New inbound activity feeds the suggestion engine (§4.4).
- Per-school data controls: unfollow, delete-school-data (Settings → Data &
  consent).

### 4.3 Lead-generation engine
- Discovers **lookalike** schools/buyers matched to the profile of existing
  won customers (ADDENDUM §11), scores fit, and writes them into the CRM at
  `discovered`/`scored`.
- Funnel: Discovered → Scored → Contacted → Replied → In pipeline.
- Drafts outreach **campaigns** under the throughput cap; every message is
  human-approved and human-sent (wa.me prefill). The engine never sends.
- Configurable segments, regions, product focus, cap; on/off switch
  (admin-only).

### 4.4 AI suggestions (Gate 2)
- **Conversation-driven:** from new messages in followed chats → propose
  stage moves, task completions, new tasks, reply drafts.
- **Time-in-pipeline-driven** (ADDENDUM §7): from age + bucket → propose
  follow-ups with suggested wording, routed to the assigned rep (e.g.
  Awaiting Term leads as the school term approaches).
- All suggestions land in the Review Queue and the "Needs you" rail, and are
  mirrored inline where relevant (school page, Ask chat).

### 4.5 Ask chat
- Function-calls over Convex: pipeline stats, deal lookups, school/thread
  summaries, drafting outreach/quotes. Rich answers (stat rows, deep-link
  chips).
- Any mutation it proposes is emitted as a Gate-2 suggestion card inline in
  the chat and mirrored to the Review Queue. The chat never writes silently.

## 5. Roles & access

Per ADDENDUM §6: ~10 users, shared visibility (no row-level restriction);
`admin` (founder + one trusted admin) vs `member`, differing only on
settings/user/engine management.

## 6. Sprint plan (Phase B)

As adjusted by ADDENDUM §13:

- **Sprint 0 — Foundations:** Convex project, schema, auth/users seed,
  environment + secrets hygiene, deploy pipeline.
- **Sprint 1 — CRM core:** both pipeline types, quotations + orders,
  assignment + audit trail, dashboard (§8), schools directory.
- **Sprint 1b — Tasks & views:** tasks/reminders/notifications, Global /
  Assigned-to-me / Pending-tasks views and filters.
- **Sprint 2 — WhatsApp loop:** read-only MCP ingestion, Gate-1 follow flow,
  activity throttle, "Open in WhatsApp" draft-send. *Resolve the
  tracking-scope question (per-conversation vs broader) before starting; the
  default and build target is per-conversation opt-in.*
- **Sprint 3 — Ask chat:** function-calling over Convex behind the approved
  drawer UI, Gate-2 emission for mutations.
- **Sprint 4 — Suggestions & outreach engine:** conversation + time-in-
  pipeline triggers, suggested wording, campaign drafting under the cap,
  lookalike discovery.
- **Sprint 5 — Hardening & handover:** states, performance, seed/import,
  training data for the client.
- **Sprint 6 — Reports & leaderboard** and role/admin setup (ADDENDUM §9, §6).

Kickoff constraints for every sprint: read-only MCP, both consent gates,
throughput cap, secrets hygiene. The approved Phase A prototype is the UI
contract — do not redesign during build.

---

*Reconstructed v2 · LayerSync · to be superseded by the original BUILD-SCOPE
v2 verbatim if recovered.*
