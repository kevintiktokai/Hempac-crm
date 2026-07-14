/**
 * Settings wireframe (handoff §4.7): users/roles, engine defaults, WhatsApp
 * MCP connection (read-only badge + last sync), data & consent.
 */
import { MessageCircle, ShieldCheck, Trash2, Users } from "lucide-react";
import { Avatar, Card, CardTitle, Chip, GhostBtn, Note } from "@/components/wireframe/ui";
import { SCHOOLS } from "@/lib/sampleData";

const USERS = [
  { name: "Emilia Chisango", role: "Owner", initials: "EC" },
  { name: "Tino Chisango", role: "Sales", initials: "TC" },
];

export default function SettingsPage() {
  const followed = SCHOOLS.filter((s) => s.following);
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold text-wf-ink">Settings</h1>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle><span className="flex items-center gap-2"><Users size={14} /> Users &amp; roles</span></CardTitle>
          <ul className="divide-y divide-wf-line">
            {USERS.map((u) => (
              <li key={u.initials} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={u.initials} dark />
                  <div>
                    <div className="text-sm font-medium text-wf-ink">{u.name}</div>
                    <div className="text-xs text-wf-mid">{u.role}</div>
                  </div>
                </div>
                <Chip>{u.role === "Owner" ? "Full access" : "Sales access"}</Chip>
              </li>
            ))}
          </ul>
          <GhostBtn>Invite user</GhostBtn>
        </Card>

        <Card>
          <CardTitle>Engine defaults</CardTitle>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-wf-mid">Segments</span>
              <span className="text-xs text-wf-ink">Private · Trust · Mission</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-wf-mid">Regions</span>
              <span className="text-xs text-wf-ink">Harare · Bulawayo · Mutare · Gweru</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-wf-mid">Throughput cap</span>
              <span className="text-xs font-semibold tabular-nums text-wf-ink">10 drafts / day</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-wf-mid">Currency · phone format</span>
              <span className="text-xs text-wf-ink">USD · +263</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle right={<Note>Read-only badge</Note>}>
            <span className="flex items-center gap-2"><MessageCircle size={14} /> WhatsApp connection</span>
          </CardTitle>
          <div className="flex items-center justify-between rounded-lg border border-wf-line px-3 py-2.5">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-wf-ink">
                Connected · +263 77 ••• ••12
                <span className="rounded-full bg-wf-fill px-2 py-0.5 text-[10px] font-semibold text-wf-mid">READ-ONLY</span>
              </div>
              <div className="mt-0.5 text-xs text-wf-mid">Last sync 4 minutes ago · send, react &amp; typing disabled</div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-wf-dark" />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-wf-faint">
            The assistant reads followed conversations to suggest updates. It can never send a message from your number.
          </p>
        </Card>

        <Card>
          <CardTitle><span className="flex items-center gap-2"><ShieldCheck size={14} /> Data &amp; consent</span></CardTitle>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-wf-faint">
            Followed conversations · {followed.length}
          </div>
          <ul className="divide-y divide-wf-line">
            {followed.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-wf-ink">{s.name}</span>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-wf-mid underline">Unfollow</button>
                  <button className="flex items-center gap-1 text-xs text-wf-faint underline">
                    <Trash2 size={11} /> Delete data
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
