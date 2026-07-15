"use client";

/**
 * School page (§4.5): header (name, meta, Follow toggle, fit) · left:
 * decision-makers, deal, quotes · centre: read-only WhatsApp thread with
 * interleaved timeline · right: suggestions + tasks + Copilot next-best-
 * action + cross-sell nudge.
 */
import { MapPin, MessageCircle, Phone, Sparkles, Star, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Avatar, FitBar, dealTone, productTone } from "@/components/crm/bits";
import { FollowToggle } from "@/components/crm/FollowToggle";
import { SuggestionCard } from "@/components/crm/SuggestionCard";
import { WhatsAppThread, ReadOnlyBadge } from "@/components/crm/WhatsAppThread";
import { usePrototype } from "@/components/crm/store";
import { initialsOf, money, schoolById } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

export default function SchoolPage({ params }: { params: { id: string } }) {
  const { suggestions, tasks, stages, toggleTask } = usePrototype();
  const school = schoolById(Number(params.id));
  if (!school) notFound();

  const stage = stages[school.id];
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

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[280px_1fr_324px]">
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
                    <button className="rounded-lg border border-line p-1.5 transition-colors hover:border-faint" aria-label={`WhatsApp ${name}`}>
                      <MessageCircle size={13} className="text-success" />
                    </button>
                    <button className="rounded-lg border border-line p-1.5 transition-colors hover:border-faint" aria-label={`Call ${name}`}>
                      <Phone size={13} className="text-muted" />
                    </button>
                  </div>
                </div>
              ))}
          </Card>

          <Card>
            <CardTitle>Deal</CardTitle>
            {stage ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted">Stage</span><Chip tone={dealTone(stage)} dot>{stage}</Chip></div>
                <div className="flex items-center justify-between"><span className="text-muted">Product</span><Chip tone={productTone(school.product)}>{school.product}</Chip></div>
                <div className="flex items-center justify-between"><span className="text-muted">Units</span><span className="tabular-nums text-body">{school.units}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Value</span><span className="font-semibold tabular-nums text-body">{money(school.value)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Owner</span><Avatar initials={school.owner} tone={school.owner === "EC" ? "terra" : "green"} size="sm" /></div>
              </div>
            ) : (
              <p className="text-xs leading-snug text-muted">
                No open deal yet — this school is in the engine at “{school.eng}”.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Quotes</CardTitle>
            {stage === "Quote Sent" || stage === "Procurement" || stage === "Won" ? (
              <div className="rounded-lg border border-line px-3.5 py-2.5">
                <div className="text-xs font-medium text-body">Q-2026-0{school.id} · {school.units} units</div>
                <div className="mt-0.5 text-xs text-muted">{money(school.value)} · <span className="text-success">sent</span></div>
              </div>
            ) : (
              <p className="text-xs text-muted">No quotes yet.</p>
            )}
          </Card>
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
              interleave={stage ? [{ afterIndex: 0, text: `Deal created · moved to ${stage}` }] : undefined}
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
                {schoolTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.done ? `Reopen: ${task.title}` : `Complete: ${task.title}`}
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors duration-150",
                        task.done ? "border-green bg-green" : "border-faint hover:border-green"
                      )}
                    />
                    <span className={cn("flex-1 text-xs leading-snug", task.done ? "text-faint line-through" : "text-body")}>
                      {task.title}
                    </span>
                    <span className="rounded-full bg-faint/15 px-2 py-0.5 text-[10px] text-muted">{task.due}</span>
                  </li>
                ))}
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
