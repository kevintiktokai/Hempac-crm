"use client";

/**
 * Phase A1 wireframe shell: renders BOTH nav variants (handoff §2) behind a
 * floating review toggle, plus the topbar and the global Ask drawer (§3).
 */
import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Radar, Columns3, GraduationCap, Inbox, Settings,
  Search, Bell, Sparkles, Tag, ChevronRight,
} from "lucide-react";
import { CURRENT_USER } from "@/lib/sampleData";
import { AskDrawer } from "./AskDrawer";
import { Note } from "./ui";

type NavVariant = "A" | "B";

interface ShellState {
  variant: NavVariant;
  setVariant: (v: NavVariant) => void;
  askOpen: boolean;
  setAskOpen: (open: boolean) => void;
}

const ShellContext = createContext<ShellState | null>(null);

export function useShell(): ShellState {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <Shell>");
  return ctx;
}

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/engine", label: "Lead Engine", icon: Radar },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/schools", label: "Schools", icon: GraduationCap },
  { href: "/review", label: "Review Queue", icon: Inbox },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Variant A — dark brand sidebar (rendered dark-grey in lo-fi). */
function SidebarA() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between bg-wf-dark">
      <div>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">ls</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Hempac Sport</div>
            <div className="text-[10px] tracking-wide text-white/50">SynCRM · by LayerSync</div>
          </div>
        </div>
        <nav className="mt-2 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = isActive(pathname, href);
            return (
              <Link key={href} href={href}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  on ? "bg-white font-semibold text-wf-ink" : "font-medium text-white/60"
                }`}>
                <Icon size={17} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <button className="mb-3 flex w-full items-center justify-between rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white/80">
          <span className="flex items-center gap-2"><Tag size={16} /> The Offer</span>
          <ChevronRight size={15} />
        </button>
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
            {CURRENT_USER.initials}
          </span>
          <div className="leading-tight">
            <div className="text-xs font-medium text-white">{CURRENT_USER.fullName}</div>
            <div className="text-[10px] text-white/50">{CURRENT_USER.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Variant B — light sidebar with grouped sections (effix-style). */
function SidebarB() {
  const pathname = usePathname();
  const main = NAV.slice(0, 4);
  const others = NAV.slice(4);
  const group = (label: string, items: typeof NAV) => (
    <div className="px-3">
      <div className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-widest text-wf-faint">{label}</div>
      {items.map(({ href, label: l, icon: Icon }) => {
        const on = isActive(pathname, href);
        return (
          <Link key={href} href={href}
            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              on ? "bg-wf-fill font-semibold text-wf-ink" : "font-medium text-wf-mid"
            }`}>
            <Icon size={17} /> {l}
          </Link>
        );
      })}
    </div>
  );
  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-wf-line bg-wf-card">
      <div>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wf-dark text-sm font-bold text-white">ls</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-wf-ink">Hempac Sport</div>
            <div className="text-[10px] tracking-wide text-wf-mid">SynCRM · by LayerSync</div>
          </div>
        </div>
        {group("Main", main)}
        {group("Others", others)}
      </div>
      <div className="px-3 pb-4">
        <div className="mb-3 rounded-lg border border-wf-line p-3">
          <div className="text-xs font-semibold text-wf-ink">Engine plan</div>
          <div className="mt-0.5 text-[11px] text-wf-mid">Lead engine active · 96 contacted</div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-wf-fill px-3 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-wf-dark text-[10px] font-semibold text-white">
            {CURRENT_USER.initials}
          </span>
          <div className="leading-tight">
            <div className="text-xs font-medium text-wf-ink">{CURRENT_USER.fullName}</div>
            <div className="text-[10px] text-wf-mid">{CURRENT_USER.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { setAskOpen } = useShell();
  return (
    <div className="flex items-center justify-between border-b border-wf-line bg-wf-card px-6 py-3">
      <div className="flex w-80 items-center gap-2 rounded-lg border border-wf-line px-3 py-1.5">
        <Search size={15} className="text-wf-faint" />
        <span className="flex-1 text-sm text-wf-faint">Search schools, deals…</span>
        <kbd className="rounded border border-wf-line px-1 text-[10px] text-wf-faint">⌘K</kbd>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAskOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-wf-mid px-3 py-1.5 text-sm font-medium text-wf-ink">
          <Sparkles size={15} /> Ask
        </button>
        <button className="rounded-lg border border-wf-line p-2" aria-label="Notifications">
          <Bell size={16} className="text-wf-mid" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wf-fill2 text-xs font-semibold text-wf-mid">
          {CURRENT_USER.initials}
        </span>
      </div>
    </div>
  );
}

/** Floating review-only control to flip nav variants. Not product UI. */
function VariantToggle() {
  const { variant, setVariant } = useShell();
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-wf-line bg-wf-card px-3 py-2 shadow-lg">
      <Note>Wireframe · nav</Note>
      {(["A", "B"] as const).map((v) => (
        <button key={v} onClick={() => setVariant(v)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            variant === v ? "bg-wf-dark text-white" : "text-wf-mid"
          }`}>
          {v === "A" ? "A · dark" : "B · light"}
        </button>
      ))}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<NavVariant>("A");
  const [askOpen, setAskOpen] = useState(false);
  return (
    <ShellContext.Provider value={{ variant, setVariant, askOpen, setAskOpen }}>
      <div className="flex h-screen w-full overflow-hidden bg-wf-bg text-wf-ink">
        {variant === "A" ? <SidebarA /> : <SidebarB />}
        <main className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
        <AskDrawer />
        <VariantToggle />
      </div>
    </ShellContext.Provider>
  );
}
