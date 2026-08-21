import { Sparkles } from "lucide-react";
import type { Suggestion } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { FloatingWindow } from "./floating-window";
import { SuggestionList } from "./suggestion-list";

/** General "improve my CV" window with the recommendation list. */
export function ImproveWindow({
  suggestions,
  onApply,
  onReject,
  onClose,
}: {
  suggestions: Suggestion[];
  onApply: (id: string, text: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const done = suggestions.filter((s) => s.state !== "pending").length;

  return (
    <FloatingWindow
      title={t("ws.recTitle")}
      subtitle={t("ws.recSubtitle")}
      icon={<Sparkles className="size-4.5" />}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {t("ws.recCount", { done, total: suggestions.length })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="tap rounded-2xl border border-border-strong bg-card px-4 text-sm font-bold hover:bg-muted"
          >
            {t("ws.close")}
          </button>
        </div>
      }
    >
      <SuggestionList suggestions={suggestions} onApply={onApply} onReject={onReject} />
      {done ? <p className="mt-4 text-xs text-muted-foreground">{t("ws.sending")}</p> : null}
    </FloatingWindow>
  );
}
