"use client";

/**
 * App shell — approved nav Variant A (§2): dark forest sidebar, white active
 * pill, logo + org top, "The Offer" + user bottom. Topbar: global search
 * (⌘K), Ask button (⌘J), notifications, avatar.
 * Sidebar collapses to icons below 1280px (§4 responsive).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard, Radar, Columns3, GraduationCap, Inbox, Settings,
  Search, Bell, Sparkles, Tag, ChevronRight, BarChart3,
} from "lucide-react";
import { CURRENT_USER } from "@/lib/sampleData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePrototype } from "./store";
import { AskDrawer } from "./AskDrawer";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/engine", label: "Lead Engine", icon: Radar },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/schools", label: "Schools", icon: GraduationCap },
  { href: "/review", label: "Review Queue", icon: Inbox },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const { suggestions } = usePrototype();
  const pending = suggestions.filter((s) => s.status === "pending").length;
  return (
    <aside className="flex w-16 shrink-0 flex-col justify-between bg-ink xl:w-60">
      <div>
        <div className="flex items-center gap-2.5 px-3 py-5 xl:px-5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#C25E30,#5FA15A)" }}
          >
            ls
          </div>
          <div className="hidden leading-tight xl:block">
            <div className="text-sm font-semibold text-white">Hempac Sport</div>
            <div className="text-[10px] tracking-wide text-white/45">SynCRM · by LayerSync</div>
          </div>
        </div>
        <nav className="mt-2 px-2.5 xl:px-3" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                title={label}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                  on ? "bg-white font-semibold text-ink shadow-card" : "font-medium text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={17} className="shrink-0" />
                <span className="hidden xl:inline">{label}</span>
                {href === "/review" && pending > 0 && (
                  <span className={cn(
                    "ml-auto hidden rounded-full px-1.5 text-[10px] font-bold tabular-nums xl:inline",
                    on ? "bg-terra text-white" : "bg-terra/80 text-white"
                  )}>
                    {pending}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-2.5 pb-4 xl:px-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="mb-3 flex w-full items-center justify-between rounded-lg bg-terra/15 px-3 py-2.5 text-sm font-medium text-[#E7B79E] transition-colors duration-150 hover:bg-terra/25">
              <span className="flex items-center gap-2"><Tag size={16} className="shrink-0" /><span className="hidden xl:inline">The Offer</span></span>
              <ChevronRight size={15} className="hidden xl:block" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-56">
            <p className="text-xs leading-snug text-muted">
              Your LayerSync engagement details are shared separately.
            </p>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2 py-2.5 xl:px-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terra text-[10px] font-semibold text-white">
            {CURRENT_USER.initials}
          </span>
          <div className="hidden leading-tight xl:block">
            <div className="text-xs font-medium text-white">{CURRENT_USER.name}</div>
            <div className="text-[10px] text-white/45">{CURRENT_USER.roleTitle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { setAskOpen, askOpen } = usePrototype();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAskOpen(!askOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [askOpen, setAskOpen]);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line bg-card/80 px-6 py-3 backdrop-blur">
      <div className="flex w-full max-w-80 items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 transition-colors hover:border-faint">
        <Search size={15} className="shrink-0 text-faint" />
        <span className="flex-1 truncate text-sm text-faint">Search schools, deals…</span>
        <kbd className="rounded border border-line px-1 text-[10px] text-faint">⌘K</kbd>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={() => setAskOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-terra/50 bg-card px-3 py-1.5 text-sm font-medium text-terra transition-colors duration-150 hover:bg-terra-soft"
        >
          <Sparkles size={15} /> Ask
          <kbd className="ml-0.5 rounded border border-terra/30 px-1 text-[10px] text-terra/70">⌘J</kbd>
        </button>
        <button className="relative rounded-lg border border-line bg-card p-2 transition-colors hover:border-faint" aria-label="Notifications">
          <Bell size={16} className="text-muted" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-terra" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-semibold text-white">
          {CURRENT_USER.initials}
        </span>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-body">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
      <AskDrawer />
    </div>
  );
}
