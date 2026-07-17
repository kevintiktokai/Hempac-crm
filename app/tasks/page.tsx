"use client";

/**
 * Tasks section (client decision, Jul 2026): the team's task log — filter
 * all/mine/pending/done, log tasks with future reminders, or log completed
 * activities ("made the call", "went to the conference"). Everything feeds
 * Reports and the audit trail.
 */
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ListTodo, Phone, Users as MeetingIcon, MessageCircle, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/crm/bits";
import { NewTaskDialog } from "@/components/crm/NewTaskDialog";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useCrmActions, useTasks } from "@/components/crm/data";
import { CURRENT_USER, type TaskKind } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Mine", "Pending", "Done"] as const;

const KIND_META: Record<TaskKind, { label: string; tone: ChipTone }> = {
  followup: { label: "Follow-up", tone: "green" },
  meeting: { label: "Meeting", tone: "gold" },
  call: { label: "Call", tone: "terra" },
  whatsapp: { label: "WhatsApp", tone: "success" },
  other: { label: "Other", tone: "neutral" },
};

export default function TasksPage() {
  const tasks = useTasks();
  const { toggleTask } = useCrmActions();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  if (tasks === undefined) return <LoadingSkeleton variant="table" />;

  const rows = tasks
    .filter((t) => {
      if (filter === "Mine") return t.assigneeInitials === CURRENT_USER.initials;
      if (filter === "Pending") return !t.done;
      if (filter === "Done") return t.done;
      return true;
    })
    .sort((a, b) => Number(a.done) - Number(b.done));

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<ListTodo size={22} />}
          headline="No tasks yet"
          body="Log a task with a due date and reminder, or record an activity that already happened — everything shows up in Reports."
          action="Log a task"
        />
      }
    >
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Tasks</h1>
            <p className="mt-0.5 text-sm text-muted">
              {openCount} open · every task is assigned, due-dated and reminded — so tomorrow actually comes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-line bg-card p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                    filter === f ? "bg-ink text-white" : "text-muted hover:text-body"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <NewTaskDialog trigger={<Button variant="success">Log task / activity</Button>} />
          </div>
        </div>

        <Card className="!p-0">
          <div className="hidden grid-cols-12 border-b border-line px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint md:grid">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Kind</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Reminder</div>
            <div className="col-span-1 text-right">Due</div>
          </div>
          {rows.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-2 items-center gap-y-2 border-b border-line px-5 py-3.5 last:border-b-0 md:grid-cols-12"
            >
              <div className="col-span-2 flex items-start gap-3 md:col-span-5">
                <button
                  onClick={() => toggleTask(t._id)}
                  aria-label={t.done ? `Reopen: ${t.title}` : `Complete: ${t.title}`}
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150",
                    t.done ? "border-green bg-green text-white" : "border-faint hover:border-green"
                  )}
                >
                  {t.done && <CheckCircle2 size={11} />}
                </button>
                <div className="min-w-0">
                  <div className={cn("text-sm leading-snug", t.done ? "text-faint line-through" : "text-body")}>
                    {t.title}
                  </div>
                  {t.schoolName && t.schoolId && (
                    <Link href={`/schools/${t.schoolId}`} className="text-[11px] text-muted underline-offset-2 hover:underline">
                      {t.schoolName}
                    </Link>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <Chip tone={KIND_META[t.kind].tone}>
                  {t.kind === "call" ? <Phone size={10} /> : t.kind === "meeting" ? <MeetingIcon size={10} /> : t.kind === "whatsapp" ? <MessageCircle size={10} /> : null}
                  {KIND_META[t.kind].label}
                </Chip>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Avatar initials={t.assigneeInitials} tone={t.assigneeInitials === "EC" || t.assigneeInitials === "GB" ? "terra" : "green"} size="sm" />
              </div>
              <div className="text-[11px] text-muted md:col-span-2">
                {t.remindLabel ? (
                  <span className="flex items-center gap-1"><CalendarClock size={11} /> {t.remindLabel}</span>
                ) : (
                  <span className="text-faint">—</span>
                )}
              </div>
              <div className="flex justify-end md:col-span-1">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  t.overdue ? "bg-danger/10 text-danger"
                    : t.dueLabel === "Today" ? "bg-terra/10 text-terra"
                    : t.done ? "bg-line text-faint" : "bg-faint/15 text-muted"
                )}>
                  {t.dueLabel}
                </span>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted">Nothing in “{filter}”.</p>
          )}
        </Card>
      </div>
    </PageState>
  );
}
