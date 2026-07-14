/**
 * Right rail "Needs you" panel (handoff §1.4-5): Suggestions (Gate 2) + Tasks.
 */
import { SUGGESTIONS, TASKS, schoolById } from "@/lib/sampleData";
import { SuggestionCard } from "./SuggestionCard";
import { Card, CardTitle, Note } from "./ui";

export function NeedsYouRail() {
  const pending = SUGGESTIONS.filter((s) => s.status === "pending").slice(0, 3);
  return (
    <Card>
      <CardTitle right={<Note>Needs-you rail</Note>}>Needs you</CardTitle>

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-wf-faint">
        Suggestions · {SUGGESTIONS.length} pending
      </div>
      <div className="space-y-2.5">
        {pending.map((s) => (
          <SuggestionCard key={s.id} s={s} showSchool />
        ))}
      </div>
      <button className="mt-2 w-full rounded-lg border border-wf-line py-1.5 text-xs font-medium text-wf-mid">
        See all in Review Queue
      </button>

      <div className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-widest text-wf-faint">Tasks</div>
      <ul className="space-y-2">
        {TASKS.map((task) => {
          const school = task.schoolId ? schoolById(task.schoolId) : undefined;
          return (
            <li key={task.id} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${
                  task.done ? "border-wf-mid bg-wf-mid" : "border-wf-faint bg-wf-card"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className={`text-xs ${task.done ? "text-wf-faint line-through" : "text-wf-ink"}`}>
                  {task.title}
                </div>
                {school && <div className="text-[10px] text-wf-faint">{school.name}</div>}
              </div>
              <span className="shrink-0 rounded-full bg-wf-fill px-2 py-0.5 text-[10px] font-medium text-wf-mid">
                {task.due}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
