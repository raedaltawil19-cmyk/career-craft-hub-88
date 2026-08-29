import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { ExperienceEntry, MasterCv } from "@/lib/career-types";

const field =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const labelCls = "block text-sm font-medium";
const uid = (p: string) => `${p}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;

export type AiSection = "profile" | "experience";

type Proposal = {
  label: string;
  before: string;
  after: string;
  patch: Partial<MasterCv>;
};

const lower = (s: string) => s.toLowerCase();
const has = (text: string, words: string[]) => words.some((w) => lower(text).includes(lower(w)));

const SEPARATORS = [" to ", " till ", " إلى ", " الى ", ":", " = "];

function payloadOf(instruction: string) {
  for (const sep of SEPARATORS) {
    const i = lower(instruction).lastIndexOf(sep.toLowerCase());
    if (i > -1) return instruction.slice(i + sep.length).trim().replace(/^["“”']|["“”'.]$/g, "");
  }
  return "";
}

const ADD_WORDS = ["add ", "new ", "lägg till", "ny ", "أضف", "اضف", "إضافة", "اضافة", "جديدة"];
const SHORTEN_WORDS = ["shorten", "shorter", "korta", "kortare", "اختصر", "اختصار"];
const COMPANY_WORDS = ["company", "employer", "företag", "arbetsgivare", "الشركة", "رب العمل"];
const TASK_WORDS = ["task", "responsib", "uppgift", "ansvar", "مهام", "المهام", "مسؤول"];

function afterWord(instruction: string, words: string[]) {
  for (const w of words) {
    const i = lower(instruction).indexOf(lower(w));
    if (i > -1) {
      const rest = instruction.slice(i + w.length).trim();
      const cut = rest.split(/\s+(?:at|på|hos|في|لدى|from|från|من)\s+/i)[0] ?? rest;
      return cut.replace(/[.،,]$/, "").trim();
    }
  }
  return "";
}

/** Deterministic, non-inventive proposal builder for profile edits. */
function profileProposal(cv: MasterCv, instruction: string): Proposal | null {
  const summary = cv.summary ?? "";
  let after = "";
  if (has(instruction, SHORTEN_WORDS) && summary) {
    after = (summary.match(/[^.!?]+[.!?]?/g) ?? [summary]).slice(0, 2).join(" ").trim();
  } else if (has(instruction, ADD_WORDS)) {
    const extra = payloadOf(instruction) || afterWord(instruction, ADD_WORDS);
    if (!extra) return null;
    after = [summary, extra].filter(Boolean).join(" ").trim();
  } else {
    const value = payloadOf(instruction);
    if (!value) return null;
    after = value;
  }
  if (!after || after === summary) return null;
  return { label: "", before: summary, after, patch: { summary: after } };
}

function findEntry(cv: MasterCv, instruction: string) {
  const i = cv.experience.findIndex(
    (e) =>
      (e.company && lower(instruction).includes(lower(e.company))) ||
      (e.role && lower(instruction).includes(lower(e.role))),
  );
  return i > -1 ? i : cv.experience.length ? 0 : -1;
}

function experienceProposal(cv: MasterCv, instruction: string): Proposal | null {
  const index = findEntry(cv, instruction);
  if (index < 0) return null;
  const entry = cv.experience[index]!;
  const value = payloadOf(instruction);
  if (!value) return null;

  const next: ExperienceEntry = { ...entry };
  let before = "";
  if (has(instruction, COMPANY_WORDS)) {
    before = entry.company;
    next.company = value;
  } else if (has(instruction, TASK_WORDS)) {
    before = entry.bullets.join(" · ");
    next.bullets = value
      .split(/\n|;|،/)
      .map((x) => x.trim())
      .filter(Boolean);
  } else {
    before = entry.role;
    next.role = value;
  }
  const list = [...cv.experience];
  list[index] = next;
  return {
    label: `${entry.role} · ${entry.company}`,
    before,
    after: has(instruction, TASK_WORDS) ? next.bullets.join(" · ") : (next.company !== entry.company ? next.company : next.role),
    patch: { experience: list },
  };
}

export function AiSectionDialog({
  section,
  cv,
  onClose,
  onSave,
}: {
  section: AiSection;
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [unknown, setUnknown] = useState(false);
  const [applied, setApplied] = useState(false);
  const [dates, setDates] = useState<null | {
    role: string;
    company: string;
    start: string;
    end: string;
    tasks: string;
  }>(null);

  const title = section === "profile" ? t("cv.aiTitleProfile") : t("cv.aiTitleExperience");
  const hint = section === "profile" ? t("cv.aiHintProfile") : t("cv.aiHintExperience");

  const analyse = () => {
    const instruction = input.trim();
    if (!instruction) {
      setError(t("cv.aiEmptyError"));
      return;
    }
    setError("");
    setUnknown(false);

    if (section === "experience" && has(instruction, ADD_WORDS)) {
      // New experience always needs explicit start/end dates from the user.
      setDates({
        role: afterWord(instruction, ["as ", "som ", "كـ", "بصفة", "بوظيفة"]),
        company: afterWord(instruction, ["at ", "på ", "hos ", "في ", "لدى "]),
        start: "",
        end: "",
        tasks: "",
      });
      return;
    }

    const p =
      section === "profile"
        ? profileProposal(cv, instruction)
        : experienceProposal(cv, instruction);
    if (!p) {
      setUnknown(true);
      setProposal(null);
      return;
    }
    setProposal(p);
  };

  const confirmDates = () => {
    if (!dates) return;
    if (!dates.role.trim() || !dates.company.trim()) {
      setError(t("cv.expRequiredError"));
      return;
    }
    if (!dates.start.trim()) {
      setError(t("cv.aiDatesError"));
      return;
    }
    setError("");
    const entry: ExperienceEntry = {
      id: uid("exp"),
      role: dates.role.trim(),
      company: dates.company.trim(),
      location: "",
      start: dates.start.trim(),
      end: dates.end.trim() || t("cv.expEndPlaceholder"),
      bullets: dates.tasks
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    };
    setDates(null);
    setProposal({
      label: t("cv.aiNewExperience"),
      before: "",
      after: `${entry.role} · ${entry.company} · ${entry.start}–${entry.end}`,
      patch: { experience: [entry, ...cv.experience] },
    });
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg animate-in slide-in-from-bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
        <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-safe shadow-lift sm:rounded-3xl sm:pb-5">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong sm:hidden" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h2 className="display flex items-center gap-2 text-2xl">
                <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 truncate">{title}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("common.close")}
              className="tap grid place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Step 1 — instruction */}
          {!proposal && !dates ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                analyse();
              }}
              className="mt-5 space-y-3"
            >
              <textarea
                autoFocus
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("cv.aiPlaceholder")}
                aria-label={t("cv.aiPlaceholder")}
                className={field}
              />
              {unknown ? (
                <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {t("cv.chatUnknown")}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="tap flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {t("cv.aiGenerate")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="tap rounded-xl border border-border px-5 text-sm font-medium"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          ) : null}

          {/* Step 2 — dates for a new experience */}
          {dates ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmDates();
              }}
              className="mt-5 space-y-3.5"
            >
              <div className="rounded-xl bg-primary-soft/60 px-3 py-2 text-sm">
                <p className="font-semibold">{t("cv.aiDatesTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("cv.aiDatesHint")}</p>
              </div>
              <label className="block">
                <span className={labelCls}>{t("cv.expRole")}</span>
                <input
                  value={dates.role}
                  onChange={(e) => setDates({ ...dates, role: e.target.value })}
                  placeholder={t("cv.expRolePlaceholder")}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={labelCls}>{t("cv.expCompany")}</span>
                <input
                  value={dates.company}
                  onChange={(e) => setDates({ ...dates, company: e.target.value })}
                  placeholder={t("cv.expCompanyPlaceholder")}
                  className={field}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>{t("cv.expStart")}</span>
                  <input
                    autoFocus
                    value={dates.start}
                    onChange={(e) => setDates({ ...dates, start: e.target.value })}
                    placeholder="2022"
                    className={field}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>{t("cv.expEnd")}</span>
                  <input
                    value={dates.end}
                    onChange={(e) => setDates({ ...dates, end: e.target.value })}
                    placeholder={t("cv.expEndPlaceholder")}
                    className={field}
                  />
                </label>
              </div>
              <label className="block">
                <span className={labelCls}>{t("cv.expTasks")}</span>
                <textarea
                  rows={3}
                  value={dates.tasks}
                  onChange={(e) => setDates({ ...dates, tasks: e.target.value })}
                  placeholder={t("cv.expTasksPlaceholder")}
                  className={field}
                />
              </label>
              {error ? (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="tap flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {t("cv.aiContinue")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="tap rounded-xl border border-border px-5 text-sm font-medium"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          ) : null}

          {/* Step 3 — before / after */}
          {proposal ? (
            <div className="mt-5 space-y-3">
              {proposal.label ? (
                <p className="text-sm font-semibold">{proposal.label}</p>
              ) : null}
              <div className="rounded-xl bg-muted p-3">
                <p className="eyebrow mb-1">{t("cv.chatBefore")}</p>
                <p className="text-sm text-foreground/75">{proposal.before || "—"}</p>
              </div>
              <div className="rounded-xl bg-success-soft p-3">
                <p className="eyebrow mb-1">{t("cv.chatAfter")}</p>
                <p className="text-sm">{proposal.after}</p>
              </div>

              {applied ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  <Check className="size-4" aria-hidden /> {t("cv.chatApplied")}
                </p>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSave(proposal.patch);
                      setApplied(true);
                      setTimeout(onClose, 900);
                    }}
                    className="tap inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    <Check className="size-4" aria-hidden /> {t("cv.chatApply")}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="tap rounded-xl border border-border px-5 text-sm font-medium"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
