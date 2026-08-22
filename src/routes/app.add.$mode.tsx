import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardType,
  FileUp,
  Linkedin,
  Loader2,
  PenLine,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { ErrorState, Eyebrow, Panel } from "@/components/ui-bits";
import { TemplateGallery } from "@/components/template-gallery";
import { TemplatePreviewSheet } from "@/components/template-preview-sheet";
import { demoMasterCv, emptyMasterCv } from "@/lib/career-data";
import type { CvTemplateId, MasterCv } from "@/lib/career-types";

import { cn } from "@/lib/utils";
import { translate, useI18n, useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/add/$mode")({
  head: () => ({
    meta: [
      { title: translate("en", "add.headTitle") },
      { name: "description", content: translate("en", "add.headDescription") },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AddCvPage,
});

const meta = {
  paste: { titleKey: "add.modePasteTitle", icon: ClipboardType },
  upload: { titleKey: "add.modeUploadTitle", icon: FileUp },
  linkedin: { titleKey: "add.modeLinkedinTitle", icon: Linkedin },
  manual: { titleKey: "add.modeManualTitle", icon: PenLine },
} as const;

type Mode = keyof typeof meta;

/** Holds the parsed draft so the page can show the template step before saving. */
const DraftContext = createContext<(cv: MasterCv) => void>(() => {});

function AddCvPage() {
  const { mode } = Route.useParams();
  const t = useT();
  const { isRtl } = useI18n();
  const m = (Object.keys(meta).includes(mode) ? mode : "paste") as Mode;
  const Icon = meta[m].icon;
  const [draft, setDraft] = useState<MasterCv | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className={cn("size-4", isRtl && "rotate-180")} /> {t("add.backToWorkspace")}
      </Link>

      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <Eyebrow>{t("add.eyebrow")}</Eyebrow>
          <h1 className="display text-2xl leading-tight sm:text-3xl">{t(meta[m].titleKey)}</h1>
        </div>
      </header>

      {draft ? (
        <TemplateStep draft={draft} />
      ) : (
        <DraftContext.Provider value={setDraft}>
          {m === "paste" ? <PasteFlow /> : null}
          {m === "upload" ? <UploadFlow /> : null}
          {m === "linkedin" ? <LinkedInFlow /> : null}
          {m === "manual" ? <ManualFlow /> : null}
        </DraftContext.Provider>
      )}
    </div>
  );
}

/** Step shown after extraction: pick a template, then save the master CV. */
function TemplateStep({ draft }: { draft: MasterCv }) {
  const t = useT();
  const navigate = useNavigate();
  const { state, setTemplate, createMasterCv } = useWorkspace();
  const [tpl, setTpl] = useState<CvTemplateId>(draft.template ?? state.template);
  const [previewTpl, setPreviewTpl] = useState<CvTemplateId | null>(null);

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="display text-xl">{t("add.templateStepTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("add.templateStepHint")}</p>
        <div className="mt-3">
          <TemplateGallery value={tpl} onChange={setTpl} onPreview={setPreviewTpl} />
        </div>
        <button
          type="button"
          onClick={() => {
            setTemplate(tpl);
            createMasterCv({ ...draft, template: tpl });
            navigate({ to: "/app/cv" });
          }}
          className="tap mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          {t("add.templateStepCta")}
        </button>
      </Panel>

      <TemplatePreviewSheet
        templateId={previewTpl}
        onOpenChange={(o) => !o && setPreviewTpl(null)}
        onNavigate={setPreviewTpl}
        onSelect={(id) => {
          setTpl(id);
          setPreviewTpl(null);
        }}
      />
    </div>
  );
}


/* ---------------------------------- shared --------------------------------- */

/** The draft is now created instantly — the confirm step lives after improvements. */
function ReviewStep({
  draft,
  onConfirm,
  note,
}: {
  draft: MasterCv;
  onConfirm: () => void;
  note: string;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    onConfirm();
  }, [onConfirm]);
  void draft;
  return <Working label={note} />;
}


/** Hands the extracted draft to the template step instead of saving directly. */
function useCreate() {
  return useContext(DraftContext);
}

/* ---------------------------------- paste ---------------------------------- */

function PasteFlow() {
  const t = useT();
  const [text, setText] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const v = window.sessionStorage.getItem(INTAKE_TEXT_KEY) ?? "";
      window.sessionStorage.removeItem(INTAKE_TEXT_KEY);
      return v;
    } catch {
      return "";
    }
  });
  const [phase, setPhase] = useState<"input" | "working" | "review" | "error">("input");
  const create = useCreate();


  return phase === "review" ? (
    <ReviewStep
      draft={demoMasterCv}
      note={t("add.pasteNote")}
      onConfirm={() => create(demoMasterCv)}
    />
  ) : phase === "working" ? (
    <Working label={t("add.pasteWorkingLabel")} />
  ) : (
    <Panel>
      <label className="block">
        <span className="text-sm font-medium">{t("add.pasteLabel")}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={t("add.pastePlaceholder")}
          className="mt-2 w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-primary"
        />
      </label>
      {phase === "error" ? (
        <div className="mt-4">
          <ErrorState
            description={t("add.pasteErrorDescription")}
            onRetry={() => setPhase("input")}
          />
        </div>
      ) : null}
      <button
        onClick={() => {
          setPhase("working");
          window.setTimeout(
            () => setPhase(text.trim().length > 60 ? "review" : "error"),
            1100,
          );
        }}
        className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        {t("add.continue")}
      </button>
    </Panel>
  );
}

