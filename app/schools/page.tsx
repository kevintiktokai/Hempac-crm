"use client";

/**
 * Schools directory (§4.4), live from Convex: workspace table with search,
 * type filter, export, priority gauges, chips, fit-sorted by default.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Download, ChevronDown, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { AddLeadDialog } from "@/components/crm/AddLeadDialog";
import { FitBar, PriorityBars, productTone, engineTone } from "@/components/crm/bits";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useSchools } from "@/components/crm/data";
import type { SchoolType } from "@/lib/sampleData";

const TYPE_OPTIONS: ("All" | SchoolType)[] = ["All", "Group", "Private", "Trust", "Mission", "Government"];

export default function SchoolsPage() {
  const schools = useSchools();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("All");

  const rows = useMemo(
    () =>
      (schools ?? [])
        .filter((s) => type === "All" || s.type === type)
        .filter(
          (s) =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.region.toLowerCase().includes(query.toLowerCase())
        ),
    [schools, query, type]
  );

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<GraduationCap size={22} />}
          headline="No schools yet"
          body="Switch the Lead Engine on and it will build your schools database — discovered, scored and ranked by fit."
          action="Start discovering schools"
        />
      }
    >
      {schools === undefined ? (
        <LoadingSkeleton variant="table" />
      ) : (
        <div className="p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ink">Leads</h1>
              <p className="mt-0.5 text-sm text-muted">342 identified across Zimbabwe · {schools.length} in the system</p>
            </div>
            <AddLeadDialog />
          </div>

          <Card className="!p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 transition-colors focus-within:border-green">
                <Search size={13} className="text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search schools…"
                  className="w-36 bg-transparent text-xs text-body outline-none placeholder:text-faint"
                  aria-label="Search schools"
                />
                <kbd className="rounded border border-line px-1 text-[9px] text-faint">⌘K</kbd>
              </div>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as (typeof TYPE_OPTIONS)[number])}
                  aria-label="Filter by type"
                  className="appearance-none rounded-lg border border-line bg-card py-1.5 pl-2.5 pr-7 text-xs text-muted outline-none transition-colors hover:border-faint"
                >
                  {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint" />
              </div>
              {["Region: All", "Product: All", "Engine: All"].map((f) => (
                <button key={f} className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-faint">
                  {f} <ChevronDown size={12} />
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs tabular-nums text-faint">{rows.length} shown</span>
                <Button variant="ghost"><Download size={12} /> Export</Button>
              </div>
            </div>

            <div className="hidden grid-cols-12 border-b border-line px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint lg:grid">
              <div className="col-span-3">School</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Type · Region</div>
              <div className="col-span-1 text-right">Enrolment</div>
              <div className="col-span-2 pl-6">Product</div>
              <div className="col-span-1">Engine</div>
              <div className="col-span-2 text-right">Fit ↓</div>
            </div>
            {rows.map((s) => (
              <Link
                key={s._id}
                href={`/schools/${s._id}`}
                className="grid grid-cols-2 items-center gap-y-2 border-b border-line px-5 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-green-soft/40 lg:grid-cols-12"
              >
                <div className="col-span-2 lg:col-span-3">
                  <div className="text-sm font-medium text-body">{s.name}</div>
                  <div className="text-xs text-muted">
                    {s.following ? (
                      <span className="text-green">● Following</span>
                    ) : (
                      <span className="text-faint">○ Not following</span>
                    )}
                  </div>
                </div>
                <div className="hidden lg:col-span-1 lg:block">
                  <PriorityBars level={s.fitScore >= 90 ? 3 : s.fitScore >= 75 ? 2 : 1} />
                </div>
                <div className="hidden text-xs text-muted lg:col-span-2 lg:block">{s.type} · {s.region}</div>
                <div className="hidden text-right text-sm tabular-nums text-muted lg:col-span-1 lg:block">{s.enrolment.toLocaleString()}</div>
                <div className="lg:col-span-2 lg:pl-6"><Chip tone={productTone(s.product)}>{s.product}</Chip></div>
                <div className="hidden lg:col-span-1 lg:block"><Chip tone={engineTone(s.engineStage)} dot>{s.engineStage}</Chip></div>
                <div className="flex justify-end lg:col-span-2">
                  <FitBar v={s.fitScore} />
                </div>
              </Link>
            ))}
            {rows.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted">
                No schools match “{query}”. Try a different name or region.
              </p>
            )}
          </Card>
        </div>
      )}
    </PageState>
  );
}
