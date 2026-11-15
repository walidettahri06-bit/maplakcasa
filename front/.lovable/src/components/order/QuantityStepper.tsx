import { Minus, Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export function QuantityStepper({
  value,
  min = 0,
  max,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const { t } = useI18n();
  return (
    <div className="inline-flex items-center rounded-full border bg-background" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t("order.service.decrease")}
        className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t("order.service.increase")}
        className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
