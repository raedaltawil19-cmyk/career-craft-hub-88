import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Download, FileText, LayoutTemplate, Pencil, Printer, Sparkles, Target } from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, MatchRing, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
import { CvActionToolbar } from "@/components/cv-action-toolbar";
import {
  CareerSuggestionsPanel,
  SimilarJobsPanel,
} from "@/components/career-suggestions-panel";
import type { CvTemplateId } from "@/lib/career-types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

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

type WindowKind = "improve" | "tailor" | null;

function MasterCvPage() {
  const t = useT();
  const navigate = useNavigate();
  const {
    state,
    jobs,
    careers,
    updateMasterCv,
    setTemplate,
    applySuggestion,
    setSuggestionState,
  } = useWorkspace();
  const cv = state.masterCv;

  const [openWindow, setOpenWindow] = useState<WindowKind>(null);
  const [tailorPreset, setTailorPreset] = useState<string | undefined>(undefined);
  const [showCareers, setShowCareers] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<CvTemplateId | null>(null);

  const templates = [
    { id: "editorial", label: t("cv.templateEditorial") },
    { id: "compact", label: t("cv.templateCompact") },
    { id: "classic", label: t("cv.templateClassic") },
  ] as const;

  if (!cv) {
    return (
      <EmptyState
        icon={<FileText className="size-5" />}
        title={t("cv.emptyMasterCvTitle")}
        description={t("cv.emptyMasterCvDescription")}
      />
    );
  }

  const pending = state.suggestions.filter((s) => s.state === "pending").length;
  const topJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <PageHeader
        eyebrow={t("cv.versionMeta", { version: cv.version })}
        title={t("cv.title")}
        description={t("cv.description")}
        action={
          <Link
            to="/app/cv/edit"
            className="tap hidden items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground lg:inline-flex"
          >
            <Pencil className="size-4" /> {t("cv.editAction")}
          </Link>
        }
      />

      <CvActionToolbar
        openWindow={openWindow}
        showCareers={showCareers}
        templateActive={previewTpl !== null}
        onEdit={() => navigate({ to: "/app/cv/edit" })}
        onImprove={() => setOpenWindow("improve")}
        onTailor={() => {
          setTailorPreset(undefined);
          setOpenWindow("tailor");
        }}
        onCareers={() => setShowCareers((v) => !v)}
        onTemplate={() => setPreviewTpl(cv.template)}
      />


      <div className="mx-auto w-full max-w-3xl">
        <CvPreview cv={cv} />
      </div>

      {showCareers ? (
        <div className="space-y-4 lg:hidden">
          <CareerSuggestionsPanel
            careers={careers}
            onOpenJobs={() => navigate({ to: "/app/jobs" })}
            onTailor={(career) => {
              setTailorPreset(career.title);
              setOpenWindow("tailor");
            }}
          />
          <SimilarJobsPanel jobs={topJobs} onOpenJobs={() => navigate({ to: "/app/jobs" })} />
        </div>
      ) : null}

      <div className="hidden lg:block">
        <Panel>
          <h2 className="eyebrow">{t("cv.templateLabel")}</h2>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => updateMasterCv({ template: tpl.id })}
                className={cn(
                  "tap rounded-xl border px-2 text-sm font-medium",
                  cv.template === tpl.id
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {tpl.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => window.print()}
              className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
            >
              <Printer className="size-4" /> {t("cv.print")}
            </button>
            <button
              onClick={() => window.print()}
              className="tap inline-flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" /> {t("cv.pdf")}
            </button>
          </div>
        </Panel>
      </div>


      <div>
        <Panel>
          <h2 className="eyebrow">{t("cv.versionsLabel")}</h2>
          <ul className="mt-2.5 space-y-2">
            {state.docs.map((d) => (
              <li
                key={d.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface p-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{d.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {d.kind === "master" ? t("cv.masterLabel") : t("cv.tailoredLabel")} · {d.updatedAt}
                  </span>
                </span>
                <Tag tone={d.score >= 80 ? "match" : "neutral"}>{d.score}</Tag>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <TemplatePreviewSheet
        templateId={previewTpl}
        onOpenChange={(o) => !o && setPreviewTpl(null)}
        onNavigate={setPreviewTpl}
        onSelect={(id) => {
          setTemplate(id);
          setPreviewTpl(null);
        }}
      />

      {openWindow === "improve" ? (
        <ImproveWindow
          suggestions={state.suggestions}
          onApply={applySuggestion}
          onReject={(id) => setSuggestionState(id, "rejected")}
          onClose={() => setOpenWindow(null)}
        />
      ) : null}

      {openWindow === "tailor" ? (
        <TailorWindow
          suggestions={state.suggestions}
          presetTitle={tailorPreset}
          onApply={applySuggestion}
          onReject={(id) => setSuggestionState(id, "rejected")}
          onClose={() => setOpenWindow(null)}
        />
      ) : null}

    </div>
  );
}

