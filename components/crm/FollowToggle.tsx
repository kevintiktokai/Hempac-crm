"use client";

/**
 * Per-school Follow toggle (§1.4-8) — consent Gate 1, persisted on the
 * school and mirrored to its thread server-side.
 */
import { Eye, EyeOff } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useCrmActions } from "./data";

export function FollowToggle({ schoolId, following }: { schoolId: Id<"schools">; following: boolean }) {
  const { toggleFollow } = useCrmActions();
  return (
    <div className="text-right">
      <button
        onClick={() => toggleFollow(schoolId)}
        role="switch"
        aria-checked={following}
        aria-label="Track this chat"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150",
          following ? "bg-green text-white hover:bg-ink" : "border border-line bg-card text-muted hover:border-faint"
        )}
      >
        {following ? <Eye size={15} /> : <EyeOff size={15} />}
        {following ? "Following" : "Not following"}
      </button>
      <p className="ml-auto mt-1.5 max-w-60 text-[11px] leading-snug text-faint">
        All business-line chats are tracked by default. Turn off to exclude this conversation — its messages are never stored.
      </p>
    </div>
  );
}
