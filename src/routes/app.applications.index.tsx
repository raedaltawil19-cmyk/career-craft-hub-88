import { Link, createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui-bits";
import { statusOrder } from "@/lib/career-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/applications/")({
  head: () => ({
    meta: [
      { title: "Applications — Smart CV" },
      { name: "description", content: "Track every application, status and follow-up." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplicationsPage,
});

const groups = ["Active", "All", "Closed"] as const;

function ApplicationsPage() {
  const t = useT();
  const { state } = useWorkspace();
  const [group, setGroup] = useState<(typeof groups)[number]>("Active");

  const groupLabels: Record<(typeof groups)[number], string> = {
    Active: t("applications.groupActive"),
    All: t("applications.groupAll"),
    Closed: t("applications.groupClosed"),
  };

  const closed = ["Rejected", "Withdrawn", "Closed"];
  const list = state.applications.filter((a) =>
    group === "All" ? true : group === "Closed" ? closed.includes(a.status) : !closed.includes(a.status),
  );

  const counts = statusOrder
    .map((s) => ({ status: s, n: state.applications.filter((a) => a.status === s).length }))
    .filter((x) => x.n > 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("applications.eyebrowPipeline")}
        title={t("applications.title")}
        description={t("applications.description")}
      />

      {state.applications.length ? (
        <>
          <div className="flex flex-wrap gap-2">
            {counts.map((c) => (
              <span
                key={c.status}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs"
              >
                <StatusPill status={c.status} />
                <span className="font-semibold tabular-nums">{c.n}</span>
              </span>
            ))}
          </div>

          <div
            role="tablist"
            aria-label={t("applications.groupsAriaLabel")}
            className="flex gap-1 rounded-xl border border-border bg-surface p-1"
          >
            {groups.map((g) => (
              <button
                key={g}
                role="tab"
                aria-selected={group === g}
                onClick={() => setGroup(g)}
                className={cn(
                  "tap flex-1 rounded-lg text-sm font-medium",
                  group === g ? "bg-card shadow-soft" : "text-muted-foreground",
                )}
              >
                {groupLabels[g]}
              </button>
            ))}
          </div>

          {list.length ? (
            <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {list.map((a) => (
                <li key={a.id}>
                  <Link
                    to="/app/applications/$appId"
                    params={{ appId: a.id }}
                    className="block h-full rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-surface"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{a.position}</h2>
                        <p className="truncate text-sm text-muted-foreground">{a.company}</p>
                      </div>
                      <StatusPill status={a.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <dt className="eyebrow">{t("applications.appliedLabel")}</dt>
                        <dd className="mt-0.5 tabular-nums text-foreground">{a.appliedDate}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="eyebrow">{t("applications.cvUsedLabel")}</dt>
                        <dd className="mt-0.5 truncate text-foreground">{a.cvUsed}</dd>
                      </div>
                    </dl>
                    {a.nextAction ? (
                      <p className="mt-3 truncate rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs text-accent-foreground">
                        {t("applications.nextAction", { action: a.nextAction })}
                        {a.nextActionDate ? ` · ${a.nextActionDate}` : ""}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={t("applications.emptyGroupTitle", { group: groupLabels[group].toLowerCase() })}
              description={t("applications.emptyGroupDescription")}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<Send className="size-5" />}
          title={t("applications.emptyAllTitle")}
          description={t("applications.emptyAllDescription")}
          action={
            <Link
              to="/app/jobs"
              className="tap inline-flex items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("applications.browseJobs")}
            </Link>
          }
        />
      )}
    </div>
  );
}
