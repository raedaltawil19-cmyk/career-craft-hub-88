import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CvPreview } from "@/components/cv-preview";
import { CV_TEMPLATES } from "@/components/template-gallery";
import { blankCvFor } from "@/lib/sample-cv";
import { useI18n, useT } from "@/lib/i18n";
import type { CvTemplateId } from "@/lib/career-types";

/** Mobile bottom sheet that previews a single (empty) CV template. */
export function TemplatePreviewSheet({
  templateId,
  onOpenChange,
  onSelect,
  onNavigate,
}: {
  templateId: CvTemplateId | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: CvTemplateId) => void;
  onNavigate: (id: CvTemplateId) => void;
}) {
  const t = useT();
  const { lang } = useI18n();
  const open = templateId !== null;
  const index = CV_TEMPLATES.findIndex((tpl) => tpl.id === templateId);
  const current = index >= 0 ? CV_TEMPLATES[index]! : null;

  const go = (delta: number) => {
    const next = CV_TEMPLATES[(index + delta + CV_TEMPLATES.length) % CV_TEMPLATES.length]!;
    onNavigate(next.id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex h-[90dvh] flex-col gap-0 rounded-t-3xl p-0">
        <SheetHeader className="border-b border-border px-4 pb-3 pe-12 pt-4 text-start">
          <SheetTitle className="truncate text-base">
            {current ? t(current.nameKey) : t("ws.tplPreviewTitle")}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-4">
          {current ? (
            <div className="pointer-events-none select-none">
              <CvPreview cv={blankCvFor(lang, current.id)} className="w-full" placeholder />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border bg-card px-4 py-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("ws.prevTemplate")}
            className="pressable grid size-11 place-items-center rounded-full border border-border"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => current && onSelect(current.id)}
            className="pressable rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            {t("ws.useThisTemplate")}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("ws.nextTemplate")}
            className="pressable grid size-11 place-items-center rounded-full border border-border"
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
