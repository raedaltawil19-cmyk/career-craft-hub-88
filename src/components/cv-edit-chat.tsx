import { useState } from "react";
import { Check, Send, Sparkles, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { Panel } from "@/components/ui-bits";
import type { MasterCv } from "@/lib/career-types";
import { cn } from "@/lib/utils";

type Proposal = {
  /** i18n key for the field label. */
  labelKey: string;
  before: string;
  after: string;
  patch: Partial<MasterCv>;
};

type Turn = {
  id: string;
  instruction: string;
  proposal: Proposal | null;
  state: "pending" | "applied" | "dismissed";
};

/**
 * Text-driven manual editing: the user writes an instruction, the assistant
 * proposes a concrete before/after change and applies it on confirmation.
 */
export function CvEditChat() {
  const t = useT();
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv!;
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const send = () => {
    const instruction = input.trim();
    if (!instruction) return;
    setTurns((x) => [
      ...x,
      {
        id: `turn-${x.length + 1}-${Date.now()}`,
        instruction,
        proposal: parseInstruction(cv, instruction),
        state: "pending",
      },
    ]);
    setInput("");
  };

  const examples = [t("cv.chatExample1"), t("cv.chatExample2"), t("cv.chatExample3")];

  return (
    <div className="space-y-3">
      <Panel className="border-primary/25 bg-primary-soft/40">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{t("cv.chatTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("cv.chatIntro")}</p>
          </div>
        </div>
        <ul className="mt-3 space-y-1.5">
          {examples.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => setInput(ex)}
                className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-start text-xs font-medium hover:bg-muted"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <ul className="space-y-3">
        {turns.map((turn) => (
          <li key={turn.id} className="space-y-2">
            <p className="ms-auto w-fit max-w-[85%] rounded-2xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
              {turn.instruction}
            </p>

            {turn.proposal ? (
              <Panel
                className={cn(
                  "w-full",
                  turn.state === "applied" && "border-success/40",
                  turn.state === "dismissed" && "opacity-60",
                )}
              >
                <p className="eyebrow mb-1.5">{t("cv.chatProposal")}</p>
                <p className="text-sm font-semibold">{t(turn.proposal.labelKey)}</p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="eyebrow mb-1">{t("cv.chatBefore")}</p>
                    <p className="text-foreground/75">{turn.proposal.before || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-success-soft p-2.5">
                    <p className="eyebrow mb-1">{t("cv.chatAfter")}</p>
                    <p>{turn.proposal.after}</p>
                  </div>
                </div>

                {turn.state === "pending" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateMasterCv(turn.proposal!.patch);
                        setTurns((x) =>
                          x.map((y) => (y.id === turn.id ? { ...y, state: "applied" } : y)),
                        );
                      }}
                      className="tap inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="size-4" aria-hidden /> {t("cv.chatApply")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTurns((x) =>
                          x.map((y) => (y.id === turn.id ? { ...y, state: "dismissed" } : y)),
                        )
                      }
                      className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-medium"
                    >
                      <X className="size-4" aria-hidden /> {t("cv.chatDismiss")}
                    </button>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold",
                      turn.state === "applied" ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {turn.state === "applied" ? (
                      <>
                        <Check className="size-4" aria-hidden /> {t("cv.chatApplied")}
                      </>
                    ) : (
                      t("cv.chatDismissed")
                    )}
                  </p>
                )}
              </Panel>
            ) : (
              <p className="w-fit max-w-[92%] rounded-2xl border border-border bg-card p-3 text-sm text-muted-foreground">
                {t("cv.chatUnknown")}
              </p>
            )}
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("cv.chatPlaceholder")}
          aria-label={t("cv.chatPlaceholder")}
          className="tap min-w-0 flex-1 rounded-2xl border border-border-strong bg-background px-4 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          aria-label={t("cv.chatSend")}
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Send className="size-4.5 rtl:-scale-x-100" aria-hidden />
        </button>
      </form>
    </div>
  );
}

const SEPARATORS = [" to ", " till ", " إلى ", " الى ", ":", "="];

type FieldSpec = {
  labelKey: string;
  keywords: string[];
  read: (cv: MasterCv) => string;
  write: (cv: MasterCv, value: string) => Partial<MasterCv>;
};

const FIELDS: FieldSpec[] = [
  {
    labelKey: "cv.fieldTitle",
    keywords: [
      "job title",
      "jobtitle",
      "professional title",
      "jobbtitel",
      "titel",
      "المسمى",
      "اللقب",
    ],
    read: (cv) => cv.title,
    write: (_cv, v) => ({ title: v }),
  },
  {
    labelKey: "cv.fieldEmail",
    keywords: ["email", "e-mail", "e-post", "epost", "mail", "البريد", "الايميل", "الإيميل"],
    read: (cv) => cv.email,
    write: (_cv, v) => ({ email: v }),
  },
  {
    labelKey: "cv.fieldPhone",
    keywords: ["phone", "telefon", "mobil", "الهاتف", "الجوال", "رقم"],
    read: (cv) => cv.phone,
    write: (_cv, v) => ({ phone: v }),
  },
  {
    labelKey: "cv.fieldLocation",
    keywords: ["location", "city", "plats", "ort", "stad", "الموقع", "المدينة", "العنوان"],
    read: (cv) => cv.location,
    write: (_cv, v) => ({ location: v }),
  },
  {
    labelKey: "cv.fieldName",
    keywords: ["name", "namn", "الاسم"],
    read: (cv) => cv.name,
    write: (_cv, v) => ({ name: v }),
  },
  {
    labelKey: "cv.sectionProfileTitle",
    keywords: ["profile", "summary", "profil", "sammanfattning", "الملخص", "البروفايل", "النبذة"],
    read: (cv) => cv.summary,
    write: (_cv, v) => ({ summary: v }),
  },
  {
    labelKey: "cv.expRole",
    keywords: ["role", "position", "roll", "الوظيفة", "المنصب"],
    read: (cv) => cv.experience[0]?.role ?? "",
    write: (cv, v) => patchFirstExperience(cv, { role: v }),
  },
  {
    labelKey: "cv.expCompany",
    keywords: ["employer", "company", "arbetsgivare", "företag", "رب العمل", "الشركة", "جهة العمل"],
    read: (cv) => cv.experience[0]?.company ?? "",
    write: (cv, v) => patchFirstExperience(cv, { company: v }),
  },
  {
    labelKey: "cv.skillsFormTitle",
    keywords: ["skill", "skills", "färdighet", "kompetens", "المهارات", "المهارة"],
    read: (cv) => cv.skills.join(", "),
    write: (_cv, v) => ({ skills: splitList(v) }),
  },
  {
    labelKey: "cv.langFormTitle",
    keywords: ["language", "languages", "språk", "اللغات", "اللغة"],
    read: (cv) => cv.languages.join(", "),
    write: (_cv, v) => ({ languages: splitList(v) }),
  },
  {
    labelKey: "cv.eduSchool",
    keywords: [
      "school",
      "university",
      "institution",
      "skola",
      "universitet",
      "الجامعة",
      "المدرسة",
      "الجهة",
    ],
    read: (cv) => cv.education[0]?.school ?? "",
    write: (cv, v) => patchFirstEducation(cv, { school: v }),
  },
  {
    labelKey: "cv.eduProgram",
    keywords: [
      "programme",
      "program",
      "degree",
      "utbildning",
      "examen",
      "البرنامج",
      "الشهادة",
      "التخصص",
    ],
    read: (cv) => cv.education[0]?.program ?? "",
    write: (cv, v) => patchFirstEducation(cv, { program: v }),
  },
];

function patchFirstExperience(cv: MasterCv, patch: Partial<MasterCv["experience"][number]>) {
  const first = cv.experience[0];
  if (!first) return {};
  return { experience: [{ ...first, ...patch }, ...cv.experience.slice(1)] };
}

function patchFirstEducation(cv: MasterCv, patch: Partial<MasterCv["education"][number]>) {
  const first = cv.education[0];
  if (!first) return {};
  return { education: [{ ...first, ...patch }, ...cv.education.slice(1)] };
}

function splitList(value: string): string[] {
  return value
    .split(/[,،;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function findField(text: string): FieldSpec | null {
  const lower = text.toLowerCase();
  let best: { field: FieldSpec; length: number } | null = null;
  for (const field of FIELDS) {
    for (const kw of field.keywords) {
      if (lower.includes(kw.toLowerCase()) && (!best || kw.length > best.length)) {
        best = { field, length: kw.length };
      }
    }
  }
  return best?.field ?? null;
}

/**
 * Local, deterministic instruction parsing — never invents facts, it only moves
 * the words the user typed into the field they named.
 */
function parseInstruction(cv: MasterCv, instruction: string): Proposal | null {
  const text = instruction.trim();
  const lower = text.toLowerCase();

  // "shorten the profile" style commands operate on existing text only.
  if (/\b(shorten|kort(a|are)?|اختصر|قصّر|قصر)\b/.test(lower) || /اختصر/.test(text)) {
    const field = findField(text) ?? FIELDS.find((f) => f.labelKey === "cv.sectionProfileTitle")!;
    const before = field.read(cv);
    if (!before) return null;
    const after =
      before
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .slice(0, 1)
        .join(" ") || before;
    if (after === before) return null;
    return { labelKey: field.labelKey, before, after, patch: field.write(cv, after) };
  }

  let index = -1;
  let sepLength = 0;
  for (const sep of SEPARATORS) {
    const at = text.toLowerCase().lastIndexOf(sep);
    if (at > index) {
      index = at;
      sepLength = sep.length;
    }
  }
  if (index < 0) return null;

  const target = text.slice(0, index);
  const value = text
    .slice(index + sepLength)
    .trim()
    .replace(/^["'«]|["'»]$/g, "");
  if (!value) return null;

  const field = findField(target);
  if (!field) return null;

  const patch = field.write(cv, value);
  if (!Object.keys(patch).length) return null;

  return { labelKey: field.labelKey, before: field.read(cv), after: value, patch };
}
