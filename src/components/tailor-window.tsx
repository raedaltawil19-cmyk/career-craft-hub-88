import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  FileUp,
  Link2,
  Loader2,
  Target,
  Type,
} from "lucide-react";
import type { Suggestion, TailorChange } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { cn } from "@/lib/utils";
import { FloatingWindow } from "./floating-window";
import { SuggestionList } from "./suggestion-list";

type Tab = "paste" | "url" | "upload";

/** Map a suggestion section label to the CV field the change belongs to. */
function targetOf(section: string): TailorChange["target"] {
  const s = section.toLowerCase();
  if (/summary|profil|ملخص|نبذة/.test(s)) return "summary";
  if (/skill|färdighet|kompetens|مهار/.test(s)) return "skills";
  return "bullet";
}

/**
 * "Tailor for a job" window: job input (paste / link / file), then review of the
 * recommendations. Approving never edits the Master CV — a brand new tailored
 * version is created with only the approved changes applied.
 */
export function TailorWindow({
  suggestions,
  presetTitle,
  sourceId,
  onClose,
}: {
  suggestions: Suggestion[];
  presetTitle?: string | undefined;
  sourceId?: string | undefined;
  onClose: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  const { createTailoredCv, state } = useWorkspace();
  const [tab, setTab] = useState<Tab>("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "results" | "done">("input");
  /** Local review state — the shared workspace suggestions stay untouched. */
  const [local, setLocal] = useState<Suggestion[]>(suggestions);
  const [newDocId, setNewDocId] = useState<string | null>(null);

  const ready =
    (tab === "paste" && text.trim().length > 20) ||
    (tab === "url" && url.trim().length > 8) ||
    (tab === "upload" && !!fileName);

  const analyse = () => {
    setLocal(suggestions.map((s) => ({ ...s, state: "pending" })));
    setPhase("loading");
    window.setTimeout(() => setPhase("results"), 1200);
  };

  const accepted = local.filter((s) => s.state === "accepted");
  const done = local.filter((s) => s.state !== "pending").length;
  const newDoc = state.docs.find((d) => d.id === newDocId) ?? null;

  const create = () => {
    const changes: TailorChange[] = accepted.map((s) => ({
      target: targetOf(s.section),
      before: s.before,
      after: s.after,
    }));
    const id = createTailoredCv({
      ...(sourceId ? { sourceId } : {}),
      baseName: presetTitle ?? t("ws.tailorInputTitle"),
      ...(presetTitle ? { jobTitle: presetTitle } : {}),
      changes,
    });
    setNewDocId(id);
    setPhase("done");
  };

  return (
    <FloatingWindow
      title={t("ws.tailorInputTitle")}
      subtitle={presetTitle ?? t("ws.tailorInputHint")}
      icon={<Target className="size-4.5" />}
      onClose={onClose}
      footer={
        phase === "input" ? (
          <button
            type="button"
            disabled={!ready}
            onClick={analyse}
            className="tap w-full rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground disabled:opacity-45"
          >
            {t("ws.analyze")}
          </button>
        ) : phase === "results" ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {t("ws.recCount", { done, total: local.length })}
            </p>
            <button
              type="button"
              disabled={!accepted.length}
              onClick={create}
              className="tap rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-45"
            >
              {t("ws.tailorCreate")}
            </button>
          </div>
        ) : undefined
      }
    >
      {phase === "input" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
            {(
              [
                { id: "paste", label: t("ws.tabPaste"), icon: Type },
                { id: "url", label: t("ws.tabUrl"), icon: Link2 },
                { id: "upload", label: t("ws.tabUpload"), icon: FileUp },
              ] as const
            ).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setTab(x.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors",
                  tab === x.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
                )}
              >
                <x.icon className="size-4" />
                {x.label}
              </button>
            ))}
          </div>

          {tab === "paste" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={t("ws.jobTextPlaceholder")}
              className="w-full rounded-2xl border border-border-strong bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary"
            />
          ) : null}

          {tab === "url" ? (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputMode="url"
              placeholder={t("ws.jobUrlPlaceholder")}
              className="tap w-full rounded-2xl border border-border-strong bg-background px-4 text-sm outline-none focus:border-primary"
            />
          ) : null}

          {tab === "upload" ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-background p-8 text-center">
              <FileUp className="size-6 text-primary" />
              <span className="text-sm font-semibold">
                {fileName ? t("ws.fileChosen", { name: fileName }) : t("ws.dropFile")}
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="sr-only"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          ) : null}
        </div>
      ) : phase === "loading" ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t("ws.analyzing")}</p>
        </div>
      ) : phase === "results" ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{t("ws.recSubtitle")}</p>
          <SuggestionList
            suggestions={local}
            onApply={(id, after) =>
              setLocal((l) => l.map((s) => (s.id === id ? { ...s, after, state: "accepted" } : s)))
            }
            onReject={(id) =>
              setLocal((l) => l.map((s) => (s.id === id ? { ...s, state: "rejected" } : s)))
            }
          />
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-success text-success">
              <Check className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{newDoc?.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{t("ws.tailorCreated")}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <button
              type="button"
              disabled={!newDoc}
              onClick={() => {
                if (!newDoc) return;
                onClose();
                navigate({ to: "/app/cv/$docId/view", params: { docId: newDoc.id } });
              }}
              className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground disabled:opacity-45"
            >
              <FileText className="size-4.5" aria-hidden />
              {t("ws.tailorOpenCv")}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {tab === "url" && url.trim() ? (
                <a
                  href={url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border-strong bg-card px-3 text-sm font-bold hover:bg-muted"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  {t("ws.tailorApply")}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate({ to: "/app/jobs" });
                  }}
                  className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border-strong bg-card px-3 text-sm font-bold hover:bg-muted"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  {t("ws.tailorApply")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate({ to: "/app" });
                }}
                className="tap inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-3 text-sm font-bold text-muted-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
                {t("ws.tailorBackToLibrary")}
              </button>
            </div>
          </div>
        </div>
      )}
    </FloatingWindow>
  );
}
