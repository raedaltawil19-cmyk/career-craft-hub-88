import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useWorkspace } from "@/lib/career-store";
import { Tag } from "@/components/ui-bits";

/** List of every CV the user created. Each card opens its versions page. */
export function CvLibrary() {
  const t = useT();
  const { state } = useWorkspace();
  const docs = state.docs;

  if (!docs.length) return null;

  const childCount = (id: string) => docs.filter((d) => d.parentId === id).length;
  const nameOf = (id?: string) => docs.find((d) => d.id === id)?.name;

  return (
    <section aria-label={t("cv.libraryTitle")} className="space-y-3">
      <div>
        <h2 className="display text-xl sm:text-2xl">{t("cv.libraryTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("cv.libraryHint")}</p>
      </div>

      <ul className="grid gap-2.5 lg:grid-cols-2">
        {docs.map((d) => {
          const kids = childCount(d.id);
          const parent = nameOf(d.parentId);
          return (
            <li key={d.id}>
              <Link
                to="/app/cv/$docId"
                params={{ docId: d.id }}
                className="pressable grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border-strong bg-card p-3 text-start hover:bg-muted"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                  style={{ background: d.kind === "master" ? "#ff6b6b" : "#574b90" }}
                >
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{d.name}</span>
                    {d.kind === "master" ? (
                      <Tag tone="match">{t("cv.masterLabel")}</Tag>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {parent
                      ? t("cv.derivedFrom", { name: parent })
                      : d.updatedAt}
                    {kids ? ` · ${t("cv.versionsCount", { count: kids })}` : ""}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
                  {t("cv.openAction")}
                  <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
