"use client";

/**
 * "Needs you" right rail (§1.4-5): Suggestions (Gate 2) above Tasks, with
 * the §4 task views (All / Mine / Pending) and the live team-activity feed
 * from the audit trail.
 */
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRightCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENT_USER } from "@/lib/sampleData";
import { SuggestionCard } from "./SuggestionCard";
import { useActivity, useCrmActions, usePendingSuggestions, useTasks } from "./data";
import { cn } from "@/lib/utils";

type TaskView = "all" | "mine" | "pending";

export function NeedsYouRail() {
  const suggestions = usePendingSuggestions();
  const tasks = useTasks();
  const activity = useActivity();
  const { toggleTask } = useCrmActions();
  const [taskView, setTaskView] = useState<TaskView>("all");

  if (suggestions === undefined || tasks === undefined) {
    return (
      <Card className="h-fit">
        <Skeleton className="h-5 w-24" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </Card>
    );
  }

  const pending = suggestions.slice(0, 3);
  const visibleTasks = tasks.filter((t) => {
    if (taskView === "mine") return t.assigneeInitials === CURRENT_USER.initials;
    if (taskView === "pending") return t.assigneeInitials === CURRENT_USER.initials && !t.done;
    return true;
  });

  return (
    <Card className="h-fit">
      <CardTitle right={suggestions.length > 0 && (
        <span className="rounded-full bg-terra/10 px-2 py-0.5 text-[11px] font-semibold text-terra">
          {suggestions.length} waiting
        </span>
      )}>
        Needs you
      </CardTitle>

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-faint">Suggestions</div>
      {pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((s) => <SuggestionCard key={s._id} s={s} showSchool compact />)}
        </div>
      ) : (
        <p className="rounded-lg bg-green-soft px-3 py-2.5 text-xs text-green">
          All caught up — nothing waiting for you. ✨
        </p>
      )}
      {suggestions.length > 3 && (
        <Link href="/review"
          className="mt-2.5 block rounded-lg border border-line py-1.5 text-center text-xs font-medium text-muted transition-colors hover:border-faint hover:text-body">
          See all {suggestions.length} in Review Queue
        </Link>
      )}

      <div className="mb-2 mt-6 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-faint">Tasks</span>
        <div className="flex gap-0.5">
          {(["all", "mine", "pending"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTaskView(v)}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors duration-150",
                taskView === v ? "bg-ink text-white" : "text-faint hover:text-muted"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-2.5">
        {visibleTasks.map((task) => (
          <li key={task._id} className="flex items-start gap-2.5">
            <button
              onClick={() => toggleTask(task._id)}
              aria-label={task.done ? `Reopen: ${task.title}` : `Complete: ${task.title}`}
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150",
                task.done ? "border-green bg-green text-white" : "border-faint bg-card hover:border-green"
              )}
            >
              {task.done && <CheckCircle2 size={11} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className={cn("text-xs leading-snug", task.done ? "text-faint line-through" : "text-body")}>
                {task.title}
              </div>
              <div className="text-[10px] text-faint">
                {task.schoolName ?? "General"} · {task.assigneeInitials}
                {task.remindLabel ? ` · ⏰ ${task.remindLabel}` : ""}
              </div>
            </div>
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
              task.dueLabel === "Today" ? "bg-terra/10 text-terra" : task.done ? "bg-line text-faint" : "bg-faint/15 text-muted"
            )}>
              {task.dueLabel}
            </span>
          </li>
        ))}
      </ul>

      {activity && activity.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-widest text-faint">Activity</div>
          <ul className="space-y-1.5">
            {activity.slice(0, 5).map((a) => (
              <li key={a._id} className="flex animate-slide-fade-in items-start gap-2 text-[11px] leading-snug text-muted">
                {a.kind === "accepted" ? <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-success" />
                  : a.kind === "dismissed" ? <XCircle size={12} className="mt-0.5 shrink-0 text-faint" />
                  : <ArrowRightCircle size={12} className="mt-0.5 shrink-0 text-terra" />}
                <span className="flex-1">{a.text}</span>
                <span className="shrink-0 text-[10px] text-faint">{a.actorInitials}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
