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
import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
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
    <div className="space-y-5 pb-28 lg:pb-6">
      <PageHeader
        eyebrow={doc.kind === "master" ? t("cv.masterLabel") : t("cv.tailoredLabel")}
        title={doc.name}
        description={t("cv.versionMeta", { version: cv.version })}
        action={
          <button
            type="button"
            onClick={onDelete}
            aria-label={t("cv.deleteAction")}
            className="tap grid size-11 place-items-center rounded-xl border border-border text-destructive hover:bg-muted"
          >
            <Trash2 className="size-5" />
          </button>
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
          onApply={applySuggestion}
          onReject={(id) => setSuggestionState(id, "rejected")}
          onClose={() => setOpenWindow(null)}
        />
      ) : null}

      <div
        className="fixed inset-x-0 z-40 px-3 lg:hidden"
        style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
        <div
          className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-3xl border border-border bg-card/90 p-1.5 backdrop-blur"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <BarAction
            icon={<Sparkles className="size-4" />}
            label={t("ws.barImprove")}
            tone="#ff6b6b"
            active={openWindow === "improve"}
            onClick={() => setOpenWindow("improve")}
          />
          <BarAction
            icon={<Target className="size-4" />}
            label={t("ws.barTailor")}
            tone="#574b90"
            active={openWindow === "tailor"}
            onClick={() => {
              setTailorPreset(undefined);
              setOpenWindow("tailor");
            }}
          />
          <BarAction
            icon={<Compass className="size-4" />}
            label={t("ws.barCareers")}
            tone="#12946a"
            active={showCareers}
            onClick={() => setShowCareers((v) => !v)}
          />
          <BarAction
            icon={<LayoutTemplate className="size-4" />}
            label={t("ws.barTemplate")}
            tone="#1f6feb"
            active={previewTpl !== null}
            onClick={() => setPreviewTpl(cv.template)}
          />
        </div>
      </div>
    </div>
  );
}

function BarAction({
  icon,
  label,
  tone,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-center transition-colors active:scale-[0.97]"
      style={active ? { background: `color-mix(in oklab, ${tone} 14%, transparent)` } : undefined}
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full text-white"
        style={{ background: tone }}
      >
        {icon}
      </span>
      <span className="text-[10px] font-bold leading-[1.15]" style={{ color: tone }}>
        {label}
      </span>
    </button>
  );
}
