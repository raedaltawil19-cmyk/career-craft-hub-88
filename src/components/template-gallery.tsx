import { Check } from "lucide-react";
import type { CvTemplateId } from "@/lib/career-types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const CV_TEMPLATES: { id: CvTemplateId; nameKey: string; descKey: string }[] = [
  { id: "editorial", nameKey: "ws.tplEditorial", descKey: "ws.tplEditorialDesc" },
  { id: "modern", nameKey: "ws.tplModern", descKey: "ws.tplModernDesc" },
  { id: "classic", nameKey: "ws.tplClassic", descKey: "ws.tplClassicDesc" },
  { id: "compact", nameKey: "ws.tplCompact", descKey: "ws.tplCompactDesc" },
  { id: "minimal", nameKey: "ws.tplMinimal", descKey: "ws.tplMinimalDesc" },
];

/** Horizontal gallery of the five CV templates. */
export function TemplateGallery({
  value,
  onChange,
}: {
  value: CvTemplateId;
  onChange: (id: CvTemplateId) => void;
}) {
  const t = useT();
  return (
    <section aria-label={t("ws.chooseTemplate")}>
      <h2 className="display text-xl sm:text-2xl">{t("ws.chooseTemplate")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("ws.chooseTemplateHint")}</p>
      <ul className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {CV_TEMPLATES.map((tpl) => {
          const active = tpl.id === value;
          return (
            <li key={tpl.id} className="w-40 shrink-0 snap-start sm:w-44">
              <button
                type="button"
                onClick={() => onChange(tpl.id)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-2xl border-2 bg-card p-3 text-start transition-all",
                  active
                    ? "border-primary shadow-lift"
                    : "border-border hover:border-border-strong",
                )}
              >
                <span className="relative block overflow-hidden rounded-xl border border-border bg-background">
                  <TemplateThumb id={tpl.id} />
                  {active ? (
                    <span className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block text-sm font-bold">{t(tpl.nameKey)}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {t(tpl.descKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Line({ w, strong = false }: { w: string; strong?: boolean }) {
  return (
    <span
      className={cn("block h-1.5 rounded-full", strong ? "bg-foreground/45" : "bg-foreground/15")}
      style={{ width: w }}
    />
  );
}

function TemplateThumb({ id }: { id: CvTemplateId }) {
  const common = "flex h-24 flex-col gap-1.5 p-2.5";
  if (id === "classic") {
    return (
      <span className={cn(common, "items-center")}>
        <Line w="60%" strong />
        <Line w="40%" />
        <span className="my-1 block h-px w-full bg-foreground/15" />
        <Line w="85%" />
        <Line w="75%" />
        <Line w="80%" />
      </span>
    );
  }
  if (id === "modern") {
    return (
      <span className={cn(common, "gap-1")}>
        <span className="mb-1 block h-4 w-full rounded-md bg-primary/80" />
        <Line w="55%" strong />
        <Line w="90%" />
        <Line w="70%" />
        <Line w="85%" />
      </span>
    );
  }
  if (id === "compact") {
    return (
      <span className={cn(common, "gap-1")}>
        <Line w="50%" strong />
        <Line w="95%" />
        <Line w="92%" />
        <Line w="95%" />
        <Line w="88%" />
        <Line w="94%" />
      </span>
    );
  }
  if (id === "minimal") {
    return (
      <span className={cn(common, "gap-2")}>
        <Line w="45%" strong />
        <Line w="70%" />
        <Line w="60%" />
      </span>
    );
  }
  return (
    <span className={common}>
      <Line w="65%" strong />
      <Line w="35%" />
      <span className="my-0.5 block h-px w-full bg-primary/50" />
      <Line w="88%" />
      <Line w="78%" />
    </span>
  );
}
