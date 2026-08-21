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

export const Route = createFileRoute("/")({
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

const entryModes = [
  { icon: ClipboardType, label: "Paste text", detail: "Drop in your CV, we structure it" },
  { icon: FileUp, label: "Upload file", detail: "PDF, DOC or DOCX" },
  { icon: Linkedin, label: "LinkedIn", detail: "Import your profile export" },
  { icon: PenLine, label: "Guided form", detail: "One friendly question at a time" },
];

const steps = [
  {
    icon: Sparkles,
    title: "One Master CV",
    body: "Your complete career history, kept in one living document. Every other version comes from it.",
  },
  {
    icon: Search,
    title: "Find and analyze roles",
    body: "See how a posting actually maps to your experience: strong matches, transferable skills, real gaps.",
  },
  {
    icon: Target,
    title: "Tailor honestly",
    body: "The assistant reframes what you already did to fit the role. It never invents experience.",
  },
  {
    icon: Send,
    title: "Track every application",
    body: "Statuses, reminders and interview notes for each role you sent a tailored CV to.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5">
        <span className="display min-w-0 truncate text-xl">Smart CV</span>
        <Link
          to="/app"
          className="tap inline-flex shrink-0 items-center rounded-xl border border-border px-4 text-sm font-medium"
        >
          Open workspace
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-6 sm:pt-16">
          <p className="eyebrow">Your career workspace</p>
          <h1 className="display mt-2 text-[2.5rem] leading-[1.05] sm:text-6xl">
            One master CV.
            <br />
            Tailored for every job.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Smart CV keeps your full career history in one place, analyzes the roles you want, and
            writes a focused version for each one — using only what you've actually done.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              to="/app"
              className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Start your Master CV <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/app/jobs"
              className="tap inline-flex items-center rounded-xl border border-border px-5 text-sm font-medium"
            >
              Browse matching jobs
            </Link>
          </div>
        </section>

        <section className="border-y border-border bg-surface/60">
          <div className="mx-auto max-w-5xl px-5 py-12">
            <h2 className="display text-2xl sm:text-3xl">Four ways to bring your CV in</h2>
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
          <h2 className="display text-2xl sm:text-3xl">How the workspace works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Step {i + 1}
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
            <h2 className="display text-2xl sm:text-4xl">Stop rewriting your CV from scratch</h2>
            <p className="mt-3 max-w-lg text-sm opacity-85 sm:text-base">
              Build it once, keep it current, and send a sharper version to every role you care
              about.
            </p>
            <Link
              to="/app"
              className="tap mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
            >
              Open Smart CV <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted-foreground">
          Smart CV — a calm workspace for your career.
        </div>
      </footer>
    </div>
  );
}
