"use client";

/**
 * School page (§4.5 + addendum §3): header (name, meta, Follow toggle, fit)
 * · left: decision-makers (wa.me links), deals with assignment + logged-by,
 * quotes, audit trail · centre: read-only WhatsApp thread · right:
 * suggestions + tasks + Copilot next-best-action + cross-sell nudge.
 */
import { History, MapPin, MessageCircle, Phone, Sparkles, Star, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Avatar, FitBar, dealTone, productTone } from "@/components/crm/bits";
import { FollowToggle } from "@/components/crm/FollowToggle";
import { SuggestionCard } from "@/components/crm/SuggestionCard";
import { WhatsAppThread, ReadOnlyBadge } from "@/components/crm/WhatsAppThread";
import { usePrototype } from "@/components/crm/store";
import {
  QUOTES, auditForDeal, dealsForSchool, initialsOf, money, schoolById, userById, waLink,
} from "@/lib/sampleData";
import { cn } from "@/lib/utils";

export default function SchoolPage({ params }: { params: { id: string } }) {
  const { suggestions, tasks, stages, toggleTask } = usePrototype();
  const school = schoolById(Number(params.id));
  if (!school) notFound();

  const deals = dealsForSchool(school.id);
  const quotes = QUOTES.filter((q) => q.schoolId === school.id);
  const audit = deals.flatMap((d) => auditForDeal(d.id));
  const schoolSuggestions = suggestions.filter((s) => s.schoolId === school.id && s.status === "pending");
  const schoolTasks = tasks.filter((t) => t.schoolId === school.id);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{school.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1"><MapPin size={12} /> {school.region}</span>
            <Chip tone="neutral">{school.type}</Chip>
            <Chip tone="neutral">{school.enrol.toLocaleString()} pupils</Chip>
            <span className="flex items-center gap-2 pl-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-faint">Fit</span>
              <FitBar v={school.fit} />
            </span>
          </div>
        </div>
        <FollowToggle schoolId={school.id} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[300px_1fr_324px]">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardTitle><span className="flex items-center gap-2"><Users size={14} /> Decision-makers</span></CardTitle>
            {[[school.head, school.headRole], [school.bursar, school.bursarRole]]
              .filter(([n]) => n && n !== "—")
              .map(([name, role], i) => (
                <div key={name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={initialsOf(name)} tone={i ? "terra" : "green"} />
                    <div>
                      <div className="text-sm font-medium text-body">{name}</div>
                      <div className="text-xs text-muted">{role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <a
                      href={waLink(school.phone)}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-lg border border-line p-1.5 transition-colors hover:border-success"
                      aria-label={`Open WhatsApp chat with ${name}`}
                    >
                      <MessageCircle size={13} className="text-success" />
                    </a>
                    <button className="rounded-lg border border-line p-1.5 transition-colors hover:border-faint" aria-label={`Call ${name}`}>
                      <Phone size={13} className="text-muted" />
                    </button>
                  </div>
                </div>
              ))}
          </Card>

          <Card>
            <CardTitle right={deals.length > 1 && <span className="text-xs text-muted">{deals.length} open</span>}>
              Deals
            </CardTitle>
            {deals.length > 0 ? (
              <div className="space-y-3">
                {deals.map((d) => {
                  const stage = stages[d.id];
                  const assignee = userById(d.assignedTo);
                  const creator = userById(d.createdBy);
                  return (
                    <div key={d.id} className="rounded-xl border border-line p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <Chip tone={productTone(d.product)}>{d.pipeline === "boards" ? "Boards" : "Sports"}</Chip>
                        <Chip tone={dealTone(stage)} dot>{stage}</Chip>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-sm">
                        <span className="text-muted">
                          {d.pipeline === "boards" ? `${d.units} × ${d.boardSize}` : "kit order"}
                        </span>
                        <span className="font-semibold tabular-nums text-body">{money(d.value)}</span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5 text-[11px] text-muted">
                        <span className="flex items-center gap-1.5">
                          <Avatar initials={assignee?.initials ?? "?"} tone={assignee?.role === "admin" ? "terra" : "green"} size="sm" />
                          assigned {assignee?.name.split(" ")[0]}
                        </span>
                        <span className="text-faint">logged by {creator?.initials} · {d.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs leading-snug text-muted">
                No deal yet — this school is in the engine at “{school.eng}”.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Quotes</CardTitle>
            {quotes.length > 0 ? (
              <div className="space-y-2">
                {quotes.map((q) => (
                  <div key={q.id} className="rounded-lg border border-line px-3.5 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-body">
                        {q.id.toUpperCase()} · {q.units} {q.boardSize ? `× ${q.boardSize}` : "kit"}
                      </span>
                      <Chip tone={q.status === "won" ? "success" : q.status === "lost" ? "danger" : "amber"}>{q.status}</Chip>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {money(q.value)} · sent {q.sentAt} by {userById(q.ownerId)?.initials}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No quotes yet.</p>
            )}
          </Card>

          {audit.length > 0 && (
            <Card>
              <CardTitle><span className="flex items-center gap-2"><History size={14} /> History</span></CardTitle>
              <ul className="space-y-2">
                {audit.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 text-[11px] leading-snug">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-faint" />
                    <span className="flex-1 text-muted">{a.action}</span>
                    <span className="shrink-0 text-faint">{userById(a.actorId)?.initials} · {a.at}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Centre: thread */}
        <Card className="min-w-0 !p-0 lg:row-span-2 xl:row-span-1">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-body">
              <MessageCircle size={15} className="text-success" /> WhatsApp thread
            </h3>
            <ReadOnlyBadge />
          </div>
          <div className="px-5 py-5">
            <WhatsAppThread
              messages={school.wa}
              interleave={deals[0] ? [{ afterIndex: 0, text: `Deal logged · ${stages[deals[0].id]}` }] : undefined}
            />
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          <Card>
            <CardTitle right={schoolSuggestions.length > 0 && (
              <span className="rounded-full bg-terra/10 px-2 py-0.5 text-[11px] font-semibold text-terra">
                {schoolSuggestions.length}
              </span>
            )}>
              Suggestions
            </CardTitle>
            {schoolSuggestions.length > 0 ? (
              <div className="space-y-3">
                {schoolSuggestions.map((s) => <SuggestionCard key={s.id} s={s} />)}
              </div>
            ) : (
              <p className="rounded-lg bg-green-soft px-3 py-2.5 text-xs text-green">
                Nothing pending for this school. ✨
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Tasks</CardTitle>
            {schoolTasks.length > 0 ? (
              <ul className="space-y-2.5">
                {schoolTasks.map((task) => {
                  const assignee = userById(task.assignedTo);
                  return (
                    <li key={task.id} className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTask(task.id)}
                        aria-label={task.done ? `Reopen: ${task.title}` : `Complete: ${task.title}`}
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors duration-150",
                          task.done ? "border-green bg-green" : "border-faint hover:border-green"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-xs leading-snug", task.done ? "text-faint line-through" : "text-body")}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-faint">
                          {assignee?.initials}{task.remind ? ` · ⏰ ${task.remind}` : ""}
                        </div>
                      </div>
                      <span className="rounded-full bg-faint/15 px-2 py-0.5 text-[10px] text-muted">{task.due}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted">No open tasks.</p>
            )}
          </Card>

          <Card className="border-terra/30 bg-terra-soft/60">
            <CardTitle>
              <span className="flex items-center gap-2 text-terra"><Sparkles size={14} /> Copilot · next best action</span>
            </CardTitle>
            <p className="text-xs leading-relaxed text-[#7A3A1E]">{school.next}</p>
            {(school.product === "Both" || school.product === "Smart Boards") && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2">
                <Star size={13} className="mt-0.5 shrink-0 text-gold" />
                <span className="text-[11px] leading-snug text-[#7A3A1E]">
                  Cross-sell: the same buyer purchases school sports equipment — bundle it.
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
