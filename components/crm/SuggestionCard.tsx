"use client";

/**
 * Gate-2 suggestion card (§1.4-6) — the product's trust story.
 * White card, terracotta left rule, type chip, plain-English rationale,
 * quoted WhatsApp snippet, Accept (solid green) / Dismiss (ghost).
 */
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, type ChipTone } from "@/components/ui/chip";
import type { Suggestion, SuggestionType } from "@/lib/sampleData";
import { schoolById } from "@/lib/sampleData";
import { usePrototype } from "./store";

const TYPE_TONE: Record<SuggestionType, ChipTone> = {
  "Stage change": "terra",
  "Task done": "success",
  "New task": "gold",
};

export function SuggestionCard({
  s, showSchool = false, compact = false,
}: { s: Suggestion; showSchool?: boolean; compact?: boolean }) {
  const { acceptSuggestion, dismissSuggestion } = usePrototype();
  const school = schoolById(s.schoolId);
  return (
    <div className="animate-slide-fade-in rounded-xl border border-line border-l-[3px] border-l-terra bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <Chip tone={TYPE_TONE[s.type]} dot>{s.type}</Chip>
        {showSchool && school && (
          <span className="truncate text-[11px] text-muted">{school.name}</span>
        )}
      </div>
      <div className="mt-2 text-sm font-medium leading-snug text-body">{s.proposal}</div>
      {!compact && <p className="mt-1 text-xs leading-snug text-muted">{s.rationale}</p>}
      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-green-soft px-2.5 py-1.5">
        <MessageCircle size={11} className="mt-0.5 shrink-0 text-success" />
        <span className="text-[11px] italic leading-snug text-muted">“{s.sourceSnippet}”</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="success" size="md" onClick={() => acceptSuggestion(s.id)}>Accept</Button>
        <Button variant="ghost" size="md" onClick={() => dismissSuggestion(s.id)}>Dismiss</Button>
      </div>
    </div>
  );
}
