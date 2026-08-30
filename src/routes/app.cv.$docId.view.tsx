import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileText,
  LayoutTemplate,
  Pencil,
  Printer,
  Sparkles,
  Target,
} from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, PageHeader } from "@/components/ui-bits";

import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
import { CvActionToolbar } from "@/components/cv-action-toolbar";
import { CareersWindow } from "@/components/careers-window";
import type { CvTemplateId } from "@/lib/career-types";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/cv/$docId/view")({
  head: () => ({
    meta: [
      { title: "CV version — Smart CV" },
      { name: "description", content: "Open one CV version with the AI tools." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvVersionPage,
});

type WindowKind = "improve" | "tailor" | null;

function CvVersionPage() {
  const t = useT();
  const navigate = useNavigate();
  const { docId } = Route.useParams();
  const {
    state,
    jobs,
    careers,
    setTemplate,
    applySuggestion,
    setSuggestionState,
    duplicateCv,
  } = useWorkspace();

  const [openWindow, setOpenWindow] = useState<WindowKind>(null);
  const [tailorPreset, setTailorPreset] = useState<string | undefined>(undefined);
  const [showCareers, setShowCareers] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<CvTemplateId | null>(null);

  const doc = state.docs.find((d) => d.id === docId);
  const cv = doc?.data ?? state.masterCv;

  if (!doc || !cv) {
    return (
      <EmptyState
        icon={<FileText className="size-5" />}
        title={t("cv.versionNotFound")}
        description={t("cv.emptyMasterCvDescription")}
      />
    );
  }

  const linkedJob = doc.jobId ? jobs.find((j) => j.id === doc.jobId) : undefined;

  return (
    <div className="space-y-5 pb-28 lg:pb-6">
      <PageHeader
        eyebrow={doc.kind === "master" ? t("cv.masterLabel") : t("cv.tailoredLabel")}
        title={doc.name}
        description={t("cv.versionMeta", { version: cv.version })}
      />

      {linkedJob ? (
        <a
          href={linkedJob.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground"
          style={{ boxShadow: "var(--shadow-press)" }}
        >
          {t("tailor.applyNow")}
          <ExternalLink className="size-4 rtl:rotate-180" aria-hidden />
        </a>
      ) : null}

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

      <div className="hidden grid-cols-4 gap-1.5 lg:grid">
        <Link
          to="/app/cv/edit"
          className="tap flex flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] font-bold hover:bg-muted"
        >
          <Pencil className="size-4" />
          {t("cv.manualEditAction")}
        </Link>
        <button
          type="button"
          onClick={() => duplicateCv(doc.id, t("cv.copyWord"))}
          className="tap flex flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] font-bold hover:bg-muted"
        >
          <Copy className="size-4" />
          {t("cv.duplicateAction")}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="tap flex flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] font-bold hover:bg-muted"
        >
          <Printer className="size-4" />
          {t("cv.print")}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="tap flex flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] font-bold hover:bg-muted"
        >
          <Download className="size-4" />
          {t("cv.pdf")}
        </button>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <CvPreview cv={cv} />
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
          sourceId={docId}
          onClose={() => setOpenWindow(null)}
        />
      ) : null}

      {showCareers ? (
        <CareersWindow
          careers={careers}
          onOpenJobs={(c) => {
            setShowCareers(false);
            navigate({ to: "/app/jobs", search: { career: c.id } });
          }}
          onTailor={(c) => {
            setShowCareers(false);
            setTailorPreset(c.title);
            setOpenWindow("tailor");
          }}
          onClose={() => setShowCareers(false)}
        />
      ) : null}
    </div>
  );
}
