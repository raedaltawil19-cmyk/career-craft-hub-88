import { useNavigate } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { AddCvSheet } from "@/components/add-cv-sheet";
import { useT } from "@/lib/i18n";

export const INTAKE_TEXT_KEY = "smartcv:intake-text";

/**
 * First-screen CV intake: paste box + a "+" button that opens the other
 * entry methods (upload / LinkedIn / manual). Paste is excluded from the
 * sheet because the box itself already covers it.
 */
export function CvIntake() {
  const t = useT();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState(false);

  const submit = () => {
    if (!text.trim()) {
      setError(true);
      return;
    }
    setError(false);
    try {
      window.sessionStorage.setItem(INTAKE_TEXT_KEY, text);
    } catch {
      /* ignore */
    }
    navigate({ to: "/app/add/$mode", params: { mode: "paste" } });
  };

  return (
    <section aria-label={t("ws.intakeTitle")} className="space-y-3">
      <div className="space-y-1">
        <h2 className="display text-xl leading-snug sm:text-2xl">{t("ws.intakeTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("ws.intakeHint")}</p>
      </div>

      <div className="relative rounded-2xl border border-border-strong bg-card p-3.5 shadow-soft">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) setError(false);
          }}
          rows={7}
          placeholder={t("ws.intakePlaceholder")}
          aria-invalid={error}
          className="w-full resize-y rounded-xl border border-border bg-background p-3.5 pl-14 text-sm leading-relaxed outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label={t("ws.intakeMore")}
          title={t("ws.intakeMore")}
          className="tap absolute bottom-3 left-3 grid size-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm hover:border-border-strong hover:text-foreground"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={submit}
        className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        <Sparkles className="size-5" aria-hidden />
        {t("ws.intakeCreate")}
      </button>

      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {t("ws.intakeEmptyError")}
        </p>
      ) : null}

      <AddCvSheet open={sheetOpen} onClose={() => setSheetOpen(false)} exclude={["paste"]} />
    </section>
  );
}
