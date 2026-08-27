import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, Eyebrow, MatchRing, Panel, Tag } from "@/components/ui-bits";
import { ShareCvMenu } from "@/components/share-cv-menu";
import { formatEdited } from "@/lib/cv-share";
import { cn } from "@/lib/utils";
import { useI18n, useT } from "@/lib/i18n";


export const Route = createFileRoute("/app/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job analysis — Smart CV" },
      { name: "description", content: "Requirements, keywords and match against your Master CV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobDetailPage,
});

const tabs = ["Overview", "Analysis", "Match"] as const;

function JobDetailPage() {
  const t = useT();
  const { locale } = useI18n();
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, state, toggleSavedJob, addApplication } = useWorkspace();
  const job = jobs.find((j) => j.id === jobId);
  const jobDoc = state.docs.find((d) => d.jobId === jobId);
  const jobCv = jobDoc?.data ?? state.masterCv;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");


  const tabLabels: Record<(typeof tabs)[number], string> = {
    Overview: t("jobs.tabOverview"),
    Analysis: t("jobs.tabAnalysis"),
    Match: t("jobs.tabMatch"),
  };

  if (!job) {
    return (
      <EmptyState
        title={t("jobs.jobNotFoundTitle")}
        description={t("jobs.jobNotFoundDescription")}
        action={
          <Link to="/app/jobs" className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium">
            {t("jobs.backToJobs")}
          </Link>
        }
      />
    );
  }

  const saved = state.savedJobIds.includes(job.id);
  const cv = state.masterCv;
  const alreadyTracked = state.applications.some((a) => a.jobId === job.id);

  return (
    <div className="space-y-5">
      <Link
        to="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> {t("jobs.backToJobsShort")}
      </Link>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <Eyebrow>
            {job.mode} · {job.source} · {job.posted}
          </Eyebrow>
          <h1 className="display mt-1 text-[1.75rem] leading-tight sm:text-4xl">{job.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.company} · {job.location}
          </p>
        </div>
        <MatchRing value={job.match} size={64} />
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/app/tailor/$jobId"
          params={{ jobId: job.id }}
          className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Sparkles className="size-4" /> {t("jobs.tailorMyCv")}
        </Link>
        <button
          onClick={() => toggleSavedJob(job.id)}
          className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? t("jobs.saved") : t("jobs.save")}
        </button>
        {!alreadyTracked ? (
          <button
            onClick={() => {
              addApplication({
                id: `app-${Math.random().toString(36).slice(2, 8)}`,
                jobId: job.id,
                company: job.company,
                position: job.title,
                link: "",
                appliedDate: new Date().toISOString().slice(0, 10),
                cvUsed: "Master CV",
                status: "Saved",
                notes: "",
                timeline: [
                  {
                    id: `ev-${Math.random().toString(36).slice(2, 8)}`,
                    date: new Date().toISOString().slice(0, 10),
                    label: t("jobs.trackedFromDiscovery"),
                  },
                ],
              });
              navigate({ to: "/app/applications" });
            }}
            className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            {t("jobs.trackApplication")}
          </button>
        ) : null}
      </div>

      {jobDoc && jobCv ? (
        <Panel className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white">
            <FileText className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{jobDoc.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {t("cv.lastEdited", { date: formatEdited(jobDoc.updatedAt, locale) })}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <ShareCvMenu cv={jobCv} name={jobDoc.name} compact />
            <Link
              to="/app/cv/$docId/view"
              params={{ docId: jobDoc.id }}
              aria-label={t("cv.openAction")}
              className="tap grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"
            >
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
            </Link>
          </span>
        </Panel>
      ) : null}

      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tap inline-flex items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white"
      >
        {t("tailor.applyNow")}
        <ExternalLink className="size-4" aria-hidden />
      </a>



      <div
        role="tablist"
        aria-label={t("jobs.jobSections")}
        className="flex gap-1 rounded-xl border border-border bg-surface p-1"
      >
        {tabs.map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => setTab(tb)}
            className={cn(
              "tap flex-1 rounded-lg px-3 text-sm font-medium transition-colors",
              tab === tb ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
            )}
          >
            {tabLabels[tb]}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h2 className="text-xl">{t("jobs.aboutTheRole")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{job.summary}</p>
            <h3 className="eyebrow mt-5">{t("jobs.responsibilities")}</h3>
            <ul className="mt-2 space-y-1.5">
              {job.responsibilities.map((r) => (
                <li
                  key={r}
                  className="relative ps-4 text-sm leading-relaxed text-foreground/85 before:absolute before:start-0 before:top-2.5 before:size-1 before:rounded-full before:bg-accent"
                >
                  {r}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="text-lg">{t("jobs.facts")}</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Fact label={t("jobs.factExperience")} value={job.experienceRequirement} />
              <Fact label={t("jobs.factWorkingMode")} value={job.mode} />
              <Fact label={t("jobs.factLocation")} value={job.location} />
              <Fact label={t("jobs.factSalary")} value={job.salary ?? t("jobs.notDisclosed")} />
              <Fact label={t("jobs.factSource")} value={job.source} />
            </dl>
          </Panel>
        </div>
      ) : null}

      {tab === "Analysis" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg">{t("jobs.required")}</h2>
            <ul className="mt-3 space-y-2">
              {job.required.map((r) => (
                <li key={r} className="flex gap-2 text-sm">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-5 text-lg">{t("jobs.preferred")}</h2>
            <ul className="mt-3 space-y-2">
              {job.preferred.map((r) => (
                <li key={r} className="flex gap-2 text-sm">
                  <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="text-lg">{t("jobs.keywordsEmployerUses")}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.keywords.map((k) => (
                <Tag key={k} tone="key">
                  {k}
                </Tag>
              ))}
            </div>
            <h3 className="eyebrow mt-5">{t("jobs.employerExpectations")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {t("jobs.employerExpectationsBody")}
            </p>
          </Panel>
        </div>
      ) : null}

      {tab === "Match" ? (
        cv ? (
          <div className="space-y-4">
            <Panel>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <MatchRing value={job.match} size={64} />
                <p className="min-w-0 text-sm text-muted-foreground">
                  {t("jobs.matchComparisonBody")}
                </p>
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-3">
              <MatchGroup
                title={t("jobs.strongMatches")}
                tone="match"
                icon={<CircleCheck className="size-4 text-success" />}
                items={job.matchingSkills}
                emptyLabel={t("jobs.nothingInGroup")}
              />
              <MatchGroup
                title={t("jobs.transferable")}
                tone="neutral"
                icon={<CircleDashed className="size-4 text-muted-foreground" />}
                items={cv.skills.filter((s) => !job.matchingSkills.includes(s)).slice(0, 4)}
                emptyLabel={t("jobs.nothingInGroup")}
              />
              <MatchGroup
                title={t("jobs.missingToAddress")}
                tone="gap"
                icon={<CircleAlert className="size-4 text-warning" />}
                items={job.gaps}
                emptyLabel={t("jobs.nothingInGroup")}
              />
            </div>
            <Panel>
              <h2 className="text-lg">{t("jobs.recommendedChanges")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                <li>{t("jobs.recommendation1")}</li>
                <li>{t("jobs.recommendation2")}</li>
                <li>{t("jobs.recommendation3")}</li>
              </ul>
              <Link
                to="/app/tailor/$jobId"
                params={{ jobId: job.id }}
                className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <Sparkles className="size-4" /> {t("jobs.startTailoring")}
              </Link>
            </Panel>
          </div>
        ) : (
          <EmptyState
            title={t("jobs.noMasterCvTitle")}
            description={t("jobs.noMasterCvDescription")}
          />
        )
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium">{value}</dd>
    </div>
  );
}

function MatchGroup({
  title,
  items,
  tone,
  icon,
  emptyLabel,
}: {
  title: string;
  items: string[];
  tone: "match" | "gap" | "neutral";
  icon: React.ReactNode;
  emptyLabel: string;
}) {
  return (
    <Panel>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {items.map((i) => (
            <Tag key={i} tone={tone}>
              {i}
            </Tag>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </Panel>
  );
}
