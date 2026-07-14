"use client";

/**
 * Per-school Follow toggle (§1.4-8) — consent Gate 1.
 */
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototype } from "./store";

export function FollowToggle({ schoolId }: { schoolId: number }) {
  const { following, toggleFollow } = usePrototype();
  const on = following[schoolId] ?? false;
  return (
    <div className="text-right">
      <button
        onClick={() => toggleFollow(schoolId)}
        role="switch"
        aria-checked={on}
        aria-label="Follow this conversation"
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150",
          on ? "bg-green text-white hover:bg-ink" : "border border-line bg-card text-muted hover:border-faint"
        )}
      >
        {on ? <Eye size={15} /> : <EyeOff size={15} />}
        {on ? "Following" : "Not following"}
      </button>
      <p className="ml-auto mt-1.5 max-w-60 text-[11px] leading-snug text-faint">
        When on, the assistant reads this conversation and suggests updates.
      </p>
    </div>
  );
}
