import { useState } from "react";
import { FileUp, Link2, Loader2, Target, Type } from "lucide-react";
import type { Suggestion } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { FloatingWindow } from "./floating-window";
import { SuggestionList } from "./suggestion-list";

type Tab = "paste" | "url" | "upload";

/**
 * "Tailor for a job" window: job input (paste / link / file) then the same
 * recommendation review flow as the general improvement window.
 */
export function TailorWindow({
  suggestions,
  presetTitle,
  onApply,
  onReject,
  onClose,
}: {
  suggestions: Suggestion[];
  presetTitle?: string | undefined;
  onApply: (id: string, text: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "results">("input");

  const ready =
    (tab === "paste" && text.trim().length > 20) ||
    (tab === "url" && url.trim().length > 8) ||
    (tab === "upload" && !!fileName);

  const analyse = () => {
    setPhase("loading");
    window.setTimeout(() => setPhase("results"), 1200);
  };

  const done = suggestions.filter((s) => s.state !== "pending").length;

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
              {t("ws.recCount", { done, total: suggestions.length })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="tap rounded-2xl border border-border-strong bg-card px-4 text-sm font-bold hover:bg-muted"
            >
              {t("ws.close")}
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
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{t("ws.recSubtitle")}</p>
          <SuggestionList suggestions={suggestions} onApply={onApply} onReject={onReject} />
          {done ? <p className="mt-4 text-xs text-muted-foreground">{t("ws.sending")}</p> : null}
        </>
      )}
    </FloatingWindow>
  );
}
