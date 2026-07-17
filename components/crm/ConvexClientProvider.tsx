"use client";

/**
 * Mounts the Convex client. The deployment URL is public by design (it
 * ships in every client bundle); the committed fallback keeps preview
 * builds working before NEXT_PUBLIC_CONVEX_URL is configured in Vercel.
 * Secrets (the deploy key) never appear here.
 */
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

// Normalize whatever the env supplies: a trailing slash makes the client
// build a //api/... WebSocket path that Convex 404s, hanging every query
// on its loading skeleton. Trim, strip trailing slashes, and fall back on
// empty as well as unset.
const raw = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
const url = (raw && raw.length > 0 ? raw : "https://glorious-fox-328.convex.cloud").replace(/\/+$/, "");
const client = new ConvexReactClient(url);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
