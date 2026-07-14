/**
 * Lead Engine wireframe (handoff §4.2): dark header band, funnel strip,
 * ranked discovered/scored table, engine-settings panel.
 */
import { Radar, Sparkles, MapPin, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Card, Chip, FitBar, Note } from "@/components/wireframe/ui";
import { FUNNEL, SCHOOLS } from "@/lib/sampleData";
import Link from "next/link";

export default function EnginePage() {
  const rows = SCHOOLS.filter((s) => s.eng !== "In pipeline");
  return (
    <div className="space-y-5 p-6">
      {/* Engine identity band */}
      <div className="overflow-hidden rounded-hero border border-wf-line bg-wf-card">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-wf-dark px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Radar size={18} className="text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                Lead Engine
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Active
                </span>
              </div>
              <div className="text-[11px] text-white/60">Finding and scoring schools; outreach is drafted for you to send.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">Private · Trust · Mission</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">Harare +3 regions</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">Cap: 10 / day</span>
            <button className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-medium text-white">
              <SlidersHorizontal size={13} /> Settings
            </button>
          </div>
        </div>
        {/* Funnel strip */}
        <div className="grid grid-cols-5 divide-x divide-wf-line">
          {FUNNEL.map((f, i) => (
            <div key={f.stage} className="px-4 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-wf-mid" />
                <span className="text-xs text-wf-mid">{f.stage}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-wf-ink">{f.count}</div>
              {i < FUNNEL.length - 1 && (
                <div className="mt-1 text-[11px] text-wf-faint">
                  {Math.round((FUNNEL[i + 1].count / f.count) * 100)}% →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Ranked table */}
        <Card className="!p-0">
          <div className="flex items-center justify-between border-b border-wf-line px-5 py-3.5">
            <h3 className="text-sm font-semibold text-wf-ink">Discovered &amp; scored schools</h3>
            <span className="text-xs text-wf-mid">ranked by fit</span>
          </div>
          <div className="grid grid-cols-12 border-b border-wf-line px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-wf-faint">
            <div className="col-span-4">School</div>
            <div className="col-span-2">Fit</div>
            <div className="col-span-4">Why this school</div>
            <div className="col-span-2">Outreach</div>
          </div>
          {rows.map((s) => (
            <Link key={s.id} href={`/schools/${s.id}`}
              className="grid grid-cols-12 items-center border-b border-wf-line px-5 py-3 last:border-b-0 hover:bg-wf-fill/50">
              <div className="col-span-4 pr-2">
                <div className="text-sm font-medium text-wf-ink">{s.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-wf-mid">
                  <MapPin size={11} /> {s.region} · {s.type}
                </div>
              </div>
              <div className="col-span-2"><FitBar v={s.fit} /></div>
              <div className="col-span-4 pr-3 text-xs leading-snug text-wf-mid">
                <Sparkles size={11} className="mr-1 inline text-wf-faint" />
                {s.signal}
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-wf-fill px-2 py-1 text-xs font-medium text-wf-mid">
                  <MessageCircle size={12} /> {s.eng}
                </span>
              </div>
            </Link>
          ))}
        </Card>

        {/* Engine settings panel */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-wf-ink">Engine settings</h3>
            <Note>Side panel</Note>
          </div>
          {[
            ["Segments", "Private · Trust · Mission"],
            ["Regions", "Harare · Bulawayo · Mutare · Gweru"],
            ["Product focus", "Smart Boards (cross-sell: Sports Equipment)"],
          ].map(([label, value]) => (
            <div key={label} className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-wf-faint">{label}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {value.split(" · ").map((v) => <Chip key={v}>{v}</Chip>)}
              </div>
            </div>
          ))}
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-wf-faint">Throughput cap</div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-wf-fill2">
              <div className="h-full w-1/2 rounded-full bg-wf-dark" />
            </div>
            <span className="text-xs font-semibold tabular-nums text-wf-ink">10 / day</span>
          </div>
          <p className="mt-3 rounded-lg bg-wf-fill px-2.5 py-2 text-[11px] leading-snug text-wf-mid">
            Outreach is drafted by the engine and sent by you on WhatsApp. The system never sends messages itself.
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-wf-line px-3 py-2">
            <span className="text-xs font-medium text-wf-ink">Engine</span>
            <span className="flex h-5 w-9 items-center rounded-full bg-wf-dark p-0.5">
              <span className="ml-auto h-4 w-4 rounded-full bg-white" />
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
