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
import { useT } from "@/lib/i18n";
import { LanguageSelect } from "./language-select";

const primaryNav = [
  { to: "/app", labelKey: "nav.home", icon: Home, exact: true },
  { to: "/app/jobs", labelKey: "nav.jobs", icon: Briefcase, exact: false },
  { to: "/app/applications", labelKey: "nav.applications", icon: Send, exact: false },
  { to: "/app/profile", labelKey: "nav.profile", icon: User, exact: false },
] as const;

const desktopNav = [
  { to: "/app", labelKey: "nav.home", icon: Home, exact: true },
  { to: "/app/cv", labelKey: "nav.masterCv", icon: FileText, exact: false },
  { to: "/app/jobs", labelKey: "nav.jobs", icon: Briefcase, exact: false },
  { to: "/app/applications", labelKey: "nav.applications", icon: Send, exact: false },
  { to: "/app/profile", labelKey: "nav.profile", icon: User, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { state } = useWorkspace();
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter((n) => !n.read).length;
  const jobAlert = state.suggestions.some((s) => s.state === "accepted");

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop / tablet side rail */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-border bg-sidebar px-4 py-6 lg:flex">
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
          <Plus className="size-4" /> {t("nav.addCv")}
        </button>

        <nav className="mt-6 flex-1 space-y-1" aria-label={t("nav.main")}>
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
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <LanguageSelect className="mb-3 self-start" />

        <Link
          to="/how-it-works"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <HelpCircle className="size-4.5" />
          {t("nav.howItWorks")}
        </Link>

        <Link
          to="/app/notifications"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4.5" />
          {t("nav.notifications")}
          {unread ? (
            <span className="ms-auto grid size-5 place-items-center rounded-full bg-accent text-[0.625rem] font-bold text-accent-foreground">
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
          <div className="flex items-center gap-2">
          <LanguageSelect />
          <Link
            to="/app/notifications"
            aria-label={t("nav.notifications")}
            className="tap relative grid place-items-center rounded-full text-muted-foreground"
          >
            <Bell className="size-5" />
            {unread ? (
              <span className="absolute end-2 top-2 size-2 rounded-full bg-accent" />
            ) : null}
          </Link>
          </div>
        </div>
      </header>

      <main className="nav-offset lg:pb-16 lg:ps-60">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 xl:max-w-6xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation with central + */}
      <nav
        aria-label={t("nav.primary")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe backdrop-blur lg:hidden"
        style={{ boxShadow: "var(--shadow-nav)" }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-1 pt-1.5">
          {primaryNav.slice(0, 2).map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={t(item.labelKey)}
              icon={item.icon}
              active={isActive(item.to, item.exact)}
              alert={item.to === "/app/jobs" && jobAlert}
            />
          ))}
          <li className="flex justify-center">
            <button
              onClick={() => setSheetOpen(true)}
              aria-label={t("nav.addCv")}
              className="-mt-7 grid size-15 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background transition-transform active:scale-95"
              style={{ boxShadow: "var(--shadow-lift)", width: "3.5rem", height: "3.5rem" }}
            >
              <Plus className="size-6" />
            </button>
          </li>
          {primaryNav.slice(2).map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={t(item.labelKey)}
              icon={item.icon}
              active={isActive(item.to, item.exact)}
              alert={item.to === "/app/jobs" && jobAlert}
            />
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
  alert = false,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  alert?: boolean;
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
        <span className="relative">
          <Icon className={cn("size-5", active && "stroke-[2.4]")} />
          {alert ? (
            <span className="absolute -end-1 -top-0.5 size-2 rounded-full bg-accent" />
          ) : null}
        </span>
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
