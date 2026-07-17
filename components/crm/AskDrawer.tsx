"use client";

/**
 * "Ask" drawer (§3): ~420px right overlay over any screen, ⌘J, dimmed page
 * behind. Reads and drafts freely; any proposed mutation renders as an
 * inline Gate-2 suggestion card — the chat never writes silently.
 * Phase A: scripted exchanges over sample data.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Sparkles, Send, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { waLink } from "@/lib/sampleData";
import { usePrototype } from "./store";
import { useCrmActions, usePendingSuggestions } from "./data";
import { cn } from "@/lib/utils";

const HIGHFIELD_DRAFT =
  "Good morning Mrs. Sibanda — following Tuesday's demo with your ICT committee, here's the quote for 8 boards across the two labs. Happy to walk the bursar through it, and to show you the same setup running at The Lookeron School.";

interface ChatMsg {
  id: number;
  who: "you" | "ai";
  body: ReactNode;
}

const QUICK_PROMPTS = [
  "How's the pipeline this week?",
  "Which deals need my attention?",
  "What did Greendale last say?",
  "Draft a follow-up for Highfield",
] as const;

function StatRow({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-2 space-y-1">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center justify-between rounded-md bg-white/70 px-2.5 py-1.5 text-[11px]">
          <span className="text-muted">{label}</span>
          <span className="font-semibold tabular-nums text-body">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** Inline Gate-2 card inside the chat; Accept routes through the same Convex mutations as everywhere else. */
function InlineSuggestion() {
  const suggestions = usePendingSuggestions();
  const { acceptSuggestion, dismissSuggestion } = useCrmActions();
  if (suggestions === undefined) {
    return <div className="rounded-xl bg-cream px-3 py-2 text-[11px] text-faint">Checking the queue…</div>;
  }
  const s = suggestions.find(
    (x) => x.type === "Stage change" && x.schoolName.startsWith("Greendale")
  );
  if (!s) {
    return (
      <div className="rounded-xl border border-line bg-green-soft px-3 py-2 text-[11px] text-green">
        Already handled — that suggestion is no longer pending.
      </div>
    );
  }
  return (
    <div className="animate-slide-fade-in rounded-xl border border-line border-l-[3px] border-l-terra bg-card p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <Chip tone="terra" dot>Stage change</Chip>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-faint">needs your OK</span>
      </div>
      <div className="mt-1.5 text-xs font-medium text-body">{s.proposal}</div>
      <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-green-soft px-2 py-1.5">
        <MessageCircle size={10} className="mt-0.5 shrink-0 text-success" />
        <span className="text-[10px] italic text-muted">“{s.sourceSnippet}”</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="success" size="sm" onClick={() => acceptSuggestion(s._id)}>Accept</Button>
        <Button variant="ghost" size="sm" onClick={() => dismissSuggestion(s._id)}>Dismiss</Button>
      </div>
      <div className="mt-1.5 text-[10px] text-faint">Also mirrored to the Review Queue.</div>
    </div>
  );
}

const SCRIPTS: Record<string, ReactNode> = {
  [QUICK_PROMPTS[0]]: (
    <>
      <p>Open pipeline is <strong>$108.2k</strong> across 12 deals — $94.8k boards, $13.4k sports. The boards side by bucket:</p>
      <StatRow rows={[["Awaiting Response", "$32.0k"], ["Awaiting Term", "$9.2k"], ["Awaiting Funds", "$6.9k"], ["No Response", "$5.7k"]]} />
      <p className="mt-2">Greendale&rsquo;s finance committee met Thursday — worth a follow-up today.</p>
    </>
  ),
  [QUICK_PROMPTS[1]]: (
    <>
      <p>Three deals are waiting on you:</p>
      <StatRow rows={[["Greendale · committee decision", "$32,000"], ["Northgate · PO in, book install", "$22,500"], ["Highfield · quote requested", "$18,400"]]} />
      <p className="mt-2">There are also 10 suggestions in your Review Queue — two are timed follow-ups with wording ready.</p>
    </>
  ),
  [QUICK_PROMPTS[2]]: (
    <>
      <p>Greendale&rsquo;s last message (Tue 09:41):</p>
      <div className="mt-2 rounded-lg bg-green-soft px-2.5 py-2 text-[11px] italic text-muted">
        “Please send the quote for 14 units, we table it at the finance committee Thursday.”
      </div>
      <p className="mt-2">The quote went out the same day. The committee met Thursday — I&rsquo;ve suggested moving them to Procurement.</p>
    </>
  ),
  [QUICK_PROMPTS[3]]: (
    <>
      <p>Here&rsquo;s a draft — open it in WhatsApp and send it yourself:</p>
      <div className="mt-2 rounded-lg border border-dashed border-faint/50 bg-cream px-2.5 py-2 text-[11px] leading-relaxed text-body">
        {HIGHFIELD_DRAFT}
      </div>
      <a
        href={waLink("263773310290", HIGHFIELD_DRAFT)}
        target="_blank" rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-success/40 px-2.5 py-1.5 text-[11px] font-medium text-success transition-colors hover:bg-green-soft"
      >
        <ExternalLink size={11} /> Open in WhatsApp
      </a>
      <p className="mt-2 text-[11px] text-faint">I draft — you send. Nothing goes out from your number automatically.</p>
    </>
  ),
};

