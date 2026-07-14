/**
 * Dashboard wireframe (handoff §4.1): greeting, KPI row, highlighted bar
 * chart + funnel radial, upcoming demos, Needs-you rail.
 */
import { ArrowUpRight, TrendingUp, Radar, Columns3, CalendarCheck, Trophy } from "lucide-react";
import { Card, CardTitle, Note, SegmentBar, Sparkline, BarChartWf, DonutWf, GhostBtn, Avatar } from "@/components/wireframe/ui";
import { NeedsYouRail } from "@/components/wireframe/NeedsYouRail";
import { DEMOS, FUNNEL, KPIS, money, CURRENT_USER } from "@/lib/sampleData";

const KPI_CARDS = [
  { icon: TrendingUp, label: "Pipeline value", value: money(KPIS.pipelineValue), delta: KPIS.pipelineDelta, viz: "spark" as const },
  { icon: Radar, label: "Leads this month", value: String(KPIS.leadsThisMonth), delta: KPIS.leadsDelta, viz: "spark" as const },
  { icon: Columns3, label: "Active deals", value: String(KPIS.activeDeals), delta: null, viz: "spark" as const },
  { icon: CalendarCheck, label: "Demos booked", value: `${KPIS.demosBooked} / ${KPIS.demosTarget}`, delta: null, viz: "segments" as const },
  { icon: Trophy, label: "Won this quarter", value: money(KPIS.wonThisQuarter), delta: null, viz: "spark" as const },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Greeting header (§1.4-9) */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-wf-ink">Good morning, {CURRENT_USER.name} 👋</h1>
          <p className="mt-0.5 text-sm text-wf-mid">Here&rsquo;s where your schools stand today.</p>
        </div>
        <GhostBtn>Manage widgets</GhostBtn>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* KPI row (§1.4-1) */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {KPI_CARDS.map(({ icon: Icon, label, value, delta, viz }) => (
              <div key={label} className="rounded-card border border-wf-line bg-wf-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-wf-fill text-wf-mid">
                    <Icon size={15} />
                  </span>
                  {delta && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-wf-mid">
                      <ArrowUpRight size={12} /> {delta}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-2xl font-semibold tabular-nums text-wf-ink">{value}</div>
                <div className="mb-2 text-xs text-wf-mid">{label}</div>
                {viz === "segments" ? <SegmentBar filled={KPIS.demosBooked} total={KPIS.demosTarget} /> : <Sparkline />}
              </div>
            ))}
          </div>

          {/* Chart row */}
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle right={<Note>Highlighted bar chart</Note>}>Pipeline by stage</CardTitle>
              <BarChartWf bars={[12800, 34600, 36900, 22500]} activeIndex={2} activeLabel="$36.9k" />
              <div className="mt-2 flex justify-around text-[11px] text-wf-mid">
                {["New Enquiry", "Demo Booked", "Quote Sent", "Procurement"].map((s) => <span key={s}>{s}</span>)}
              </div>
            </Card>
            <Card>
              <CardTitle right={<Note>Funnel radial</Note>}>Engine funnel</CardTitle>
              <DonutWf centerBig="4.1%" centerSmall="discovered → pipeline" />
              <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                {FUNNEL.map((f) => (
                  <div key={f.stage}>
                    <div className="text-xs font-semibold tabular-nums text-wf-ink">{f.count}</div>
                    <div className="text-[9px] leading-tight text-wf-faint">{f.stage}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Upcoming demos (§1.4-10) */}
          <Card>
            <CardTitle right={<span className="text-xs text-wf-mid">See all</span>}>Upcoming demos</CardTitle>
            <ul className="divide-y divide-wf-line">
              {DEMOS.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {d.attendees.map((a) => <Avatar key={a} initials={a} />)}
                    </div>
                    <span className="text-sm text-wf-ink">{d.title}</span>
                  </div>
                  <span className="rounded-full bg-wf-fill px-2.5 py-1 text-[11px] font-medium text-wf-mid">
                    {d.date} · {d.time}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right rail */}
        <NeedsYouRail />
      </div>
    </div>
  );
}
