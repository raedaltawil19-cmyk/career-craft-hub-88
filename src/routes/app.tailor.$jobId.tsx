import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { ShareCvMenu } from "@/components/share-cv-menu";
import { EmptyState, Eyebrow, MatchRing, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { ApplicationStatus } from "@/lib/career-types";


export const Route = createFileRoute("/app/tailor/$jobId")({
  head: () => ({
    meta: [
      { title: "Tailor your CV — Smart CV" },
      { name: "description", content: "Review proposed changes and generate a tailored CV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TailorPage,
});

type Step = 0 | 1 | 2 | 3;

function TailorPage() {
  const t = useT();
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, state, addTailoredCv } = useWorkspace();
  const job = jobs.find((j) => j.id === jobId);
  const cv = state.masterCv;
  const [step, setStep] = useState<Step>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  const steps = [
    t("tailor.stepAnalyze"),
    t("tailor.stepCompare"),
    t("tailor.stepReview"),
    t("tailor.stepGenerate"),
  ] as const;

  if (!job || !cv) {
    return (
      <EmptyState
        title={t("tailor.cantTailorTitle")}
        description={t("tailor.cantTailorDescription")}
        action={
          <Link to="/app/jobs" className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium">
            {t("tailor.backToJobs")}
          </Link>
        }
      />
    );
  }

  /** Create (or reuse) the tracker entry for this job and return its id. */
  const trackApplication = (status: ApplicationStatus) => {
    const existing = state.applications.find((a) => a.jobId === job.id);
    if (existing) return existing.id;
    const id = `app-${job.id}`;
    const today = new Date().toISOString().slice(0, 10);
    addApplication({
      id,
      jobId: job.id,
      company: job.company,
      position: job.title,
      link: job.applyUrl,
      appliedDate: today,
      cvUsed: `${job.company} — ${job.title}`,
      status,
      notes: "",
      timeline: [{ id: `ev-${id}`, date: today, label: status }],
    });
    return id;
  };


  const changes = [
    {
      id: "c1",
      section: t("tailor.sectionSummary"),
      before: cv.summary,
      after: t("tailor.changeSummaryAfter", { title: cv.title, keyword: job.keywords[0] ?? "" }),
      why: t("tailor.changeSummaryWhy", { keyword: job.keywords[0] ?? "" }),
    },
    {
      id: "c2",
      section: t("tailor.sectionExperienceOrder"),
      before: t("tailor.changeExperienceBefore"),
      after: t("tailor.changeExperienceAfter"),
      why: t("tailor.changeExperienceWhy"),
    },
    {
      id: "c3",
      section: t("tailor.sectionSkills"),
      before: cv.skills.slice(0, 4).join(", "),
      after: t("tailor.changeSkillsAfter", { skills: job.matchingSkills.join(", ") }),
      why: t("tailor.changeSkillsWhy"),
    },
  ];

  const approvedCount = Object.values(approved).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <Link
        to="/app/jobs/$jobId"
        params={{ jobId: job.id }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> {job.title}
      </Link>

      <header>
        <Eyebrow>
          {t("tailor.eyebrowTailoring", { company: job.company, version: cv.version })}
        </Eyebrow>
        <h1 className="display mt-1 text-[1.75rem] sm:text-4xl">{t("tailor.heading")}</h1>
      </header>

      <ol className="grid grid-cols-4 gap-1.5" aria-label={t("tailor.progressLabel")}>
        {steps.map((s, i) => (
          <li key={s} className="min-w-0">
            <div
              className={cn(
                "h-1 rounded-full",
                i <= step ? "bg-primary" : "bg-border",
              )}
            />
            <p
              className={cn(
                "mt-1.5 truncate text-[0.6875rem] font-medium",
                i <= step ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s}
            </p>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <Panel>
          <h2 className="text-lg">{t("tailor.analyzeTitle")}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("tailor.analyzeDescription", { title: job.title, company: job.company })}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.keywords.map((k) => (
              <Tag key={k} tone="key">
                {k}
              </Tag>
            ))}
          </div>
          <button
            onClick={() => {
              setAnalyzing(true);
              window.setTimeout(() => {
                setAnalyzing(false);
                setStep(1);
              }, 1100);
            }}
            className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {analyzing ? t("tailor.analyzing") : t("tailor.analyzeJob")}
          </button>
        </Panel>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Panel>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <MatchRing value={job.match} size={64} />
              <p className="min-w-0 text-sm text-muted-foreground">
                {t("tailor.matchIntro")}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="eyebrow">{t("tailor.strong")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {job.matchingSkills.map((s) => (
                    <Tag key={s} tone="match">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">{t("tailor.transferable")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cv.skills.slice(0, 3).map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">{t("tailor.missing")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {job.gaps.map((s) => (
                    <Tag key={s} tone="gap">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
          <button
            onClick={() => setStep(2)}
            className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("tailor.seeProposedChanges")}
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("tailor.changesApproved", { approved: approvedCount, total: changes.length })}
          </p>
          <ul className="space-y-3">
            {changes.map((c) => (
              <li key={c.id}>
                <Panel className={cn(approved[c.id] && "border-success/40")}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-accent">{c.section}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
                    </div>
                    {approved[c.id] ? <Tag tone="match">{t("tailor.approved")}</Tag> : null}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="rounded-lg bg-muted p-2.5">
                      <p className="eyebrow mb-1">{t("tailor.masterCv")}</p>
                      <p className="text-foreground/75">{c.before}</p>
                    </div>
                    <div className="rounded-lg bg-success-soft p-2.5">
                      <p className="eyebrow mb-1">{t("tailor.tailored")}</p>
                      <p>{c.after}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setApproved((a) => ({ ...a, [c.id]: true }))}
                      className="tap inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="size-4" /> {t("tailor.approve")}
                    </button>
                    <button
                      onClick={() => setApproved((a) => ({ ...a, [c.id]: false }))}
                      className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-medium"
                    >
                      <X className="size-4" /> {t("tailor.skip")}
                    </button>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
          <button
            disabled={approvedCount === 0}
            onClick={() => {
              addTailoredCv({
                id: `cv-${job.id}`,
                name: `${job.company} — ${job.title}`,
                kind: "tailored",
                jobId: job.id,
                updatedAt: new Date().toISOString(),
                score: Math.min(96, job.match + 6),
                data: cv,
              });
              setStep(3);
            }}
            className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {t("tailor.generateTailoredCv")}
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Panel className="border-success/40 bg-success-soft/40">
            <h2 className="text-lg">{t("tailor.createdTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("tailor.createdDescription", { version: cv.version, company: job.company, title: job.title })}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackApplication("Applied")}
                className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {t("tailor.applyNow")}
                <ExternalLink className="size-4" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => {
                  const id = trackApplication("Saved");
                  navigate({ to: "/app/applications/$appId", params: { appId: id } });
                }}
                className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium"
              >
                {t("tailor.trackApplication")}
              </button>
              <ShareCvMenu cv={cv} name={`${job.company} — ${job.title}`} />
            </div>
          </Panel>
          <CvPreview cv={cv} highlight={job.matchingSkills} />
        </div>
      ) : null}

    </div>
  );
}
