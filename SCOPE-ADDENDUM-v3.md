# Hempac Sales Engine — Scope Addendum (v3)
*Internal · LayerSync · post-discovery. Apply ON TOP OF BUILD-SCOPE v2 and DESIGN-BUILD-HANDOFF v1.*

This addendum captures requirements confirmed in the discovery meeting with the client (Emilia Chisango, founder). Everything in BUILD-SCOPE v2 still holds. The items below **add to or refine** it. Where they conflict, this file wins.

The through-line from the meeting: her real pain is **visibility + follow-up + accountability**. Leads arrive (even after hours), get a "noted", and then "tomorrow never comes". The system must make follow-up unavoidable and performance visible.

---

## 1. TWO pipelines, not one *(important structural change)*

Boards and sports sell completely differently. Build **two pipeline types**, selectable per deal / product line.

**A. Smart Boards (schools) — quotation-driven, long cycle.** Most schools say "not yet, no money". Stages:
`Enquiry → Quotation Sent → [ Awaiting Response | Awaiting Term | Awaiting Funds | No Response ] → Won (Purchased) | Lost`
- `Awaiting Term` = waiting for the next school term / budget cycle (e.g. "third term"). This is a first-class state, not a note.
- `Awaiting Funds` = interested, waiting on budget/funding.
- The four bracketed states are sub-statuses of "quoted, in play"; a deal sits in exactly one.

**B. Sports Equipment — fast, transactional.** Simple pipeline:
`Enquiry → Interested | Not Now → Won | Lost`
- Lighter: name, what they asked about, value, outcome. No quotation machinery required (though a quote can still attach).

The dashboard, reports, and suggestions must respect which pipeline a deal is on.

---

## 2. Quotations & sales tracking *(new first-class objects)*

- **Quotations** are first-class (already in the data model — extend): a quote has value, volume (units, and board **size** for boards), status, and links to a school + deal.
- **Activity vs hit rate:** track **quotations sent** (activity) and **quotations converted** (hit rate), reportable by **volume AND value**. Example she gave: "sent 100, closed 20". Both bases must be available.
- **Aggregate quotation value with bucket breakdown:** e.g. total quoted $300k, of which $X awaiting response, $Y awaiting term, $Z awaiting funds, $W no response. This breakdown is a headline dashboard view for the boards side.
- **Sales / orders record:** a cumulative record of what has actually been **sold** (won): boards sold by **size**, by **period** (this month / quarter / year), by value and volume. "What we've sold" report.

---

## 3. Assignment, ownership & audit trail *(new)*

- Leads/deals can be **assigned to a specific rep**. Every record shows **created/logged by** and **assigned to**, with timestamps (audit trail). Her example: "logged by Emilia, allocated to [rep]".
- Re-assignment is logged.
- This replaces informal "post it in the group and hope someone follows up".

## 4. Views & filters *(new)*

Every user can switch between:
- **Global view** — everything, everyone (default; see §6, all users share visibility).
- **Assigned to me** — my leads/deals/tasks.
- **Pending tasks** — my open tasks/reminders.
Filter also by pipeline (Boards / Sports), status/bucket, and rep.

---

## 5. Tasks, reminders & notifications *(new module)*

- A **task/reminder** system: any user can log a task against a lead/deal or standalone (e.g. "meeting next week"), with a due date and assignee.
- **Notifications/reminders**: fire ahead of due time (e.g. day-before and/or hour-before a meeting). On completion, **mark done** (meeting done, follow-up done, "WhatsApp message sent" as a logged action).
- Tasks feed the "Pending tasks" filter and the reports.
- Purpose the client named: accountability, so "tomorrow" actually comes.

---

## 6. Users, roles & access *(confirmed)*

- **~10 users** (plan for 10). Named seats include the founder and her sales reps.
- **Shared visibility:** everyone sees the same thing (no row-level data restriction). Access is NOT segmented by rep. Accountability comes from assignment + audit trail + reports, not from hiding data.
- **Admin role:** the founder and one trusted admin (Gracious) can manage users, settings, and the engine. Everyone else is a standard member.
- So: two roles — `admin` and `member` — differing on settings/user-management, NOT on data visibility.

---

## 7. AI suggestions — conversation AND time driven *(refine §5.4)*

Suggestions are proposed from two triggers, not one:
- **Conversation-driven** (existing): from what's said in an approved WhatsApp chat → propose stage move / task / reply draft.
- **Time-in-pipeline-driven** (new): from how long a lead has sat, and its bucket. Example: as a new school **term** approaches, surface all `Awaiting Term` leads with *"Third term is coming up, here's what to say to these"* plus suggested wording, routed to the **assigned** rep.
- Suggested **wording** ("the words to say") accompanies follow-up suggestions.
- All suggestions still pass **Gate 2** (accept/dismiss). Outreach is drafted, never auto-sent.

---

