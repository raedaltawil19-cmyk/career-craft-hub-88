import { useRef, useState } from "react";
import { Compass, GripVertical, LayoutTemplate, Sparkles, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TONES = {
  improve: "#ff6b6b",
  tailor: "#574b90",
  careers: "#12946a",
  template: "#1f6feb",
} as const;

type CvSideRailProps = {
  openWindow: "improve" | "tailor" | null;
  showCareers: boolean;
  templateActive: boolean;
  onImprove: () => void;
  onTailor: () => void;
  onCareers: () => void;
  onTemplate: () => void;
};

export function CvSideRail({
  openWindow,
  showCareers,
  templateActive,
  onImprove,
  onTailor,
  onCareers,
  onTemplate,
}: CvSideRailProps) {
  const t = useT();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    startY: number;
    baseY: number;
    moved: boolean;
    lastVibrateY: number;
  } | null>(null);

  const vibrate = (ms: number) => {
    try {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { vibrate?: (n: number) => boolean }) : null;
      nav?.vibrate?.(ms);
    } catch {
      // ignore unsupported vibrators
    }
  };

  const maxDrag =
    typeof window !== "undefined" ? window.innerHeight / 2 - 140 : 200;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    drag.current = { startY: e.clientY, baseY: dragY, moved: false, lastVibrateY: dragY };
    vibrate(6);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    const nextY = Math.min(Math.max(drag.current.baseY + dy, -maxDrag), maxDrag);
    setDragY(nextY);

    // subtle tick feedback while dragging past each ~48px step
    if (Math.abs(nextY - drag.current.lastVibrateY) > 48) {
      drag.current.lastVibrateY = nextY;
      vibrate(4);
    }
  };

  const endDrag = () => {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    setDragging(false);
    if (moved) vibrate(10);
  };

  return (
    <div
      className={cn(
        "fixed end-2 top-1/2 z-40 lg:hidden will-change-transform touch-none",
        !dragging && "transition-transform duration-300 ease-out",
      )}
      style={{ transform: `translateY(calc(-50% + ${dragY}px))` }}
    >
      <div
        className="flex w-14 flex-col items-center gap-1 rounded-3xl border border-border bg-card/90 p-1.5 backdrop-blur"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <button
          type="button"
          aria-label="Drag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="grid h-6 w-full cursor-grab touch-none place-items-center rounded-full text-muted-foreground hover:bg-muted/60 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <BarAction
          icon={<Sparkles className="size-4" />}
          label={t("ws.barImprove")}
          tone={TONES.improve}
          active={openWindow === "improve"}
          onClick={onImprove}
        />
        <BarAction
          icon={<Target className="size-4" />}
          label={t("ws.barTailor")}
          tone={TONES.tailor}
          active={openWindow === "tailor"}
          onClick={onTailor}
        />
        <BarAction
          icon={<Compass className="size-4" />}
          label={t("ws.barCareers")}
          tone={TONES.careers}
          active={showCareers}
          onClick={onCareers}
        />
        <BarAction
          icon={<LayoutTemplate className="size-4" />}
          label={t("ws.barTemplate")}
          tone={TONES.template}
          active={templateActive}
          onClick={onTemplate}
        />
      </div>
    </div>
  );
}

function BarAction({
  icon,
  label,
  tone,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  active?: boolean;
  onClick: () => void;
}) {
  const [touchHint, setTouchHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch screens have no hover: tapping reveals the label briefly while
  // still firing the action.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setTouchHint(true);
    hintTimer.current = setTimeout(() => setTouchHint(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      title={label}
      aria-label={label}
      className="group relative grid size-11 place-items-center rounded-2xl transition-colors active:scale-[0.97]"
      style={active ? { background: `color-mix(in oklab, ${tone} 14%, transparent)` } : undefined}
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full text-white"
        style={{ background: tone }}
      >
        {icon}
      </span>
      <span
        className={cn(
          "pointer-events-none absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-bold text-background opacity-0 shadow-lg transition-opacity duration-150",
          "group-hover:opacity-100",
          touchHint && "opacity-100",
        )}
      >
        {label}
      </span>
    </button>
  );
}
