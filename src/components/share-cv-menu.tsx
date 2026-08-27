import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, Printer, Share2 } from "lucide-react";
import type { MasterCv } from "@/lib/career-types";
import { buildShareUrl } from "@/lib/cv-share";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Share one CV version: download (print to PDF), print, or copy a public link. */
export function ShareCvMenu({
  cv,
  name,
  className,
  compact = false,
}: {
  cv: MasterCv;
  name: string;
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const copyLink = async () => {
    const url = buildShareUrl({ name, cv });
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t("cv.copyLink"), url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const item =
    "tap flex w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-semibold hover:bg-muted";

  return (
    <div ref={boxRef} className={cn("relative print:hidden", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={t("cv.share")}
        aria-expanded={open}
        className={cn(
          "tap inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-card text-xs font-bold hover:bg-muted",
          compact ? "size-10" : "px-3.5",
        )}
      >
        <Share2 className="size-4" aria-hidden />
        {compact ? null : t("cv.share")}
      </button>

      {open ? (
        <div className="absolute z-40 mt-1.5 w-56 end-0 rounded-2xl border border-border-strong bg-card p-1.5 shadow-lg">
          <button type="button" className={item} onClick={() => window.print()}>
            <Download className="size-4" aria-hidden /> {t("cv.downloadPdf")}
          </button>
          <button type="button" className={item} onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> {t("cv.print")}
          </button>
          <button type="button" className={item} onClick={copyLink}>
            {copied ? (
              <Check className="size-4 text-success" aria-hidden />
            ) : (
              <Link2 className="size-4" aria-hidden />
            )}
            {copied ? t("cv.linkCopied") : t("cv.copyLink")}
          </button>
          <p className="px-3 py-1.5 text-[0.6875rem] text-muted-foreground">
            {t("cv.shareHint")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
