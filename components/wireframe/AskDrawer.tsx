"use client";

/**
 * "Ask" drawer (handoff §3): right-side overlay, ~420px, over any screen.
 * Lo-fi shows the scripted exchange incl. one inline Gate-2 suggestion card,
 * so the consent model is visible at the design review.
 */
import { X, Sparkles } from "lucide-react";
import { useShell } from "./Shell";
import { Note } from "./ui";

const QUICK_PROMPTS = [
  "How's the pipeline this week?",
  "Which deals need my attention?",
  "What did Greendale last say?",
  "Draft a follow-up for Highfield",
];

function Bubble({ who, children }: { who: "you" | "ai"; children: React.ReactNode }) {
  const you = who === "you";
  return (
    <div className={`flex ${you ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          you ? "rounded-br-sm bg-wf-dark text-white" : "rounded-bl-sm bg-wf-fill text-wf-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function AskDrawer() {
  const { askOpen, setAskOpen } = useShell();
  if (!askOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setAskOpen(false)}>
      <div
        role="dialog" aria-label="Ask assistant" aria-modal="true"
        className="flex h-full w-[420px] max-w-full flex-col border-l border-wf-line bg-wf-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-wf-line px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-wf-ink">
            <Sparkles size={16} /> Ask
            <Note>Drawer · ⌘J</Note>
          </div>
          <button onClick={() => setAskOpen(false)} aria-label="Close" className="rounded-lg border border-wf-line p-1.5">
            <X size={14} className="text-wf-mid" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="rounded-xl bg-wf-fill p-3 text-xs text-wf-mid">
            Good morning, Emilia. Ask me anything about your schools and pipeline.
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} className="rounded-full border border-wf-line px-2.5 py-1 text-[11px] text-wf-mid">
                {q}
              </button>
            ))}
          </div>

          {/* Scripted exchange 1 — read/summarise */}
          <Bubble who="you">How&rsquo;s the pipeline this week?</Bubble>
          <Bubble who="ai">
            <p>Open pipeline is <strong>$106.8k</strong> across 14 deals. Movement this week:</p>
            <div className="mt-2 space-y-1">
              {["Quote Sent · $36.9k · 3 deals", "Procurement · $22.5k · 1 deal", "Demo Booked · $34.6k · 4 deals"].map((r) => (
                <div key={r} className="rounded-md bg-white/70 px-2 py-1 text-[11px] text-wf-mid">{r}</div>
              ))}
            </div>
            <p className="mt-2">Greendale&rsquo;s finance committee met Thursday — worth a follow-up today.</p>
          </Bubble>

          {/* Scripted exchange 2 — a mutation → inline Gate-2 suggestion card */}
          <Bubble who="you">Greendale approved the quote — move them to Procurement.</Bubble>
          <Bubble who="ai">
            That matches their last message. I don&rsquo;t change deals myself — here&rsquo;s the suggestion to approve:
          </Bubble>
          <div className="rounded-xl border border-wf-line border-l-4 border-l-wf-dark bg-wf-card p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-wf-fill px-2 py-0.5 text-[10px] font-medium text-wf-mid">Stage change</span>
              <Note>Gate 2 · in chat</Note>
            </div>
            <div className="mt-1.5 text-xs font-medium text-wf-ink">Move Greendale Group to Procurement</div>
            <div className="mt-1 rounded-lg bg-wf-fill px-2 py-1 text-[10px] italic text-wf-mid">
              WhatsApp · “…the committee approved the quote on Thursday.”
            </div>
            <div className="mt-2 flex gap-2">
              <button className="rounded-lg bg-wf-dark px-2.5 py-1 text-[11px] font-semibold text-white">Accept</button>
              <button className="rounded-lg border border-wf-line px-2.5 py-1 text-[11px] text-wf-mid">Dismiss</button>
            </div>
            <div className="mt-1.5 text-[10px] text-wf-faint">Also mirrored to the Review Queue.</div>
          </div>
        </div>

        <div className="border-t border-wf-line px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-wf-line px-3 py-2.5">
            <span className="flex-1 text-xs text-wf-faint">Ask about schools, deals, threads…</span>
            <span className="rounded-md bg-wf-fill px-2 py-1 text-[10px] font-semibold text-wf-mid">Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
