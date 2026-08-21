import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileText,
  Send,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import {
  ActionCard,
  EmptyState,
  Eyebrow,
  MatchRing,
  NavTile,
  Panel,
  StatusPill,
  Tag,
} from "@/components/ui-bits";
import dashboardNs from "@/lib/i18n/ns/dashboard";

const dashboardHeadTitle = dashboardNs.en.headTitle;
const dashboardHeadDescription = dashboardNs.en.headDescription;

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: dashboardHeadTitle },
      { name: "description", content: dashboardHeadDescription },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomePage,
});

function QuickTiles({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <NavTile to="/app/cv" icon={<FileText className="size-6" />} label={t("nav.masterCv")} />
      <NavTile
        to="/app/jobs"
        tone="accent"
        icon={<Briefcase className="size-6" />}
        label={t("nav.jobs")}
      />
      <NavTile
        to="/app/applications"
        tone="success"
        icon={<Send className="size-6" />}
        label={t("nav.applications")}
      />
      <NavTile
        to="/app/profile"
        tone="indigo"
        icon={<User className="size-6" />}
        label={t("nav.profile")}
      />
    </div>
  );
}

function HomePage() {
  const t = useT();
  const { state, jobs, loadDemo } = useWorkspace();
  const cv = state.masterCv;
  const pendingSuggestions = state.suggestions.filter((s) => s.state === "pending");
  const attention = state.applications.filter(
    (a) => a.status === "Interview" || a.status === "Second interview" || a.nextAction,
  );

  if (!cv) {
    return (
      <div className="space-y-6">
        <div>
          <Eyebrow>{t("dashboard.workspaceEyebrow")}</Eyebrow>
          <h1 className="display mt-1 text-3xl sm:text-4xl">{t("dashboard.startTitle")}</h1>
          <p className="mt-2 max-w-prose text-base text-muted-foreground">
            {t("dashboard.startDescription")}
          </p>
        </div>
        <EmptyState
          icon={<FileText className="size-7" />}
          title={t("dashboard.emptyCvTitle")}
          description={t("dashboard.emptyCvDescription")}
          action={
            <button
              onClick={loadDemo}
              className="tap inline-flex items-center gap-2 rounded-2xl border border-border-strong bg-card px-5 text-base font-semibold hover:bg-muted"
            >
              {t("dashboard.exploreSampleData")}
            </button>
          }
        />
      </div>
    );
  }

  const topJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  return (
    <div className="space-y-7">
      <header>
        <Eyebrow>{t("dashboard.workspaceEyebrow")}</Eyebrow>
        <h1 className="display mt-1 text-[2rem] leading-tight sm:text-4xl">
          {t("dashboard.greeting", { name: cv.name.split(" ")[0] ?? cv.name })}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t("dashboard.summaryStats", {
            pending: pendingSuggestions.length,
            attention: attention.length,
          })}
        </p>
      </header>

      {/* One clear primary action */}
      <ActionCard
        to="/app/cv/edit"
        icon={<Sparkles className="size-7" />}
        title={t("dashboard.editAndImprove")}
        description={cv.title}
      />


      <QuickTiles t={t} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Master CV status */}
        <Panel className="lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <Eyebrow>{t("dashboard.masterCvEyebrow")}</Eyebrow>
              <h2 className="display mt-1 truncate text-xl">{cv.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("dashboard.versionUpdated", {
                  version: cv.version,
                  date: new Date(cv.updatedAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  }),
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag tone="match">{t("dashboard.rolesCount", { count: cv.experience.length })}</Tag>
                <Tag tone="key">{t("dashboard.skillsCount", { count: cv.skills.length })}</Tag>
                <Tag>{t("dashboard.educationCount", { count: cv.education.length })}</Tag>
              </div>
            </div>
            <MatchRing value={78} size={64} label={t("dashboard.cvQuality")} />
          </div>
          <div className="mt-5">
            <Link
              to="/app/cv"
              className="tap inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 text-base font-semibold text-secondary-foreground"
            >
              {t("dashboard.openMasterCv")}
            </Link>
          </div>
        </Panel>

        {/* AI recommendations */}
        <Panel>
          <Eyebrow>{t("dashboard.assistantEyebrow")}</Eyebrow>
          <h2 className="display mt-1 text-xl">{t("dashboard.recommendationsTitle")}</h2>
          {pendingSuggestions.length ? (
            <>
              <ul className="mt-3 space-y-2.5">
                {pendingSuggestions.slice(0, 2).map((s) => (
                  <li key={s.id} className="rounded-2xl bg-surface p-4">
                    <p className="text-sm font-bold text-accent">{s.section}</p>
                    <p className="mt-1 text-sm">{s.issue}</p>
                  </li>
                ))}
              </ul>
              <Link
                to="/app/cv/edit"
                search={{ panel: "ai" }}
                className="mt-4 inline-flex items-center gap-1.5 text-base font-bold text-primary"
              >
                {t("dashboard.reviewAll", { count: pendingSuggestions.length })}{" "}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </>
          ) : (
            <p className="mt-3 text-base text-muted-foreground">
              {t("dashboard.noRecommendations")}
            </p>
          )}
        </Panel>
      </div>


      {/* Applications needing attention */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="min-w-0 text-xl">{t("dashboard.needsAttentionTitle")}</h2>
          <Link to="/app/applications" className="shrink-0 text-sm font-semibold text-primary">
            {t("dashboard.allApplications")}
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {attention.length ? (
            attention.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Link
                  to="/app/applications/$appId"
                  params={{ appId: a.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{a.position}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {a.company}
                    </span>
                    {a.nextAction ? (
                      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-accent">
                        <CalendarClock className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {a.nextAction}
                          {a.nextActionDate ? ` · ${a.nextActionDate}` : ""}
                        </span>
                      </span>
                    ) : null}
                  </span>
                  <StatusPill status={a.status} />
                </Link>
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-dashed border-border-strong p-5 text-sm text-muted-foreground">
              {t("dashboard.noFollowUps")}
            </li>
          )}
        </ul>
      </section>

      {/* Recommended jobs */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="min-w-0 text-xl">{t("dashboard.matchedJobsTitle")}</h2>
          <Link to="/app/jobs" className="shrink-0 text-sm font-semibold text-primary">
            {t("dashboard.allJobs")}
          </Link>
        </div>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topJobs.map((j) => (
            <li key={j.id}>
              <Link
                to="/app/jobs/$jobId"
                params={{ jobId: j.id }}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-surface"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{j.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {j.company} · {j.mode}
                    </span>
                  </span>
                  <MatchRing value={j.match} size={44} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.matchingSkills.slice(0, 2).map((s) => (
                    <Tag key={s} tone="match">
                      {s}
                    </Tag>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Progress */}
      <Panel>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <TrendingUp className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg">{t("dashboard.careerProgressTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.progressSummary", {
                applications: state.applications.length,
                docs: state.docs.length,
                saved: state.savedJobIds.length,
              })}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0 text-accent" />
          <p>
            {t("dashboard.assistantDisclaimer")}
          </p>
        </div>
      </Panel>
    </div>
  );
}
