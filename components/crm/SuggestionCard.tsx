"use client";

/**
 * Gate-2 suggestion card (§1.4-6 + addendum §7) — the product's trust story.
 * Terracotta left rule, type chip, plain-English rationale, quoted WhatsApp
 * source (conversation trigger) or suggested wording with an
 * "Open in WhatsApp" prefill (time trigger, §10 — the human sends).
 */
import { Clock, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, type ChipTone } from "@/components/ui/chip";
import type { Suggestion, SuggestionType } from "@/lib/sampleData";
import { schoolById, userById, waLink } from "@/lib/sampleData";
import { usePrototype } from "./store";

const TYPE_TONE: Record<SuggestionType, ChipTone> = {
  "Stage change": "terra",
  "Task done": "success",
  "New task": "gold",
  "Follow-up": "amber",
};

export function SuggestionCard({
  s, showSchool = false, compact = false,
}: { s: Suggestion; showSchool?: boolean; compact?: boolean }) {
  const { acceptSuggestion, dismissSuggestion } = usePrototype();
  const school = schoolById(s.schoolId);
  const assignee = userById(s.assignedTo);
  return (
    <div className="animate-slide-fade-in rounded-xl border border-line border-l-[3px] border-l-terra bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Chip tone={TYPE_TONE[s.type]} dot>{s.type}</Chip>
          {s.trigger === "time_in_pipeline" && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-faint" title="Raised by time-in-pipeline">
              <Clock size={10} /> timed
            </span>
          )}
        </div>
        {showSchool && school && (
          <span className="truncate text-[11px] text-muted">{school.name}</span>
        )}
      </div>
      <div className="mt-2 text-sm font-medium leading-snug text-body">{s.proposal}</div>
      {!compact && <p className="mt-1 text-xs leading-snug text-muted">{s.rationale}</p>}
      {s.sourceSnippet && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-green-soft px-2.5 py-1.5">
          <MessageCircle size={11} className="mt-0.5 shrink-0 text-success" />
          <span className="text-[11px] italic leading-snug text-muted">“{s.sourceSnippet}”</span>
        </div>
      )}
      {s.suggestedWording && (
        <div className="mt-2 rounded-lg border border-dashed border-faint/50 bg-cream px-2.5 py-2">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-faint">Suggested wording</div>
          <p className="text-[11px] leading-relaxed text-body">{s.suggestedWording}</p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="success" size="md" onClick={() => acceptSuggestion(s.id)}>Accept</Button>
        <Button variant="ghost" size="md" onClick={() => dismissSuggestion(s.id)}>Dismiss</Button>
        {s.suggestedWording && school && (
          <a
            href={waLink(school.phone, s.suggestedWording)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-success/40 px-3 py-1.5 text-xs font-medium text-success transition-colors duration-150 hover:bg-green-soft"
          >
            <ExternalLink size={12} /> Open in WhatsApp
          </a>
        )}
        {assignee && (
          <span className="ml-auto text-[10px] text-faint" title={`Routed to ${assignee.name}`}>
            → {assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
}
