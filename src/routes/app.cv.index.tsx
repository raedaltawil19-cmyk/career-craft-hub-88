import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Pencil, Printer, Sparkles } from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, MatchRing, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/cv/")({
  head: () => ({
    meta: [
      { title: "Master CV — Smart CV" },
      { name: "description", content: "Your central career profile and all CV versions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasterCvPage,
});

const templates = [
  { id: "editorial", label: "Editorial" },
  { id: "compact", label: "Compact" },
  { id: "classic", label: "Classic" },
] as const;

function MasterCvPage() {
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv;

  if (!cv) {
    return (
      <EmptyState
        icon={<FileText className="size-5" />}
        title="No Master CV yet"
        description="Use the + action to paste, upload, import or fill in your career profile. Everything else builds on it."
      />
    );
  }

  const pending = state.suggestions.filter((s) => s.state === "pending").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Version ${cv.version} · source of truth`}
        title="Master CV"
        description="Structured career data, not a document. Tailored versions inherit from here."
        action={
          <Link
            to="/app/cv/edit"
            className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Pencil className="size-4" /> Edit
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 lg:order-1">
          <CvPreview cv={cv} />
        </div>

        <div className="order-1 space-y-4 lg:order-2">
          <Panel>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <MatchRing value={78} size={56} label="CV quality" />
              <div className="min-w-0">
                <h2 className="text-base font-semibold">CV quality</h2>
                <p className="text-xs text-muted-foreground">ATS readability: good</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>· Consistent structure detected</li>
              <li>· 2 achievements lack measurable results</li>
              <li>· Mixed date formats</li>
            </ul>
            {pending ? (
              <Link
                to="/app/cv/edit"
                search={{ panel: "ai" }}
                className="tap mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                <Sparkles className="size-4" /> {pending} recommendations
              </Link>
            ) : null}
          </Panel>

          <Panel>
            <h2 className="eyebrow">Template</h2>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateMasterCv({ template: t.id })}
                  className={cn(
                    "tap rounded-xl border px-2 text-sm font-medium",
                    cv.template === t.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => window.print()}
                className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                <Printer className="size-4" /> Print
              </button>
              <button
                onClick={() => window.print()}
                className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                <Download className="size-4" /> PDF
              </button>
            </div>
          </Panel>

          <Panel>
            <h2 className="eyebrow">Versions</h2>
            <ul className="mt-2.5 space-y-2">
              {state.docs.map((d) => (
                <li
                  key={d.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface p-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.kind === "master" ? "Master" : "Tailored"} · {d.updatedAt}
                    </span>
                  </span>
                  <Tag tone={d.score >= 80 ? "match" : "neutral"}>{d.score}</Tag>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
