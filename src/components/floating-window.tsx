import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minimize2, Minus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Mode = "normal" | "maximized" | "minimized";

/**
 * Portable floating window: draggable, resizable (maximise/restore), minimisable
 * to the screen corner, and closable. On small screens it renders as a bottom
 * sheet. Pure presentational component — no routing or data dependencies.
 */
export function FloatingWindow({
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  width = 560,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const t = useT();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<Mode>("normal");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (pos || isMobile) return;
    const w = Math.min(width, window.innerWidth - 32);
    setPos({
      x: Math.max(16, (window.innerWidth - w) / 2),
      y: Math.max(16, window.innerHeight * 0.08),
    });
  }, [pos, isMobile, width]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile || mode !== "normal" || !pos) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    },
    [isMobile, mode, pos],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const x = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 120);
    const y = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 80);
    setPos({ x, y });
  }, []);

  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  if (mode === "minimized") {
    return (
      <button
        type="button"
        onClick={() => setMode("normal")}
        className="fixed bottom-24 end-4 z-[70] flex max-w-[70vw] items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground lg:bottom-6"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        {icon}
        <span className="truncate">{title}</span>
        <Maximize2 className="size-4 shrink-0" aria-hidden />
      </button>
    );
  }

  const floating = !isMobile && mode === "normal";

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          "absolute flex flex-col overflow-hidden bg-card",
          isMobile
            ? "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl"
            : mode === "maximized"
              ? "inset-4 rounded-3xl"
              : "rounded-3xl",
        )}
        style={{
          boxShadow: "var(--shadow-lift)",
          ...(floating && pos
            ? {
                insetInlineStart: undefined,
                left: pos.x,
                top: pos.y,
                width: Math.min(width, typeof window !== "undefined" ? window.innerWidth - 32 : width),
                maxHeight: "82vh",
              }
            : {}),
        }}
      >
        <header
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "flex items-start gap-3 border-b border-border bg-card px-4 py-3 sm:px-5",
            floating && "cursor-move select-none",
          )}
          title={floating ? t("ws.dragHint") : undefined}
        >
          {isMobile ? (
            <span className="absolute inset-x-0 top-1.5 mx-auto h-1 w-10 rounded-full bg-border" />
          ) : null}
          {icon ? (
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold leading-tight">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <WinBtn label={t("ws.minimize")} onClick={() => setMode("minimized")}>
              <Minus className="size-4" />
            </WinBtn>
            {!isMobile ? (
              <WinBtn
                label={mode === "maximized" ? t("ws.restore") : t("ws.maximize")}
                onClick={() => setMode(mode === "maximized" ? "normal" : "maximized")}
              >
                {mode === "maximized" ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </WinBtn>
            ) : null}
            <WinBtn label={t("ws.close")} onClick={onClose}>
              <X className="size-4" />
            </WinBtn>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer ? (
          <div className="border-t border-border px-4 py-3 pb-safe sm:px-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

function WinBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
