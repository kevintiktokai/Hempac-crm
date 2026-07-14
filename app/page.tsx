"use client";

/**
 * Dashboard (§4.1): greeting, KPI row, highlighted bar chart + funnel
 * radial, upcoming demos, Needs-you rail. Reads in <5s: money, movement,
 * what-needs-me (§7.2).
 */
import { TrendingUp, Radar, Columns3, CalendarCheck, Trophy, LayoutGrid, Sun } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KpiCard, Avatar } from "@/components/crm/bits";
import { HighlightBarChart, FunnelRadial } from "@/components/crm/charts";
import { NeedsYouRail } from "@/components/crm/NeedsYouRail";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { DEMOS, KPIS, money, CURRENT_USER } from "@/lib/sampleData";

const PIPELINE_BY_STAGE = [
  { label: "New Enquiry", value: 12800 },
  { label: "Demo Booked", value: 34600 },
  { label: "Quote Sent", value: 36900 },
  { label: "Procurement", value: 22500 },
];

export default function DashboardPage() {
  return (
    <PageState
      skeleton="dashboard"
      empty={
        <EmptyState
          icon={<Sun size={22} />}
          headline="Welcome to your sales engine"
          body="Once the Lead Engine finds your first schools and conversations start flowing, this page shows your money, movement, and what needs you."
          action="Set up the Lead Engine"
        />
      }
    >
      <div className="dashboard-tint p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-ink">
              Good morning, {CURRENT_USER.name} 👋
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
              <KpiCard icon={TrendingUp} label="Pipeline value" value={money(KPIS.pipelineValue)} delta={KPIS.pipelineDelta} tone="green" />
              <KpiCard icon={Radar} label="Leads this month" value={String(KPIS.leadsThisMonth)} delta={KPIS.leadsDelta} tone="terra" />
              <KpiCard icon={Columns3} label="Active deals" value={String(KPIS.activeDeals)} tone="gold" />
              <KpiCard icon={CalendarCheck} label="Demos booked" value={`${KPIS.demosBooked} / ${KPIS.demosTarget}`} tone="amber"
                segments={{ filled: KPIS.demosBooked, total: KPIS.demosTarget }} />
              <KpiCard icon={Trophy} label="Won this quarter" value={money(KPIS.wonThisQuarter)} tone="success" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="min-w-0 lg:col-span-2">
                <CardTitle right={<span className="text-xs text-muted">open deal value</span>}>
                  Pipeline by stage
                </CardTitle>
                <HighlightBarChart data={PIPELINE_BY_STAGE} activeIndex={2} format={money} />
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
