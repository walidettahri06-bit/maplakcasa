import { useI18n } from "@/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Renders a MAD amount in the active language. */
export function Price({ amount, className }: { amount: number; className?: string }) {
  const { lang } = useI18n();
  return <span className={cn("tabular-nums", className)}>{formatMAD(amount, lang)}</span>;
}
