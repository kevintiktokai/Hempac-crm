"use client";

/**
 * Client-side prototype state (Phase A — no backend, §6).
 * Holds everything the clickable prototype mutates: suggestion statuses,
 * task completion, deal stages, follow flags, and the activity feed.
 * Convex replaces this in Phase B behind the same component API.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  SCHOOLS, SUGGESTIONS, TASKS,
  type DealStage, type Suggestion, type Task,
} from "@/lib/sampleData";

/** Review-only preview of each screen's loading/empty/error states (§4). */
export type PreviewState = "normal" | "loading" | "empty" | "error";

export interface ActivityItem {
  id: string;
  schoolId: number;
  text: string;
  kind: "accepted" | "dismissed" | "moved" | "task";
}

interface PrototypeState {
  suggestions: Suggestion[];
  tasks: Task[];
  stages: Record<number, DealStage | "">;
  following: Record<number, boolean>;
  activity: ActivityItem[];
  askOpen: boolean;
  setAskOpen: (open: boolean) => void;
  preview: PreviewState;
  setPreview: (p: PreviewState) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleFollow: (schoolId: number) => void;
  moveDeal: (schoolId: number, stage: DealStage) => void;
}

const Ctx = createContext<PrototypeState | null>(null);

export function usePrototype(): PrototypeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used inside <PrototypeProvider>");
  return ctx;
}

let seq = 0;
const nextId = (): string => `act-${++seq}`;

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SUGGESTIONS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [stages, setStages] = useState<Record<number, DealStage | "">>(
    Object.fromEntries(SCHOOLS.map((s) => [s.id, s.stage]))
  );
  const [following, setFollowing] = useState<Record<number, boolean>>(
    Object.fromEntries(SCHOOLS.map((s) => [s.id, s.following]))
  );
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>("normal");

  const log = useCallback((item: Omit<ActivityItem, "id">) => {
    setActivity((prev) => [{ ...item, id: nextId() }, ...prev]);
  }, []);

  const acceptSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s || s.status !== "pending") return prev;
      // Apply the accepted change to prototype state
      if (s.type === "Stage change") {
        const match = /to (New Enquiry|Demo Booked|Quote Sent|Procurement|Won|Lost)/.exec(s.proposal);
        if (match) {
          const stage = match[1] as DealStage;
          setStages((st) => ({ ...st, [s.schoolId]: stage }));
        }
      } else if (s.type === "Task done") {
        setTasks((ts) => ts.map((t) => (t.schoolId === s.schoolId && !t.done ? { ...t, done: true, due: "Done" } : t)));
      } else {
        setTasks((ts) => [
          ...ts,
          { id: `tk-sg-${s.id}`, schoolId: s.schoolId, title: s.proposal, due: "This week", done: false },
        ]);
      }
      log({ schoolId: s.schoolId, text: `Accepted: ${s.proposal}`, kind: "accepted" });
      return prev.map((x) => (x.id === id ? { ...x, status: "accepted" as const } : x));
    });
  }, [log]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s || s.status !== "pending") return prev;
      log({ schoolId: s.schoolId, text: `Dismissed: ${s.proposal}`, kind: "dismissed" });
      return prev.map((x) => (x.id === id ? { ...x, status: "dismissed" as const } : x));
    });
  }, [log]);

  const toggleTask = useCallback((id: string) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done, due: t.done ? "This week" : "Done" } : t)));
  }, []);

  const toggleFollow = useCallback((schoolId: number) => {
    setFollowing((f) => ({ ...f, [schoolId]: !f[schoolId] }));
  }, []);

  const moveDeal = useCallback((schoolId: number, stage: DealStage) => {
    setStages((st) => {
      if (st[schoolId] === stage) return st;
      const school = SCHOOLS.find((s) => s.id === schoolId);
      log({ schoolId, text: `${school?.name ?? "Deal"} moved to ${stage}`, kind: "moved" });
      return { ...st, [schoolId]: stage };
    });
  }, [log]);

  const value = useMemo<PrototypeState>(() => ({
    suggestions, tasks, stages, following, activity, askOpen, setAskOpen, preview, setPreview,
    acceptSuggestion, dismissSuggestion, toggleTask, toggleFollow, moveDeal,
  }), [suggestions, tasks, stages, following, activity, askOpen, preview,
       acceptSuggestion, dismissSuggestion, toggleTask, toggleFollow, moveDeal]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
