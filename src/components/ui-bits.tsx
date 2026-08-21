import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/career-types";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="display mt-1 text-[1.9rem] leading-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-prose text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  as: As = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <As className={cn("tile p-5 sm:p-6", className)}>{children}</As>;
}

/** Big, unmistakable primary action card. */
export function ActionCard({
  icon,
  title,
  description,
  onClick,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable w-full rounded-3xl bg-primary p-6 text-start text-primary-foreground shadow-lift",
        className,
      )}
      style={{ boxShadow: "var(--shadow-press)" }}
    >
      {icon ? (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/20">{icon}</span>
      ) : null}
      <span className="display block text-xl sm:text-2xl">{title}</span>
      {description ? (
        <span className="mt-1 block text-sm text-primary-foreground/85">{description}</span>
      ) : null}
    </button>
  );
}

/** Large, equal-size navigation tile with a coloured icon square. */
export function NavTile({
  to,
  params,
  icon,
  label,
  hint,
  tone = "primary",
}: {
  to: string;
  params?: Record<string, string>;
  icon: ReactNode;
  label: string;
  hint?: string;
  tone?: "primary" | "accent" | "indigo" | "success";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    indigo: "bg-secondary text-secondary-foreground",
    success: "bg-success-soft text-success",
  } as const;
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="tile flex min-h-[7.5rem] flex-col items-center justify-center gap-3 p-5 text-center hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className={cn("grid size-13 place-items-center rounded-2xl", tones[tone])}>{icon}</span>
      <span className="text-base font-bold leading-tight">{label}</span>
      {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </Link>
  );
}


export function MatchRing({
  value,
  size = 56,
  label = "match",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const tone =
    value >= 80 ? "var(--color-success)" : value >= 65 ? "var(--color-accent)" : "var(--color-muted-foreground)";
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value}% ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

const statusTone: Record<ApplicationStatus, string> = {
  Saved: "bg-muted text-muted-foreground",
  Applied: "bg-primary-soft text-primary",
  Interview: "bg-accent-soft text-accent",
  "Second interview": "bg-accent-soft text-accent",
  Offer: "bg-success-soft text-success",
  Rejected: "bg-secondary text-muted-foreground",
  Withdrawn: "bg-secondary text-muted-foreground",
  Closed: "bg-secondary text-muted-foreground",
};

const statusKey: Record<ApplicationStatus, string> = {
  Saved: "dashboard.statusSaved",
  Applied: "dashboard.statusApplied",
  Interview: "dashboard.statusInterview",
  "Second interview": "dashboard.statusSecondInterview",
  Offer: "dashboard.statusOffer",
  Rejected: "dashboard.statusRejected",
  Withdrawn: "dashboard.statusWithdrawn",
  Closed: "dashboard.statusClosed",
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide",
        statusTone[status],
      )}
    >
      {t(statusKey[status])}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "match" | "gap" | "key";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground border-transparent",
    match: "bg-success-soft text-success border-transparent",
    gap: "bg-warning-soft text-warning-foreground border-transparent",
    key: "bg-primary-soft text-primary border-transparent",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 px-5 py-10 text-center">
      {icon ? (
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-card text-primary shadow-soft">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

export function LoadingList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4">
          <SkeletonBlock className="h-4 w-2/5" />
          <SkeletonBlock className="mt-3 h-3 w-3/5" />
          <SkeletonBlock className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <h3 className="text-base font-semibold text-destructive">{title ?? t("common.errorTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="tap mt-4 inline-flex items-center rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          {retryLabel ?? t("common.retry")}
        </button>
      ) : null}
    </div>
  );
}

export function LinkRow({
  to,
  params,
  title,
  meta,
  right,
}: {
  to: string;
  params?: Record<string, string>;
  title: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:bg-surface"
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold">{title}</span>
        {meta ? <span className="mt-1 block text-sm text-muted-foreground">{meta}</span> : null}
      </span>
      {right ? <span className="shrink-0">{right}</span> : null}
    </Link>
  );
}
