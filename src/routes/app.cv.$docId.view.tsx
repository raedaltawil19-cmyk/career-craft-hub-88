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

      {/* Mobile-only floating draggable side rail */}
      <SideRail
        t={t}
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

function SideRail({
  t,
  openWindow,
  showCareers,
  templateActive,
  onImprove,
  onTailor,
  onCareers,
  onTemplate,
}: {
  t: ReturnType<typeof useT>;
  openWindow: WindowKind;
  showCareers: boolean;
  templateActive: boolean;
  onImprove: () => void;
  onTailor: () => void;
  onCareers: () => void;
  onTemplate: () => void;
}) {
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ startY: number; baseY: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { startY: e.clientY, baseY: dragY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    const max = typeof window !== "undefined" ? window.innerHeight / 2 - 140 : 200;
    setDragY(Math.min(Math.max(drag.current.baseY + dy, -max), max));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className="fixed end-2 top-1/2 z-40 lg:hidden"
      style={{ transform: `translateY(calc(-50% + ${dragY}px))` }}
    >
      <div
        className="flex w-14 flex-col items-center gap-1 rounded-3xl border border-border bg-card/90 p-1.5 backdrop-blur"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <button
          type="button"
          aria-label="Drag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="grid h-5 w-full cursor-grab touch-none place-items-center rounded-full text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <BarAction
          icon={<Sparkles className="size-4" />}
          label={t("ws.barImprove")}
          tone="#ff6b6b"
          active={openWindow === "improve"}
          onClick={onImprove}
        />
        <BarAction
          icon={<Target className="size-4" />}
          label={t("ws.barTailor")}
          tone="#574b90"
          active={openWindow === "tailor"}
          onClick={onTailor}
        />
        <BarAction
          icon={<Compass className="size-4" />}
          label={t("ws.barCareers")}
          tone="#12946a"
          active={showCareers}
          onClick={onCareers}
        />
        <BarAction
          icon={<LayoutTemplate className="size-4" />}
          label={t("ws.barTemplate")}
          tone="#1f6feb"
          active={templateActive}
          onClick={onTemplate}
        />
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
  const [touchHint, setTouchHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch screens have no hover: tapping reveals the label briefly while
  // still firing the action.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setTouchHint(true);
    hintTimer.current = setTimeout(() => setTouchHint(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      title={label}
      aria-label={label}
      className="group relative grid size-11 place-items-center rounded-2xl transition-colors active:scale-[0.97]"
      style={active ? { background: `color-mix(in oklab, ${tone} 14%, transparent)` } : undefined}
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full text-white"
        style={{ background: tone }}
      >
        {icon}
      </span>
      <span
        className={cn(
          "pointer-events-none absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-bold text-background opacity-0 shadow-lg transition-opacity duration-150",
          "group-hover:opacity-100",
          touchHint && "opacity-100",
        )}
      >
        {label}
      </span>
    </button>
  );
}
