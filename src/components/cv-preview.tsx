import type { MasterCv } from "@/lib/career-types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function CvPreview({
  cv,
  highlight = [],
  className,
  compact = false,
  placeholder = false,
}: {
  cv: MasterCv;
  highlight?: string[];
  className?: string;
  compact?: boolean;
  placeholder?: boolean;
}) {
  const t = useT();
  const isClassic = cv.template === "classic";
  const isCompact = cv.template === "compact" || compact;
  const isModern = cv.template === "modern";
  const isMinimal = cv.template === "minimal";

  return (
    <article
      className={cn("paper overflow-hidden", className)}
      aria-label={t("cv.previewAriaLabel", { name: cv.name || t("cv.yourName") })}
    >
      {isModern ? <div className="h-2.5 w-full bg-primary" /> : null}
      <div className={cn("px-5 py-6 sm:px-8 sm:py-8", isCompact && "px-4 py-5 sm:px-6 sm:py-6")}>
        <header className={cn("pb-4", isClassic ? "text-center" : "")}>
          <h2 className="display text-2xl leading-tight sm:text-3xl">{cv.name || t("cv.yourName")}</h2>
          <p
            className={cn(
              "mt-1 text-sm font-semibold tracking-wide",
              isMinimal ? "text-muted-foreground" : "text-primary",
            )}
          >
            {cv.title || t("cv.yourTitle")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {[cv.location, cv.email, cv.phone, ...cv.links].filter(Boolean).join("  ·  ")}
          </p>
        </header>

        <div className="h-px w-full bg-border" />

        {cv.summary ? (
          <Section title={t("cv.profileSection")}>
            <p className="text-sm leading-relaxed text-foreground/85">{cv.summary}</p>
          </Section>
        ) : null}

        {cv.experience.length ? (
          <Section title={t("cv.experienceSection")}>
            <ul className="space-y-4">
              {cv.experience.map((e) => (
                <li key={e.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold">
                      {e.role} · <span className="font-medium text-foreground/80">{e.company}</span>
                    </p>
                    <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {e.start} – {e.end}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.location}</p>
                  <ul className="mt-1.5 space-y-1">
                    {e.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="relative ps-4 text-sm leading-relaxed text-foreground/85 before:absolute before:start-0 before:top-2.5 before:size-1 before:rounded-full before:bg-accent"
                      >
                        <Highlighted text={b} terms={highlight} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {cv.education.length ? (
          <Section title={t("cv.educationSection")}>
            <ul className="space-y-2">
              {cv.education.map((ed) => (
                <li key={ed.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                  <p className="min-w-0 text-sm">
                    <span className="font-semibold">{ed.program}</span>
                    <span className="text-foreground/75"> · {ed.school}</span>
                  </p>
                  <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {ed.start} – {ed.end}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {cv.skills.length ? (
          <Section title={t("cv.skillsSection")}>
            <p className="text-sm leading-relaxed text-foreground/85">
              <Highlighted text={cv.skills.join(" · ")} terms={highlight} />
            </p>
          </Section>
        ) : null}

        {(cv.tools.length || cv.languages.length) ? (
          <Section title={t("cv.toolsLanguagesSection")}>
            {cv.tools.length ? (
              <p className="text-sm text-foreground/85">{t("cv.toolsLabel", { tools: cv.tools.join(", ") })}</p>
            ) : null}
            {cv.languages.length ? (
              <p className="mt-1 text-sm text-foreground/85">
                {t("cv.languagesLabel", { languages: cv.languages.join(", ") })}
              </p>
            ) : null}
          </Section>
        ) : null}

        {cv.projects.length ? (
          <Section title={t("cv.projectsSection")}>
            <ul className="space-y-2">
              {cv.projects.map((p) => (
                <li key={p.id}>
                  <p className="text-sm font-semibold">
                    {p.name} <span className="font-normal text-muted-foreground">· {p.year}</span>
                  </p>
                  <p className="text-sm text-foreground/85">{p.description}</p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {cv.certifications.length || cv.volunteer.length ? (
          <Section title={t("cv.additionalSection")}>
            <ul className="space-y-1 text-sm text-foreground/85">
              {[...cv.certifications, ...cv.volunteer].map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  );
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((p, i) =>
        terms.some((t) => t.toLowerCase() === p.toLowerCase()) ? (
          <mark key={i} className="rounded bg-accent-soft px-0.5 text-accent-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
