import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, Eyebrow, MatchRing, Panel, StatusPill, Tag } from "@/components/ui-bits";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Home — Smart CV workspace" },
      { name: "description", content: "Overview of your Master CV, matches and applications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { state, jobs, loadDemo } = useWorkspace();
  const cv = state.masterCv;
  const pendingSuggestions = state.suggestions.filter((s) => s.state === "pending");
  const attention = state.applications.filter(
    (a) => a.status === "Interview" || a.status === "Second interview" || a.nextAction,
  );

  if (!cv) {
    return (
      <div className="space-y-6">
        <div>
          <Eyebrow>Career workspace</Eyebrow>
          <h1 className="display mt-1 text-3xl sm:text-4xl">Start with your Master CV</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Everything here — job matches, tailored versions, application tracking — grows out of
            one central career profile.
          </p>
        </div>
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No Master CV yet"
          description="Tap the + button in the navigation to paste, upload, import from LinkedIn or fill in a short guided form."
          action={
            <button
              onClick={loadDemo}
              className="tap inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              Explore with sample data
            </button>
          }
        />
      </div>
    );
  }

  const topJobs = [...jobs].sort((a, b) => b.match - a.match).slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <Eyebrow>Career workspace</Eyebrow>
        <h1 className="display mt-1 text-3xl sm:text-4xl">
          Good to see you, {cv.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pendingSuggestions.length} open recommendations · {attention.length} applications need
          attention
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Master CV status */}
        <Panel className="lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <Eyebrow>Master CV</Eyebrow>
              <h2 className="mt-1 truncate text-xl">{cv.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Version {cv.version} · updated{" "}
                {new Date(cv.updatedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag tone="match">{cv.experience.length} roles</Tag>
                <Tag tone="key">{cv.skills.length} skills</Tag>
                <Tag>{cv.education.length} education entries</Tag>
              </div>
            </div>
            <MatchRing value={78} size={64} label="CV quality" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/app/cv"
              className="tap inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Open Master CV
            </Link>
            <Link
              to="/app/cv/edit"
              className="tap inline-flex items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              Edit & improve
            </Link>
          </div>
        </Panel>

        {/* AI recommendations */}
        <Panel>
          <Eyebrow>Assistant</Eyebrow>
          <h2 className="mt-1 text-xl">Recommendations</h2>
          {pendingSuggestions.length ? (
            <>
              <ul className="mt-3 space-y-2.5">
                {pendingSuggestions.slice(0, 2).map((s) => (
                  <li key={s.id} className="rounded-xl bg-surface p-3">
                    <p className="text-xs font-semibold text-accent">{s.section}</p>
                    <p className="mt-0.5 text-sm">{s.issue}</p>
                  </li>
                ))}
              </ul>
              <Link
                to="/app/cv/edit"
                search={{ panel: "ai" }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                Review all {pendingSuggestions.length} <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing pending. The assistant re-checks your CV after every edit.
            </p>
          )}
        </Panel>
      </div>

      {/* Applications needing attention */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="min-w-0 text-xl">Needs your attention</h2>
          <Link to="/app/applications" className="shrink-0 text-sm font-semibold text-primary">
            All applications
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {attention.length ? (
            attention.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Link
                  to="/app/applications/$appId"
                  params={{ appId: a.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{a.position}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {a.company}
                    </span>
                    {a.nextAction ? (
                      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-accent">
                        <CalendarClock className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {a.nextAction}
                          {a.nextActionDate ? ` · ${a.nextActionDate}` : ""}
                        </span>
                      </span>
                    ) : null}
                  </span>
                  <StatusPill status={a.status} />
                </Link>
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-dashed border-border-strong p-5 text-sm text-muted-foreground">
              No follow-ups scheduled. Saved jobs appear here once you apply.
            </li>
          )}
        </ul>
      </section>

      {/* Recommended jobs */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="min-w-0 text-xl">Matched to your Master CV</h2>
          <Link to="/app/jobs" className="shrink-0 text-sm font-semibold text-primary">
            All jobs
          </Link>
        </div>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topJobs.map((j) => (
            <li key={j.id}>
              <Link
                to="/app/jobs/$jobId"
                params={{ jobId: j.id }}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-surface"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{j.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {j.company} · {j.mode}
                    </span>
                  </span>
                  <MatchRing value={j.match} size={44} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.matchingSkills.slice(0, 2).map((s) => (
                    <Tag key={s} tone="match">
                      {s}
                    </Tag>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Progress */}
      <Panel>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <TrendingUp className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg">Career progress</h2>
            <p className="text-sm text-muted-foreground">
              {state.applications.length} applications · {state.docs.length} CV versions ·{" "}
              {state.savedJobIds.length} saved roles
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0 text-accent" />
          <p>
            The assistant only suggests changes. Nothing is written to your CV without your
            approval.
          </p>
        </div>
      </Panel>
    </div>
  );
}
