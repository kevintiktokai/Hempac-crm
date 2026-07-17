"use client";

/**
 * Pipeline kanban (§4.3 + addendum §1), now backed by the live board query.
 * Drag-and-drop calls the moveDeal mutation (audit-logged); check-burst on
 * a Won drop (§1.5). Historical wins render from the orders record.
 */
import Link from "next/link";
import { useState, type DragEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BOARDS_STAGES, SPORTS_STAGES, CURRENT_USER, money,
  type DealStage, type PipelineType,
} from "@/lib/sampleData";
import { LoadingSkeleton } from "./PageState";
import { Avatar, productTone } from "./bits";
import { useBoard, useCrmActions } from "./data";
import { usePrototype } from "./store";
import { cn } from "@/lib/utils";

const STAGE_DOTS: Record<DealStage, string> = {
  Enquiry: "bg-faint",
  "Quotation Sent": "bg-gold",
  "Awaiting Response": "bg-amber",
  "Awaiting Term": "bg-gold",
  "Awaiting Funds": "bg-terra",
  "No Response": "bg-danger",
  Interested: "bg-green",
  "Not Now": "bg-amber",
  Won: "bg-success",
  Lost: "bg-danger",
};

export function KanbanBoard({ pipeline, repFilter }: { pipeline: PipelineType; repFilter?: string | null }) {
  const data = useBoard(pipeline);
  const { moveDeal } = useCrmActions();
  const { view } = usePrototype();
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  if (data === undefined) return <LoadingSkeleton variant="kanban" />;

  const stageList: readonly DealStage[] = pipeline === "boards" ? BOARDS_STAGES : SPORTS_STAGES;
  const deals = data.deals
    .filter((d) => view === "global" || d.assigneeInitials === CURRENT_USER.initials)
    .filter((d) => !repFilter || d.assigneeInitials === repFilter);

  const onDrop = (e: DragEvent, stage: DealStage) => {
    e.preventDefault();
    setOverStage(null);
    const id = e.dataTransfer.getData("text/deal-id");
    if (!id) return;
    void moveDeal(id as Id<"deals">, stage);
    if (stage === "Won") {
      setBurstId(id);
      setTimeout(() => setBurstId(null), 700);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stageList.map((stage) => {
        const cards = deals.filter((d) => d.stage === stage);
        const extras = stage === "Won" && view === "global" ? data.historicalWins : [];
        const total = cards.reduce((a, c) => a + c.value, 0) + extras.reduce((a, c) => a + c.value, 0);
        const isOver = overStage === stage;
        return (
          <div key={stage} className="flex w-60 shrink-0 flex-col sm:w-64">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", STAGE_DOTS[stage])} />
                <span className="whitespace-nowrap text-sm font-semibold text-body">{stage}</span>
                <span className="text-xs tabular-nums text-faint">{cards.length + extras.length}</span>
              </div>
              <span className="text-xs font-medium tabular-nums text-muted">{money(total)}</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
              onDragLeave={() => setOverStage((cur) => (cur === stage ? null : cur))}
              onDrop={(e) => onDrop(e, stage)}
              className={cn(
                "flex min-h-32 flex-1 flex-col gap-2.5 rounded-xl p-2 transition-shadow duration-150",
                isOver ? "drop-glow bg-green-soft/60" : "bg-line/40"
              )}
            >
              {cards.map((d) => (
                <Link
                  key={d._id}
                  href={`/schools/${d.schoolId}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/deal-id", d._id)}
                  className="group relative cursor-grab rounded-xl border border-line bg-card p-3.5 shadow-card transition-shadow duration-150 hover:shadow-lift active:cursor-grabbing"
                >
                  {burstId === d._id && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="absolute h-14 w-14 animate-burst-ring rounded-full border-2 border-success" />
                      <CheckCircle2 size={30} className="animate-check-burst text-success" />
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug text-body">{d.schoolName}</span>
                    {stage === "Won" && <CheckCircle2 size={15} className="shrink-0 text-success" />}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Chip tone={productTone(d.product)}>{d.product}</Chip>
                    {d.units > 0 && pipeline === "boards" && (
                      <span className="text-xs text-faint">{d.units} × {d.boardSize}</span>
                    )}
                  </div>
                  {d.note && <p className="mt-1.5 text-[11px] leading-snug text-faint">{d.note}</p>}
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-sm font-semibold tabular-nums text-body">{money(d.value)}</span>
                    <span title={`Assigned to ${d.assigneeName}`}>
                      <Avatar initials={d.assigneeInitials} tone={d.assigneeRole === "admin" ? "terra" : "green"} size="sm" />
                    </span>
                  </div>
                </Link>
              ))}
              {extras.map((w) => (
                <div key={w.name + w.value} className="rounded-xl border border-line bg-card p-3.5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug text-body">{w.name}</span>
                    <CheckCircle2 size={15} className="shrink-0 text-success" />
                  </div>
                  <div className="mt-2 text-xs text-faint">{w.detail}</div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-sm font-semibold tabular-nums text-body">{money(w.value)}</span>
                    <Avatar initials={w.ownerInitials} tone={w.ownerInitials === "EC" || w.ownerInitials === "GB" ? "terra" : "green"} size="sm" />
                  </div>
                </div>
              ))}
              {cards.length + extras.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-faint">
                  Drop a deal here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
