/**
 * Lo-fi wireframe primitives (Phase A1). Greyscale only — these communicate
 * layout and hierarchy, not the visual design. Styled equivalents replace
 * them in Phase A2.
 */
import type { ReactNode } from "react";

/** Dotted annotation tag naming a signature component for the design review. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded border border-dashed border-wf-faint px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-wf-faint">
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-wf-line bg-wf-card p-5 ${className}`}>{children}</div>
  );
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-wf-ink">{children}</h3>
      {right}
    </div>
  );
}

export function Chip({ children, dot = false }: { children: ReactNode; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-wf-fill px-2 py-0.5 text-[11px] font-medium text-wf-mid">
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-wf-mid" />}
      {children}
    </span>
  );
}

export function SolidBtn({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-lg bg-wf-dark px-3 py-1.5 text-xs font-semibold text-white">
      {children}
    </button>
  );
}

export function GhostBtn({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-lg border border-wf-line bg-wf-card px-3 py-1.5 text-xs font-medium text-wf-mid">
      {children}
    </button>
  );
}

/** x-of-y segmented progress bar (effix-style). */
export function SegmentBar({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < filled ? "bg-wf-dark" : "bg-wf-fill2"}`}
        />
      ))}
    </div>
  );
}

/** Greyscale sparkline placeholder. */
export function Sparkline() {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,20 12,16 24,18 36,10 48,12 60,6 72,8 80,3"
        fill="none" stroke="#8A8A84" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  );
}

/** Fit-score bar with numeric value. */
export function FitBar({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-wf-fill2">
        <div className="h-full rounded-full bg-wf-dark" style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-wf-ink">{v}</span>
    </div>
  );
}

/** 3-bar priority mini gauge for table rows. */
export function PriorityBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-0.5" aria-label={`priority ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i <= level ? "bg-wf-dark" : "bg-wf-fill2"}`}
          style={{ height: 4 + i * 3 }}
        />
      ))}
    </span>
  );
}

export function Avatar({ initials, dark = false }: { initials: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
        dark ? "bg-wf-dark text-white" : "bg-wf-fill2 text-wf-mid"
      }`}
    >
      {initials}
    </span>
  );
}

/** Highlighted bar chart placeholder: quiet bars, one active bar with value pill. */
export function BarChartWf({
  bars, activeIndex, activeLabel,
}: { bars: number[]; activeIndex: number; activeLabel: string }) {
  const max = Math.max(...bars);
  return (
    <div className="flex h-44 items-end gap-3 px-2">
      {bars.map((b, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} className="relative flex h-full flex-1 flex-col items-center justify-end">
            {active && (
              <span className="absolute -top-7 rounded-md bg-wf-dark px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {activeLabel}
              </span>
            )}
            <div
              className={`w-full rounded-t-md ${active ? "bg-wf-dark" : "bg-wf-fill2"}`}
              style={{ height: `${(b / max) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Segmented donut placeholder for the engine funnel. */
export function DonutWf({ centerBig, centerSmall }: { centerBig: string; centerSmall: string }) {
  const segments = [
    { pct: 38, color: "#CFCFC9" },
    { pct: 24, color: "#B9B9B2" },
    { pct: 18, color: "#9C9C95" },
    { pct: 12, color: "#6E6E68" },
    { pct: 8, color: "#3A3A36" },
  ];
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc - 1.5}%, transparent ${acc - 1.5}% ${acc}%`;
    })
    .join(", ");
  return (
    <div className="relative mx-auto h-40 w-40">
      <div className="h-full w-full rounded-full" style={{ background: `conic-gradient(${stops})` }} />
      <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-wf-card">
        <span className="text-2xl font-semibold tabular-nums text-wf-ink">{centerBig}</span>
        <span className="text-[10px] text-wf-mid">{centerSmall}</span>
      </div>
    </div>
  );
}
