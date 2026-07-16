"use client";

/**
 * Sprint 0: mounts the Convex client when NEXT_PUBLIC_CONVEX_URL is set.
 * The UI still reads the Phase A client store; Sprint 1 migrates screens to
 * live queries. Without the env var (e.g. preview builds before the env is
 * configured) the app runs exactly as before.
 */
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
