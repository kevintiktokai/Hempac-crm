"use client";

/**
 * Dashboard (§4.1 + addendum §8), live from Convex: KPI row, boards
 * pipeline chart, funnel radial, quotation buckets, quotes sent vs
 * converted, boards sold, sports snapshot, demos, Needs-you rail.
 */
import { TrendingUp, Radar, Columns3, CalendarCheck, Trophy, LayoutGrid, Sun } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KpiCard, Avatar, SegmentBar } from "@/components/crm/bits";
import { HighlightBarChart, FunnelRadial } from "@/components/crm/charts";
import { NeedsYouRail } from "@/components/crm/NeedsYouRail";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useDashboard } from "@/components/crm/data";
import { BOARD_SIZES, DEMOS, KPIS, money, CURRENT_USER } from "@/lib/sampleData";

const BUCKET_BARS: Record<string, string> = {
  "Awaiting Response": "bg-amber",
  "Awaiting Term": "bg-gold",
  "Awaiting Funds": "bg-terra",
  "No Response": "bg-danger",
};

export default function DashboardPage() {
  const data = useDashboard();

  return (
    <PageState
      skeleton="dashboard"
      empty={
        <EmptyState
          icon={<Sun size={22} />}
          headline="Welcome to your sales engine"
          body="Once leads are logged and quotes go out, this page shows your money, movement, and what needs you — nothing slips to 'tomorrow'."
          action="Log your first lead"
        />
      }
    >
      {data === undefined ? (
        <LoadingSkeleton variant="dashboard" />
      ) : (
        <div className="dashboard-tint p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-ink">
                Good morning, {CURRENT_USER.firstName} 👋
              </h1>
              <p className="mt-0.5 text-sm text-muted">Here&rsquo;s where your schools stand today.</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost"><LayoutGrid size={13} /> Manage widgets</Button>
              </PopoverTrigger>
              <PopoverContent className="w-52">
                <p className="text-xs leading-snug text-muted">Widget customisation is coming soon.</p>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_324px]">
            <div className="min-w-0 space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <KpiCard icon={TrendingUp} label="Pipeline value" value={money(data.pipelineValue)} delta={KPIS.pipelineDelta} tone="green" />
                <KpiCard icon={Radar} label="Leads this month" value={String(KPIS.leadsThisMonth)} delta={KPIS.leadsDelta} tone="terra" />
                <KpiCard icon={Columns3} label="Active deals" value={String(data.openDeals)} tone="gold" />
                <KpiCard icon={CalendarCheck} label="Demos booked" value={`${KPIS.demosBooked} / ${KPIS.demosTarget}`} tone="amber"
                  segments={{ filled: KPIS.demosBooked, total: KPIS.demosTarget }} />
                <KpiCard icon={Trophy} label="Won this quarter" value={money(data.wonThisQuarter)} tone="success" />
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <Card className="min-w-0 lg:col-span-2">
                  <CardTitle right={<span className="text-xs text-muted">boards · open deal value</span>}>
                    Boards pipeline by stage
                  </CardTitle>
                  <HighlightBarChart
                    data={data.barData}
                    activeIndex={data.barData.reduce((best, b, i, arr) => (b.value > arr[best].value ? i : best), 0)}
                    format={money}
                  />
                </Card>
                <Card>
                  <CardTitle right={
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> ACTIVE
                    </span>
                  }>
                    Engine funnel
                  </CardTitle>
                  <FunnelRadial />
                </Card>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <Card>
                  <CardTitle right={
                    <span className="text-xs tabular-nums text-muted">
                      {money(data.buckets.reduce((a, b) => a + b.value, 0))} waiting
                    </span>
                  }>
                    Quotation value by bucket
                  </CardTitle>
                  <div className="space-y-2.5">
                    {data.buckets.map((b) => {
                      const max = Math.max(...data.buckets.map((x) => x.value), 1);
                      return (
                        <div key={b.bucket} className="flex items-center gap-2.5">
                          <span className="w-28 shrink-0 text-[11px] text-muted">{b.bucket}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                            <div className={`h-full rounded-full ${BUCKET_BARS[b.bucket]}`} style={{ width: `${(b.value / max) * 100}%` }} />
                          </div>
                          <span className="w-16 shrink-0 text-right text-[11px] font-semibold tabular-nums text-body">{money(b.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-faint">
                    Quoted and in play — what each school is waiting on.
                  </p>
                </Card>

                <Card>
                  <CardTitle>Quotes sent → converted</CardTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xl font-semibold tabular-nums text-body">{data.quotesSent}</div>
                      <div className="text-[11px] text-muted">sent · {money(data.quotesSentValue)}</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold tabular-nums text-success">{data.quotesWon}</div>
                      <div className="text-[11px] text-muted">won · {money(data.quotesWonValue)}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {([
                      ["by volume", Math.round((data.quotesWon / Math.max(data.quotesSent, 1)) * 100)],
                      ["by value", Math.round((data.quotesWonValue / Math.max(data.quotesSentValue, 1)) * 100)],
                    ] as const).map(([label, pct]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="text-muted">{label}</span>
                          <span className="font-semibold tabular-nums text-body">{pct}%</span>
                        </div>
                        <SegmentBar filled={Math.round(pct / 10)} total={10} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <CardTitle right={<span className="text-xs text-muted">cumulative</span>}>Boards sold</CardTitle>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-xl font-semibold tabular-nums text-body">{data.boardsSoldUnits}</span>
                    <span className="text-[11px] text-muted">units · {money(data.boardsSoldValue)}</span>
                  </div>
                  <div className="space-y-2">
                    {BOARD_SIZES.map((size) => {
                      const row = data.boardsSold.find((b) => b.size === size);
                      const max = Math.max(...data.boardsSold.map((b) => b.units), 1);
                      const units = row?.units ?? 0;
                      return (
                        <div key={size} className="flex items-center gap-2.5">
                          <span className="w-7 text-[11px] font-semibold tabular-nums text-body">{size}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full bg-green" style={{ width: `${(units / max) * 100}%` }} />
                          </div>
                          <span className="w-6 text-right text-[11px] tabular-nums text-muted">{units}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-green-soft px-2.5 py-1.5 text-[11px]">
                    <span className="text-muted">Sports pipeline</span>
                    <span className="font-medium tabular-nums text-green">
                      {data.sports.enquiry} enq · {data.sports.interested} int · {data.sports.notNow} later · {data.sports.won} won
                    </span>
                  </div>
                </Card>
              </div>

              <Card>
                <CardTitle right={<button className="text-xs font-medium text-muted transition-colors hover:text-body">See all</button>}>
                  Upcoming demos
                </CardTitle>
                <ul className="divide-y divide-line">
                  {DEMOS.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex shrink-0 -space-x-2">
                          {d.attendees.map((a, i) => (
                            <Avatar key={a} initials={a} tone={i % 2 ? "terra" : "green"} size="sm" />
                          ))}
                        </div>
                        <span className="truncate text-sm text-body">{d.title}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-soft px-2.5 py-1 text-[11px] font-medium text-green">
                        {d.date} · {d.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <NeedsYouRail />
          </div>
        </div>
      )}
    </PageState>
  );
}
