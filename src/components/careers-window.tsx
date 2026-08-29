import { Briefcase, Compass, Target } from "lucide-react";
import type { CareerSuggestion } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { FloatingWindow } from "./floating-window";

/**
 * Floating window listing suggested career paths. Each path offers a primary
 * "see available jobs" action (opens the jobs list filtered by that path) and
 * a secondary tailor action.
 */
export function CareersWindow({
  careers,
  onOpenJobs,
  onTailor,
  onClose,
}: {
  careers: CareerSuggestion[];
  onOpenJobs: (career: CareerSuggestion) => void;
  onTailor: (career: CareerSuggestion) => void;
  onClose: () => void;
}) {
  const t = useT();

  return (
    <FloatingWindow
      title={t("ws.careersWindowTitle")}
      subtitle={t("ws.careersWindowHint")}
      icon={<Compass className="size-4.5" />}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
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
      <ul className="space-y-3">
        {careers.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 text-base font-bold">{c.title}</p>
              <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
                {c.match}% {t("ws.matchLabel")}
              </span>
            </div>
            <p className="eyebrow mt-2">{t("ws.whyFit")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.why}</p>
            {c.transferable.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {c.transferable.map((s) => (
                  <li key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {s}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              <Briefcase className="size-3.5" /> {t("ws.jobsInCareer")}: {c.openings}
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => onOpenJobs(c)}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-bold text-primary-foreground"
              >
                <Briefcase className="size-4" /> {t("ws.viewOpenJobs")}
              </button>
              <button
                type="button"
                onClick={() => onTailor(c)}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border-strong bg-card px-3 text-sm font-bold hover:bg-muted"
              >
                <Target className="size-4" /> {t("ws.tailorForCareer")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </FloatingWindow>
  );
}
