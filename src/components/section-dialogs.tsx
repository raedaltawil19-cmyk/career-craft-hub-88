import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import type {
  EducationEntry,
  ExperienceEntry,
  MasterCv,
  ReferenceEntry,
} from "@/lib/career-types";

const field =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const labelCls = "block text-sm font-medium";
const uid = (p: string) => `${p}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;

/* ---------------------------------------------------------------- shell --- */

function SectionDialog({
  title,
  subtitle,
  error,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  subtitle: string;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const t = useT();
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
              <h2 className="display text-2xl">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("common.close")}
              className="tap grid place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-5 space-y-3.5"
          >
            {children}

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
                {t("common.save")}
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
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  onRemove,
  removeLabel,
  children,
}: {
  onRemove: () => void;
  removeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-surface p-3.5 pt-9">
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="absolute end-2.5 top-2.5 grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
      >
        <X className="size-4" />
      </button>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong text-sm font-semibold text-foreground/80 hover:border-primary/50 hover:bg-primary-soft/50"
    >
      <Plus className="size-4" /> {label}
    </button>
  );
}

/* -------------------------------------------------------------- contact --- */

export function ContactDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const [name, setName] = useState(cv.name);
  const [title, setTitle] = useState(cv.title);
  const [email, setEmail] = useState(cv.email);
  const [phone, setPhone] = useState(cv.phone);
  const [location, setLocation] = useState(cv.location);
  const [links, setLinks] = useState<string[]>(cv.links.length ? cv.links : [""]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError(t("cv.contactRequiredError"));
      return;
    }
    onSave({
      name: name.trim(),
      title: title.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      links: links.map((l) => l.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <SectionDialog
      title={t("cv.contactFormTitle")}
      subtitle={t("cv.contactFormSubtitle")}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      <label className={labelCls}>
        {t("cv.fieldName")}
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </label>
      <label className={labelCls}>
        {t("cv.fieldTitle")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelCls}>
          {t("cv.fieldEmail")}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </label>
        <label className={labelCls}>
          {t("cv.fieldPhone")}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </label>
      </div>
      <label className={labelCls}>
        {t("cv.fieldLocation")}
        <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
      </label>

      <div>
        <p className={labelCls}>{t("cv.fieldLinks")}</p>
        <div className="mt-1 space-y-2">
          {links.map((l, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <input
                value={l}
                placeholder={t("cv.fieldLinkPlaceholder")}
                onChange={(e) =>
                  setLinks(links.map((x, xi) => (xi === i ? e.target.value : x)))
                }
                className="min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setLinks(links.filter((_, xi) => xi !== i))}
                aria-label={t("cv.removeItemAria")}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <AddRowButton label={t("cv.addLink")} onClick={() => setLinks([...links, ""])} />
        </div>
      </div>
    </SectionDialog>
  );
}

/* -------------------------------------------------------------- profile --- */

export function ProfileDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const [summary, setSummary] = useState(cv.summary);

  return (
    <SectionDialog
      title={t("cv.profileFormTitle")}
      subtitle={t("cv.profileFormSubtitle")}
      onClose={onClose}
      onSubmit={() => {
        onSave({ summary: summary.trim() });
        onClose();
      }}
    >
      <label className={labelCls}>
        {t("cv.summaryTitle")}
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={7}
          placeholder={t("cv.profileFormSubtitle")}
          className={`${field} resize-y`}
        />
      </label>
    </SectionDialog>
  );
}

/* ----------------------------------------------------------- experience --- */

type ExpDraft = ExperienceEntry & { tasks: string };

export function ExperienceDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const blank = (): ExpDraft => ({
    id: uid("exp"),
    role: "",
    company: "",
    location: "",
    start: "",
    end: "",
    bullets: [],
    tasks: "",
  });
  const [items, setItems] = useState<ExpDraft[]>(
    cv.experience.length
      ? cv.experience.map((e) => ({ ...e, tasks: e.bullets.join("\n") }))
      : [blank()],
  );
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<ExpDraft>) =>
    setItems(items.map((x, xi) => (xi === i ? { ...x, ...p } : x)));

  const submit = () => {
    const cleaned = items.filter((x) => x.role.trim() || x.company.trim());
    if (cleaned.some((x) => !x.role.trim() || !x.company.trim())) {
      setError(t("cv.expRequiredError"));
      return;
    }
    onSave({
      experience: cleaned.map((x) => ({
        id: x.id,
        role: x.role.trim(),
        company: x.company.trim(),
        location: x.location.trim(),
        start: x.start.trim(),
        end: x.end.trim() || t("cv.expEndPlaceholder"),
        bullets: x.tasks
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      })),
    });
    onClose();
  };

  return (
    <SectionDialog
      title={t("cv.expFormTitle")}
      subtitle={t("cv.expFormSubtitle")}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          removeLabel={t("cv.removeExperienceAria", { role: it.role || t("cv.expRole") })}
          onRemove={() => setItems(items.filter((_, xi) => xi !== i))}
        >
          <label className={labelCls}>
            {t("cv.expRole")}
            <input
              value={it.role}
              placeholder={t("cv.expRolePlaceholder")}
              onChange={(e) => patch(i, { role: e.target.value })}
              className={field}
            />
          </label>
          <label className={labelCls}>
            {t("cv.expCompany")}
            <input
              value={it.company}
              placeholder={t("cv.expCompanyPlaceholder")}
              onChange={(e) => patch(i, { company: e.target.value })}
              className={field}
            />
          </label>
          <label className={labelCls}>
            {t("cv.expLocation")}
            <input
              value={it.location}
              placeholder={t("cv.expLocationPlaceholder")}
              onChange={(e) => patch(i, { location: e.target.value })}
              className={field}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              {t("cv.expStart")}
              <input
                value={it.start}
                onChange={(e) => patch(i, { start: e.target.value })}
                className={field}
              />
            </label>
            <label className={labelCls}>
              {t("cv.expEnd")}
              <input
                value={it.end}
                placeholder={t("cv.expEndPlaceholder")}
                onChange={(e) => patch(i, { end: e.target.value })}
                className={field}
              />
            </label>
          </div>
          <label className={labelCls}>
            {t("cv.expTasks")}
            <textarea
              value={it.tasks}
              rows={4}
              placeholder={t("cv.expTasksPlaceholder")}
              onChange={(e) => patch(i, { tasks: e.target.value })}
              className={`${field} resize-y`}
            />
            <span className="mt-1 block text-xs text-muted-foreground">{t("cv.expTasksHint")}</span>
          </label>
        </ItemCard>
      ))}
      <AddRowButton label={t("cv.addExperience")} onClick={() => setItems([...items, blank()])} />
    </SectionDialog>
  );
}

/* ------------------------------------------------------------ education --- */

export function EducationDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const blank = (): EducationEntry => ({
    id: uid("edu"),
    school: "",
    program: "",
    start: "",
    end: "",
    note: "",
  });
  const [items, setItems] = useState<EducationEntry[]>(
    cv.education.length ? cv.education.map((e) => ({ ...e })) : [blank()],
  );
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<EducationEntry>) =>
    setItems(items.map((x, xi) => (xi === i ? { ...x, ...p } : x)));

  const submit = () => {
    const cleaned = items.filter((x) => x.program.trim() || x.school.trim());
    if (cleaned.some((x) => !x.program.trim() || !x.school.trim())) {
      setError(t("cv.eduRequiredError"));
      return;
    }
    onSave({
      education: cleaned.map((x) => ({
        id: x.id,
        program: x.program.trim(),
        school: x.school.trim(),
        start: x.start.trim(),
        end: x.end.trim(),
        note: x.note?.trim() || undefined,
      })),
    });
    onClose();
  };

  return (
    <SectionDialog
      title={t("cv.eduFormTitle")}
      subtitle={t("cv.eduFormSubtitle")}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          removeLabel={t("cv.removeEducationAria", { name: it.program || t("cv.eduProgram") })}
          onRemove={() => setItems(items.filter((_, xi) => xi !== i))}
        >
          <label className={labelCls}>
            {t("cv.eduProgram")}
            <input
              value={it.program}
              placeholder={t("cv.eduProgramPlaceholder")}
              onChange={(e) => patch(i, { program: e.target.value })}
              className={field}
            />
          </label>
          <label className={labelCls}>
            {t("cv.eduSchool")}
            <input
              value={it.school}
              placeholder={t("cv.eduSchoolPlaceholder")}
              onChange={(e) => patch(i, { school: e.target.value })}
              className={field}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              {t("cv.expStart")}
              <input
                value={it.start}
                onChange={(e) => patch(i, { start: e.target.value })}
                className={field}
              />
            </label>
            <label className={labelCls}>
              {t("cv.expEnd")}
              <input
                value={it.end}
                onChange={(e) => patch(i, { end: e.target.value })}
                className={field}
              />
            </label>
          </div>
          <label className={labelCls}>
            {t("cv.eduNote")}
            <input
              value={it.note ?? ""}
              placeholder={t("cv.eduNotePlaceholder")}
              onChange={(e) => patch(i, { note: e.target.value })}
              className={field}
            />
          </label>
        </ItemCard>
      ))}
      <AddRowButton label={t("cv.addEducation")} onClick={() => setItems([...items, blank()])} />
    </SectionDialog>
  );
}

/* --------------------------------------------------------------- skills --- */

export function SkillsDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const [items, setItems] = useState<string[]>(cv.skills.length ? cv.skills : [""]);

  return (
    <SectionDialog
      title={t("cv.skillsFormTitle")}
      subtitle={t("cv.skillsFormSubtitle")}
      onClose={onClose}
      onSubmit={() => {
        onSave({ skills: items.map((s) => s.trim()).filter(Boolean) });
        onClose();
      }}
    >
      <div className="space-y-2">
        {items.map((s, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              value={s}
              placeholder={t("cv.addSkillPlaceholder")}
              onChange={(e) => setItems(items.map((x, xi) => (xi === i ? e.target.value : x)))}
              className="min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, xi) => xi !== i))}
              aria-label={t("cv.removeSkillAria", { skill: s })}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <AddRowButton label={t("cv.addSkill")} onClick={() => setItems([...items, ""])} />
    </SectionDialog>
  );
}

/* ------------------------------------------------------------ languages --- */

type LangDraft = { id: string; name: string; level: string };

const LEVEL_KEYS = ["levelBasic", "levelIntermediate", "levelAdvanced", "levelNative"] as const;

function parseLanguage(raw: string): { name: string; level: string } {
  const m = raw.match(/^(.*?)\s*[（(]\s*(.*?)\s*[)）]\s*$/);
  if (m) return { name: m[1]!.trim(), level: m[2]!.trim() };
  return { name: raw.trim(), level: "" };
}

export function LanguagesDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const levels = LEVEL_KEYS.map((k) => t(`cv.${k}` as `cv.${typeof k}`));
  const blank = (): LangDraft => ({ id: uid("lang"), name: "", level: "" });
  const [items, setItems] = useState<LangDraft[]>(
    cv.languages.length
      ? cv.languages.map((l) => ({ id: uid("lang"), ...parseLanguage(l) }))
      : [blank()],
  );

  const patch = (i: number, p: Partial<LangDraft>) =>
    setItems(items.map((x, xi) => (xi === i ? { ...x, ...p } : x)));

  return (
    <SectionDialog
      title={t("cv.langFormTitle")}
      subtitle={t("cv.langFormSubtitle")}
      onClose={onClose}
      onSubmit={() => {
        onSave({
          languages: items
            .filter((x) => x.name.trim())
            .map((x) => (x.level ? `${x.name.trim()} (${x.level})` : x.name.trim())),
        });
        onClose();
      }}
    >
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <input
                value={it.name}
                placeholder={t("cv.langNamePlaceholder")}
                onChange={(e) => patch(i, { name: e.target.value })}
                className="min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <select
                value={it.level}
                onChange={(e) => patch(i, { level: e.target.value })}
                aria-label={t("cv.langLevel")}
                className="min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">{t("cv.langLevel")}</option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, xi) => xi !== i))}
              aria-label={t("cv.removeLanguageAria", { name: it.name })}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <AddRowButton label={t("cv.addLanguage")} onClick={() => setItems([...items, blank()])} />
    </SectionDialog>
  );
}

/* ----------------------------------------------------------- references --- */

export function ReferencesDialog({
  cv,
  onClose,
  onSave,
}: {
  cv: MasterCv;
  onClose: () => void;
  onSave: (patch: Partial<MasterCv>) => void;
}) {
  const t = useT();
  const blank = (): ReferenceEntry => ({
    id: uid("ref"),
    name: "",
    relation: "",
    company: "",
    email: "",
    phone: "",
  });
  const [items, setItems] = useState<ReferenceEntry[]>(
    cv.references?.length ? cv.references.map((r) => ({ ...r })) : [blank()],
  );
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<ReferenceEntry>) =>
    setItems(items.map((x, xi) => (xi === i ? { ...x, ...p } : x)));

  const submit = () => {
    const cleaned = items.filter((x) => x.name.trim() || x.company.trim());
    if (cleaned.some((x) => !x.name.trim())) {
      setError(t("cv.refRequiredError"));
      return;
    }
    onSave({
      references: cleaned.map((x) => ({
        id: x.id,
        name: x.name.trim(),
        relation: x.relation.trim(),
        company: x.company.trim(),
        email: x.email.trim(),
        phone: x.phone.trim(),
      })),
    });
    onClose();
  };

  return (
    <SectionDialog
      title={t("cv.refFormTitle")}
      subtitle={t("cv.refFormSubtitle")}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          removeLabel={t("cv.removeReferenceAria", { name: it.name || t("cv.refName") })}
          onRemove={() => setItems(items.filter((_, xi) => xi !== i))}
        >
          <label className={labelCls}>
            {t("cv.refName")}
            <input
              value={it.name}
              onChange={(e) => patch(i, { name: e.target.value })}
              className={field}
            />
          </label>
          <label className={labelCls}>
            {t("cv.refRelation")}
            <input
              value={it.relation}
              placeholder={t("cv.refRelationPlaceholder")}
              onChange={(e) => patch(i, { relation: e.target.value })}
              className={field}
            />
          </label>
          <label className={labelCls}>
            {t("cv.refCompany")}
            <input
              value={it.company}
              onChange={(e) => patch(i, { company: e.target.value })}
              className={field}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              {t("cv.fieldEmail")}
              <input
                value={it.email}
                onChange={(e) => patch(i, { email: e.target.value })}
                className={field}
              />
            </label>
            <label className={labelCls}>
              {t("cv.fieldPhone")}
              <input
                value={it.phone}
                onChange={(e) => patch(i, { phone: e.target.value })}
                className={field}
              />
            </label>
          </div>
        </ItemCard>
      ))}
      <AddRowButton label={t("cv.addReference")} onClick={() => setItems([...items, blank()])} />
    </SectionDialog>
  );
}
