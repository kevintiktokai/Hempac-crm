"use client";

/**
 * Chart components (§1.4-2, §1.4-3). Green is the hero series, terracotta is
 * the highlighted element, everything else stays quiet. Never rainbow.
 */
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { FUNNEL } from "@/lib/sampleData";

const COLORS = {
  ink: "#1E3D2C", green: "#2E5A40", terra: "#C25E30", gold: "#A78950",
  line: "#ECE9E0", muted: "#6C7B72", faint: "#98A69D", quiet: "#E3E0D5",
};

interface BarDatum {
  label: string;
  value: number;
}

/** Highlighted bar chart: quiet neutral bars, active bar in green gradient with a floating value pill. */
export function HighlightBarChart({
  data, activeIndex, format,
}: { data: BarDatum[]; activeIndex: number; format: (v: number) => string }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="heroBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} />
              <stop offset="100%" stopColor={COLORS.ink} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={COLORS.line} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: COLORS.faint }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => "$" + v / 1000 + "k"}
          />
          <Tooltip
            cursor={{ fill: "rgba(46,90,64,0.05)" }}
            formatter={(v) => format(Number(v))}
            contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.line}`, fontSize: 12 }}
          />
          <Bar
            dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive
            label={(props) => {
              const { x, y, width, index, value } = props as {
                x: number; y: number; width: number; index: number; value: number;
              };
              if (index !== activeIndex) return <g />;
              const cx = x + width / 2;
              const text = format(value);
              const w = text.length * 6.4 + 16;
              return (
                <g>
                  <rect x={cx - w / 2} y={y - 26} rx={8} width={w} height={20} fill={COLORS.ink} />
                  <text x={cx} y={y - 12} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
                    {text}
                  </text>
                </g>
              );
            }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={i === activeIndex ? "url(#heroBar)" : COLORS.quiet} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const FUNNEL_COLORS = [COLORS.quiet, "#CBBF9F", COLORS.gold, COLORS.terra, COLORS.green];

/** Funnel radial (§1.4-3): segmented donut, centre conversion %, stage-count legend. */
export function FunnelRadial() {
  const total = FUNNEL[0].count;
  const conversion = ((FUNNEL[FUNNEL.length - 1].count / total) * 100).toFixed(1);
  const sum = FUNNEL.reduce((a, f) => a + f.count, 0);
  const R = 62;
  const CIRC = 2 * Math.PI * R;
  const GAP = 6;
  let offset = 0;

  return (
    <div>
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          {FUNNEL.map((f, i) => {
            const frac = f.count / sum;
            const len = Math.max(frac * CIRC - GAP, 3);
            const el = (
              <circle
                key={f.stage}
                cx="80" cy="80" r={R} fill="none"
                stroke={FUNNEL_COLORS[i]} strokeWidth={i === FUNNEL.length - 1 ? 15 : 12}
                strokeLinecap="round"
                strokeDasharray={`${len} ${CIRC - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += frac * CIRC;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-semibold tabular-nums text-ink">{conversion}%</span>
          <span className="text-[10px] text-muted">discovered → pipeline</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-1">
        {FUNNEL.map((f, i) => (
          <div key={f.stage} className="flex min-w-0 flex-col items-center">
            <span className="mb-1 h-1.5 w-1.5 rounded-full" style={{ background: FUNNEL_COLORS[i] }} />
            <span className="text-xs font-semibold tabular-nums text-body">{f.count}</span>
            <span className="truncate text-[9px] leading-tight text-faint">{f.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mini sparkline for KPI cards. */
export function Sparkline({ points = "0,20 12,16 24,18 36,10 48,13 60,6 72,9 80,3" }: { points?: string }) {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
    </svg>
  );
}
