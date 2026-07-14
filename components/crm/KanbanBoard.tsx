"use client";

/**
 * Pipeline kanban (§4.3): drag-and-drop with drop-glow; a check-burst plays
 * when a deal lands in Won (the one allowed moment of celebration, §1.5).
 */
import Link from "next/link";
import { useState, type DragEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { PIPELINE_STAGES, SCHOOLS, WON_DEALS, money, type DealStage } from "@/lib/sampleData";
import { Avatar, productTone } from "./bits";
import { usePrototype } from "./store";
import { cn } from "@/lib/utils";

const STAGE_DOTS: Record<DealStage, string> = {
  "New Enquiry": "bg-faint", "Demo Booked": "bg-gold", "Quote Sent": "bg-amber",
  Procurement: "bg-terra", Won: "bg-success", Lost: "bg-danger",
};

export function KanbanBoard() {
  const { stages, moveDeal } = usePrototype();
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [burstId, setBurstId] = useState<number | null>(null);

  const deals = SCHOOLS.filter((s) => stages[s.id]);

  const onDrop = (e: DragEvent, stage: DealStage) => {
    e.preventDefault();
    setOverStage(null);
    const id = Number(e.dataTransfer.getData("text/school-id"));
    if (!id) return;
    moveDeal(id, stage);
    if (stage === "Won") {
      setBurstId(id);
      setTimeout(() => setBurstId(null), 700);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const cards = deals.filter((d) => stages[d.id] === stage);
        const wonExtras = stage === "Won" ? WON_DEALS : [];
        const total =
          cards.reduce((a, c) => a + c.value, 0) + wonExtras.reduce((a, c) => a + c.value, 0);
        const isOver = overStage === stage;
        return (
          <div key={stage} className="flex w-64 shrink-0 flex-col sm:w-72">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", STAGE_DOTS[stage])} />
                <span className="text-sm font-semibold text-body">{stage}</span>
                <span className="text-xs tabular-nums text-faint">{cards.length + wonExtras.length}</span>
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
                  key={d.id}
                  href={`/schools/${d.id}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/school-id", String(d.id))}
                  className="group relative cursor-grab rounded-xl border border-line bg-card p-3.5 shadow-card transition-shadow duration-150 hover:shadow-lift active:cursor-grabbing"
                >
                  {burstId === d.id && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="absolute h-14 w-14 animate-burst-ring rounded-full border-2 border-success" />
                      <CheckCircle2 size={30} className="animate-check-burst text-success" />
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug text-body">{d.name}</span>
                    {stage === "Won" && <CheckCircle2 size={15} className="shrink-0 text-success" />}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Chip tone={productTone(d.product)}>{d.product}</Chip>
                    {d.units > 0 && <span className="text-xs text-faint">{d.units} unit{d.units === 1 ? "" : "s"}</span>}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-sm font-semibold tabular-nums text-body">{money(d.value)}</span>
                    <Avatar initials={d.owner} tone={d.owner === "EC" ? "terra" : "green"} size="sm" />
                  </div>
                </Link>
              ))}
              {wonExtras.map((w) => (
                <div key={w.name} className="rounded-xl border border-line bg-card p-3.5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug text-body">{w.name}</span>
                    <CheckCircle2 size={15} className="shrink-0 text-success" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Chip tone={productTone(w.product)}>{w.product}</Chip>
                    <span className="text-xs text-faint">{w.units} unit{w.units === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-sm font-semibold tabular-nums text-body">{money(w.value)}</span>
                    <Avatar initials={w.owner} tone={w.owner === "EC" ? "terra" : "green"} size="sm" />
                  </div>
                </div>
              ))}
              {cards.length + wonExtras.length === 0 && (
                <div className="flex flex-1 items-center justify-center py-8 text-xs text-faint">
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
