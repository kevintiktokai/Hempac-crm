"use client";

/**
 * Review Queue (§4.6): every pending suggestion, grouped by school, bulk
 * accept/dismiss, filter by type. Empty state celebrates inbox-zero.
 */
import { useMemo, useState } from "react";
import { ChevronDown, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestionCard } from "@/components/crm/SuggestionCard";
import { PageState, EmptyState } from "@/components/crm/PageState";
import { usePrototype } from "@/components/crm/store";
import { schoolById, type SuggestionType } from "@/lib/sampleData";

const TYPE_FILTERS: ("All" | SuggestionType)[] = ["All", "Stage change", "Task done", "New task"];

function InboxZero() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-soft text-green">
        <Inbox size={22} />
      </div>
      <h2 className="mt-4 font-serif text-2xl text-ink">All caught up 🎉</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The assistant has nothing waiting for you. New suggestions appear here as followed conversations move.
      </p>
    </div>
  );
}

export default function ReviewQueuePage() {
  const { suggestions, acceptSuggestion, dismissSuggestion } = usePrototype();
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("All");

  const pending = useMemo(
    () => suggestions.filter((s) => s.status === "pending" && (typeFilter === "All" || s.type === typeFilter)),
    [suggestions, typeFilter]
  );

  const bySchool = useMemo(() => {
    const map = new Map<number, typeof pending>();
    for (const s of pending) {
      const list = map.get(s.schoolId) ?? [];
      list.push(s);
      map.set(s.schoolId, list);
    }
    return map;
  }, [pending]);

  const allPendingCount = suggestions.filter((s) => s.status === "pending").length;

  return (
    <PageState skeleton="table" empty={<InboxZero />}>
      {allPendingCount === 0 ? (
        <InboxZero />
      ) : (
        <div className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ink">Review Queue</h1>
              <p className="mt-0.5 text-sm text-muted">
                {allPendingCount} suggestion{allPendingCount === 1 ? "" : "s"} waiting · nothing changes until you accept it
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as (typeof TYPE_FILTERS)[number])}
                  aria-label="Filter by suggestion type"
                  className="appearance-none rounded-lg border border-line bg-card py-1.5 pl-2.5 pr-7 text-xs text-muted outline-none transition-colors hover:border-faint"
                >
                  {TYPE_FILTERS.map((t) => <option key={t}>{t === "All" ? "Type: All" : t}</option>)}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint" />
              </div>
              <Button variant="ghost" onClick={() => pending.forEach((s) => dismissSuggestion(s.id))}>
                Dismiss all
              </Button>
              <Button variant="success" onClick={() => pending.forEach((s) => acceptSuggestion(s.id))}>
                Accept all
              </Button>
            </div>
          </div>

          {pending.length === 0 ? (
            <p className="rounded-card border border-line bg-card px-5 py-8 text-center text-sm text-muted shadow-card">
              No “{typeFilter}” suggestions pending.
            </p>
          ) : (
            <div className="space-y-5">
              {Array.from(bySchool.entries()).map(([schoolId, items]) => {
                const school = schoolById(schoolId);
                if (!school) return null;
                return (
                  <Card key={schoolId} className="!p-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
                      <div>
                        <span className="text-sm font-semibold text-body">{school.name}</span>
                        <span className="ml-2 text-xs text-muted">{items.length} pending</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="subtle" size="sm" onClick={() => items.forEach((s) => acceptSuggestion(s.id))}>
                          Accept group
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => items.forEach((s) => dismissSuggestion(s.id))}>
                          Dismiss group
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 p-5 md:grid-cols-2">
                      {items.map((s) => <SuggestionCard key={s.id} s={s} />)}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageState>
  );
}
