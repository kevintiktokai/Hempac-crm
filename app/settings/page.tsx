"use client";

/**
 * Settings (§4.7 + addendum §6), live from Convex: users & roles (shared
 * visibility), engine defaults from the settings singleton, WhatsApp
 * connection status, data & consent (followed list with live unfollow).
 */
import { MessageCircle, ShieldCheck, Trash2, Users, Settings as SettingsIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/crm/bits";
import { PageState, EmptyState, LoadingSkeleton } from "@/components/crm/PageState";
import { useCrmActions, useEngineSettings, useSchools, useUsers } from "@/components/crm/data";

export default function SettingsPage() {
  const users = useUsers();
  const schools = useSchools();
  const engine = useEngineSettings();
  const { toggleFollow } = useCrmActions();

  if (users === undefined || schools === undefined || engine === undefined) {
    return <LoadingSkeleton variant="table" />;
  }

  const followed = schools.filter((s) => s.following);

  return (
    <PageState
      skeleton="table"
      empty={
        <EmptyState
          icon={<SettingsIcon size={22} />}
          headline="Nothing configured yet"
          body="Invite your team, connect WhatsApp in read-only mode, and set the engine's defaults to get started."
          action="Connect WhatsApp"
        />
      }
    >
      <div className="p-6">
        <h1 className="mb-5 text-xl font-semibold text-ink">Settings</h1>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardTitle right={<span className="text-xs tabular-nums text-muted">{users.length} of 10 seats</span>}>
              <span className="flex items-center gap-2"><Users size={14} /> Users &amp; roles</span>
            </CardTitle>
            <ul className="divide-y divide-line">
              {users.map((u) => (
                <li key={u._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={u.initials} tone={u.role === "admin" ? "terra" : "green"} />
                    <div>
                      <div className="text-sm font-medium text-body">{u.name}</div>
                      <div className="text-xs text-muted">
                        {u.initials === "EC" ? "Founder & CEO" : u.role === "admin" ? "Admin" : "Sales rep"}
                      </div>
                    </div>
                  </div>
                  <Chip tone={u.role === "admin" ? "terra" : "neutral"}>{u.role}</Chip>
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-1 text-[11px] leading-snug text-faint">
              Everyone sees the same data — accountability comes from assignment and the audit trail, not from hiding rows.
              Admins additionally manage users, settings and the engine.
            </p>
            <Button variant="ghost">Invite user</Button>
          </Card>

          <Card>
            <CardTitle>Engine defaults</CardTitle>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Segments</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {(engine?.segments ?? []).map((s) => <Chip key={s} tone="green">{s}</Chip>)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Regions</span>
                <span className="text-right text-xs text-body">{(engine?.regions ?? []).join(" · ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Throughput cap</span>
                <span className="text-xs font-semibold tabular-nums text-body">{engine?.throughputCap ?? 10} drafts / day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Currency · phone format</span>
                <span className="text-xs text-body">USD · +263</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>
              <span className="flex items-center gap-2"><MessageCircle size={14} className="text-success" /> WhatsApp connection</span>
            </CardTitle>
            <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-body">
                  Connected · +263 77 ••• ••12
                  <span className="rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green">
                    read-only
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted">Last sync 4 minutes ago · send, react &amp; typing disabled</div>
              </div>
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-success" />
            </div>
            <p className="mt-3 text-[11px] leading-snug text-faint">
              The assistant reads followed conversations to suggest updates. It can never send a message from your number.
            </p>
          </Card>

          <Card>
            <CardTitle right={<span className="text-xs tabular-nums text-muted">{followed.length} followed</span>}>
              <span className="flex items-center gap-2"><ShieldCheck size={14} /> Data &amp; consent</span>
            </CardTitle>
            {followed.length > 0 ? (
              <ul className="divide-y divide-line">
                {followed.map((s) => (
                  <li key={s._id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-body">{s.name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleFollow(s._id)}
                        className="text-xs font-medium text-muted underline-offset-2 transition-colors hover:text-body hover:underline"
                      >
                        Unfollow
                      </button>
                      <button className="flex items-center gap-1 text-xs text-faint underline-offset-2 transition-colors hover:text-danger hover:underline">
                        <Trash2 size={11} /> Delete data
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">
                No conversations are being followed. Turn on Follow from any school page.
              </p>
            )}
          </Card>
        </div>
      </div>
    </PageState>
  );
}
