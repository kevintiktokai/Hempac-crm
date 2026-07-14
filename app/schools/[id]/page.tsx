/**
 * School page wireframe (handoff §4.5): header with Follow toggle + fit,
 * left = decision-makers/deals/quotes, centre = read-only WhatsApp thread
 * with timeline, right = suggestions + tasks + copilot + cross-sell.
 */
import { Eye, MapPin, MessageCircle, Phone, Sparkles, Star, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar, Card, CardTitle, Chip, Note } from "@/components/wireframe/ui";
import { SuggestionCard } from "@/components/wireframe/SuggestionCard";
import { SCHOOLS, SUGGESTIONS, TASKS, initialsOf, money, schoolById } from "@/lib/sampleData";

export function generateStaticParams() {
  return SCHOOLS.map((s) => ({ id: String(s.id) }));
}

export default function SchoolPage({ params }: { params: { id: string } }) {
  const school = schoolById(Number(params.id));
  if (!school) notFound();

  const suggestions = SUGGESTIONS.filter((s) => s.schoolId === school.id && s.status === "pending");
  const tasks = TASKS.filter((t) => t.schoolId === school.id);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-wf-ink">{school.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-wf-mid">
            <span className="flex items-center gap-1"><MapPin size={12} /> {school.region}</span>
            <Chip>{school.type}</Chip>
            <Chip>{school.enrol.toLocaleString()} pupils</Chip>
            <Chip>Fit {school.fit} / 100</Chip>
          </div>
        </div>
        <div className="text-right">
          {/* Follow toggle (§1.4-8) — Gate 1 */}
          <button className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold ${
            school.following ? "bg-wf-dark text-white" : "border border-wf-line bg-wf-card text-wf-mid"
          }`}>
            <Eye size={15} /> {school.following ? "Following" : "Not following"}
          </button>
          <div className="mt-1.5 max-w-56 text-[11px] leading-snug text-wf-faint">
            When on, the assistant reads this conversation and suggests updates.
          </div>
          <Note>Follow toggle · Gate 1</Note>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr_320px]">
        {/* Left column */}
        <div className="space-y-5">
          <Card>
            <CardTitle><span className="flex items-center gap-2"><Users size={14} /> Decision-makers</span></CardTitle>
            {[[school.head, school.headRole], [school.bursar, school.bursarRole]]
              .filter(([n]) => n && n !== "—")
              .map(([name, role]) => (
                <div key={name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={initialsOf(name)} />
                    <div>
                      <div className="text-sm font-medium text-wf-ink">{name}</div>
                      <div className="text-xs text-wf-mid">{role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-lg border border-wf-line p-1.5"><MessageCircle size={13} className="text-wf-mid" /></span>
                    <span className="rounded-lg border border-wf-line p-1.5"><Phone size={13} className="text-wf-mid" /></span>
                  </div>
                </div>
              ))}
          </Card>

          <Card>
            <CardTitle>Deal</CardTitle>
            {school.stage ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-wf-mid">Stage</span><Chip dot>{school.stage}</Chip></div>
                <div className="flex justify-between"><span className="text-wf-mid">Product</span><span className="text-wf-ink">{school.product}</span></div>
                <div className="flex justify-between"><span className="text-wf-mid">Units</span><span className="tabular-nums text-wf-ink">{school.units}</span></div>
                <div className="flex justify-between"><span className="text-wf-mid">Value</span><span className="font-semibold tabular-nums text-wf-ink">{money(school.value)}</span></div>
                <div className="flex justify-between"><span className="text-wf-mid">Owner</span><Avatar initials={school.owner} dark /></div>
              </div>
            ) : (
              <p className="text-xs text-wf-mid">No open deal yet — this school is in the engine at “{school.eng}”.</p>
            )}
          </Card>

          <Card>
            <CardTitle>Quotes</CardTitle>
            {school.stage === "Quote Sent" || school.stage === "Procurement" ? (
              <div className="rounded-lg border border-wf-line px-3 py-2 text-xs">
                <div className="font-medium text-wf-ink">Q-2026-0{school.id} · {school.units} units</div>
                <div className="mt-0.5 text-wf-mid">{money(school.value)} · sent</div>
              </div>
            ) : (
              <p className="text-xs text-wf-mid">No quotes yet.</p>
            )}
          </Card>
        </div>

        {/* Centre: WhatsApp thread + timeline (§1.4-7) */}
        <Card className="!p-0">
          <div className="flex items-center justify-between border-b border-wf-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-wf-ink">
              <MessageCircle size={15} /> WhatsApp thread
            </h3>
            <span className="rounded-full bg-wf-fill px-2 py-0.5 text-[10px] font-medium text-wf-mid">read-only · captured</span>
          </div>
          <div className="space-y-3 px-5 py-4">
            {school.wa.length === 0 && (
              <p className="py-8 text-center text-xs text-wf-mid">No conversation captured yet. Draft outreach from the Lead Engine.</p>
            )}
            {school.wa.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-snug ${
                    m.dir === "out" ? "rounded-br-sm bg-wf-dark text-white" : "rounded-bl-sm bg-wf-fill text-wf-ink"
                  }`}>
                    {m.text}
                    <div className={`mt-1 text-[9px] ${m.dir === "out" ? "text-white/50" : "text-wf-faint"}`}>{m.time}</div>
                  </div>
                </div>
                {/* interleaved timeline event after the first message */}
                {i === 0 && school.stage && (
                  <div className="my-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-wf-line" />
                    <span className="text-[10px] text-wf-faint">Deal created · moved to {school.stage}</span>
                    <span className="h-px flex-1 bg-wf-line" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          <Card>
            <CardTitle right={<Note>Gate 2</Note>}>Suggestions</CardTitle>
            {suggestions.length > 0 ? (
              <div className="space-y-2.5">
                {suggestions.map((s) => <SuggestionCard key={s.id} s={s} />)}
              </div>
            ) : (
              <p className="text-xs text-wf-mid">Nothing pending for this school.</p>
            )}
          </Card>

          <Card>
            <CardTitle>Tasks</CardTitle>
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${task.done ? "border-wf-mid bg-wf-mid" : "border-wf-faint"}`} />
                    <span className={`flex-1 text-xs ${task.done ? "text-wf-faint line-through" : "text-wf-ink"}`}>{task.title}</span>
                    <span className="rounded-full bg-wf-fill px-2 py-0.5 text-[10px] text-wf-mid">{task.due}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-wf-mid">No open tasks.</p>
            )}
          </Card>

          <Card>
            <CardTitle><span className="flex items-center gap-2"><Sparkles size={14} /> Copilot · next best action</span></CardTitle>
            <p className="text-xs leading-snug text-wf-mid">{school.next}</p>
            {(school.product === "Both" || school.product === "Smart Boards") && (
              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-wf-fill px-2.5 py-2">
                <Star size={13} className="mt-0.5 shrink-0 text-wf-mid" />
                <span className="text-[11px] leading-snug text-wf-mid">
                  Cross-sell: same buyer purchases school sports equipment — bundle it.
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
