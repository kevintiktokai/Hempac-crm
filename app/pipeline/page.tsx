"use client";

/**
 * Pipeline (§4.3): kanban with live drag-and-drop, drop-glow, Won
 * check-burst. Horizontal scroll on small screens.
 */
import { Columns3 } from "lucide-react";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { usePrototype } from "@/components/crm/store";
import { SCHOOLS, WON_DEALS, money } from "@/lib/sampleData";

export default function PipelinePage() {
  const { stages } = usePrototype();
  const open = SCHOOLS.filter((s) => stages[s.id] && stages[s.id] !== "Won" && stages[s.id] !== "Lost");
  const openValue = open.reduce((a, s) => a + s.value, 0);
  const wonValue =
    SCHOOLS.filter((s) => stages[s.id] === "Won").reduce((a, s) => a + s.value, 0) +
    WON_DEALS.reduce((a, w) => a + w.value, 0);

  return (
    <PageState
      skeleton="kanban"
      empty={
        <EmptyState
          icon={<Columns3 size={22} />}
          headline="No deals yet"
          body="When a school replies and a deal is created — by you or from an accepted suggestion — it appears here and moves stage by stage to Won."
          action="Open the Lead Engine"
        />
      }
    >
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Pipeline</h1>
            <p className="mt-0.5 text-sm text-muted">Every deal, from enquiry to won · drag cards between stages</p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <div className="text-lg font-semibold tabular-nums text-body">{money(openValue)}</div>
              <div className="text-[11px] text-muted">open · {open.length} deals</div>
            </div>
            <div>
              <div className="text-lg font-semibold tabular-nums text-success">{money(wonValue)}</div>
              <div className="text-[11px] text-muted">won this quarter</div>
            </div>
          </div>
        </div>
        <KanbanBoard />
      </div>
    </PageState>
  );
}
