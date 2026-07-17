"use client";

/**
 * UI-only client state (Sprint 1). Data moved to Convex — see data.ts.
 * This keeps drawer visibility, the review-only state preview, and the
 * §4 view scope (Global / Assigned-to-me).
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** Review-only preview of each screen's loading/empty/error states (§4). */
export type PreviewState = "normal" | "loading" | "empty" | "error";

/** §4 views: everything vs assigned-to-me. Pending tasks is a task-list filter. */
export type ViewScope = "global" | "mine";

interface UiState {
  askOpen: boolean;
  setAskOpen: (open: boolean) => void;
  preview: PreviewState;
  setPreview: (p: PreviewState) => void;
  view: ViewScope;
  setView: (v: ViewScope) => void;
}

const Ctx = createContext<UiState | null>(null);

export function usePrototype(): UiState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used inside <PrototypeProvider>");
  return ctx;
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>("normal");
  const [view, setView] = useState<ViewScope>("global");

  const value = useMemo<UiState>(
    () => ({ askOpen, setAskOpen, preview, setPreview, view, setView }),
    [askOpen, preview, view]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
