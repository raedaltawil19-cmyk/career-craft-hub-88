import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Compass,
  Copy,
  Download,
  FileText,
  LayoutTemplate,
  Pencil,
  Printer,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, PageHeader } from "@/components/ui-bits";
import { ShareCvMenu } from "@/components/share-cv-menu";

import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
import { CvSideRail } from "@/components/cv-side-rail";
import {
  CareerSuggestionsPanel,
  SimilarJobsPanel,
} from "@/components/career-suggestions-panel";
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
    deleteCv,
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

  const topJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  const onDelete = () => {
    const kids = state.docs.filter((x) => x.parentId === doc.id).length;
    const message =
      doc.kind === "master" && kids
        ? t("cv.deleteMasterConfirm", { name: doc.name, count: kids })
        : t("cv.deleteConfirm", { name: doc.name });
    if (!window.confirm(message)) return;
    deleteCv(doc.id);
    navigate({ to: "/app" });
  };

  return (
    <div className="space-y-5 pb-28 pe-14 lg:pb-6 lg:pe-0">
      <PageHeader
        eyebrow={doc.kind === "master" ? t("cv.masterLabel") : t("cv.tailoredLabel")}
        title={doc.name}
        description={t("cv.versionMeta", { version: cv.version })}
        action={
          <div className="flex items-center gap-2">
            <ShareCvMenu cv={cv} name={doc.name} compact />
            <button
              type="button"
              onClick={onDelete}
              aria-label={t("cv.deleteAction")}
              className="tap grid size-11 place-items-center rounded-xl border border-border text-destructive hover:bg-muted"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        }

      />

      <div className="grid grid-cols-4 gap-1.5">
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

      {showCareers ? (
        <div className="space-y-4">
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

      <CvSideRail
        openWindow={openWindow}
        showCareers={showCareers}
        templateActive={previewTpl !== null}
        onImprove={() => setOpenWindow("improve")}
        onTailor={() => {
          setTailorPreset(undefined);
          setOpenWindow("tailor");
        }}
        onCareers={() => setShowCareers((v) => !v)}
        onTemplate={() => setPreviewTpl(cv.template)}
      />
    </div>
  );
}

