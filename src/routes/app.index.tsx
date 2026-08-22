import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, Compass, MessageSquare, Pencil, Sparkles, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { CvLibrary } from "@/components/cv-library";
import { AddAnotherCvButton, CvIntake } from "@/components/cv-intake";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
import { ImproveWindow } from "@/components/improve-window";
import { TailorWindow } from "@/components/tailor-window";
import { EditorChatWindow } from "@/components/editor-chat-window";
import {
  CareerSuggestionsPanel,
  SimilarJobsPanel,
} from "@/components/career-suggestions-panel";
import { Eyebrow } from "@/components/ui-bits";
import dashboardNs from "@/lib/i18n/ns/dashboard";
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
  const [previewTpl, setPreviewTpl] = useState<CvTemplateId | null>(null);

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

      <TemplatePreviewSheet
        templateId={previewTpl}
        onOpenChange={(o) => !o && setPreviewTpl(null)}
        onNavigate={setPreviewTpl}
        onSelect={(id) => {
          setTemplate(id);
          setPreviewTpl(null);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-7">
          {state.docs.length ? (
            <>
              <CvLibrary />
              <AddAnotherCvButton />
            </>
          ) : (
            <CvIntake />
          )}
        </div>



        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-6">
          

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
              <Link
                to="/app/cv"
                className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-center text-sm font-bold text-primary-foreground"
              >
                <Check className="size-5" />
                {t("add.confirmCreate")}
              </Link>
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
      className="group pressable flex w-full items-center gap-4 rounded-2xl p-4 text-start text-white"
      style={{ background: color, boxShadow: "var(--shadow-press)" }}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 transition-transform duration-150 group-hover:scale-105">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold leading-tight">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-white/85">{description}</span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 rtl:rotate-180"
        aria-hidden
      />
    </button>
  );
}


