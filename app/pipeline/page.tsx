"use client";

/**
 * Pipeline (§4.3 + addendum §1, §4): two pipeline types behind a toggle
 * (Boards quotation-driven / Sports transactional), Global vs Assigned-to-me
 * view, live drag-and-drop with drop-glow and the Won check-burst.
 */
import { useState } from "react";
import { Columns3, Presentation, Volleyball } from "lucide-react";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { usePrototype } from "@/components/crm/store";
import { DEALS, ORDERS, money, type PipelineType } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const { stages, view, setView } = usePrototype();
  const [pipeline, setPipeline] = useState<PipelineType>("boards");

  const live = DEALS.filter((d) => d.pipeline === pipeline);
  const open = live.filter((d) => stages[d.id] !== "Won" && stages[d.id] !== "Lost");
  const openValue = open.reduce((a, d) => a + d.value, 0);
  const wonValue =
    live.filter((d) => stages[d.id] === "Won").reduce((a, d) => a + d.value, 0) +
    ORDERS.filter((o) =>
      pipeline === "boards" ? o.product === "Smart Boards" && o.schoolId === null : o.product === "Sports Equipment"
    ).reduce((a, o) => a + o.value, 0);

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
            {/* Pipeline type toggle (§1) */}
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
            {/* View scope (§4) */}
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
