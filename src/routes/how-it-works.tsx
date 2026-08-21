import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardType,
  FileUp,
  Linkedin,
  PenLine,
  Search,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { LanguageSelect } from "@/components/language-select";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Smart CV — One master CV, tailored for every job" },
      {
        name: "description",
        content:
          "Build one Master CV, then let Smart CV tailor it to each role, track applications and guide your next career move.",
      },
      { property: "og:title", content: "Smart CV — One master CV, tailored for every job" },
      {
        property: "og:description",
        content:
          "A calm career workspace: import your CV, match it to real jobs, tailor it honestly and track every application.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const t = useT();

  const entryModes = [
    { icon: ClipboardType, label: t("landing.entryPasteLabel"), detail: t("landing.entryPasteDetail") },
    { icon: FileUp, label: t("landing.entryUploadLabel"), detail: t("landing.entryUploadDetail") },
    { icon: Linkedin, label: t("landing.entryLinkedinLabel"), detail: t("landing.entryLinkedinDetail") },
    { icon: PenLine, label: t("landing.entryFormLabel"), detail: t("landing.entryFormDetail") },
  ];

  const steps = [
    { icon: Sparkles, title: t("landing.step1Title"), body: t("landing.step1Body") },
    { icon: Search, title: t("landing.step2Title"), body: t("landing.step2Body") },
    { icon: Target, title: t("landing.step3Title"), body: t("landing.step3Body") },
    { icon: Send, title: t("landing.step4Title"), body: t("landing.step4Body") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-5">
        <span className="display min-w-0 truncate text-xl">{t("landing.appName")}</span>
        <LanguageSelect />
        <Link
          to="/app"
          className="tap inline-flex shrink-0 items-center rounded-xl border border-border px-4 text-sm font-medium"
        >
          {t("landing.openWorkspace")}
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-6 sm:pt-16">
          <p className="eyebrow">{t("landing.eyebrow")}</p>
          <h1 className="display mt-2 text-[2.5rem] leading-[1.05] sm:text-6xl">
            {t("landing.heroTitleLine1")}
            <br />
            {t("landing.heroTitleLine2")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("landing.heroBody")}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              to="/app"
              className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              {t("landing.startMasterCv")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link
              to="/app/jobs"
              className="tap inline-flex items-center rounded-xl border border-border px-5 text-sm font-medium"
            >
              {t("landing.browseJobs")}
            </Link>
          </div>
        </section>

        <section className="border-y border-border bg-surface/60">
          <div className="mx-auto max-w-5xl px-5 py-12">
            <h2 className="display text-2xl sm:text-3xl">{t("landing.entryModesTitle")}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {entryModes.map((m) => (
                <li key={m.label} className="rounded-2xl border border-border bg-card p-4">
                  <m.icon className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">{m.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="display text-2xl sm:text-3xl">{t("landing.howItWorksTitle")}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t("landing.stepLabel", { count: i + 1 })}
                  </p>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
            <h2 className="display text-2xl sm:text-4xl">{t("landing.ctaTitle")}</h2>
            <p className="mt-3 max-w-lg text-sm opacity-85 sm:text-base">{t("landing.ctaBody")}</p>
            <Link
              to="/app"
              className="tap mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
            >
              {t("landing.ctaButton")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted-foreground">
          {t("landing.footerText")}
        </div>
      </footer>
    </div>
  );
}
