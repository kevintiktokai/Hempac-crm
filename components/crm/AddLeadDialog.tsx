"use client";

/**
 * Manual lead entry (client decision, Jul 2026): name, region, phone,
 * pipeline, assignee → creates the school + an Enquiry deal, audit-logged.
 */
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CURRENT_USER, type PipelineType } from "@/lib/sampleData";
import { useCrmActions, useUsers } from "./data";
import { cn } from "@/lib/utils";

export function AddLeadDialog() {
  const users = useUsers();
  const { createLead } = useCrmActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [pipeline, setPipeline] = useState<PipelineType>("boards");
  const [assignee, setAssignee] = useState(CURRENT_USER.initials);

  const submit = async () => {
    if (!name.trim()) return;
    await createLead({
      name: name.trim(),
      region: region.trim(),
      phone: phone.trim() || undefined,
      pipelineType: pipeline,
      assigneeInitials: assignee,
    });
    setName(""); setRegion(""); setPhone("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="success"><UserPlus size={13} /> Add lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-sm font-semibold text-body">Add a lead</DialogTitle>
        <p className="mt-0.5 text-xs text-muted">Logged by you, assigned to a rep, straight into Enquiry.</p>
        <div className="mt-4 space-y-3">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="School / customer name"
            aria-label="Lead name"
            className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-body outline-none transition-colors placeholder:text-faint focus:border-green"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={region} onChange={(e) => setRegion(e.target.value)}
              placeholder="Region (e.g. Harare)"
              aria-label="Region"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-xs text-body outline-none placeholder:text-faint focus:border-green"
            />
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="WhatsApp number (263…)"
              aria-label="Phone"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-xs text-body outline-none placeholder:text-faint focus:border-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Pipeline</span>
              <div className="flex gap-1.5">
                {(["boards", "sports"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPipeline(p)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
                      pipeline === p ? "bg-ink text-white" : "border border-line text-muted hover:text-body"
                    )}
                  >
                    {p === "boards" ? "Smart Boards" : "Sports"}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-faint">Assignee</span>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-2 py-1.5 text-xs text-body outline-none"
              >
                {(users ?? []).map((u) => (
                  <option key={u._id} value={u.initials}>{u.name}</option>
                ))}
              </select>
            </label>
          </div>
          <Button variant="success" size="lg" className="w-full" onClick={() => void submit()} disabled={!name.trim()}>
            Add lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
