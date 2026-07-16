"use client";

/**
 * Client-side prototype state (Phase A — no backend, §6), extended for the
 * v3 scope: deal-keyed stages across two pipelines, suggestion effects via
 * explicit payloads, assignment-aware tasks, views, and the activity feed.
 * Convex replaces this in Phase B behind the same component API.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEALS, SCHOOLS, SUGGESTIONS, TASKS, dealById, schoolById,
  type DealStage, type Suggestion, type Task,
} from "@/lib/sampleData";

export interface ActivityItem {
  id: string;
  schoolId: number;
  text: string;
  kind: "accepted" | "dismissed" | "moved" | "task";
}

/** Review-only preview of each screen's loading/empty/error states (§4). */
export type PreviewState = "normal" | "loading" | "empty" | "error";

/** §4 views: everything vs assigned-to-me. Pending tasks is a task-list filter. */
export type ViewScope = "global" | "mine";

interface PrototypeState {
  suggestions: Suggestion[];
  tasks: Task[];
  stages: Record<string, DealStage>;
  following: Record<number, boolean>;
  activity: ActivityItem[];
  askOpen: boolean;
  setAskOpen: (open: boolean) => void;
  preview: PreviewState;
  setPreview: (p: PreviewState) => void;
  view: ViewScope;
  setView: (v: ViewScope) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleFollow: (schoolId: number) => void;
  moveDeal: (dealId: string, stage: DealStage) => void;
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
  const [stages, setStages] = useState<Record<string, DealStage>>(
    Object.fromEntries(DEALS.map((d) => [d.id, d.stage]))
  );
  const [following, setFollowing] = useState<Record<number, boolean>>(
    Object.fromEntries(SCHOOLS.map((s) => [s.id, s.following]))
  );
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>("normal");
  const [view, setView] = useState<ViewScope>("global");

  const log = useCallback((item: Omit<ActivityItem, "id">) => {
    setActivity((prev) => [{ ...item, id: nextId() }, ...prev]);
  }, []);

  const moveDeal = useCallback((dealId: string, stage: DealStage) => {
    setStages((st) => {
      if (st[dealId] === stage) return st;
      const deal = dealById(dealId);
      const school = deal ? schoolById(deal.schoolId) : undefined;
      log({ schoolId: deal?.schoolId ?? 0, text: `${school?.name ?? "Deal"} moved to ${stage}`, kind: "moved" });
      return { ...st, [dealId]: stage };
    });
  }, [log]);

  const acceptSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s || s.status !== "pending") return prev;
      if (s.type === "Stage change" && s.dealId && s.toStage) {
        moveDeal(s.dealId, s.toStage);
      } else if (s.type === "Task done") {
        setTasks((ts) => ts.map((t) => (t.schoolId === s.schoolId && !t.done ? { ...t, done: true, due: "Done" } : t)));
      } else {
        // New task and Follow-up both create an assigned task
        setTasks((ts) => [
          ...ts,
          {
            id: `tk-sg-${s.id}`, schoolId: s.schoolId, title: s.proposal,
            kind: s.type === "Follow-up" ? "whatsapp" : "followup",
            due: "This week", assignedTo: s.assignedTo, done: false,
          },
        ]);
      }
      log({ schoolId: s.schoolId, text: `Accepted: ${s.proposal}`, kind: "accepted" });
      return prev.map((x) => (x.id === id ? { ...x, status: "accepted" as const } : x));
    });
  }, [log, moveDeal]);

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

  const value = useMemo<PrototypeState>(() => ({
    suggestions, tasks, stages, following, activity, askOpen, setAskOpen,
    preview, setPreview, view, setView,
    acceptSuggestion, dismissSuggestion, toggleTask, toggleFollow, moveDeal,
  }), [suggestions, tasks, stages, following, activity, askOpen, preview, view,
       acceptSuggestion, dismissSuggestion, toggleTask, toggleFollow, moveDeal]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
