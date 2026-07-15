import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft-fill status chip: colour at ~12% opacity, full-strength text (§1.2). */
export type ChipTone = "green" | "terra" | "gold" | "success" | "amber" | "danger" | "neutral";

const TONES: Record<ChipTone, string> = {
  green: "bg-green/10 text-green",
  terra: "bg-terra/10 text-terra",
  gold: "bg-gold/15 text-gold",
  success: "bg-success/10 text-success",
  amber: "bg-amber/15 text-amber",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-faint/15 text-muted",
};

export function Chip({
  tone = "neutral", dot = false, className, children,
}: { tone?: ChipTone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
      TONES[tone], className
    )}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
