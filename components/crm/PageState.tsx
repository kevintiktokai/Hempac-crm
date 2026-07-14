"use client";

/**
 * Loading / empty / error states for every screen (§4), plus the floating
 * review-only control that previews them. Empty states are friendly, one
 * action; headlines use the brand serif (§1.3).
 */
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrototype, type PreviewState } from "./store";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon, headline, body, action,
}: { icon: ReactNode; headline: string; body: string; action: string }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-soft text-green">{icon}</div>
      <h2 className="mt-4 font-serif text-2xl text-ink">{headline}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <Button variant="success" size="lg" className="mt-5">{action}</Button>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle size={22} />
      </div>
      <h2 className="mt-4 font-serif text-2xl text-ink">Something went wrong</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        We couldn&rsquo;t load this screen. Your data is safe — try again in a moment.
      </p>
      <Button variant="ghost" size="lg" className="mt-5"><RefreshCw size={14} /> Retry</Button>
    </div>
  );
}

export function LoadingSkeleton({ variant }: { variant: "dashboard" | "table" | "kanban" | "detail" }) {
  if (variant === "kanban") {
    return (
      <div className="flex gap-4 p-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-64 shrink-0 space-y-2.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "table") {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-12 w-full rounded-card" />
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }
  if (variant === "detail") {
    return (
      <div className="p-6">
        <Skeleton className="h-9 w-72" />
        <div className="mt-6 grid gap-5 xl:grid-cols-[280px_1fr_320px]">
          <div className="space-y-4"><Skeleton className="h-40 rounded-card" /><Skeleton className="h-48 rounded-card" /></div>
          <Skeleton className="h-96 rounded-card" />
          <div className="space-y-4"><Skeleton className="h-56 rounded-card" /><Skeleton className="h-32 rounded-card" /></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6">
      <Skeleton className="h-9 w-80" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Skeleton className="col-span-2 h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  );
}

/**
 * Wraps a screen's content and swaps it for the previewed state.
 * `empty` is the screen-specific empty state.
 */
export function PageState({
  skeleton, empty, children,
}: { skeleton: "dashboard" | "table" | "kanban" | "detail"; empty: ReactNode; children: ReactNode }) {
  const { preview } = usePrototype();
  if (preview === "loading") return <LoadingSkeleton variant={skeleton} />;
  if (preview === "error") return <ErrorState />;
  if (preview === "empty") return <>{empty}</>;
  return <>{children}</>;
}

const STATES: PreviewState[] = ["normal", "loading", "empty", "error"];

/** Floating review-only control. Not product UI — removed in Phase B. */
export function StatePreviewControl() {
  const { preview, setPreview } = usePrototype();
  return (
    <div className="fixed bottom-4 left-20 z-50 flex items-center gap-1 rounded-full border border-line bg-card px-2 py-1.5 shadow-lift xl:left-64">
      <span className="px-1.5 text-[9px] font-semibold uppercase tracking-widest text-faint">Preview</span>
      {STATES.map((s) => (
        <button
          key={s}
          onClick={() => setPreview(s)}
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize transition-colors duration-150",
            preview === s ? "bg-ink text-white" : "text-muted hover:text-body"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
