import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  FileText,
  Home,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AddCvSheet } from "./add-cv-sheet";
import { useWorkspace } from "@/lib/career-store";

const primaryNav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { to: "/app/applications", label: "Applications", icon: Send, exact: false },
  { to: "/app/profile", label: "Profile", icon: User, exact: false },
] as const;

const desktopNav = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/cv", label: "Master CV", icon: FileText, exact: false },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { to: "/app/applications", label: "Applications", icon: Send, exact: false },
  { to: "/app/profile", label: "Profile", icon: User, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { state } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter((n) => !n.read).length;

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop / tablet side rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="display text-xl">Smart CV</span>
        </Link>

        <button
          onClick={() => setSheetOpen(true)}
          className="tap mt-7 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01]"
        >
          <Plus className="size-4" /> Add a CV
        </button>

        <nav className="mt-6 flex-1 space-y-1" aria-label="Main">
          {desktopNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to, item.exact)
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/app/notifications"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4.5" />
          Notifications
          {unread ? (
            <span className="ml-auto grid size-5 place-items-center rounded-full bg-accent text-[0.625rem] font-bold text-accent-foreground">
              {unread}
            </span>
          ) : null}
        </Link>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur lg:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/app" className="flex min-w-0 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <span className="display truncate text-lg">Smart CV</span>
          </Link>
          <Link
            to="/app/notifications"
            aria-label="Notifications"
            className="tap relative grid place-items-center rounded-full text-muted-foreground"
          >
            <Bell className="size-5" />
            {unread ? (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
            ) : null}
          </Link>
        </div>
      </header>

      <main className="nav-offset lg:pb-16 lg:pl-60">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 xl:max-w-6xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation with central + */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur lg:hidden"
        style={{ boxShadow: "var(--shadow-nav)" }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-1 pt-1.5">
          {primaryNav.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to, item.exact)} />
          ))}
          <li className="flex justify-center">
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Add a CV"
              className="-mt-7 grid size-15 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background transition-transform active:scale-95"
              style={{ boxShadow: "var(--shadow-lift)", width: "3.5rem", height: "3.5rem" }}
            >
              <Plus className="size-6" />
            </button>
          </li>
          {primaryNav.slice(2).map((item) => (
            <NavItem key={item.to} {...item} active={isActive(item.to, item.exact)} />
          ))}
        </ul>
      </nav>

      <AddCvSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <li>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={to as any}
        className={cn(
          "tap flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[0.6875rem] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className={cn("size-5", active && "stroke-[2.4]")} />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