export function AskDrawer() {
  const { askOpen, setAskOpen } = usePrototype();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const push = (who: "you" | "ai", body: ReactNode) => {
    idRef.current += 1;
    setMessages((m) => [...m, { id: idRef.current, who, body }]);
  };

  const ask = (q: string) => {
    push("you", q);
    const scripted = SCRIPTS[q];
    setTimeout(() => {
      if (scripted) {
        push("ai", scripted);
      } else if (/move|stage|procurement/i.test(q)) {
        push("ai", (
          <>
            <p>That matches Greendale&rsquo;s last message. I don&rsquo;t change deals myself — here&rsquo;s the suggestion to approve:</p>
            <div className="mt-2"><InlineSuggestion /></div>
          </>
        ));
      } else {
        push("ai", <p>In the full build I answer this from your live pipeline, threads and tasks. Try one of the quick prompts to see the pattern.</p>);
      }
    }, 350);
  };

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(q);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (askOpen) closeRef.current?.focus();
  }, [askOpen]);

  if (!askOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-ink/30 backdrop-blur-[1px] transition-opacity duration-200"
      onClick={() => setAskOpen(false)}
    >
      <div
        role="dialog" aria-label="Ask assistant" aria-modal="true"
        className="flex h-full w-[420px] max-w-full animate-slide-fade-in flex-col border-l border-line bg-bg shadow-lift"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Escape") setAskOpen(false); }}
      >
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-body">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-terra/10 text-terra"><Sparkles size={15} /></span>
            Ask
          </div>
          <button
            ref={closeRef}
            onClick={() => setAskOpen(false)}
            aria-label="Close"
            className="rounded-lg border border-line p-1.5 transition-colors hover:border-faint"
          >
            <X size={14} className="text-muted" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="rounded-xl bg-card p-3.5 text-xs leading-relaxed text-muted shadow-card">
            Good morning, Emilia. Ask me anything about your schools, deals and conversations —
            I&rsquo;ll answer, draft, and suggest. Changes always wait for your OK.
          </div>
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-full border border-line bg-card px-2.5 py-1 text-[11px] text-muted transition-colors duration-150 hover:border-terra/50 hover:text-terra"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex animate-slide-fade-in", m.who === "you" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                m.who === "you" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-card text-body shadow-card"
              )}>
                {m.body}
              </div>
            </div>
          ))}
          {messages.length > 0 && messages.length < 3 && (
            <button
              onClick={() => ask("Greendale approved the quote — move them to Procurement.")}
              className="rounded-full border border-terra/40 bg-card px-2.5 py-1 text-[11px] text-terra transition-colors hover:bg-terra-soft"
            >
              Greendale approved — move them to Procurement
            </button>
          )}
        </div>

        <div className="border-t border-line bg-card px-5 py-3.5">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 transition-colors focus-within:border-green">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask about schools, deals, threads…"
              className="flex-1 bg-transparent text-xs text-body outline-none placeholder:text-faint"
              aria-label="Ask the assistant"
            />
            <button onClick={send} aria-label="Send" className="rounded-lg bg-green p-1.5 text-white transition-colors hover:bg-ink">
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
