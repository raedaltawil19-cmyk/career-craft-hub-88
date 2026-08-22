import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Download, FileText, LayoutTemplate, Pencil, Printer, Sparkles, Target } from "lucide-react";
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
    <div className="space-y-5">
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

      {/* Mobile-only floating action bar above the bottom navigation */}
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
