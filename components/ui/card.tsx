import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Standard surface: white, 16px radius, hairline border, airy shadow (§1.1). */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-card border border-line bg-card p-6 shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      <h3 className="text-sm font-semibold text-body">{children}</h3>
      {right}
    </div>
  );
}