/* ---------------------------------- upload --------------------------------- */

function UploadFlow() {
  const t = useT();
  const [file, setFile] = useState<string | null>(null);
  const [phase, setPhase] = useState<"input" | "working" | "review" | "error">("input");
  const create = useCreate();

  if (phase === "review")
    return (
      <ReviewStep
        draft={demoMasterCv}
        note={t("add.uploadNote", { file: file ?? "" })}
        onConfirm={() => create(demoMasterCv)}
      />
    );
  if (phase === "working") return <Working label={t("add.uploadWorkingLabel", { file: file ?? "" })} />;

  return (
    <Panel>
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8 text-center">
        <FileUp className="mx-auto size-7 text-primary" />
        <p className="mt-3 font-medium">{t("add.uploadDropTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("add.uploadHint")}</p>
        <label className="tap mt-4 inline-flex cursor-pointer items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          {t("add.uploadChooseFile")}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f.name);
              setPhase("working");
              window.setTimeout(() => setPhase(f.size > 0 ? "review" : "error"), 1400);
            }}
          />
        </label>
      </div>
      {phase === "error" ? (
        <div className="mt-4">
          <ErrorState
            title={t("add.uploadErrorTitle")}
            description={t("add.uploadErrorDescription")}
            onRetry={() => setPhase("input")}
            retryLabel={t("add.uploadErrorRetryLabel")}
          />
        </div>
      ) : null}
    </Panel>
  );
}

/* --------------------------------- linkedin -------------------------------- */

