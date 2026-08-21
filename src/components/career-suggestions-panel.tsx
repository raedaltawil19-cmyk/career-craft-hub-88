import { Briefcase, Compass, Target } from "lucide-react";
import type { CareerSuggestion, Job } from "@/lib/career-types";
import { useT } from "@/lib/i18n";

/** "Other careers that fit you" panel with a tailor action per career. */
export function CareerSuggestionsPanel({
  careers,
  onTailor,
  onOpenJobs,
}: {
  careers: CareerSuggestion[];
  onTailor: (career: CareerSuggestion) => void;
  onOpenJobs: () => void;
}) {
  const t = useT();
  return (
    <section className="tile p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Compass className="size-5.5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight">{t("ws.careersTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("ws.careersHint")}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
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
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              <Briefcase className="size-3.5" /> {t("ws.jobsInCareer")}: {c.openings}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onTailor(c)}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-bold text-primary-foreground"
              >
                <Target className="size-4" /> {t("ws.tailorForCareer")}
              </button>
              <button
                type="button"
                onClick={onOpenJobs}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border-strong bg-card px-3 text-sm font-bold hover:bg-muted"
              >
                {t("ws.viewJobs")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Side panel of similar jobs shown after improvements are applied. */
export function SimilarJobsPanel({ jobs, onOpenJobs }: { jobs: Job[]; onOpenJobs: () => void }) {
  const t = useT();
  return (
    <section className="tile p-5">
      <h2 className="text-lg font-bold leading-tight">{t("ws.similarJobsTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("ws.similarJobsHint")}</p>
      <ul className="mt-4 space-y-2">
        {jobs.map((j) => (
          <li
            key={j.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Briefcase className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{j.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {j.company} · {j.location}
              </span>
            </span>
            <span className="shrink-0 text-xs font-bold tabular-nums text-primary">{j.match}%</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onOpenJobs}
        className="tap mt-4 w-full rounded-2xl border border-border-strong bg-card px-4 text-sm font-bold hover:bg-muted"
      >
        {t("ws.viewJobs")}
      </button>
    </section>
  );
}
