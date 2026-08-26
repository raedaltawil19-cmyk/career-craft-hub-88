import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Compass, Download, FileText, GripVertical, LayoutTemplate, Pencil, Printer, Sparkles, Target } from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, MatchRing, PageHeader, Panel, Tag } from "@/components/ui-bits";
import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
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
            className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Pencil className="size-4" /> {t("cv.editAction")}
          </Link>
        }
      />

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

      <div className="mx-auto w-full max-w-3xl">
        <CvPreview cv={cv} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <MatchRing value={78} size={56} label={t("cv.cvQuality")} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{t("cv.cvQuality")}</h2>
              <p className="text-xs text-muted-foreground">{t("cv.atsReadability")}</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>· {t("cv.insightConsistentStructure")}</li>
            <li>· {t("cv.insightAchievements")}</li>
            <li>· {t("cv.insightDateFormats")}</li>
          </ul>
          {pending ? (
            <Link
              to="/app/cv/edit"
              search={{ panel: "ai" }}
              className="tap mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              <Sparkles className="size-4" /> {t("cv.recommendationsCount", { count: pending })}
            </Link>
          ) : null}
        </Panel>

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
