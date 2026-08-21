import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FilePlus2, MessageSquare, Pencil, Sparkles, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
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
import dashboardNs from "@/lib/i18n/ns/dashboard";

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
    loadDemo,
  } = useWorkspace();

  const [openWindow, setOpenWindow] = useState<WindowKind>(null);
  const [tailorPreset, setTailorPreset] = useState<string | undefined>(undefined);

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-5">
          {cv ? (
            <>
              <CvPreview cv={{ ...cv, template }} />

              <div className="grid gap-3 sm:grid-cols-2">
                <BigAction
                  icon={<Sparkles className="size-6" />}
                  title={t("ws.improveGeneral")}
                  description={t("ws.improveGeneralDesc")}
                  onClick={() => setOpenWindow("improve")}
                  primary
                />
                <BigAction
                  icon={<Target className="size-6" />}
                  title={t("ws.tailorJob")}
                  description={t("ws.tailorJobDesc")}
                  onClick={() => {
                    setTailorPreset(undefined);
                    setOpenWindow("tailor");
                  }}
                />
              </div>

              {improved ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="sm:col-span-2 inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
                    {t("ws.improvedBadge", { count: applied })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenWindow("chat")}
                    className="tap flex items-center gap-3 rounded-2xl border border-border-strong bg-card px-4 text-start font-bold hover:bg-muted"
                  >
                    <MessageSquare className="size-5 text-primary" />
                    {t("ws.chatOpen")}
                  </button>
                  <Link
                    to="/app/cv/edit"
                    className="tap flex items-center gap-3 rounded-2xl border border-border-strong bg-card px-4 text-start font-bold hover:bg-muted"
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
            </>
          ) : (
            <EmptyTemplate onLoadDemo={loadDemo} />
          )}
        </div>

        {cv && improved ? (
          <aside className="space-y-5">
            <SimilarJobsPanel jobs={topJobs} onOpenJobs={openJobs} />
            <CareerSuggestionsPanel
              careers={careers}
              onOpenJobs={openJobs}
              onTailor={(career) => {
                setTailorPreset(career.title);
                setOpenWindow("tailor");
              }}
            />
          </aside>
        ) : null}
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

function BigAction({
  icon,
  title,
  description,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "pressable rounded-3xl bg-primary p-5 text-start text-primary-foreground"
          : "pressable rounded-3xl border-2 border-primary bg-card p-5 text-start"
      }
      style={{ boxShadow: "var(--shadow-press)" }}
    >
      <span
        className={
          primary
            ? "mb-3 grid size-12 place-items-center rounded-2xl bg-white/20"
            : "mb-3 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"
        }
      >
        {icon}
      </span>
      <span className="block text-lg font-bold leading-tight">{title}</span>
      <span
        className={
          primary
            ? "mt-1 block text-sm text-primary-foreground/85"
            : "mt-1 block text-sm text-muted-foreground"
        }
      >
        {description}
      </span>
    </button>
  );
}

function EmptyTemplate({ template }: { template: CvTemplateId }) {
  const t = useT();
  const placeholder: MasterCv = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    links: [],
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    tools: [],
    certifications: [],
    projects: [],
    volunteer: [],
    updatedAt: new Date().toISOString(),
    template,
    version: 0,
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <CvPreview cv={placeholder} className="opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 p-6 opacity-40" aria-hidden>
          {[90, 80, 85, 70, 88, 60].map((w, i) => (
            <span
              key={i}
              className="block h-2 rounded-full bg-foreground/15"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

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
        <Link
          to="/app/add/$mode"
          params={{ mode: "paste" }}
          className="tap flex w-full max-w-xs items-center justify-center rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground"
        >
          {t("ws.addCvCta")}
        </Link>
      </div>
    </div>
  );
}

