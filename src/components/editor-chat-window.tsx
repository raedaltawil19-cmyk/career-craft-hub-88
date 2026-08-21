import { useState } from "react";
import { Check, MessageSquare, Send } from "lucide-react";
import { useT } from "@/lib/i18n";
import { FloatingWindow } from "./floating-window";

type Turn = {
  id: string;
  instruction: string;
  proposal: string;
  applied: boolean;
};

/**
 * AI editing assistant: the user writes an instruction, the assistant proposes a
 * rewritten text and the user confirms it with a check button.
 */
export function EditorChatWindow({
  baseText,
  onApply,
  onClose,
}: {
  baseText: string;
  onApply: (text: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const send = () => {
    const instruction = input.trim();
    if (!instruction) return;
    const proposal = propose(baseText, instruction);
    setTurns((x) => [
      ...x,
      { id: `turn-${x.length + 1}-${Date.now()}`, instruction, proposal, applied: false },
    ]);
    setInput("");
  };

  return (
    <FloatingWindow
      title={t("ws.chatTitle")}
      icon={<MessageSquare className="size-4.5" />}
      onClose={onClose}
      width={480}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ws.chatPlaceholder")}
            className="tap min-w-0 flex-1 rounded-2xl border border-border-strong bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            aria-label={t("ws.chatSend")}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Send className="size-4.5 rtl:-scale-x-100" />
          </button>
        </form>
      }
    >
      <p className="rounded-2xl bg-muted p-3 text-sm leading-relaxed text-muted-foreground">
        {t("ws.chatIntro")}
      </p>
      <ul className="mt-4 space-y-4">
        {turns.map((turn) => (
          <li key={turn.id} className="space-y-2">
            <p className="ms-auto w-fit max-w-[85%] rounded-2xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
              {turn.instruction}
            </p>
            <div className="w-fit max-w-[92%] rounded-2xl border border-border bg-background p-3">
              <p className="eyebrow mb-1.5">{t("ws.chatProposal")}</p>
              <p className="text-sm leading-relaxed">{turn.proposal}</p>
              <button
                type="button"
                disabled={turn.applied}
                onClick={() => {
                  onApply(turn.proposal);
                  setTurns((x) =>
                    x.map((y) => (y.id === turn.id ? { ...y, applied: true } : y)),
                  );
                }}
                className="tap mt-3 inline-flex items-center gap-2 rounded-xl bg-success-soft px-3 text-sm font-bold text-success disabled:opacity-70"
              >
                <Check className="size-4" />
                {turn.applied ? t("ws.chatApplied") : t("ws.chatApply")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </FloatingWindow>
  );
}

/** Local, deterministic rewrite preview (no invented facts). */
function propose(base: string, instruction: string): string {
  const sentences = base.split(/(?<=\.)\s+/).filter(Boolean);
  const lower = instruction.toLowerCase();
  if (/short|kort|اختصر|قصير/.test(lower)) {
    return sentences.slice(0, 1).join(" ") || base;
  }
  if (/keyword|nyckelord|كلمات|مفتاح/.test(lower)) {
    return base;
  }
  return sentences.join(" ");
}
