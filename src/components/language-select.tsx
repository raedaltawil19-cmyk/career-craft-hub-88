import { Globe } from "lucide-react";
import { LANGUAGES, useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Secondary, low-emphasis language switcher.
 * Native <select> keeps it compact and accessible on mobile.
 */
export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      title={t("common.languageHint")}
    >
      <Globe className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        className="cursor-pointer appearance-none bg-transparent pe-1 text-xs font-medium outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
