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

  const submit = () => {
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
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={t("ws.intakePlaceholder")}
          className="w-full resize-y rounded-xl border border-border bg-background p-3.5 pl-14 text-sm leading-relaxed outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label={t("ws.intakeMore")}
          title={t("ws.intakeMore")}
          className="tap absolute bottom-4 left-4 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90"
        >
          <Plus className="size-5" aria-hidden />
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

      <AddCvSheet open={sheetOpen} onClose={() => setSheetOpen(false)} exclude={["paste"]} />
    </section>
  );
}