function LinkedInFlow() {
  const t = useT();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({
    profile: true,
    experience: true,
    education: true,
    skills: true,
  });
  const create = useCreate();

  const sections = [
    { id: "profile", label: t("add.linkedinSectionProfileLabel"), detail: t("add.linkedinSectionProfileDetail") },
    { id: "experience", label: t("add.linkedinSectionExperienceLabel"), detail: t("add.linkedinSectionExperienceDetail") },
    { id: "education", label: t("add.linkedinSectionEducationLabel"), detail: t("add.linkedinSectionEducationDetail") },
    { id: "skills", label: t("add.linkedinSectionSkillsLabel"), detail: t("add.linkedinSectionSkillsDetail") },
  ];

  if (step === 2)
    return (
      <ReviewStep
        draft={demoMasterCv}
        note={t("add.linkedinNote")}
        onConfirm={() => create(demoMasterCv)}
      />
    );

  return (
    <div className="space-y-4">
      <Panel>
        <h2 className="text-lg">{t("add.linkedinHowTitle")}</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-foreground/85">
          <li>
            <span className="font-semibold">1.</span> {t("add.linkedinStep1")}
          </li>
          <li>
            <span className="font-semibold">2.</span> {t("add.linkedinStep2")}
          </li>
          <li>
            <span className="font-semibold">3.</span> {t("add.linkedinStep3")}
          </li>
        </ol>
        <label className="tap mt-4 inline-flex cursor-pointer items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          {t("add.linkedinUploadExport")}
          <input type="file" className="sr-only" onChange={() => setStep(1)} />
        </label>
        <button
          onClick={() => setStep(1)}
          className="tap ms-2 inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium"
        >
          {t("add.linkedinPasteInstead")}
        </button>
      </Panel>

      {step >= 1 ? (
        <Panel>
          <h2 className="text-lg">{t("add.linkedinChooseTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("add.linkedinChooseSubtitle")}
          </p>
          <ul className="mt-3 space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <label
                  className={cn(
                    "tap grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3",
                    selected[s.id] ? "border-primary bg-primary-soft/50" : "border-border",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">{s.detail}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={!!selected[s.id]}
                    onChange={(e) => setSelected((v) => ({ ...v, [s.id]: e.target.checked }))}
                    className="size-5 shrink-0 accent-[var(--color-primary)]"
                  />
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setStep(2)}
            className="tap mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("add.linkedinOrganize")}
          </button>
        </Panel>
      ) : null}
    </div>
  );
}

/* ---------------------------------- manual --------------------------------- */

type Answer = Record<string, string>;

function useQuestionGroups() {
  const t = useT();
  return [
    {
      titleKey: "add.groupPersonalTitle",
      questions: [
        { id: "name", qKey: "add.qName", placeholderKey: "add.qNamePlaceholder" },
        { id: "title", qKey: "add.qTitle", placeholderKey: "add.qTitlePlaceholder" },
        { id: "email", qKey: "add.qEmail", placeholderKey: "add.qEmailPlaceholder" },
        { id: "location", qKey: "add.qLocation", placeholderKey: "add.qLocationPlaceholder" },
      ],
    },
    {
      titleKey: "add.groupWorkTitle",
      questions: [
        { id: "company", qKey: "add.qCompany", placeholderKey: "add.qCompanyPlaceholder" },
        { id: "role", qKey: "add.qRole", placeholderKey: "add.qRolePlaceholder" },
        { id: "period", qKey: "add.qPeriod", placeholderKey: "add.qPeriodPlaceholder" },
        { id: "responsibilities", qKey: "add.qResponsibilities", placeholderKey: "add.qResponsibilitiesPlaceholder" },
        { id: "achievements", qKey: "add.qAchievements", placeholderKey: "add.qAchievementsPlaceholder" },
      ],
    },
    {
      titleKey: "add.groupEducationTitle",
      questions: [
        { id: "school", qKey: "add.qSchool", placeholderKey: "add.qSchoolPlaceholder" },
        { id: "program", qKey: "add.qProgram", placeholderKey: "add.qProgramPlaceholder" },
        { id: "years", qKey: "add.qYears", placeholderKey: "add.qYearsPlaceholder" },
      ],
    },
    {
      titleKey: "add.groupSkillsTitle",
      questions: [
        { id: "skills", qKey: "add.qSkills", placeholderKey: "add.qSkillsPlaceholder" },
        { id: "languages", qKey: "add.qLanguages", placeholderKey: "add.qLanguagesPlaceholder" },
        { id: "tools", qKey: "add.qTools", placeholderKey: "add.qToolsPlaceholder" },
        { id: "extra", qKey: "add.qExtra", placeholderKey: "add.qExtraPlaceholder" },
      ],
    },
  ].map((g) => ({
    title: t(g.titleKey),
    questions: g.questions.map((q) => ({
      id: q.id,
      q: t(q.qKey),
      placeholder: t(q.placeholderKey),
    })),
  }));
}

function ManualFlow() {
  const t = useT();
  const questionGroups = useQuestionGroups();
  const [groupIndex, setGroupIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [reviewing, setReviewing] = useState(false);
  const create = useCreate();

  const group = questionGroups[groupIndex]!;
  const question = group.questions[qIndex]!;
  const totalQuestions = questionGroups.reduce((n, g) => n + g.questions.length, 0);
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;

  if (reviewing) {
    const a = (k: string) => answers[k] ?? "";
    const list = (k: string) =>
      a(k)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const draft: MasterCv = {
      ...emptyMasterCv,
      name: a("name"),
      title: a("title"),
      email: a("email"),
      location: a("location"),
      summary: a("responsibilities"),
      experience: a("company")
        ? [
            {
              id: "exp-new",
              role: a("role"),
              company: a("company"),
              location: a("location"),
              start: a("period").split("–")[0]?.trim() || "",
              end: a("period").split("–")[1]?.trim() || "Present",
              bullets: [a("responsibilities"), a("achievements")].filter(Boolean),
            },
          ]
        : [],
      education: a("school")
        ? [
            {
              id: "edu-new",
              school: a("school"),
              program: a("program"),
              start: a("years").split("–")[0]?.trim() || "",
              end: a("years").split("–")[1]?.trim() || "",
            },
          ]
        : [],
      skills: list("skills"),
      languages: list("languages"),
      tools: list("tools"),
    };
    return (
      <ReviewStep
        draft={draft}
        note={t("add.manualNote")}
        onConfirm={() => create(draft)}
      />
    );
  }

  const next = () => {
    if (qIndex + 1 < group.questions.length) return setQIndex(qIndex + 1);
    if (groupIndex + 1 < questionGroups.length) {
      setGroupIndex(groupIndex + 1);
      setQIndex(0);
      return;
    }
    setReviewing(true);
  };

  const back = () => {
    if (qIndex > 0) return setQIndex(qIndex - 1);
    if (groupIndex > 0) {
      const prev = questionGroups[groupIndex - 1]!;
      setGroupIndex(groupIndex - 1);
      setQIndex(prev.questions.length - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{group.title}</span>
          <span className="tabular-nums">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <Panel>
        <h2 className="display text-2xl leading-snug">{question.q}</h2>
        <textarea
          key={question.id}
          value={answers[question.id] ?? ""}
          onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
          rows={question.id === "responsibilities" || question.id === "achievements" ? 5 : 2}
          placeholder={question.placeholder}
          className="mt-4 w-full resize-y rounded-xl border border-border bg-background p-3.5 text-base outline-none focus:border-primary"
        />
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={back}
            disabled={groupIndex === 0 && qIndex === 0}
            className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium disabled:opacity-40"
          >
            {t("add.manualBack")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={next}
              className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium"
            >
              {t("add.manualSkip")}
            </button>
            <button
              onClick={next}
              className="tap inline-flex items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              {t("add.manualContinue")}
            </button>
          </div>
        </div>
      </Panel>

      <p className="text-center text-xs text-muted-foreground">
        {t("add.manualFooterNote")}
      </p>
    </div>
  );
}

function Working({ label }: { label: string }) {
  const t = useT();
  return (
    <Panel className="text-center">
      <Loader2 className="mx-auto size-6 animate-spin text-primary" />
      <p className="mt-3 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("add.workingSubtext")}
      </p>
    </Panel>
  );
}
