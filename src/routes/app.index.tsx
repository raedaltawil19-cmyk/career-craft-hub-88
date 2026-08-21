import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, FilePlus2, MessageSquare, Pencil, Sparkles, Target } from "lucide-react";
import { useI18n, useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { TemplateGallery } from "@/components/template-gallery";
import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { EditorChatWindow } from "@/components/editor-chat-window";
import {
  CareerSuggestionsPanel,
  SimilarJobsPanel,
} from "@/components/career-suggestions-panel";
import { Eyebrow } from "@/components/ui-bits";
import { AddCvSheet } from "@/components/add-cv-sheet";
import dashboardNs from "@/lib/i18n/ns/dashboard";
import { blankCvFor } from "@/lib/sample-cv";
import type { CvTemplateId } from "@/lib/career-types";

const dashboardHeadTitle = dashboardNs.en.headTitle;
const dashboardHeadDescription = dashboardNs.en.headDescription;

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: dashboardHeadTitle },
      { name: "description", content: dashboardHeadDescription },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomePage,
});

type WindowKind = "improve" | "tailor" | "chat" | null;

function HomePage() {
  const t = useT();
  const navigate = useNavigate();
  const {
    state,
    jobs,
    careers,
    setTemplate,
    applySuggestion,
    setSuggestionState,
    updateMasterCv,
  } = useWorkspace();

  const [openWindow, setOpenWindow] = useState<WindowKind>(null);
  const [tailorPreset, setTailorPreset] = useState<string | undefined>(undefined);
  const [showCareers, setShowCareers] = useState(false);

  const cv = state.masterCv;
  const template = cv?.template ?? state.template;
  const applied = state.suggestions.filter((s) => s.state === "accepted").length;
  const improved = applied > 0;
  const topJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  const openJobs = () => navigate({ to: "/app/jobs" });

  return (
    <div className="space-y-7">
      <header>
        <Eyebrow>{t("dashboard.workspaceEyebrow")}</Eyebrow>
        <h1 className="display mt-1 text-[2rem] leading-tight sm:text-4xl">
          {cv
            ? t("dashboard.greeting", { name: cv.name.split(" ")[0] ?? cv.name })
            : t("dashboard.startTitle")}
        </h1>
      </header>

      <TemplateGallery value={template} onChange={setTemplate} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-5">
          {cv ? <CvPreview cv={{ ...cv, template }} /> : <EmptyTemplate template={template} />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          {cv ? null : <AddCvTile />}

          <BigAction
            icon={<Sparkles className="size-6" />}
            title={t("ws.improveGeneral")}
            description={t("ws.improveGeneralDesc")}
            onClick={() => setOpenWindow("improve")}
            tone="coral"
          />
          <BigAction
            icon={<Target className="size-6" />}
            title={t("ws.tailorJob")}
            description={t("ws.tailorJobDesc")}
            onClick={() => {
              setTailorPreset(undefined);
              setOpenWindow("tailor");
            }}
            tone="violet"
          />
          <BigAction
            icon={<Compass className="size-6" />}
            title={t("ws.careersTitle")}
            description={t("ws.careersHint")}
            onClick={() => setShowCareers((v) => !v)}
            tone="green"
          />

          {improved ? (
            <div className="space-y-3">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
                {t("ws.improvedBadge", { count: applied })}
              </p>
              <button
                type="button"
                onClick={() => setOpenWindow("chat")}
                className="tap flex w-full items-center gap-3 rounded-2xl border border-border-strong bg-card px-4 text-start font-bold hover:bg-muted"
              >
                <MessageSquare className="size-5 text-primary" />
                {t("ws.chatOpen")}
              </button>
              <Link
                to="/app/cv/edit"
                className="tap flex w-full items-center gap-3 rounded-2xl border border-border-strong bg-card px-4 text-start font-bold hover:bg-muted"
              >
                <Pencil className="size-5 text-primary" />
                <span>
                  {t("ws.manualEdit")}
                  <span className="block text-xs font-medium text-muted-foreground">
                    {t("ws.manualEditHint")}
                  </span>
                </span>
              </Link>
            </div>
          ) : null}

          {showCareers ? (
            <>
              <CareerSuggestionsPanel
                careers={careers}
                onOpenJobs={openJobs}
                onTailor={(career) => {
                  setTailorPreset(career.title);
                  setOpenWindow("tailor");
                }}
              />
              <SimilarJobsPanel jobs={topJobs} onOpenJobs={openJobs} />
            </>
          ) : null}
        </aside>
      </div>


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

      {openWindow === "chat" && cv ? (
        <EditorChatWindow
          baseText={cv.summary}
          onApply={(summary) => updateMasterCv({ summary })}
          onClose={() => setOpenWindow(null)}
        />
      ) : null}
    </div>
  );
}

const TONES: Record<string, string> = {
  coral: "#ff6b6b",
  violet: "#574b90",
  green: "#12946a",
};

function BigAction({
  icon,
  title,
  description,
  onClick,
  tone = "coral",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  tone?: "coral" | "violet" | "green";
}) {
  const color = TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable block w-full rounded-3xl p-5 text-start text-white"
      style={{ background: color, boxShadow: "var(--shadow-press)" }}
    >
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-white/20">
        {icon}
      </span>
      <span className="block text-lg font-bold leading-tight">{title}</span>
      <span className="mt-1 block text-sm text-white/85">{description}</span>
    </button>
  );
}

function EmptyTemplate({ template }: { template: CvTemplateId }) {
  const { lang } = useI18n();
  const sample = blankCvFor(lang, template);

  return (
    <div className="relative w-full">
      <CvPreview cv={sample} className="w-full" placeholder />
    </div>
  );
}

function AddCvTile() {
  const t = useT();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="tile flex flex-col items-center gap-4 p-6 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <FilePlus2 className="size-7" />
        </span>
        <div>
          <h2 className="text-xl font-bold">{t("ws.emptyPreviewTitle")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("ws.emptyPreviewHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap flex w-full max-w-xs items-center justify-center rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground"
        >
          {t("ws.addCvCta")}
        </button>
      </div>

      <AddCvSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

