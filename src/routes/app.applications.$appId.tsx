import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, Eyebrow, Panel, StatusPill } from "@/components/ui-bits";
import { statusOrder } from "@/lib/career-data";
import type { ApplicationStatus } from "@/lib/career-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/applications/$appId")({
  head: () => ({
    meta: [
      { title: "Application — Smart CV" },
      { name: "description", content: "Status, timeline and notes for this application." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const { appId } = Route.useParams();
  const { state, setApplicationStatus, updateApplication } = useWorkspace();
  const app = state.applications.find((a) => a.id === appId);
  const [notes, setNotes] = useState(app?.notes ?? "");
  const [savedNote, setSavedNote] = useState(false);

  if (!app) {
    return (
      <EmptyState
        title="Application not found"
        description="It may have been removed from your workspace."
        action={
          <Link
            to="/app/applications"
            className="tap inline-flex items-center rounded-xl border border-border px-4 text-sm font-medium"
          >
            Back to applications
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/app/applications"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Applications
      </Link>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <Eyebrow>{app.company}</Eyebrow>
          <h1 className="display mt-1 text-[1.75rem] leading-tight sm:text-4xl">{app.position}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Applied {app.appliedDate}</p>
        </div>
        <StatusPill status={app.status} />
      </header>

      <Panel>
        <h2 className="eyebrow">Status</h2>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {statusOrder.map((s) => (
            <button
              key={s}
              onClick={() => setApplicationStatus(app.id, s as ApplicationStatus)}
              className={cn(
                "tap shrink-0 rounded-full border px-3.5 text-sm font-medium",
                app.status === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="text-lg">Timeline</h2>
          <ol className="mt-4 space-y-4">
            {app.timeline.map((e) => (
              <li key={e.id} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date}
                    {e.detail ? ` · ${e.detail}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel>
          <h2 className="text-lg">Details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="eyebrow">CV used</dt>
              <dd className="mt-1 flex items-center gap-2">
                <FileText className="size-4 shrink-0 text-primary" />
                <Link to="/app/cv" className="truncate font-medium text-primary">
                  {app.cvUsed}
                </Link>
              </dd>
            </div>
            {app.jobId ? (
              <div>
                <dt className="eyebrow">Linked job</dt>
                <dd className="mt-1">
                  <Link
                    to="/app/jobs/$jobId"
                    params={{ jobId: app.jobId }}
                    className="font-medium text-primary"
                  >
                    View job analysis
                  </Link>
                </dd>
              </div>
            ) : null}
            {app.link ? (
              <div>
                <dt className="eyebrow">Posting</dt>
                <dd className="mt-1">
                  <a
                    href={app.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 break-all font-medium text-primary"
                  >
                    <ExternalLink className="size-3.5 shrink-0" /> Open link
                  </a>
                </dd>
              </div>
            ) : null}
            {app.nextAction ? (
              <div>
                <dt className="eyebrow">Next step</dt>
                <dd className="mt-1">
                  {app.nextAction}
                  {app.nextActionDate ? ` · ${app.nextActionDate}` : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        </Panel>
      </div>

      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="min-w-0 text-lg">Notes</h2>
          <button
            onClick={() => {
              updateApplication(app.id, { notes });
              setSavedNote(true);
              window.setTimeout(() => setSavedNote(false), 1600);
            }}
            className="tap shrink-0 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            {savedNote ? "Saved" : "Save notes"}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Interview impressions, names, questions asked…"
          className="mt-3 w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-primary"
        />
      </Panel>

      <Panel className="border-primary/25 bg-primary-soft/40">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Assistant · application context</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It knows this role, the CV version you sent and where you are in the process.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Prepare interview questions", "Draft a follow-up", "What gaps should I address?"].map(
                (a) => (
                  <button
                    key={a}
                    className="tap rounded-xl border border-border bg-card px-3.5 text-sm font-medium hover:bg-muted"
                  >
                    {a}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
