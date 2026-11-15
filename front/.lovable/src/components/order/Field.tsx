import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";

/** Label + control + translated error/hint. */
export function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="ms-1.5 font-normal text-muted-foreground">({t("common.misc.optional")})</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" /> {t(`common.${error}`)}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function StepHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-3xl font-bold uppercase">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
