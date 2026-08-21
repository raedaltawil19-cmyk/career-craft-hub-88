import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, Briefcase, CheckCheck, Send, Sparkles } from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { EmptyState, PageHeader, Panel } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Smart CV" },
      { name: "description", content: "Job matches, application updates and assistant suggestions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

const icons = {
  job: Briefcase,
  application: Send,
  ai: Sparkles,
  system: Bell,
} as const;

function NotificationsPage() {
  const { state, markAllNotificationsRead } = useWorkspace();
  const items = state.notifications;
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Stay in the loop"
        title="Notifications"
        description={unread ? `${unread} unread updates` : "You're all caught up"}
        action={
          unread ? (
            <button
              onClick={markAllNotificationsRead}
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-medium"
            >
              <CheckCheck className="size-4" /> Mark all read
            </button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing yet"
          description="New job matches and application reminders will land here."
        />
      ) : (
        <ul className="space-y-2.5">
          {items.map((n) => {
            const Icon = icons[n.kind];
            return (
              <li key={n.id}>
                <Panel className={cn("py-3.5", !n.read && "border-primary/30 bg-primary-soft/30")}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold">{n.title}</p>
                        <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    </div>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      <Panel>
        <h2 className="text-base font-semibold">Notification settings</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {[
            ["New job matches", "When a role scores above 80%"],
            ["Application reminders", "Follow-ups and interview dates"],
            ["Assistant suggestions", "Improvements to your Master CV"],
          ].map(([label, detail]) => (
            <li key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <span className="min-w-0">
                <span className="block font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{detail}</span>
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="size-5 shrink-0 accent-[var(--color-primary)]"
                aria-label={label}
              />
            </li>
          ))}
        </ul>
      </Panel>

      <p className="text-center text-sm text-muted-foreground">
        Looking for your account?{" "}
        <Link to="/app/profile" className="font-medium text-primary underline-offset-4 hover:underline">
          Open profile
        </Link>
      </p>
    </div>
  );
}
