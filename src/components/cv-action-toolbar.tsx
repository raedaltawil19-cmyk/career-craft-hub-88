import type { LucideIcon } from "lucide-react";
import { Compass, LayoutTemplate, Pencil, Sparkles, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TONES = {
  improve: "#ff6b6b",
  tailor: "#574b90",
  careers: "#12946a",
  template: "#1f6feb",
  edit: "#3f3d56",
} as const;

type CvActionToolbarProps = {
  openWindow: "improve" | "tailor" | null;
  showCareers: boolean;
  templateActive: boolean;
  onEdit: () => void;
  onImprove: () => void;
  onTailor: () => void;
  onCareers: () => void;
  onTemplate: () => void;
};

/**
 * Mobile-only horizontal action tray shown under the page header.
 * One coherent control group: icon + short permanent label, subtle active state.
 */
export function CvActionToolbar({
  openWindow,
  showCareers,
  templateActive,
  onEdit,
  onImprove,
  onTailor,
  onCareers,
  onTemplate,
}: CvActionToolbarProps) {
  const t = useT();

  return (
    <div
      role="toolbar"
      aria-label={t("cv.title")}
      className="flex items-stretch justify-between gap-0.5 rounded-2xl border border-border bg-card/90 p-1 backdrop-blur lg:hidden"
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <ToolAction
        icon={Pencil}
        label={t("ws.railEdit")}
        tone={TONES.edit}
        onClick={onEdit}
      />
      <ToolAction
        icon={Sparkles}
        label={t("ws.railImprove")}
        tone={TONES.improve}
        active={openWindow === "improve"}
        onClick={onImprove}
      />
      <ToolAction
        icon={Target}
        label={t("ws.railTailor")}
        tone={TONES.tailor}
        active={openWindow === "tailor"}
        onClick={onTailor}
      />
      <ToolAction
        icon={Compass}
        label={t("ws.railCareers")}
        tone={TONES.careers}
        active={showCareers}
        onClick={onCareers}
      />
      <ToolAction
        icon={LayoutTemplate}
        label={t("ws.railTemplate")}
        tone={TONES.template}
        active={templateActive}
        onClick={onTemplate}
      />
    </div>
  );
}

function ToolAction({
  icon: Icon,
  label,
  tone,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tone: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ?? false}
      className={cn(
        "tap flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 transition-colors active:scale-[0.97]",
        active ? "" : "hover:bg-muted/60",
      )}
      style={active ? { background: `color-mix(in oklab, ${tone} 12%, transparent)` } : undefined}
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-full text-white"
        style={{ background: tone }}
      >
        <Icon className="size-3.5" />
      </span>
      <span
        className={cn(
          "w-full truncate text-center text-[10px] leading-tight",
          active ? "font-semibold" : "font-medium text-muted-foreground",
        )}
        style={{ color: active ? tone : undefined }}
      >
        {label}
      </span>
    </button>
  );
}
