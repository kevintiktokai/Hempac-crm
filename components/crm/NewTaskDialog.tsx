"use client";

/**
 * Log a task/reminder (addendum §5): title, optional school, kind, assignee,
 * due date, pre-reminder. Creation is audit-logged server-side.
 */
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Id } from "@/convex/_generated/dataModel";
import { CURRENT_USER, type TaskKind } from "@/lib/sampleData";
import { useCrmActions, useSchools, useUsers } from "./data";
import { cn } from "@/lib/utils";

const KINDS: { value: TaskKind; label: string }[] = [
  { value: "followup", label: "Follow-up" },
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const DUE_CHOICES = [
  { label: "Today", hours: 6 },
  { label: "Tomorrow", hours: 26 },
  { label: "This week", hours: 3 * 24 },
  { label: "Next week", hours: 7 * 24 },
] as const;

const REMIND_CHOICES = [
  { label: "No reminder", hours: 0 },
  { label: "1h before", hours: 1 },
  { label: "1d before", hours: 24 },
] as const;

export function NewTaskDialog({
  presetSchoolId, trigger,
}: { presetSchoolId?: Id<"schools">; trigger?: ReactNode }) {
  const schools = useSchools();
  const users = useUsers();
  const { createTask } = useCrmActions();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("followup");
  const [schoolId, setSchoolId] = useState<string>(presetSchoolId ?? "");
  const [assignee, setAssignee] = useState(CURRENT_USER.initials);
  const [due, setDue] = useState<(typeof DUE_CHOICES)[number]["label"]>("Tomorrow");
  const [remind, setRemind] = useState<(typeof REMIND_CHOICES)[number]["label"]>("1d before");

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const dueAt = Date.now() + (DUE_CHOICES.find((d) => d.label === due)?.hours ?? 26) * 3600 * 1000;
    const remindHours = REMIND_CHOICES.find((r) => r.label === remind)?.hours ?? 0;
    await createTask({
      title: trimmed,
      kind,
      schoolId: schoolId ? (schoolId as Id<"schools">) : undefined,
      assigneeInitials: assignee,
      dueAt,
      remindAt: remindHours > 0 ? dueAt - remindHours * 3600 * 1000 : undefined,
    });
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold text-muted transition-colors hover:border-green hover:text-green">
            <Plus size={10} /> New task
          </button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-sm font-semibold text-body">Log a task</DialogTitle>
        <p className="mt-0.5 text-xs text-muted">Assigned, due-dated, and reminded — so tomorrow actually comes.</p>

        <div className="mt-4 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
            placeholder="e.g. Meeting with the bursar next week"
            aria-label="Task title"
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-body outline-none transition-colors placeholder:text-faint focus:border-green"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-faint">School</span>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-body outline-none"
              >
                <option value="">General (no school)</option>
                {(schools ?? []).map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-faint">Assignee</span>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-body outline-none"
              >
                {(users ?? []).map((u) => (
                  <option key={u._id} value={u.initials}>{u.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Kind</span>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
                    kind === k.value ? "bg-ink text-white" : "border border-line text-muted hover:text-body"
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Due</span>
              <div className="flex flex-wrap gap-1.5">
                {DUE_CHOICES.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDue(d.label)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
                      due === d.label ? "bg-green text-white" : "border border-line text-muted hover:text-body"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Reminder</span>
              <div className="flex flex-wrap gap-1.5">
                {REMIND_CHOICES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRemind(r.label)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
                      remind === r.label ? "bg-terra text-white" : "border border-line text-muted hover:text-body"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button variant="success" size="lg" className="w-full" onClick={() => void submit()} disabled={!title.trim()}>
            Log task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
