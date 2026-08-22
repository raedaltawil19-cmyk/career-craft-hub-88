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
      {/* Mobile: stacked pill rows. Desktop (lg+): original horizontal card gallery. */}
      <ul className="mt-3 grid grid-cols-1 gap-2.5 lg:-mx-0 lg:flex lg:snap-x lg:gap-3 lg:overflow-x-auto lg:pb-2">
        {CV_TEMPLATES.map((tpl) => {
          const active = tpl.id === value;
          return (
            <li key={tpl.id} className="lg:w-44 lg:shrink-0 lg:snap-start">
              <button
                type="button"
                onClick={() => onChange(tpl.id)}
                aria-pressed={active}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full border-2 bg-card px-4 py-2.5 text-start transition-all lg:block lg:rounded-2xl lg:p-3",
                  active
                    ? "border-primary shadow-lift"
                    : "border-border hover:border-border-strong",
                )}
              >
                <span className="hidden lg:relative lg:block lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-background">
                  <TemplateThumb id={tpl.id} />
                  {active ? (
                    <span className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0 lg:mt-2 lg:block">
                  <span className="block truncate text-sm font-bold">{t(tpl.nameKey)}</span>
                  <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">
                    {t(tpl.descKey)}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full lg:hidden",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="size-3.5" />
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
