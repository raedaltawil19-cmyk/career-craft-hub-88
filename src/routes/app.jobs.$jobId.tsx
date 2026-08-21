import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, Eyebrow, MatchRing, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

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
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, state, toggleSavedJob, addApplication } = useWorkspace();
  const job = jobs.find((j) => j.id === jobId);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        description="This posting is no longer in your workspace."
        action={
          <Link to="/app/jobs" className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium">
            Back to jobs
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
        <ArrowLeft className="size-4" /> Jobs
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
          <Sparkles className="size-4" /> Tailor my CV
        </Link>
        <button
          onClick={() => toggleSavedJob(job.id)}
          className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? "Saved" : "Save"}
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
                    label: "Saved from job discovery",
                  },
                ],
              });
              navigate({ to: "/app/applications" });
            }}
            className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            Track application
          </button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="Job sections"
        className="flex gap-1 rounded-xl border border-border bg-surface p-1"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "tap flex-1 rounded-lg px-3 text-sm font-medium transition-colors",
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h2 className="text-xl">About the role</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{job.summary}</p>
            <h3 className="eyebrow mt-5">Responsibilities</h3>
            <ul className="mt-2 space-y-1.5">
              {job.responsibilities.map((r) => (
                <li
                  key={r}
                  className="relative pl-4 text-sm leading-relaxed text-foreground/85 before:absolute before:left-0 before:top-2.5 before:size-1 before:rounded-full before:bg-accent"
                >
                  {r}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="text-lg">Facts</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Fact label="Experience" value={job.experienceRequirement} />
              <Fact label="Working mode" value={job.mode} />
              <Fact label="Location" value={job.location} />
              <Fact label="Salary" value={job.salary ?? "Not disclosed"} />
              <Fact label="Source" value={job.source} />
            </dl>
          </Panel>
        </div>
      ) : null}

      {tab === "Analysis" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg">Required</h2>
            <ul className="mt-3 space-y-2">
              {job.required.map((r) => (
                <li key={r} className="flex gap-2 text-sm">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-5 text-lg">Preferred</h2>
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
            <h2 className="text-lg">Keywords the employer uses</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.keywords.map((k) => (
                <Tag key={k} tone="key">
                  {k}
                </Tag>
              ))}
            </div>
            <h3 className="eyebrow mt-5">Employer expectations</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              A senior contributor who can work across research, design and system contribution
              without hand-holding, and who can explain trade-offs to non-designers.
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
                  Comparison of your Master CV against this posting. The score is an aid for
                  prioritising, not a decision.
                </p>
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-3">
              <MatchGroup
                title="Strong matches"
                tone="match"
                icon={<CircleCheck className="size-4 text-success" />}
                items={job.matchingSkills}
              />
              <MatchGroup
                title="Transferable"
                tone="neutral"
                icon={<CircleDashed className="size-4 text-muted-foreground" />}
                items={cv.skills.filter((s) => !job.matchingSkills.includes(s)).slice(0, 4)}
              />
              <MatchGroup
                title="Missing / to address"
                tone="gap"
                icon={<CircleAlert className="size-4 text-warning" />}
                items={job.gaps}
              />
            </div>
            <Panel>
              <h2 className="text-lg">Recommended changes</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                <li>Lead the summary with payments-adjacent experience you already have.</li>
                <li>Surface the design system bullet higher — it maps to a core requirement.</li>
                <li>
                  Mention mentoring only if it reflects your real work; the posting asks for it.
                </li>
              </ul>
              <Link
                to="/app/tailor/$jobId"
                params={{ jobId: job.id }}
                className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <Sparkles className="size-4" /> Start tailoring
              </Link>
            </Panel>
          </div>
        ) : (
          <EmptyState
            title="No Master CV to compare"
            description="Add a CV with the + button to unlock matching for this role."
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
}: {
  title: string;
  items: string[];
  tone: "match" | "gap" | "neutral";
  icon: React.ReactNode;
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
        <p className="mt-3 text-sm text-muted-foreground">Nothing in this group.</p>
      )}
    </Panel>
  );
}
