import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Pencil, Sparkles, Undo2, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { CvEditChat } from "@/components/cv-edit-chat";
import {
  ContactDialog,
  EducationDialog,
  ExperienceDialog,
  LanguagesDialog,
  ProfileDialog,
  ReferencesDialog,
  SkillsDialog,
} from "@/components/section-dialogs";
import { EmptyState, Eyebrow, Panel, Tag } from "@/components/ui-bits";
import type { Suggestion } from "@/lib/career-types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const searchSchema = z.object({
  panel: z.enum(["sections", "ai", "preview"]).catch("sections"),
});

export const Route = createFileRoute("/app/cv/edit")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "CV editor — Smart CV" },
      { name: "description", content: "Edit sections, review AI recommendations, preview output." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvEditor,
});

function CvEditor() {
  const t = useT();
  const { panel } = Route.useSearch();
  const navigate = useNavigate();
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv;

  const panels = [
    { id: "sections", label: t("cv.panelSections") },
    { id: "ai", label: t("cv.panelAssistant") },
    { id: "preview", label: t("cv.panelPreview") },
  ] as const;

  if (!cv) {
    return (
      <EmptyState
        title={t("cv.emptyEditTitle")}
        description={t("cv.emptyEditDescription")}
      />
    );
  }

  const setPanel = (p: (typeof panels)[number]["id"]) =>
    navigate({ to: "/app/cv/edit", search: { panel: p } });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link
          to="/app/cv"
          className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="size-4 shrink-0 rtl:rotate-180" /> {t("cv.backToMaster")}
        </Link>
        <span className="shrink-0 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          {t("cv.savedVersion", { version: cv.version })}
        </span>
      </div>

      {/* Mobile panel switcher */}
      <div
        role="tablist"
        aria-label={t("cv.editorPanelsAria")}
        className="flex gap-1 rounded-xl border border-border bg-surface p-1 lg:hidden"
      >
        {panels.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={panel === p.id}
            onClick={() => setPanel(p.id)}
            className={cn(
              "tap flex-1 rounded-lg text-sm font-medium",
              panel === p.id ? "bg-card shadow-soft" : "text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)_21rem]">
        <div className={cn(panel === "sections" ? "block" : "hidden", "lg:block")}>
          <SectionsPanel />
        </div>
        <div className={cn(panel === "preview" ? "block" : "hidden", "lg:block")}>
          <CvPreview cv={cv} />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("cv.previewNote", { template: cv.template })}
          </p>
        </div>
        <div className={cn(panel === "ai" ? "block" : "hidden", "lg:block")}>
          <CvEditChat />
        </div>
      </div>

      <Panel className="lg:hidden">
        <p className="text-xs text-muted-foreground">{t("cv.desktopHint")}</p>
      </Panel>

      <div className="sr-only" aria-live="polite">
        {t("cv.editingSrLive", { name: cv.name })}
      </div>
      <button
        onClick={() => updateMasterCv({ version: cv.version + 1 })}
        className="tap hidden"
        aria-hidden
      />
    </div>
  );
}

function SectionsPanel() {
  const t = useT();
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv!;
  const [openSection, setOpenSection] = useState<
    null | "contact" | "profile" | "experience" | "education" | "skills" | "languages" | "references"
  >(null);
  const close = () => setOpenSection(null);
  const save = (patch: Partial<typeof cv>) => updateMasterCv(patch);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...cv.experience];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    updateMasterCv({ experience: next });
  };

  const removeAt = <T,>(arr: T[], i: number) => arr.filter((_, xi) => xi !== i);

  return (
    <div className="space-y-3">
      {/* 1. Name & contact ------------------------------------------------ */}
      <SectionCard
        title={t("cv.sectionContactTitle")}
        onEdit={() => setOpenSection("contact")}
      >
        {cv.name || cv.email || cv.phone ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium">{cv.name}</p>
            <p className="text-muted-foreground">{cv.title}</p>
            <p className="text-xs text-muted-foreground">
              {[cv.location, cv.email, cv.phone].filter(Boolean).join(" · ")}
            </p>
            {cv.links.length ? (
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {cv.links.map((l) => (
                  <li key={l} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                    {l}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>

      {/* 2. Profile ------------------------------------------------------- */}
      <SectionCard
        title={t("cv.sectionProfileTitle")}
        onEdit={() => setOpenSection("profile")}
      >
        {cv.summary ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{cv.summary}</p>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>

      {/* 3. Experience ---------------------------------------------------- */}
      <SectionCard
        title={t("cv.experienceTitle")}
        onEdit={() => setOpenSection("experience")}
      >
        {cv.experience.length ? (
          <ul className="space-y-2">
            {cv.experience.map((e, i) => (
              <li
                key={e.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface p-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{e.role}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {e.company} · {e.start}–{e.end}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    aria-label={t("cv.moveUpAria", { role: e.role })}
                    className="tap grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    aria-label={t("cv.moveDownAria", { role: e.role })}
                    className="tap grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    ↓
                  </button>
                  <RemoveButton
                    label={t("cv.removeExperienceAria", { role: e.role })}
                    onClick={() => updateMasterCv({ experience: removeAt(cv.experience, i) })}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>

      {/* 4. Education ----------------------------------------------------- */}
      <SectionCard title={t("cv.educationTitle")} onEdit={() => setOpenSection("education")}>
        {cv.education.length ? (
          <ul className="space-y-2">
            {cv.education.map((ed, i) => (
              <li
                key={ed.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface p-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{ed.program}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {ed.school} · {ed.start}–{ed.end}
                  </span>
                </span>
                <RemoveButton
                  label={t("cv.removeEducationAria", { name: ed.program })}
                  onClick={() => updateMasterCv({ education: removeAt(cv.education, i) })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>

      {/* 5. Skills -------------------------------------------------------- */}
      <SectionCard title={t("cv.skillsTitle")} onEdit={() => setOpenSection("skills")}>
        {cv.skills.length ? (
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
              >
                {s}
                <button
                  onClick={() => updateMasterCv({ skills: cv.skills.filter((x) => x !== s) })}
                  aria-label={t("cv.removeSkillAria", { skill: s })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <EmptyHint />
        )}
        <AddSkill />
      </SectionCard>

      {/* 6. Languages ----------------------------------------------------- */}
      <SectionCard title={t("cv.languagesTitle")} onEdit={() => setOpenSection("languages")}>
        {cv.languages.length ? (
          <ul className="space-y-2">
            {cv.languages.map((l, i) => (
              <li
                key={`${l}-${i}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm">{l}</span>
                <RemoveButton
                  label={t("cv.removeLanguageAria", { name: l })}
                  onClick={() => updateMasterCv({ languages: removeAt(cv.languages, i) })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>

      {/* 7. References ---------------------------------------------------- */}
      <SectionCard title={t("cv.referencesTitle")} onEdit={() => setOpenSection("references")}>
        {cv.references?.length ? (
          <ul className="space-y-2">
            {cv.references.map((r, i) => (
              <li
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface p-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{r.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[r.relation, r.company, r.email, r.phone].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <RemoveButton
                  label={t("cv.removeReferenceAria", { name: r.name })}
                  onClick={() =>
                    updateMasterCv({ references: removeAt(cv.references ?? [], i) })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        )}
      </SectionCard>


      {openSection === "contact" ? (
        <ContactDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "profile" ? (
        <ProfileDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "experience" ? (
        <ExperienceDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "education" ? (
        <EducationDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "skills" ? (
        <SkillsDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "languages" ? (
        <LanguagesDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
      {openSection === "references" ? (
        <ReferencesDialog cv={cv} onClose={close} onSave={save} />
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <Panel>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="min-w-0 text-base font-semibold">{title}</h2>
        <button
          onClick={onEdit}
          aria-label={t("cv.editSectionAria", { section: title })}
          className="tap grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:bg-primary-soft/60 hover:text-primary"
        >
          <Pencil className="size-4" />
        </button>
      </div>
      <div className="mt-2.5">{children}</div>
    </Panel>
  );
}

function EmptyHint() {
  const t = useT();
  return <p className="text-sm text-muted-foreground">{t("cv.sectionEmpty")}</p>;
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
    >
      <X className="size-4" />
    </button>
  );
}


function AddSkill() {
  const t = useT();
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv!;
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (!v || cv.skills.includes(v)) return;
        updateMasterCv({ skills: [...cv.skills, v] });
        setValue("");
      }}
      className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("cv.addSkillPlaceholder")}
        className="tap min-w-0 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <button className="tap shrink-0 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">
        {t("cv.addButton")}
      </button>
    </form>
  );
}
