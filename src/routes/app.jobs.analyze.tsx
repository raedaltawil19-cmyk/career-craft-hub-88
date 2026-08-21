import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ErrorState, Eyebrow, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/jobs/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a job posting — Smart CV" },
      { name: "description", content: "Paste, upload or link a job posting for analysis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyzePage,
});

type Method = "paste" | "upload" | "url";
type Phase = "input" | "working" | "done" | "error";

function AnalyzePage() {
  const [method, setMethod] = useState<Method>("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("input");

  const start = () => {
    const hasInput = method === "url" ? url.trim().length > 8 : text.trim().length > 40;
    setPhase("working");
    window.setTimeout(() => setPhase(hasInput ? "done" : "error"), 1200);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Jobs
      </Link>

      <div>
        <Eyebrow>Job analysis</Eyebrow>
        <h1 className="display mt-1 text-[1.75rem] sm:text-4xl">Analyze a specific posting</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          The assistant extracts responsibilities, requirements and keywords, then compares them
          with your Master CV. It never invents requirements that aren't in the text.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            { id: "paste", label: "Paste description", icon: Sparkles },
            { id: "upload", label: "Upload file", icon: FileUp },
            { id: "url", label: "Job URL", icon: Link2 },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMethod(m.id);
              setPhase("input");
            }}
            className={cn(
              "tap flex items-center gap-2.5 rounded-xl border px-3.5 text-sm font-medium",
              method === m.id
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            <m.icon className="size-4 shrink-0" />
            {m.label}
          </button>
        ))}
      </div>

      {phase === "input" || phase === "error" ? (
        <Panel>
          {method === "url" ? (
            <label className="block">
              <span className="text-sm font-medium">Link to the posting</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://company.com/careers/role"
                className="tap mt-2 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                Public postings only. If the page can't be read, paste the text instead.
              </span>
            </label>
          ) : method === "upload" ? (
            <div className="rounded-xl border border-dashed border-border-strong bg-surface/60 p-6 text-center">
              <FileUp className="mx-auto size-6 text-primary" />
              <p className="mt-2 text-sm font-medium">Drop the job description here</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX or TXT</p>
              <label className="tap mt-4 inline-flex cursor-pointer items-center rounded-xl border border-border bg-card px-4 text-sm font-medium">
                Choose file
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => setText(e.target.files?.[0]?.name ? "x".repeat(60) : "")}
                />
              </label>
              {text ? <p className="mt-3 text-xs text-success">File ready to analyze</p> : null}
            </div>
          ) : (
            <label className="block">
              <span className="text-sm font-medium">Job description</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Paste the full posting here…"
                className="mt-2 w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-primary"
              />
            </label>
          )}

          {phase === "error" ? (
            <div className="mt-4">
              <ErrorState
                title="Couldn't analyze that"
                description="There wasn't enough text to work with. Paste the full posting, including requirements."
                onRetry={() => setPhase("input")}
              />
            </div>
          ) : null}

          <button
            onClick={start}
            className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Analyze posting
          </button>
        </Panel>
      ) : null}

      {phase === "working" ? (
        <Panel className="text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm font-medium">Reading the posting…</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Extracting responsibilities, requirements and keywords
          </p>
        </Panel>
      ) : null}

      {phase === "done" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg">Extracted requirements</h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground/85">
              <li>6+ years product design experience</li>
              <li>Portfolio with complex, data-heavy products</li>
              <li>Systems thinking and documentation habits</li>
              <li>Comfort working with engineers day to day</li>
            </ul>
            <h3 className="eyebrow mt-5">Keywords</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["design system", "research", "end-to-end", "stakeholders", "accessibility"].map(
                (k) => (
                  <Tag key={k} tone="key">
                    {k}
                  </Tag>
                ),
              )}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-lg">Compared with your Master CV</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="eyebrow">Strong</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Tag tone="match">Design systems</Tag>
                  <Tag tone="match">User research</Tag>
                </div>
              </div>
              <div>
                <p className="eyebrow">Gaps to address</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Tag tone="gap">Stakeholder examples</Tag>
                  <Tag tone="gap">Measurable outcomes</Tag>
                </div>
              </div>
            </div>
            <Link
              to="/app/tailor/$jobId"
              params={{ jobId: "job-1" }}
              className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="size-4" /> Tailor my CV for this
            </Link>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
