"use client";

/**
 * Dashboard (§4.1 + addendum §8): greeting, KPI row, highlighted bar chart
 * + funnel radial, then the discovery-meeting views — quotation value by
 * bucket, quotations sent vs converted, boards sold by size, sports
 * snapshot — plus upcoming demos and the Needs-you rail.
 */
import { TrendingUp, Radar, Columns3, CalendarCheck, Trophy, LayoutGrid, Sun } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KpiCard, Avatar, SegmentBar } from "@/components/crm/bits";
import { HighlightBarChart, FunnelRadial } from "@/components/crm/charts";
import { NeedsYouRail } from "@/components/crm/NeedsYouRail";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { usePrototype } from "@/components/crm/store";
import {
  BOARD_SIZES, DEALS, DEMOS, KPIS, ORDERS, QUOTES, QUOTE_BUCKETS,
  money, CURRENT_USER,
} from "@/lib/sampleData";

const BUCKET_BARS: Record<string, string> = {
  "Awaiting Response": "bg-amber",
  "Awaiting Term": "bg-gold",
  "Awaiting Funds": "bg-terra",
  "No Response": "bg-danger",
};

export default function DashboardPage() {
  const { stages } = usePrototype();

  const openDeals = DEALS.filter((d) => stages[d.id] !== "Won" && stages[d.id] !== "Lost");
  const pipelineValue = openDeals.reduce((a, d) => a + d.value, 0);
  const wonThisQuarter = ORDERS.filter((o) => o.period !== "year").reduce((a, o) => a + o.value, 0);

  // Boards pipeline by stage (live, follows kanban moves)
  const boardsStages = ["Enquiry", "Quotation Sent", ...QUOTE_BUCKETS] as const;
  const barData = boardsStages.map((s) => ({
    label: s.replace("Awaiting ", "Aw. "),
    value: DEALS.filter((d) => d.pipeline === "boards" && stages[d.id] === s).reduce((a, d) => a + d.value, 0),
  }));
  const activeIndex = barData.reduce((best, b, i) => (b.value > barData[best].value ? i : best), 0);

  // Quotation value by bucket (§2 — headline boards view)
  const buckets = QUOTE_BUCKETS.map((b) => ({
    bucket: b,
    value: DEALS.filter((d) => d.pipeline === "boards" && stages[d.id] === b).reduce((a, d) => a + d.value, 0),
    count: DEALS.filter((d) => d.pipeline === "boards" && stages[d.id] === b).length,
  }));
  const bucketTotal = buckets.reduce((a, b) => a + b.value, 0);
  const bucketMax = Math.max(...buckets.map((b) => b.value), 1);

  // Quotations sent vs converted (§2)
  const sent = QUOTES.length;
  const sentValue = QUOTES.reduce((a, q) => a + q.value, 0);
  const converted = QUOTES.filter((q) => q.status === "won");
  const hitVolume = Math.round((converted.length / sent) * 100);
  const hitValue = Math.round((converted.reduce((a, q) => a + q.value, 0) / sentValue) * 100);

  // Boards sold (§2)
  const boardsOrders = ORDERS.filter((o) => o.product === "Smart Boards");
  const boardsUnits = boardsOrders.reduce((a, o) => a + o.units, 0);
  const boardsValue = boardsOrders.reduce((a, o) => a + o.value, 0);
  const maxSize = Math.max(...BOARD_SIZES.map((s) => boardsOrders.filter((o) => o.boardSize === s).reduce((a, o) => a + o.units, 0)), 1);

  // Sports snapshot (§8)
  const sportsCount = (stage: string) => DEALS.filter((d) => d.pipeline === "sports" && stages[d.id] === stage).length;
  const sportsWon = DEALS.filter((d) => d.pipeline === "sports" && stages[d.id] === "Won").length +
    ORDERS.filter((o) => o.product === "Sports Equipment").length;

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
              <KpiCard icon={TrendingUp} label="Pipeline value" value={money(pipelineValue)} delta={KPIS.pipelineDelta} tone="green" />
              <KpiCard icon={Radar} label="Leads this month" value={String(KPIS.leadsThisMonth)} delta={KPIS.leadsDelta} tone="terra" />
              <KpiCard icon={Columns3} label="Active deals" value={String(openDeals.length)} tone="gold" />
              <KpiCard icon={CalendarCheck} label="Demos booked" value={`${KPIS.demosBooked} / ${KPIS.demosTarget}`} tone="amber"
                segments={{ filled: KPIS.demosBooked, total: KPIS.demosTarget }} />
              <KpiCard icon={Trophy} label="Won this quarter" value={money(wonThisQuarter)} tone="success" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="min-w-0 lg:col-span-2">
                <CardTitle right={<span className="text-xs text-muted">boards · open deal value</span>}>
                  Boards pipeline by stage
                </CardTitle>
                <HighlightBarChart data={barData} activeIndex={activeIndex} format={money} />
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

            {/* Discovery-meeting views (§8) */}
            <div className="grid gap-5 lg:grid-cols-3">
              <Card>
                <CardTitle right={<span className="text-xs tabular-nums text-muted">{money(bucketTotal)} waiting</span>}>
                  Quotation value by bucket
                </CardTitle>
                <div className="space-y-2.5">
                  {buckets.map((b) => (
                    <div key={b.bucket} className="flex items-center gap-2.5">
                      <span className="w-28 shrink-0 text-[11px] text-muted">{b.bucket}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <div className={`h-full rounded-full ${BUCKET_BARS[b.bucket]}`} style={{ width: `${(b.value / bucketMax) * 100}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] font-semibold tabular-nums text-body">{money(b.value)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-snug text-faint">
                  Quoted and in play — what each school is waiting on.
                </p>
              </Card>

              <Card>
                <CardTitle>Quotes sent → converted</CardTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xl font-semibold tabular-nums text-body">{sent}</div>
                    <div className="text-[11px] text-muted">sent · {money(sentValue)}</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold tabular-nums text-success">{converted.length}</div>
                    <div className="text-[11px] text-muted">won · {money(converted.reduce((a, q) => a + q.value, 0))}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="mb-1 flex justify-between text-[10px]"><span className="text-muted">by volume</span><span className="font-semibold tabular-nums text-body">{hitVolume}%</span></div>
                    <SegmentBar filled={Math.round(hitVolume / 10)} total={10} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[10px]"><span className="text-muted">by value</span><span className="font-semibold tabular-nums text-body">{hitValue}%</span></div>
                    <SegmentBar filled={Math.round(hitValue / 10)} total={10} />
                  </div>
                </div>
              </Card>

              <Card>
                <CardTitle right={<span className="text-xs text-muted">cumulative</span>}>Boards sold</CardTitle>
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums text-body">{boardsUnits}</span>
                  <span className="text-[11px] text-muted">units · {money(boardsValue)}</span>
                </div>
                <div className="space-y-2">
                  {BOARD_SIZES.map((size) => {
                    const units = boardsOrders.filter((o) => o.boardSize === size).reduce((a, o) => a + o.units, 0);
                    return (
                      <div key={size} className="flex items-center gap-2.5">
                        <span className="w-7 text-[11px] font-semibold tabular-nums text-body">{size}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                          <div className="h-full rounded-full bg-green" style={{ width: `${(units / maxSize) * 100}%` }} />
                        </div>
                        <span className="w-6 text-right text-[11px] tabular-nums text-muted">{units}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-green-soft px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted">Sports pipeline</span>
                  <span className="font-medium tabular-nums text-green">
                    {sportsCount("Enquiry")} enq · {sportsCount("Interested")} int · {sportsCount("Not Now")} later · {sportsWon} won
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
    </PageState>
  );
}
