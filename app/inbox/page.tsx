"use client";

/**
 * Inbox (client decision, Jul 2026): click through the chats coming off the
 * business line, read them (always read-only), choose what to track, and
 * extract leads from unknown numbers — manually or by accepting the
 * raised "New lead" suggestion.
 */
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Inbox as InboxIcon, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { WhatsAppThread, ReadOnlyBadge } from "@/components/crm/WhatsAppThread";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useCrmActions, useThreads } from "@/components/crm/data";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

function relativeTime(ms: number): string {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / (24 * 60))}d`;
}

function ThreadPane({ threadId }: { threadId: Id<"threads"> }) {
  const data = useQuery(api.whatsapp.getThread, { threadId });
  const { toggleThreadTracking, promoteThread, acceptSuggestion } = useCrmActions();

  if (data === undefined) {
    return <div className="flex h-full items-center justify-center text-xs text-faint">Loading conversation…</div>;
  }
  if (data === null) return null;
  const { thread, messages, pendingLeadSuggestionId } = data;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-body">{thread.name}</span>
            {!thread.linked && <Chip tone="amber">not a lead yet</Chip>}
          </div>
          <div className="text-[11px] text-faint">+{thread.phone}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleThreadTracking(thread._id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150",
              thread.following ? "bg-green text-white hover:bg-ink" : "border border-line text-muted hover:border-faint"
            )}
          >
            {thread.following ? <Eye size={13} /> : <EyeOff size={13} />}
            {thread.following ? "Tracking" : "Excluded"}
          </button>
          {thread.linked && thread.schoolId ? (
            <Link
              href={`/schools/${thread.schoolId}`}
              className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-faint hover:text-body"
            >
              <ExternalLink size={12} /> Open lead
            </Link>
          ) : (
            <Button
              variant="success"
              size="md"
              onClick={() =>
                pendingLeadSuggestionId ? acceptSuggestion(pendingLeadSuggestionId) : promoteThread(thread._id)
              }
            >
              <UserPlus size={13} /> Create lead
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <WhatsAppThread messages={messages} />
      </div>
      {!thread.linked && pendingLeadSuggestionId && (
        <div className="border-t border-line bg-terra-soft/50 px-5 py-2.5 text-[11px] text-[#7A3A1E]">
          The assistant suggested extracting this chat as a lead — it's waiting in your Review Queue too. Nothing is created until you accept.
        </div>
      )}
    </div>
  );
}

export default function InboxPage() {
  const threads = useThreads();
  const [selected, setSelected] = useState<Id<"threads"> | null>(null);

  if (threads === undefined) return <LoadingSkeleton variant="table" />;
  const active = selected ?? threads[0]?._id ?? null;

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<InboxIcon size={22} />}
          headline="The inbox is quiet"
          body="Chats from the business line appear here as they sync — read them, choose what to track, and turn enquiries into leads."
          action="Sync now"
        />
      }
    >
      <div className="flex h-full flex-col p-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-ink">Inbox</h1>
          <p className="mt-0.5 text-sm text-muted">
            Every chat on the business line · read-only · {threads.filter((t) => t.following).length} of {threads.length} tracked
          </p>
        </div>
        <Card className="grid min-h-0 flex-1 !p-0 lg:grid-cols-[340px_1fr]">
          {/* Chat list */}
          <div className="max-h-[70vh] overflow-y-auto border-r border-line lg:max-h-none">
            {threads.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelected(t._id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors duration-150",
                  active === t._id ? "bg-green-soft/60" : "hover:bg-green-soft/30"
                )}
              >
                <span className={cn(
                  "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  t.following ? "bg-green-soft text-success" : "bg-line text-faint"
                )}>
                  <MessageCircle size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm font-medium", t.following ? "text-body" : "text-faint")}>
                      {t.name}
                    </span>
                    <span className="shrink-0 text-[10px] tabular-nums text-faint">{relativeTime(t.lastAt)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{t.lastMessage}</span>
                  <span className="mt-1 flex items-center gap-1.5">
                    {!t.linked && <Chip tone="amber">new</Chip>}
                    {!t.following && <Chip tone="neutral">excluded</Chip>}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {/* Reading pane */}
          <div className="hidden min-h-0 lg:block">
            {active ? (
              <ThreadPane threadId={active} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-faint">Select a chat</div>
            )}
          </div>
        </Card>
        <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-faint">
          <ReadOnlyBadge /> captured from the business line — the system never sends
        </div>
      </div>
    </PageState>
  );
}
