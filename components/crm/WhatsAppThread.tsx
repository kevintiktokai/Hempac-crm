/**
 * Captured WhatsApp thread (§1.4-7): read-only, green outbound bubbles,
 * soft-green inbound, timestamp meta. NEVER an input field here.
 */
import { MessageCircle } from "lucide-react";
import type { WhatsAppMessage } from "@/lib/sampleData";
import { cn } from "@/lib/utils";

export function ReadOnlyBadge() {
  return (
    <span className="rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green">
      read-only · captured
    </span>
  );
}

export function WhatsAppThread({
  messages, interleave,
}: { messages: WhatsAppMessage[]; interleave?: { afterIndex: number; text: string }[] }) {
  if (messages.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageCircle size={22} className="mx-auto text-faint" />
        <p className="mt-2 font-serif text-base text-body">No conversation captured yet</p>
        <p className="mt-1 text-xs text-muted">Draft outreach from the Lead Engine to start one.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {messages.map((m, i) => {
        const out = m.dir === "out";
        const event = interleave?.find((e) => e.afterIndex === i);
        return (
          <div key={i}>
            <div className={cn("flex", out ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug shadow-card",
                out ? "rounded-br-md bg-green text-white" : "rounded-bl-md bg-green-soft text-body"
              )}>
                {m.text}
                <div className={cn("mt-1 text-[9px]", out ? "text-white/60" : "text-faint")}>{m.time}</div>
              </div>
            </div>
            {event && (
              <div className="my-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-line" />
                <span className="rounded-full bg-faint/10 px-2 py-0.5 text-[10px] text-muted">{event.text}</span>
                <span className="h-px flex-1 bg-line" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
