"use client";

/**
 * Reports & leaderboard (addendum §9), live from Convex: per-rep and
 * global quotations sent vs converted (volume AND value), follow-up rate,
 * tasks completed, boards-sold record, ranked leaderboard.
 */
import { useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Avatar, SegmentBar } from "@/components/crm/bits";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useReports } from "@/components/crm/data";
import { money } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

const PERIODS = ["This month", "This quarter", "This year"] as const;

export default function ReportsPage() {
  const data = useReports();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("This quarter");

  if (data === undefined) return <LoadingSkeleton variant="table" />;

  const { rows, boardsBySize } = data;
  const totals = {
    sent: rows.reduce((a, r) => a + r.sent, 0),
    sentValue: rows.reduce((a, r) => a + r.sentValue, 0),
    won: rows.reduce((a, r) => a + r.won, 0),
    wonValue: rows.reduce((a, r) => a + r.wonValue, 0),
  };
  const hitVolume = Math.round((totals.won / Math.max(totals.sent, 1)) * 100);
  const hitValue = Math.round((totals.wonValue / Math.max(totals.sentValue, 1)) * 100);
  const boardsTotal = boardsBySize.reduce((a, b) => a + b.units, 0);
  const maxUnits = Math.max(...boardsBySize.map((b) => b.units), 1);

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<Trophy size={22} />}
          headline="No activity to report yet"
          body="Once quotes go out and deals close, this page shows who's sending, who's converting, and who's following up on time."
          action="Open the pipeline"
        />
      }
    >
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Reports</h1>
            <p className="mt-0.5 text-sm text-muted">Activity, hit rate and follow-through — per rep and for the team</p>
          </div>
          <div className="flex rounded-lg border border-line bg-card p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                  period === p ? "bg-ink text-white" : "text-muted hover:text-body"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardTitle>Quotations — sent vs converted</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-semibold tabular-nums text-body">{totals.sent}</div>
                <div className="text-xs text-muted">sent · {money(totals.sentValue)}</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums text-success">{totals.won}</div>
                <div className="text-xs text-muted">converted · {money(totals.wonValue)}</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {([
                ["Hit rate by volume", hitVolume],
                ["Hit rate by value", hitValue],
              ] as const).map(([label, pct]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold tabular-nums text-body">{pct}%</span>
                  </div>
                  <SegmentBar filled={Math.round(pct / 10)} total={10} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle right={<span className="text-xs text-muted">{period.toLowerCase()}</span>}>
              Boards sold
            </CardTitle>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-body">{boardsTotal}</span>
              <span className="text-xs text-muted">units · {money(boardsBySize.reduce((a, b) => a + b.value, 0))}</span>
            </div>
            <div className="space-y-2.5">
              {boardsBySize.map((b) => (
                <div key={b.size} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold tabular-nums text-body">{b.size}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-green" style={{ width: `${(b.units / maxUnits) * 100}%` }} />
                  </div>
                  <span className="w-20 text-right text-[11px] tabular-nums text-muted">
                    {b.units} · {money(b.value)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-faint">Cumulative sold record — every won order, by size and period.</p>
          </Card>

          <Card>
            <CardTitle right={<Trophy size={14} className="text-gold" />}>Leaderboard</CardTitle>
            <ul className="space-y-3">
              {rows.map((r, i) => (
                <li key={r.userId} className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    i === 0 ? "bg-gold/15 text-gold" : "bg-line text-muted"
                  )}>
                    {i === 0 ? <Medal size={13} /> : i + 1}
                  </span>
                  <Avatar initials={r.initials} tone={r.role === "admin" ? "terra" : "green"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-body">{r.name}</div>
                    <div className="text-[10px] text-faint">{r.won}/{r.sent} quotes converted</div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-body">{money(r.soldValue)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-5 !p-0">
          <div className="border-b border-line px-5 py-4">
            <h3 className="text-sm font-semibold text-body">Individual performance</h3>
          </div>
          <div className="hidden grid-cols-12 border-b border-line px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint md:grid">
            <div className="col-span-3">Rep</div>
            <div className="col-span-2 text-right">Quotes sent</div>
            <div className="col-span-2 text-right">Converted</div>
            <div className="col-span-3 md:pl-6">Follow-up rate</div>
            <div className="col-span-2 text-right">Tasks done</div>
          </div>
          {rows.map((r) => (
            <div key={r.userId} className="grid grid-cols-2 items-center gap-y-2 border-b border-line px-5 py-3.5 last:border-b-0 md:grid-cols-12">
              <div className="col-span-2 flex items-center gap-2.5 md:col-span-3">
                <Avatar initials={r.initials} tone={r.role === "admin" ? "terra" : "green"} size="sm" />
                <div>
                  <span className="text-sm font-medium text-body">{r.name}</span>
                  {r.role === "admin" && <Chip tone="terra" className="ml-2">admin</Chip>}
                </div>
              </div>
              <div className="text-right text-sm tabular-nums text-body md:col-span-2">
                {r.sent} <span className="text-[11px] text-faint">({money(r.sentValue)})</span>
              </div>
              <div className="text-right text-sm tabular-nums text-body md:col-span-2">
                {r.won} <span className="text-[11px] text-faint">({money(r.wonValue)})</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 md:col-span-3 md:pl-6">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                  <div
                    className={cn("h-full rounded-full", r.followUp >= 80 ? "bg-green" : r.followUp >= 70 ? "bg-gold" : "bg-danger")}
                    style={{ width: `${r.followUp}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-body">{r.followUp}%</span>
                <span className="text-[10px] text-faint">on time</span>
              </div>
              <div className="text-right text-sm tabular-nums text-body md:col-span-2">{r.tasksDone}</div>
            </div>
          ))}
        </Card>
      </div>
    </PageState>
  );
}
