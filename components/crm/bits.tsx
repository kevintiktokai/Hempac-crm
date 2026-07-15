/**
 * Small shared CRM pieces: KPI card, fit bar, priority gauge, avatars,
 * product/engine-stage chip mapping, segmented progress (§1.4-1, §1.4-4).
 */
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import type { DealStage, EngineStage, Product } from "@/lib/sampleData";
import { Sparkline } from "./charts";

export const productTone = (p: Product): ChipTone =>
  p === "Smart Boards" ? "green" : p === "Sports Equipment" ? "terra" : "gold";

export const engineTone = (s: EngineStage): ChipTone =>
  ({ Discovered: "neutral", Scored: "gold", Contacted: "amber", Replied: "terra", "In pipeline": "green" } as const)[s];

export const dealTone = (s: DealStage): ChipTone =>
  ({ "New Enquiry": "neutral", "Demo Booked": "gold", "Quote Sent": "amber", Procurement: "terra", Won: "success", Lost: "danger" } as const)[s];

export function Avatar({ initials, tone = "green", size = "md" }: { initials: string; tone?: "green" | "terra" | "muted"; size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-card",
      size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]",
      tone === "green" ? "bg-green" : tone === "terra" ? "bg-terra" : "bg-faint"
    )}>
      {initials}
    </span>
  );
}

export function FitBar({ v, w = "w-16" }: { v: number; w?: string }) {
  const color = v >= 85 ? "bg-green" : v >= 70 ? "bg-gold" : "bg-faint";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-1.5 overflow-hidden rounded-full bg-line", w)}>
        <div className={cn("h-full rounded-full", color)} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-body">{v}</span>
    </div>
  );
}

/** 3-bar priority mini gauge (§1.4-4). */
export function PriorityBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-0.5" aria-label={`priority ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-1 rounded-sm", i <= level ? (level === 3 ? "bg-green" : "bg-gold") : "bg-line")}
          style={{ height: 4 + i * 3 }}
        />
      ))}
    </span>
  );
}

/** effix-style segmented x-of-y progress bar. */
export function SegmentBar({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${filled} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < filled ? "bg-green" : "bg-line")} />
      ))}
    </div>
  );
}

/** KPI stat card (§1.4-1): icon chip, label, tabular number, delta pill, sparkline or segments. */
export function KpiCard({
  icon: Icon, label, value, delta, deltaDown = false, tone = "green", segments,
}: {
  icon: LucideIcon; label: string; value: string;
  delta?: string; deltaDown?: boolean;
  tone?: ChipTone; segments?: { filled: number; total: number };
}) {
  const iconTone: Record<string, string> = {
    green: "bg-green/10 text-green", terra: "bg-terra/10 text-terra",
    gold: "bg-gold/15 text-gold", success: "bg-success/10 text-success",
    amber: "bg-amber/15 text-amber", danger: "bg-danger/10 text-danger",
    neutral: "bg-faint/15 text-muted",
  };
  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card transition-shadow duration-150 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconTone[tone])}>
          <Icon size={15} />
        </span>
        {delta && (
          <span className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
            deltaDown ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
          )}>
            {deltaDown ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-body">{value}</div>
      <div className="mb-2.5 text-xs text-muted">{label}</div>
      {segments ? <SegmentBar filled={segments.filled} total={segments.total} /> : <Sparkline />}
    </div>
  );
}
