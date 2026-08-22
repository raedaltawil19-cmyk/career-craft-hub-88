import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Eye, FileText, Pencil, Trash2, X } from "lucide-react";
import { useWorkspace } from "@/lib/career-store";
import { CvPreview } from "@/components/cv-preview";
import { EmptyState, PageHeader, Tag } from "@/components/ui-bits";
import { useT } from "@/lib/i18n";
import type { CvDoc, MasterCv } from "@/lib/career-types";

export const Route = createFileRoute("/app/cv/$docId")({
  head: () => ({
    meta: [
      { title: "CV versions — Smart CV" },
      { name: "description", content: "All versions derived from this CV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvVersionsPage,
});

function CvVersionsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { docId } = Route.useParams();
  const { state, duplicateCv, deleteCv } = useWorkspace();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const doc = state.docs.find((d) => d.id === docId);

  if (!doc) {
    return (
      <EmptyState
        icon={<FileText className="size-5" />}
        title={t("cv.versionNotFound")}
        description={t("cv.libraryHint")}
      />
    );
  }

  const root = doc.parentId ? (state.docs.find((d) => d.id === doc.parentId) ?? doc) : doc;
  const family: CvDoc[] = [root, ...state.docs.filter((d) => d.parentId === root.id)];

  const contentOf = (d: CvDoc): MasterCv | null =>
    d.data ?? (d.kind === "master" ? state.masterCv : (state.masterCv ?? null));

  const previewDoc = family.find((d) => d.id === previewId) ?? null;
  const previewCv = previewDoc ? contentOf(previewDoc) : null;

  const onDelete = (d: CvDoc) => {
    const kids = state.docs.filter((x) => x.parentId === d.id).length;
    const message =
      d.kind === "master" && kids
        ? t("cv.deleteMasterConfirm", { name: d.name, count: kids })
        : t("cv.deleteConfirm", { name: d.name });
    if (!window.confirm(message)) return;
    deleteCv(d.id);
    if (d.id === root.id) navigate({ to: "/app" });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("cv.versionsTitle")}
        title={root.name}
        description={t("cv.versionsCount", { count: family.length })}
      />

      <ul className="space-y-2.5">
        {family.map((d, i) => (
          <li
            key={d.id}
            className="rounded-2xl border border-border-strong bg-card p-3"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{d.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {i === 0 ? t("cv.originalVersion") : t("cv.derivedFrom", { name: root.name })}
                  {` · ${d.updatedAt}`}
                </p>
              </div>
              <Tag tone={d.score >= 80 ? "match" : "neutral"}>{d.score}</Tag>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              <RowAction
                icon={<Eye className="size-4" />}
                label={t("cv.previewAction")}
                onClick={() => setPreviewId(d.id)}
              />
              <RowActionLink
                icon={<Pencil className="size-4" />}
                label={t("cv.editAction")}
                to="/app/cv/$docId/view"
                params={{ docId: d.id }}
              />
              <RowAction
                icon={<Copy className="size-4" />}
                label={t("cv.duplicateAction")}
                onClick={() => duplicateCv(d.id, t("cv.copyWord"))}
              />
              <RowAction
                icon={<Trash2 className="size-4" />}
                label={t("cv.deleteAction")}
                danger
                onClick={() => onDelete(d)}
              />
            </div>
          </li>
        ))}
      </ul>

      {previewDoc && previewCv ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-6">
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-card sm:rounded-3xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border p-3">
              <p className="truncate text-sm font-bold">{previewDoc.name}</p>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                aria-label={t("ws.close")}
                className="tap grid size-9 place-items-center rounded-xl border border-border hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              <CvPreview cv={previewCv} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const actionClass =
  "tap flex flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] font-bold hover:bg-muted";

function RowAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${actionClass} ${danger ? "text-danger" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}

function RowActionLink({
  icon,
  label,
  to,
  params,
}: {
  icon: React.ReactNode;
  label: string;
  to: "/app/cv/$docId/view";
  params: { docId: string };
}) {
  return (
    <Link to={to} params={params} className={actionClass}>
      {icon}
      {label}
    </Link>
  );
}
