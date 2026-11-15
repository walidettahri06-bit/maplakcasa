import { Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export const stepKeys = ["customer", "service", "documents", "summary"] as const;

export function Stepper({
  current,
  maxReached,
  onSelect,
}: {
  current: number;
  maxReached: number;
  onSelect: (i: number) => void;
}) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("order.stepOf", { current: current + 1, total: stepKeys.length })}>
      <ol className="grid grid-cols-4 gap-2">
        {stepKeys.map((key, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={key}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-start disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "h-1 w-full rounded-full transition-colors duration-500",
                    done || active ? "bg-primary" : "bg-border",
                  )}
                />
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                      done && "bg-primary text-primary-foreground",
                      active && "bg-ink text-ink-foreground",
                      !done && !active && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate text-xs font-semibold sm:inline",
                      active ? "text-foreground" : "text-muted-foreground",
                      reachable && !active && "group-hover:text-foreground",
                    )}
                  >
                    {t(`order.steps.${key}`)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
