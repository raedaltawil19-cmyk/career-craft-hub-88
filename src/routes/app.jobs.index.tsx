import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Filter, Link2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, MatchRing, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/jobs/")({
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
  const { jobs, state, toggleSavedJob } = useWorkspace();
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
  }, [jobs, filter, query, state.savedJobIds]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("jobs.eyebrowDiscovery")}
        title={t("jobs.title")}
        description={t("jobs.description")}
        action={
          <Link
            to="/app/jobs/analyze"
            className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            <Link2 className="size-4" /> {t("jobs.analyzeAPosting")}
          </Link>
        }
      />

      <div className="space-y-3">
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
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Filter className="size-3.5" />
          </span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {visible.length ? (
        <ul className="grid gap-3 lg:grid-cols-2">
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
                        <h2 className="truncate text-lg leading-snug">{j.title}</h2>
                        <p className="truncate text-sm text-muted-foreground">
                          {j.company} · {j.location}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {j.mode} · {j.posted} · {j.source}
                        </p>
                      </div>
                      <MatchRing value={j.match} />
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {j.matchingSkills.slice(0, 3).map((s) => (
                          <Tag key={s} tone="match">
                            {s}
                          </Tag>
                        ))}
                      </div>
                      {j.gaps.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {j.gaps.map((s) => (
                            <Tag key={s} tone="gap">
                              {t("jobs.gapPrefix", { skill: s })}
                            </Tag>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      {j.salary ?? t("jobs.salaryNotDisclosed")}
                    </span>
                    <button
                      onClick={() => toggleSavedJob(j.id)}
                      aria-pressed={saved}
                      className="tap inline-flex items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary"
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
