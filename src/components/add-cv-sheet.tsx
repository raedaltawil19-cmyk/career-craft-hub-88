import { useNavigate } from "@tanstack/react-router";
import { ClipboardType, FileUp, Linkedin, PenLine, X } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

const options = [
  {
    mode: "paste",
    titleKey: "nav.optionPasteTitle",
    descKey: "nav.optionPasteDesc",
    icon: ClipboardType,
  },
  {
    mode: "upload",
    titleKey: "nav.optionUploadTitle",
    descKey: "nav.optionUploadDesc",
    icon: FileUp,
  },
  {
    mode: "linkedin",
    titleKey: "nav.optionLinkedinTitle",
    descKey: "nav.optionLinkedinDesc",
    icon: Linkedin,
  },
  {
    mode: "manual",
    titleKey: "nav.optionManualTitle",
    descKey: "nav.optionManualDesc",
    icon: PenLine,
  },
] as const;

export function AddCvSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t("nav.addCv")}>
      <button
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg animate-in slide-in-from-bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
        <div className="rounded-t-3xl border border-border bg-card p-5 pb-safe shadow-lift sm:rounded-3xl sm:pb-5">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong sm:hidden" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h2 className="display text-2xl">{t("nav.addCv")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("nav.addCvSubtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("common.close")}
              className="tap grid place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <ul className="mt-5 space-y-2.5">
            {options.map((o) => (
              <li key={o.mode}>
                <button
                  onClick={() => {
                    onClose();
                    navigate({ to: "/app/add/$mode", params: { mode: o.mode } });
                  }}
                  className="tap grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-2xl border border-border bg-surface/70 p-3.5 text-start transition-colors hover:border-primary/40 hover:bg-primary-soft/60"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-soft">
                    <o.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{t(o.titleKey)}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {t(o.descKey)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SheetShellPortalless({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
