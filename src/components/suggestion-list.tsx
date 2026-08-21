import { useState } from "react";
import { Check, Eye, Pencil, X } from "lucide-react";
import type { Suggestion } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Recommendation list with a per-item preview dialog (before / after) offering
 * apply, edit and reject. Pure component: all changes are reported via callbacks.
 */
export function SuggestionList({
  suggestions,
  onApply,
  onReject,
}: {
  suggestions: Suggestion[];
  onApply: (id: string, text: string) => void;
  onReject: (id: string) => void;
}) {
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = suggestions.find((s) => s.id === openId) ?? null;

  if (!suggestions.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("ws.recEmpty")}</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className={cn(
              "rounded-2xl border border-border bg-background p-4",
              s.state !== "pending" && "opacity-70",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.section}
                </p>
                <p className="mt-1 text-sm font-bold leading-snug">{s.issue}</p>
              </div>
              {s.state !== "pending" ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold",
                    s.state === "accepted"
                      ? "bg-success-soft text-success"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {s.state === "accepted" ? t("ws.statusApplied") : t("ws.statusRejected")}
                </span>
              ) : null}
            </div>
            {s.state === "pending" ? (
              <button
                type="button"
                onClick={() => setOpenId(s.id)}
                className="tap mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-strong bg-card px-4 text-sm font-bold hover:bg-muted"
              >
                <Eye className="size-4" /> {t("ws.preview")}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {open ? (
        <PreviewDialog
          suggestion={open}
          onClose={() => setOpenId(null)}
          onApply={(text) => {
            onApply(open.id, text);
            setOpenId(null);
          }}
          onReject={() => {
            onReject(open.id);
            setOpenId(null);
          }}
        />
      ) : null}
    </>
  );
}

function PreviewDialog({
  suggestion,
  onClose,
  onApply,
  onReject,
}: {
  suggestion: Suggestion;
  onClose: () => void;
  onApply: (text: string) => void;
  onReject: () => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(suggestion.after);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("ws.previewTitle")}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card sm:m-4 sm:max-w-lg sm:rounded-3xl"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold">{t("ws.previewTitle")}</h3>
          <button
            type="button"
            aria-label={t("ws.close")}
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div>
            <p className="eyebrow mb-1.5">{t("ws.before")}</p>
            <p className="rounded-2xl bg-muted p-3 text-sm leading-relaxed text-foreground/80">
              {suggestion.before}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1.5">{t("ws.after")}</p>
            {editing ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-border-strong bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary"
              />
            ) : (
              <p className="rounded-2xl bg-success-soft p-3 text-sm leading-relaxed text-foreground">
                {text}
              </p>
            )}
          </div>
          <div>
            <p className="eyebrow mb-1.5">{t("ws.why")}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{suggestion.rationale}</p>
          </div>
        </div>

        <div className="grid gap-2 border-t border-border px-4 py-3 pb-safe">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => onApply(text)}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground"
              >
                <Check className="size-5" /> {t("ws.saveEdit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setText(suggestion.after);
                }}
                className="tap rounded-2xl border border-border-strong bg-card px-4 text-base font-bold hover:bg-muted"
              >
                {t("ws.cancelEdit")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onApply(text)}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground"
              >
                <Check className="size-5" /> {t("ws.applyRec")}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border-strong bg-card px-3 text-sm font-bold hover:bg-muted"
                >
                  <Pencil className="size-4" /> {t("ws.editRec")}
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-3 text-sm font-bold text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" /> {t("ws.rejectRec")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
