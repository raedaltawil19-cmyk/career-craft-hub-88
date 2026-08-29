import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Filter, Link2, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, MatchRing, PageHeader, Panel } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const searchSchema = z.object({
  career: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/app/jobs/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Jobs — Smart CV" },
      { name: "description", content: "Roles matched against your Master CV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobsPage,
});

const filters = ["All", "Remote", "Hybrid", "On-site", "Saved"] as const;

function JobsPage() {
  const t = useT();
  const { jobs, state, careers, toggleSavedJob } = useWorkspace();
  const { career } = Route.useSearch();
  const activeCareer = careers.find((c) => c.id === career);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filterLabels: Record<(typeof filters)[number], string> = {
    All: t("jobs.filterAll"),
    Remote: t("jobs.filterRemote"),
    Hybrid: t("jobs.filterHybrid"),
    "On-site": t("jobs.filterOnSite"),
    Saved: t("jobs.filterSaved"),
  };

  const visible = useMemo(() => {
    return jobs
      .filter((j) => (career ? (j.careerIds ?? []).includes(career) : true))
      .filter((j) =>
        filter === "All"
          ? true
          : filter === "Saved"
            ? state.savedJobIds.includes(j.id)
            : j.mode === filter,
      )
      .filter((j) =>
        query.trim()
          ? `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => b.match - a.match);
  }, [jobs, filter, query, career, state.savedJobIds]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("jobs.eyebrowDiscovery")}
        title={t("jobs.title")}
        description={t("jobs.description")}
        action={
          <Link
            to="/app/jobs/analyze"
            className="tap inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted sm:rounded-xl sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Link2 className="size-3.5 sm:size-4" /> {t("jobs.analyzeAPosting")}
          </Link>
        }
      />

      <div className="space-y-4">
        <label className="relative block">
          <span className="sr-only">{t("jobs.searchJobs")}</span>
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("jobs.searchPlaceholder")}
            className="tap w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:gap-2 sm:px-0">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Filter className="size-3.5" />
          </span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:py-2 sm:text-sm",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {activeCareer ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft/60 px-4 py-3">
          <p className="min-w-0 text-sm font-semibold text-primary">
            {t("jobs.careerFilterLabel", { career: activeCareer.title })}
          </p>
          <Link
            to="/app/jobs"
            search={{ career: undefined }}
            className="shrink-0 rounded-full border border-primary/40 bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted"
          >
            {t("jobs.clearCareerFilter")}
          </Link>
        </div>
      ) : null}

      {visible.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {visible.map((j) => {
            const saved = state.savedJobIds.includes(j.id);
            return (
              <li key={j.id}>
                <Panel className="h-full p-0">
                  <Link
                    to="/app/jobs/$jobId"
                    params={{ jobId: j.id }}
                    className="block rounded-2xl p-4 sm:p-5"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg leading-snug">
                          <span className="font-semibold sm:font-normal">{j.title}</span>
                        </h2>
                        <p className="truncate text-sm text-muted-foreground">
                          {j.company} · {j.location}
                        </p>
                        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                          {j.mode} · {j.posted} · {j.source}
                        </p>
                      </div>
                      <div className="origin-top-right scale-[0.78] sm:scale-100">
                        <MatchRing value={j.match} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground sm:hidden">
                      {j.mode} · {j.posted}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                      {j.salary ? (
                        <>
                          <Wallet className="size-3.5 text-primary" />
                          {j.salary}
                        </>
                      ) : (
                        t("jobs.salaryNotDisclosed")
                      )}
                    </span>
                    <button
                      onClick={() => toggleSavedJob(j.id)}
                      aria-pressed={saved}
                      className="tap inline-flex items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-primary sm:text-sm"
                    >
                      {saved ? (
                        <BookmarkCheck className="size-4" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                      {saved ? t("jobs.saved") : t("jobs.save")}
                    </button>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<Search className="size-5" />}
          title={t("jobs.emptyListTitle")}
          description={t("jobs.emptyListDescription")}
        />
      )}
    </div>
  );
}
