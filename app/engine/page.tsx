"use client";

/**
 * Lead Engine (§4.2), live school rows + engine settings from Convex. The
 * funnel counts stay illustrative until the engine itself lands (Sprint 4).
 */
import Link from "next/link";
import { Radar, Sparkles, MapPin, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Switch } from "@/components/ui/switch";
import { FitBar, engineTone } from "@/components/crm/bits";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useEngineSettings, useSchools } from "@/components/crm/data";
import { FUNNEL } from "@/lib/sampleData";

const FUNNEL_DOTS = ["bg-faint", "bg-gold", "bg-amber", "bg-terra", "bg-green"];

export default function EnginePage() {
  const schools = useSchools();
  const engine = useEngineSettings();

  if (schools === undefined || engine === undefined) return <LoadingSkeleton variant="table" />;

  const rows = schools.filter((s) => s.engineStage !== "In pipeline");

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<Radar size={22} />}
          headline="The engine hasn't started yet"
          body="Choose your segments, regions and daily cap, switch it on, and it will start discovering and scoring schools for you."
          action="Configure the engine"
        />
      }
    >
      <div className="space-y-5 p-6">
        <div className="overflow-hidden rounded-hero border border-line bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-ink px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/25">
                <Radar size={18} className="text-[#8FD69A]" />
              </span>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  Lead Engine
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/25 px-2 py-0.5 text-[10px] font-semibold text-[#9BE0A6]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7FE08C]" /> {engine?.active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="text-[11px] text-white/55">
                  Finding and scoring schools · outreach is drafted for you to send
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#CFE0D4]">
                {(engine?.segments ?? []).join(" · ")}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#CFE0D4]">
                {(engine?.regions ?? []).slice(0, 1).join("")} +{Math.max((engine?.regions.length ?? 1) - 1, 0)} regions
              </span>
              <span className="rounded-full bg-terra/25 px-2.5 py-1 text-[11px] font-medium text-[#E7B79E]">
                Cap: {engine?.throughputCap ?? 10} / day
              </span>
              <button className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-white/25">
                <SlidersHorizontal size={13} /> Settings
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-line sm:grid-cols-5">
            {FUNNEL.map((f, i) => (
              <div key={f.stage} className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${FUNNEL_DOTS[i]}`} />
                  <span className="text-xs text-muted">{f.stage}</span>
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-body">{f.count}</div>
                {i < FUNNEL.length - 1 && (
                  <div className="mt-1 text-[11px] tabular-nums text-faint">
                    {Math.round((FUNNEL[i + 1].count / f.count) * 100)}% →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
          <Card className="min-w-0 !p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-sm font-semibold text-body">Discovered &amp; scored schools</h3>
              <span className="text-xs text-muted">ranked by fit</span>
            </div>
            <div className="hidden grid-cols-12 border-b border-line px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-faint md:grid">
              <div className="col-span-4">School</div>
              <div className="col-span-2">Fit</div>
              <div className="col-span-4">Why this school</div>
              <div className="col-span-2">Outreach</div>
            </div>
            {rows.map((s) => (
              <Link
                key={s._id}
                href={`/schools/${s._id}`}
                className="grid grid-cols-2 items-center gap-y-2 border-b border-line px-5 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-green-soft/40 md:grid-cols-12"
              >
                <div className="col-span-2 pr-2 md:col-span-4">
                  <div className="text-sm font-medium text-body">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin size={11} /> {s.region} · {s.type}
                  </div>
                </div>
                <div className="md:col-span-2"><FitBar v={s.fitScore} /></div>
                <div className="hidden pr-3 text-xs leading-snug text-muted md:col-span-4 md:block">
                  <Sparkles size={11} className="mr-1 inline text-gold" />
                  {s.signal}
                </div>
                <div className="justify-self-end md:col-span-2 md:justify-self-start">
                  <Chip tone={engineTone(s.engineStage)}>
                    <MessageCircle size={11} /> {s.engineStage}
                  </Chip>
                </div>
              </Link>
            ))}
          </Card>

          <Card className="h-fit">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-body">Engine settings</h3>
              <Switch defaultChecked={engine?.active ?? true} aria-label="Engine on/off" />
            </div>
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Segments</div>
              <div className="flex flex-wrap gap-1.5">
                {(engine?.segments ?? []).map((v) => <Chip key={v} tone="green">{v}</Chip>)}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Regions</div>
              <div className="flex flex-wrap gap-1.5">
                {(engine?.regions ?? []).map((v) => <Chip key={v} tone="green">{v}</Chip>)}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Product focus</div>
              <Chip tone="terra">{engine?.productFocus ?? "Smart Boards"}</Chip>
              <p className="mt-1.5 text-[11px] text-faint">Cross-sell: sports equipment, same buyer.</p>
            </div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">Throughput cap</div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-line">
                <div className="h-full w-1/2 rounded-full bg-terra" />
              </div>
              <span className="text-xs font-semibold tabular-nums text-body">{engine?.throughputCap ?? 10} / day</span>
            </div>
            <p className="mt-4 rounded-lg bg-green-soft px-3 py-2.5 text-[11px] leading-snug text-green">
              Outreach is drafted by the engine and sent by you on WhatsApp. The system never sends messages itself.
            </p>
          </Card>
        </div>
      </div>
    </PageState>
  );
}
