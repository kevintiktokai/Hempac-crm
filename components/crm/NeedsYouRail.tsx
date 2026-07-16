"use client";

/**
 * "Needs you" right rail (§1.4-5): Suggestions (Gate 2) above Tasks.
 * Completed suggestions collapse into the activity feed below.
 */
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRightCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { CURRENT_USER, schoolById } from "@/lib/sampleData";
import { SuggestionCard } from "./SuggestionCard";
import { usePrototype } from "./store";
import { cn } from "@/lib/utils";

type TaskView = "all" | "mine" | "pending";

export function NeedsYouRail() {
  const { suggestions, tasks, activity, toggleTask } = usePrototype();
  const [taskView, setTaskView] = useState<TaskView>("all");
  const pending = suggestions.filter((s) => s.status === "pending").slice(0, 3);
  const pendingTotal = suggestions.filter((s) => s.status === "pending").length;
  const visibleTasks = tasks.filter((t) => {
    if (taskView === "mine") return t.assignedTo === CURRENT_USER.id;
    if (taskView === "pending") return t.assignedTo === CURRENT_USER.id && !t.done;
    return true;
  });

  return (
    <Card className="h-fit">
      <CardTitle right={pendingTotal > 0 && (
        <span className="rounded-full bg-terra/10 px-2 py-0.5 text-[11px] font-semibold text-terra">
          {pendingTotal} waiting
        </span>
      )}>
        Needs you
      </CardTitle>

      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-faint">Suggestions</div>
      {pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((s) => <SuggestionCard key={s.id} s={s} showSchool compact />)}
        </div>
      ) : (
        <p className="rounded-lg bg-green-soft px-3 py-2.5 text-xs text-green">
          All caught up — nothing waiting for you. ✨
        </p>
      )}
      {pendingTotal > 3 && (
        <Link href="/review"
          className="mt-2.5 block rounded-lg border border-line py-1.5 text-center text-xs font-medium text-muted transition-colors hover:border-faint hover:text-body">
          See all {pendingTotal} in Review Queue
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
        {visibleTasks.map((task) => {
          const school = task.schoolId ? schoolById(task.schoolId) : undefined;
          return (
            <li key={task.id} className="flex items-start gap-2.5">
              <button
                onClick={() => toggleTask(task.id)}
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
                {school && <div className="text-[10px] text-faint">{school.name}</div>}
              </div>
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                task.due === "Today" ? "bg-terra/10 text-terra" : task.done ? "bg-line text-faint" : "bg-faint/15 text-muted"
              )}>
                {task.due}
              </span>
            </li>
          );
        })}
      </ul>

      {activity.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-widest text-faint">Activity</div>
          <ul className="space-y-1.5">
            {activity.slice(0, 5).map((a) => (
              <li key={a.id} className="flex animate-slide-fade-in items-start gap-2 text-[11px] leading-snug text-muted">
                {a.kind === "accepted" ? <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-success" />
                  : a.kind === "dismissed" ? <XCircle size={12} className="mt-0.5 shrink-0 text-faint" />
                  : <ArrowRightCircle size={12} className="mt-0.5 shrink-0 text-terra" />}
                {a.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
