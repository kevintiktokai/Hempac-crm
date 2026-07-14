/**
 * Review Queue wireframe (handoff §4.6): all pending suggestions grouped by
 * school, bulk accept/dismiss, filter by type.
 */
import { ChevronDown, Inbox } from "lucide-react";
import { Card, GhostBtn, Note, SolidBtn } from "@/components/wireframe/ui";
import { SuggestionCard } from "@/components/wireframe/SuggestionCard";
import { SUGGESTIONS, schoolById } from "@/lib/sampleData";

export default function ReviewQueuePage() {
  const pending = SUGGESTIONS.filter((s) => s.status === "pending");
  const bySchool = new Map<number, typeof pending>();
  for (const s of pending) {
    const list = bySchool.get(s.schoolId) ?? [];
    list.push(s);
    bySchool.set(s.schoolId, list);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-wf-ink">Review Queue</h1>
          <p className="text-sm text-wf-mid">{pending.length} suggestions waiting · nothing changes until you accept it</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-lg border border-wf-line px-2.5 py-1.5 text-xs text-wf-mid">
            Type: All <ChevronDown size={12} />
          </button>
          <GhostBtn>Dismiss all</GhostBtn>
          <SolidBtn>Accept all</SolidBtn>
        </div>
      </div>

      <div className="space-y-5">
        {Array.from(bySchool.entries()).map(([schoolId, items]) => {
          const school = schoolById(schoolId);
          if (!school) return null;
          return (
            <Card key={schoolId} className="!p-0">
              <div className="flex items-center justify-between border-b border-wf-line px-5 py-3">
                <div>
                  <span className="text-sm font-semibold text-wf-ink">{school.name}</span>
                  <span className="ml-2 text-xs text-wf-mid">{items.length} pending</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button className="text-wf-mid underline">Accept group</button>
                  <button className="text-wf-faint underline">Dismiss group</button>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2">
                {items.map((s) => <SuggestionCard key={s.id} s={s} />)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty state, shown as a spec note in lo-fi */}
      <div className="mt-6 rounded-card border border-dashed border-wf-faint p-6 text-center">
        <Inbox size={20} className="mx-auto text-wf-faint" />
        <div className="mt-2 text-sm font-medium text-wf-mid">Empty state: “All caught up — the assistant has nothing waiting for you.” 🎉</div>
        <Note>Shown when queue is empty</Note>
      </div>
    </div>
  );
}
