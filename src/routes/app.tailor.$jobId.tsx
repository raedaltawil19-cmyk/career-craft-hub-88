import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, Eyebrow, MatchRing, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

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
const steps = ["Analyze", "Compare", "Review changes", "Generate"] as const;

function TailorPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, state, addTailoredCv } = useWorkspace();
  const job = jobs.find((j) => j.id === jobId);
  const cv = state.masterCv;
  const [step, setStep] = useState<Step>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  if (!job || !cv) {
    return (
      <EmptyState
        title="Can't tailor yet"
        description="A Master CV and a selected job are both required for tailoring."
        action={
          <Link to="/app/jobs" className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium">
            Back to jobs
          </Link>
        }
      />
    );
  }

  const changes = [
    {
      id: "c1",
      section: "Summary",
      before: cv.summary,
      after: `${cv.title} with 8 years in fintech and B2B SaaS, focused on ${job.keywords[0]} work and end-to-end delivery for data-heavy products.`,
      why: `Mirrors the posting's language ("${job.keywords[0]}") using facts already in your CV.`,
    },
    {
      id: "c2",
      section: "Experience order",
      before: "Chronological order",
      after: "Move Northlane Fintech design-system work to the top bullet",
      why: "The posting lists systems contribution as a core requirement.",
    },
    {
      id: "c3",
      section: "Skills",
      before: cv.skills.slice(0, 4).join(", "),
      after: `${job.matchingSkills.join(", ")} first, then the rest`,
      why: "Puts the employer's required skills where they are scanned first.",
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
        <ArrowLeft className="size-4" /> {job.title}
      </Link>

      <header>
        <Eyebrow>
          Tailoring · {job.company} · linked to Master CV v{cv.version}
        </Eyebrow>
        <h1 className="display mt-1 text-[1.75rem] sm:text-4xl">Tailored CV</h1>
      </header>

      <ol className="grid grid-cols-4 gap-1.5" aria-label="Tailoring progress">
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
          <h2 className="text-lg">Analyze the posting</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The assistant reads the requirements and keywords for {job.title} at {job.company}.
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
            {analyzing ? "Analyzing…" : "Analyze job"}
          </button>
        </Panel>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Panel>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <MatchRing value={job.match} size={64} />
              <p className="min-w-0 text-sm text-muted-foreground">
                Your Master CV against this posting. Nothing below invents experience you don't
                have.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Strong</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {job.matchingSkills.map((s) => (
                    <Tag key={s} tone="match">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">Transferable</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cv.skills.slice(0, 3).map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">Missing</p>
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
            See proposed changes
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {approvedCount} of {changes.length} changes approved. Nothing is applied until you
            generate.
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
                    {approved[c.id] ? <Tag tone="match">Approved</Tag> : null}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="rounded-lg bg-muted p-2.5">
                      <p className="eyebrow mb-1">Master CV</p>
                      <p className="text-foreground/75">{c.before}</p>
                    </div>
                    <div className="rounded-lg bg-success-soft p-2.5">
                      <p className="eyebrow mb-1">Tailored</p>
                      <p>{c.after}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setApproved((a) => ({ ...a, [c.id]: true }))}
                      className="tap inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="size-4" /> Approve
                    </button>
                    <button
                      onClick={() => setApproved((a) => ({ ...a, [c.id]: false }))}
                      className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-medium"
                    >
                      <X className="size-4" /> Skip
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
                updatedAt: "just now",
                score: Math.min(96, job.match + 6),
              });
              setStep(3);
            }}
            className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Generate tailored CV
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Panel className="border-success/40 bg-success-soft/40">
            <h2 className="text-lg">Tailored CV created</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Linked to Master CV v{cv.version} and to {job.company} · {job.title}. Editing the
              Master CV later will flag this version for review.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/app/applications"
                className="tap inline-flex items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                Track this application
              </Link>
              <button
                onClick={() => navigate({ to: "/app/cv" })}
                className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium"
              >
                All versions
              </button>
            </div>
          </Panel>
          <CvPreview cv={cv} highlight={job.matchingSkills} />
        </div>
      ) : null}
    </div>
  );
}
