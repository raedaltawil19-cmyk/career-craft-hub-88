import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Pencil, Sparkles, Undo2, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, Eyebrow, Panel, Tag } from "@/components/ui-bits";
import type { Suggestion } from "@/lib/career-types";
import { cn } from "@/lib/utils";

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

const panels = [
  { id: "sections", label: "Sections" },
  { id: "ai", label: "Assistant" },
  { id: "preview", label: "Preview" },
] as const;

function CvEditor() {
  const { panel } = Route.useSearch();
  const navigate = useNavigate();
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv;

  if (!cv) {
    return (
      <EmptyState
        title="Nothing to edit yet"
        description="Create your Master CV first using the + action."
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
          <ArrowLeft className="size-4 shrink-0" /> Master CV
        </Link>
        <span className="shrink-0 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          Saved · v{cv.version}
        </span>
      </div>

      {/* Mobile panel switcher */}
      <div
        role="tablist"
        aria-label="Editor panels"
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
            Preview reflects the {cv.template} template
          </p>
        </div>
        <div className={cn(panel === "ai" ? "block" : "hidden", "lg:block")}>
          <AiPanel />
        </div>
      </div>

      <Panel className="lg:hidden">
        <p className="text-xs text-muted-foreground">
          Editing on a larger screen shows sections, preview and the assistant side by side.
        </p>
      </Panel>

      <div className="sr-only" aria-live="polite">
        Editing {cv.name} master CV
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
  const { state, updateMasterCv } = useWorkspace();
  const cv = state.masterCv!;
  const [editingSummary, setEditingSummary] = useState(false);
  const [summary, setSummary] = useState(cv.summary);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...cv.experience];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateMasterCv({ experience: next });
  };

  return (
    <div className="space-y-3">
      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="min-w-0 text-base font-semibold">Professional summary</h2>
          <button
            onClick={() => setEditingSummary((v) => !v)}
            className="tap grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Edit summary"
          >
            <Pencil className="size-4" />
          </button>
        </div>
        {editingSummary ? (
          <>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              className="mt-2 w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  updateMasterCv({ summary });
                  setEditingSummary(false);
                }}
                className="tap rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setSummary(cv.summary);
                  setEditingSummary(false);
                }}
                className="tap rounded-xl border border-border px-4 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cv.summary}</p>
        )}
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold">Experience</h2>
        <ul className="mt-2 space-y-2">
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
              <span className="flex shrink-0 gap-1">
                <button
                  onClick={() => move(i, -1)}
                  aria-label={`Move ${e.role} up`}
                  className="tap grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  aria-label={`Move ${e.role} down`}
                  className="tap grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold">Skills</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cv.skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {s}
              <button
                onClick={() => updateMasterCv({ skills: cv.skills.filter((x) => x !== s) })}
                aria-label={`Remove ${s}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <AddSkill />
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold">Other sections</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>Education · {cv.education.length}</li>
          <li>Projects · {cv.projects.length}</li>
          <li>Certifications · {cv.certifications.length}</li>
          <li>Volunteer · {cv.volunteer.length}</li>
        </ul>
      </Panel>
    </div>
  );
}

function AddSkill() {
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
        placeholder="Add a skill"
        className="tap min-w-0 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <button className="tap shrink-0 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">
        Add
      </button>
    </form>
  );
}

function AiPanel() {
  const { state, setSuggestionState, acceptAllSuggestions, updateMasterCv } = useWorkspace();
  const cv = state.masterCv!;
  const pending = state.suggestions.filter((s) => s.state === "pending");

  const apply = (s: Suggestion) => {
    if (s.section === "Professional summary") updateMasterCv({ summary: s.after });
    setSuggestionState(s.id, "accepted");
  };

  return (
    <div className="space-y-3">
      <Panel className="border-primary/25 bg-primary-soft/40">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Assistant · CV context</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Read-only analysis. Nothing changes until you accept a recommendation.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Improve this section", "Make achievements stronger", "Find missing keywords"].map(
            (a) => (
              <button
                key={a}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {a}
              </button>
            ),
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <Eyebrow>{pending.length} open recommendations</Eyebrow>
        {pending.length ? (
          <button
            onClick={acceptAllSuggestions}
            className="shrink-0 text-xs font-semibold text-primary"
          >
            Accept all
          </button>
        ) : null}
      </div>

      {state.suggestions.length ? (
        <ul className="space-y-3">
          {state.suggestions.map((s) => (
            <li key={s.id}>
              <Panel
                className={cn(
                  s.state === "accepted" && "border-success/40",
                  s.state === "rejected" && "opacity-60",
                )}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-accent">{s.section}</p>
                    <p className="mt-0.5 text-sm font-medium">{s.issue}</p>
                  </div>
                  <Tag tone={s.severity === "high" ? "gap" : "neutral"}>{s.severity}</Tag>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{s.rationale}</p>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="eyebrow mb-1">Current</p>
                    <p className="text-foreground/75">{s.before}</p>
                  </div>
                  <div className="rounded-lg bg-success-soft p-2.5">
                    <p className="eyebrow mb-1">Suggested</p>
                    <p>{s.after}</p>
                  </div>
                </div>

                {s.state === "pending" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => apply(s)}
                      className="tap inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
                    >
                      <Check className="size-4" /> Accept
                    </button>
                    <button
                      onClick={() => setSuggestionState(s.id, "rejected")}
                      className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-medium"
                    >
                      <X className="size-4" /> Reject
                    </button>
                    <button className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-medium">
                      <Pencil className="size-4" /> Edit
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        s.state === "accepted" ? "text-success" : "text-muted-foreground",
                      )}
                    >
                      {s.state === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                    <button
                      onClick={() => setSuggestionState(s.id, "pending")}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                    >
                      <Undo2 className="size-3.5" /> Undo
                    </button>
                  </div>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No recommendations"
          description={`The assistant found nothing to flag in ${cv.name.split(" ")[0]}'s CV right now.`}
        />
      )}
    </div>
  );
}
