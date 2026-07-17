"use client";

/**
 * Pipeline (§4.3 + addendum §1, §4): two live pipelines behind a toggle,
 * Global vs Assigned-to-me view, drag-and-drop persisted via Convex.
 */
import { useState } from "react";
import { Columns3, Presentation, Volleyball } from "lucide-react";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { useBoard } from "@/components/crm/data";
import { usePrototype } from "@/components/crm/store";
import { money, type PipelineType } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const { view, setView } = usePrototype();
  const [pipeline, setPipeline] = useState<PipelineType>("boards");
  const data = useBoard(pipeline);

  const open = data?.deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost") ?? [];
  const openValue = open.reduce((a, d) => a + d.value, 0);
  const wonValue =
    (data?.deals.filter((d) => d.stage === "Won").reduce((a, d) => a + d.value, 0) ?? 0) +
    (data?.historicalWins.reduce((a, w) => a + w.value, 0) ?? 0);

  return (
    <PageState
      skeleton="kanban"
      empty={
        <EmptyState
          icon={<Columns3 size={22} />}
          headline="No deals yet"
          body="When a lead is logged — by a rep or from an accepted suggestion — it appears here, assigned and time-stamped, and moves stage by stage to Won."
          action="Log a lead"
        />
      }
    >
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Pipeline</h1>
            <p className="mt-0.5 text-sm text-muted">
              {pipeline === "boards"
                ? "Quotation-driven — most schools wait; the buckets say what they're waiting for"
                : "Fast and transactional — enquiry to outcome in days"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-line bg-card p-0.5">
              {(
                [
                  ["boards", "Smart Boards", Presentation],
                  ["sports", "Sports Equipment", Volleyball],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setPipeline(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                    pipeline === key ? "bg-ink text-white" : "text-muted hover:text-body"
                  )}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-line bg-card p-0.5">
              {(
                [
                  ["global", "Global"],
                  ["mine", "Assigned to me"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                    view === key ? "bg-green text-white" : "text-muted hover:text-body"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="ml-2 flex gap-5 text-right">
              <div>
                <div className="text-lg font-semibold tabular-nums text-body">{money(openValue)}</div>
                <div className="text-[11px] text-muted">open · {open.length} deals</div>
              </div>
              <div>
                <div className="text-lg font-semibold tabular-nums text-success">{money(wonValue)}</div>
                <div className="text-[11px] text-muted">won to date</div>
              </div>
            </div>
          </div>
        </div>
        <KanbanBoard pipeline={pipeline} />
      </div>
    </PageState>
  );
}
