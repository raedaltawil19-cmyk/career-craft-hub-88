import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ErrorState, Eyebrow, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

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
  const t = useT();
  const [method, setMethod] = useState<Method>("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("input");

  const start = () => {
    const hasInput = method === "url" ? url.trim().length > 8 : text.trim().length > 40;
    setPhase("working");
    window.setTimeout(() => setPhase(hasInput ? "done" : "error"), 1200);
  };

  const methods = [
    { id: "paste" as const, label: t("jobs.methodPaste"), icon: Sparkles },
    { id: "upload" as const, label: t("jobs.methodUpload"), icon: FileUp },
    { id: "url" as const, label: t("jobs.methodUrl"), icon: Link2 },
  ];

  return (
    <div className="space-y-5">
      <Link
        to="/app/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> {t("jobs.backToJobsShort")}
      </Link>

      <div>
        <Eyebrow>{t("jobs.analyzeEyebrow")}</Eyebrow>
        <h1 className="display mt-1 text-[1.75rem] sm:text-4xl">{t("jobs.analyzeTitle")}</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">{t("jobs.analyzeIntro")}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {methods.map((m) => (
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
              <span className="text-sm font-medium">{t("jobs.linkToPosting")}</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("jobs.urlPlaceholder")}
                className="tap mt-2 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
              />
              <span className="mt-2 block text-xs text-muted-foreground">{t("jobs.urlHint")}</span>
            </label>
          ) : method === "upload" ? (
            <div className="rounded-xl border border-dashed border-border-strong bg-surface/60 p-6 text-center">
              <FileUp className="mx-auto size-6 text-primary" />
              <p className="mt-2 text-sm font-medium">{t("jobs.dropZoneTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("jobs.dropZoneHint")}</p>
              <label className="tap mt-4 inline-flex cursor-pointer items-center rounded-xl border border-border bg-card px-4 text-sm font-medium">
                {t("jobs.chooseFile")}
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => setText(e.target.files?.[0]?.name ? "x".repeat(60) : "")}
                />
              </label>
              {text ? <p className="mt-3 text-xs text-success">{t("jobs.fileReady")}</p> : null}
            </div>
          ) : (
            <label className="block">
              <span className="text-sm font-medium">{t("jobs.jobDescriptionLabel")}</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={t("jobs.jobDescriptionPlaceholder")}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-primary"
              />
            </label>
          )}

          {phase === "error" ? (
            <div className="mt-4">
              <ErrorState
                title={t("jobs.couldNotAnalyzeTitle")}
                description={t("jobs.couldNotAnalyzeDescription")}
                onRetry={() => setPhase("input")}
              />
            </div>
          ) : null}

          <button
            onClick={start}
            className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("jobs.analyzePosting")}
          </button>
        </Panel>
      ) : null}

      {phase === "working" ? (
        <Panel className="text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm font-medium">{t("jobs.readingPosting")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("jobs.extracting")}</p>
        </Panel>
      ) : null}

      {phase === "done" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg">{t("jobs.extractedRequirements")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground/85">
              <li>{t("jobs.extractedReq1")}</li>
              <li>{t("jobs.extractedReq2")}</li>
              <li>{t("jobs.extractedReq3")}</li>
              <li>{t("jobs.extractedReq4")}</li>
            </ul>
            <h3 className="eyebrow mt-5">{t("jobs.keywords")}</h3>
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
            <h2 className="text-lg">{t("jobs.comparedWithMasterCv")}</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="eyebrow">{t("jobs.strong")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Tag tone="match">{t("jobs.designSystems")}</Tag>
                  <Tag tone="match">{t("jobs.userResearch")}</Tag>
                </div>
              </div>
              <div>
                <p className="eyebrow">{t("jobs.gapsToAddress")}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Tag tone="gap">{t("jobs.stakeholderExamples")}</Tag>
                  <Tag tone="gap">{t("jobs.measurableOutcomes")}</Tag>
                </div>
              </div>
            </div>
            <Link
              to="/app/tailor/$jobId"
              params={{ jobId: "job-1" }}
              className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="size-4" /> {t("jobs.tailorMyCvForThis")}
            </Link>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
