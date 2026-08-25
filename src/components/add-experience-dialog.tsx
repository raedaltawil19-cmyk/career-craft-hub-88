import { X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import type { ExperienceEntry } from "@/lib/career-types";

export function AddExperienceDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (entry: ExperienceEntry) => void;
}) {
  const t = useT();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [tasks, setTasks] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setRole("");
    setCompany("");
    setLocation("");
    setStart("");
    setEnd("");
    setTasks("");
    setError("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim()) {
      setError(t("cv.expRequiredError"));
      return;
    }
    onSave({
      id: `exp-${Date.now()}`,
      role: role.trim(),
      company: company.trim(),
      location: location.trim(),
      start: start.trim(),
      end: end.trim() || t("cv.expEndPlaceholder"),
      bullets: tasks
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    });
    close();
  };

  const field =
    "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t("cv.expFormTitle")}>
      <button
        aria-label={t("common.close")}
        onClick={close}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg animate-in slide-in-from-bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
        <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-safe shadow-lift sm:rounded-3xl sm:pb-5">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong sm:hidden" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h2 className="display text-2xl">{t("cv.expFormTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("cv.expFormSubtitle")}</p>
            </div>
            <button
              onClick={close}
              aria-label={t("common.close")}
              className="tap grid place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            <label className="block text-sm font-medium">
              {t("cv.expRole")}
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t("cv.expRolePlaceholder")}
                maxLength={120}
                className={field}
              />
            </label>
            <label className="block text-sm font-medium">
              {t("cv.expCompany")}
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t("cv.expCompanyPlaceholder")}
                maxLength={120}
                className={field}
              />
            </label>
            <label className="block text-sm font-medium">
              {t("cv.expLocation")}
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("cv.expLocationPlaceholder")}
                maxLength={120}
                className={field}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                {t("cv.expStart")}
                <input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="2022-03"
                  maxLength={40}
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium">
                {t("cv.expEnd")}
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder={t("cv.expEndPlaceholder")}
                  maxLength={40}
                  className={field}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              {t("cv.expTasks")}
              <textarea
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder={t("cv.expTasksPlaceholder")}
                className={`${field} resize-y`}
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {t("cv.expTasksHint")}
              </span>
            </label>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="tap flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {t("common.save")}
              </button>
              <button
                type="button"
                onClick={close}
                className="tap rounded-xl border border-border px-4 text-sm font-medium"
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
