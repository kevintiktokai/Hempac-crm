/**
 * Pipeline wireframe (handoff §4.3): 5-column kanban. Drag-and-drop is a
 * Phase A2 interaction — lo-fi shows structure only.
 */
import { CheckCircle2 } from "lucide-react";
import { Avatar, Chip, Note } from "@/components/wireframe/ui";
import { PIPELINE_STAGES, SCHOOLS, WON_DEALS, money } from "@/lib/sampleData";
import Link from "next/link";

interface KanbanCard {
  key: string;
  schoolId: number | null;
  name: string;
  product: string;
  units: number;
  value: number;
  owner: string;
}

function cardsFor(stage: string): KanbanCard[] {
  if (stage === "Won") {
    return WON_DEALS.map((w, i) => ({
      key: `won-${i}`, schoolId: null, name: w.name, product: w.product, units: w.units, value: w.value, owner: w.owner,
    }));
  }
  return SCHOOLS.filter((s) => s.stage === stage).map((s) => ({
    key: `s-${s.id}`, schoolId: s.id, name: s.name, product: s.product, units: s.units, value: s.value, owner: s.owner,
  }));
}

export default function PipelinePage() {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-wf-ink">Pipeline</h1>
          <p className="text-sm text-wf-mid">Every deal, from enquiry to won · drag cards between stages</p>
        </div>
        <Note>Kanban · drag &amp; drop in A2</Note>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const cards = cardsFor(stage);
          const total = cards.reduce((a, c) => a + c.value, 0);
          const won = stage === "Won";
          return (
            <div key={stage} className="flex w-64 shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${won ? "bg-wf-dark" : "bg-wf-mid"}`} />
                  <span className="text-sm font-semibold text-wf-ink">{stage}</span>
                  <span className="text-xs text-wf-faint">{cards.length}</span>
                </div>
                <span className="text-xs font-medium tabular-nums text-wf-mid">{money(total)}</span>
              </div>
              <div className="flex min-h-24 flex-col gap-2.5 rounded-xl bg-wf-fill/60 p-2">
                {cards.map((c) => {
                  const body = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug text-wf-ink">{c.name}</span>
                        {won && <CheckCircle2 size={15} className="shrink-0 text-wf-mid" />}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Chip>{c.product}</Chip>
                        {c.units > 0 && <span className="text-xs text-wf-faint">{c.units} units</span>}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums text-wf-ink">{money(c.value)}</span>
                        <Avatar initials={c.owner} dark />
                      </div>
                    </>
                  );
                  const cls = "rounded-xl border border-wf-line bg-wf-card p-3 text-left";
                  return c.schoolId ? (
                    <Link key={c.key} href={`/schools/${c.schoolId}`} className={cls}>{body}</Link>
                  ) : (
                    <div key={c.key} className={cls}>{body}</div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="py-6 text-center text-xs text-wf-faint">No deals here yet</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
