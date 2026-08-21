import { Link, createFileRoute } from "@tanstack/react-router";
import {
  
  Download,
  FileText,
  LogOut,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { LinkRow, PageHeader, Panel } from "@/components/ui-bits";
import { LanguageSelect } from "@/components/language-select";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings — Smart CV" },
      { name: "description", content: "Manage your account, data and assistant preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const t = useT();
  const { state, reset, loadDemo } = useWorkspace();
  const cv = state.masterCv;
  const initials = (cv?.name ?? "Smart CV")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const stats = [
    { label: t("profile.statCvVersions"), value: state.docs.length, icon: FileText },
    { label: t("profile.statApplications"), value: state.applications.length, icon: Send },
    { label: t("profile.statSuggestions"), value: state.suggestions.length, icon: Sparkles },
  ];

  const assistantPrefs = [
    [t("profile.proactiveSuggestionsLabel"), t("profile.proactiveSuggestionsDetail")],
    [t("profile.autoScanLabel"), t("profile.autoScanDetail")],
    [t("profile.keepSyncedLabel"), t("profile.keepSyncedDetail")],
  ];

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={t("profile.eyebrow")} title={t("profile.title")} description={t("profile.description")} />

      <Panel>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{cv?.name ?? t("profile.defaultName")}</p>
            <p className="truncate text-sm text-muted-foreground">
              {cv?.title ?? t("profile.defaultTitle")}
            </p>
            <p className="truncate text-xs text-muted-foreground">{cv?.email}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface p-3 text-center">
              <s.icon className="mx-auto size-4 text-primary" />
              <dd className="mt-1 text-lg font-semibold tabular-nums">{s.value}</dd>
              <dt className="text-[0.6875rem] text-muted-foreground">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Panel>

      <section>
        <h2 className="eyebrow mb-2">{t("profile.sectionWorkspace")}</h2>
        <Panel className="divide-y divide-border p-0">
          <LinkRow to="/app/cv" title={t("profile.masterCvTitle")} meta={t("profile.masterCvMeta")} />
          <LinkRow to="/app/applications" title={t("profile.applicationsTitle")} meta={t("profile.applicationsMeta")} />
          <LinkRow to="/app/notifications" title={t("profile.notificationsTitle")} meta={t("profile.notificationsMeta")} />
        </Panel>
      </section>

      <section>
        <h2 className="eyebrow mb-2">{t("profile.sectionAssistant")}</h2>
        <Panel>
          <ul className="space-y-3 text-sm">
            {assistantPrefs.map(([label, detail]) => (
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
      </section>

      <section>
        <h2 className="eyebrow mb-2">{t("common.language")}</h2>
        <Panel>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium">{t("profile.languageLabel")}</span>
              <span className="block text-xs text-muted-foreground">{t("profile.languageDetail")}</span>
            </span>
            <LanguageSelect />
          </div>
        </Panel>
      </section>

      <section>
        <h2 className="eyebrow mb-2">{t("profile.sectionDataPrivacy")}</h2>
        <Panel>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5">
            <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="min-w-0 text-sm text-muted-foreground">{t("profile.privacyNote")}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-medium">
              <Download className="size-4" /> {t("profile.exportData")}
            </button>
            <button
              onClick={loadDemo}
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-medium"
            >
              <RotateCcw className="size-4" /> {t("profile.loadDemo")}
            </button>
            <button
              onClick={reset}
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-4 text-sm font-medium text-destructive"
            >
              <Trash2 className="size-4" /> {t("profile.clearWorkspace")}
            </button>
          </div>
        </Panel>
      </section>

      <Link
        to="/"
        className="tap flex w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground"
      >
        <LogOut className="size-4" /> {t("profile.signOut")}
      </Link>
    </div>
  );
}
