/**
 * Gate-2 suggestion card (handoff §1.4-6) — the consent surface.
 * Lo-fi: grey left rule stands in for the terracotta rule.
 */
import { Chip, Note } from "./ui";
import type { Suggestion } from "@/lib/sampleData";
import { schoolById } from "@/lib/sampleData";

export function SuggestionCard({ s, showSchool = false }: { s: Suggestion; showSchool?: boolean }) {
  const school = schoolById(s.schoolId);
  return (
    <div className="rounded-xl border border-wf-line border-l-4 border-l-wf-dark bg-wf-card p-3.5">
      <div className="flex items-center justify-between">
        <Chip dot>{s.type}</Chip>
        {showSchool && school && <span className="text-[11px] text-wf-mid">{school.name}</span>}
      </div>
      <div className="mt-2 text-sm font-medium text-wf-ink">{s.proposal}</div>
      <p className="mt-1 text-xs leading-snug text-wf-mid">{s.rationale}</p>
      <div className="mt-2 rounded-lg bg-wf-fill px-2.5 py-1.5 text-[11px] italic text-wf-mid">
        WhatsApp · “{s.sourceSnippet}”
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <button className="rounded-lg bg-wf-dark px-3 py-1.5 text-xs font-semibold text-white">Accept</button>
        <button className="rounded-lg border border-wf-line px-3 py-1.5 text-xs font-medium text-wf-mid">Dismiss</button>
      </div>
    </div>
  );
}

export function SuggestionCardNote() {
  return <Note>Suggestion card · Gate 2</Note>;
}
