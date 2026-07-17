"use client";

/**
 * Mounts the Convex client. The deployment URL is public by design (it
 * ships in every client bundle); the committed fallback keeps preview
 * builds working before NEXT_PUBLIC_CONVEX_URL is configured in Vercel.
 * Secrets (the deploy key) never appear here.
 */
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://glorious-fox-328.convex.cloud";
const client = new ConvexReactClient(url);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
