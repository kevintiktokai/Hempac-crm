"use client";

/**
 * Sprint 1 client data layer: live Convex queries/mutations behind small
 * hooks. `undefined` means loading — screens render their skeletons.
 * The acting user is Emilia until the auth sprint.
 */
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CURRENT_USER, type DealStage, type PipelineType, type TaskKind } from "@/lib/sampleData";

export const useDashboard = () => useQuery(api.crm.dashboard);
export const useSchools = () => useQuery(api.crm.listSchools);
export const useSchool = (schoolId: Id<"schools">) => useQuery(api.crm.getSchool, { schoolId });
export const useBoard = (pipelineType: PipelineType) => useQuery(api.crm.board, { pipelineType });
export const usePendingSuggestions = () => useQuery(api.crm.pendingSuggestions);
export const useTasks = () => useQuery(api.crm.listTasks);
export const useActivity = () => useQuery(api.crm.recentActivity);
export const useUsers = () => useQuery(api.crm.listUsers);
export const useEngineSettings = () => useQuery(api.crm.engineSettings);
export const useReports = () => useQuery(api.crm.reports);
export const useNotifications = () =>
  useQuery(api.notify.myNotifications, { initials: CURRENT_USER.initials });
export const useSyncState = () => useQuery(api.whatsapp.getState);
export const useThreads = () => useQuery(api.whatsapp.listThreads);

export type EnrichedSuggestion = NonNullable<ReturnType<typeof usePendingSuggestions>>[number];
export type EnrichedTask = NonNullable<ReturnType<typeof useTasks>>[number];
export type BoardData = NonNullable<ReturnType<typeof useBoard>>;
export type SchoolDetail = NonNullable<NonNullable<ReturnType<typeof useSchool>>>;

export function useCrmActions() {
  const accept = useMutation(api.actions.acceptSuggestion);
  const dismiss = useMutation(api.actions.dismissSuggestion);
  const move = useMutation(api.actions.moveDeal);
  const task = useMutation(api.actions.toggleTask);
  const follow = useMutation(api.actions.toggleFollow);
  const create = useMutation(api.actions.createTask);
  const readAll = useMutation(api.notify.markAllRead);
  const threadTracking = useMutation(api.actions.toggleThreadTracking);
  const sync = useAction(api.whatsapp.syncInbox);
  const promote = useMutation(api.actions.promoteThread);
  const lead = useMutation(api.actions.createLead);
  const me = CURRENT_USER.initials;
  return {
    acceptSuggestion: (suggestionId: Id<"suggestions">) =>
      accept({ suggestionId, actorInitials: me }),
    dismissSuggestion: (suggestionId: Id<"suggestions">) =>
      dismiss({ suggestionId, actorInitials: me }),
    moveDeal: (dealId: Id<"deals">, stage: DealStage) =>
      move({ dealId, stage, actorInitials: me }),
    toggleTask: (taskId: Id<"tasks">) => task({ taskId, actorInitials: me }),
    toggleFollow: (schoolId: Id<"schools">) => follow({ schoolId }),
    createTask: (args: {
      title: string; kind: TaskKind; schoolId?: Id<"schools">;
      assigneeInitials: string; dueAt: number; remindAt?: number; alreadyDone?: boolean;
    }) => create({ ...args, actorInitials: me }),
    markNotificationsRead: () => readAll({ initials: me }),
    toggleThreadTracking: (threadId: Id<"threads">) => threadTracking({ threadId }),
    syncInboxNow: () => sync(),
    promoteThread: (threadId: Id<"threads">) => promote({ threadId, actorInitials: me }),
    createLead: (args: {
      name: string; region: string; phone?: string;
      pipelineType: PipelineType; assigneeInitials: string;
    }) => lead({ ...args, actorInitials: me }),
  };
}
