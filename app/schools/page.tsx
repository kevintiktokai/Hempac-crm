/**
 * Schools directory wireframe (handoff §4.4): workspace table with filters,
 * fit-sorted by default.
 */
import { Search, Download, ChevronDown } from "lucide-react";
import { Card, Chip, FitBar, Note, PriorityBars } from "@/components/wireframe/ui";
import { SCHOOLS } from "@/lib/sampleData";
import Link from "next/link";

const FILTERS = ["Type: All", "Region: All", "Product: All", "Engine stage: All"];

export default function SchoolsPage() {
  const rows = [...SCHOOLS].sort((a, b) => b.fit - a.fit);
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-wf-ink">Schools</h1>
          <p className="text-sm text-wf-mid">342 identified across Zimbabwe · showing 12 tracked</p>
        </div>
        <Note>Workspace table</Note>
      </div>

      <Card className="!p-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-wf-line px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-wf-line px-2.5 py-1.5">
            <Search size={13} className="text-wf-faint" />
            <span className="text-xs text-wf-faint">Search schools…</span>
            <kbd className="rounded border border-wf-line px-1 text-[9px] text-wf-faint">⌘K</kbd>
          </div>
          {FILTERS.map((f) => (
            <button key={f} className="flex items-center gap-1 rounded-lg border border-wf-line px-2.5 py-1.5 text-xs text-wf-mid">
              {f} <ChevronDown size={12} />
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-wf-line px-2.5 py-1.5 text-xs text-wf-mid">
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 border-b border-wf-line px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-wf-faint">
          <div className="col-span-3">School</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Type · Region</div>
          <div className="col-span-1">Enrolment</div>
          <div className="col-span-2">Product</div>
          <div className="col-span-1">Engine</div>
          <div className="col-span-2 text-right">Fit ↓</div>
        </div>
        {rows.map((s) => (
          <Link key={s.id} href={`/schools/${s.id}`}
            className="grid grid-cols-12 items-center border-b border-wf-line px-5 py-3 last:border-b-0 hover:bg-wf-fill/50">
            <div className="col-span-3">
              <div className="text-sm font-medium text-wf-ink">{s.name}</div>
              <div className="text-xs text-wf-mid">{s.following ? "Following" : "Not following"}</div>
            </div>
            <div className="col-span-1">
              <PriorityBars level={s.fit >= 90 ? 3 : s.fit >= 75 ? 2 : 1} />
            </div>
            <div className="col-span-2 text-xs text-wf-mid">{s.type} · {s.region}</div>
            <div className="col-span-1 text-sm tabular-nums text-wf-mid">{s.enrol.toLocaleString()}</div>
            <div className="col-span-2"><Chip>{s.product}</Chip></div>
            <div className="col-span-1"><Chip dot>{s.eng}</Chip></div>
            <div className="col-span-2 flex justify-end"><FitBar v={s.fit} /></div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