## 8. Dashboard spec *(from the meeting — build these)*

Headline cards + views the client explicitly asked to see:
- Pipeline value; leads; active deals; demos booked.
- **Boards sold** — cumulative, with breakdown by **size** and by **period** (month/quarter). Value and volume.
- **Quotations sent vs converted** — activity rate and hit rate, on volume and value.
- **Quotation value by bucket** — awaiting response / term / funds / no response (boards side).
- **Sports pipeline** snapshot — enquiries, interested, won, lost.
- Per-rep and global performance snapshot (see §9).
Keep the AlignIQ/effix visual language from DESIGN-BUILD-HANDOFF (KPI cards, highlighted bar, funnel radial, right-rail "Needs you").

---

## 9. Reports & leaderboard *(new module)*

- **Individual reports** per user: quotations sent, follow-up rate (e.g. "followed up 70% of leads on time"), conversions, tasks completed.
- **Global reports:** team totals and rates.
- **Leaderboard:** rank reps by performance to make it visible and a little competitive.
- Reportable by period.

---

## 10. WhatsApp read-only — refinements confirmed in the meeting

Reinforces BUILD-SCOPE §5.2 (all still true: read-only MCP, send/react/typing disabled, per-conversation Follow gate, human-in-the-loop). Meeting-specific detail to honour:
- **Draft + "Open in WhatsApp".** When the assistant drafts a reply, the action is a button that **opens the message in WhatsApp for the user to send themselves** (e.g. a `wa.me`/deep-link prefill). The system NEVER sends. This is exactly how it was demoed and how it was sold to the client.
- **Per-conversation approval gate**, phrased to the user as *"Do you want to track this chat?"* Only approved chats enter the CRM tracking loop.
- **Business line only**, never a personal number. The client asked directly; the answer given (and to build to) is: read-only, business line, no auto-send.
- **Activity throttling / low footprint** is a hard requirement, not a nice-to-have: keep read/interaction volume human-paced to avoid WhatsApp flagging the number. The read-only + human-send design is the primary mitigation; also cap polling/interaction rate.
- **Open engineering question to resolve before Sprint 2** (flag, don't guess): whether conversation tracking is strictly per-approved-conversation (current design) vs any broader access. Default to and build the **per-conversation opt-in** model; do not broaden without sign-off.

---

## 11. Lead-generation engine — confirmed IN, refined

Client confirmed she wants it (it is the Plan 2 differentiator). Refinement from the meeting:
- It finds **lookalike** prospects: new schools/customers the business has **not** yet contacted, matched to the **demographics/profile of who already buys** (drawn from the existing CRM records), by scanning the web.
- Populates the CRM, scored and ready.
- Runs outreach **campaigns** (drafted; human-approved/human-sent per §10) to fill the top of the pipeline.
- Applies to both sides (schools for boards; relevant buyers for sports) but boards/schools is the priority target.

---

## 12. Data model additions (Convex)

```
deals            + pipelineType ('boards'|'sports'), boardSize?, quoteBucket
                   ('awaiting_response'|'awaiting_term'|'awaiting_funds'|'no_response')?
                 + assignedTo (userId), createdBy (userId)

quotes           + status ('sent'|'won'|'lost'), sentAt, decidedAt, valueBasis fields;
                   lineItems already carry product/qty/unitPrice; add size for boards

orders (new)     id, schoolId, dealId, product, boardSize?, units, value, soldAt, ownerId
                 # the cumulative "what we've sold" record

tasks            + assignedTo, dueAt, remindAt[], kind ('followup'|'meeting'|'call'|'whatsapp'|'other'),
                   status ('open'|'done'), completedBy, completedAt

audit (new)      id, entity, entityId, action, fromValue, toValue, actorId, at
                 # created/assigned/reassigned/stage-change trail

users            + role ('admin'|'member')   # admins: founder + one trusted admin

suggestions      + trigger ('conversation'|'time_in_pipeline'), suggestedWording?
```

---

## 13. Sprint adjustments (on top of BUILD-SCOPE §8)

- **Sprint 1 (CRM core):** now includes BOTH pipeline types, quotations + orders/sales tracking, lead **assignment + audit trail**, and the fuller dashboard (§8).
- **Sprint 1b / new:** **Tasks, reminders & notifications** module (§5) and **Views/filters** (§4).
- **Sprint 2 (WhatsApp loop):** add the **"Open in WhatsApp" draft-send** flow (§10) and the activity throttle; resolve the tracking-scope question first.
- **Sprint 4 (suggestions/outreach):** add the **time-in-pipeline** trigger (§7) alongside conversation-driven.
- **New Sprint 6 — Reports & leaderboard (§9)** and role/admin setup (§6).

---

*Addendum v3 · LayerSync · reflects the discovery meeting. Behaviour authority: BUILD-SCOPE + this file. Design authority: DESIGN-BUILD-HANDOFF.*
