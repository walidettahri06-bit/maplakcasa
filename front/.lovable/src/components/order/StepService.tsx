import { Check } from "lucide-react";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Price } from "@/components/shared/Price";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { businessConfig } from "@/config/business";
import { plateLetters } from "@/data/neighborhoods";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { PlateService, ServiceId } from "@/types";
import { Field, StepHeader } from "./Field";
import { QuantityStepper } from "./QuantityStepper";
import type { Errors, WizardState } from "./wizard-state";

export function StepService({
  services,
  quantities,
  plate,
  errors,
  onQuantity,
  onPlate,
}: {
  services: PlateService[];
  quantities: WizardState["quantities"];
  plate: WizardState["plate"];
  errors: Errors;
  onQuantity: (id: ServiceId, q: number) => void;
  onPlate: (patch: Partial<WizardState["plate"]>) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <StepHeader title={t("order.service.title")} text={t("order.service.text")} />
      <div className="grid gap-3" role="group" aria-label={t("order.service.title")}>
        {services.map((s) => {
          const q = quantities[s.id] ?? 0;
          const serviceName = s.name ?? t(`common.services.${s.id}.name`);
          const serviceDescription = s.description ?? t(`common.services.${s.id}.description`);
          const selected = q > 0;
          return (
            <div
              key={s.id}
              className={cn(
                "flex flex-col gap-4 rounded-xl border-2 bg-card p-4 transition-all sm:flex-row sm:items-center",
                selected ? "border-primary shadow-red" : "border-border hover:border-foreground/20",
                !s.active && "opacity-50",
              )}
            >
              <button
                type="button"
                disabled={!s.active}
                onClick={() => onQuantity(s.id, selected ? 0 : 1)}
                aria-pressed={selected}
                className="flex flex-1 items-center gap-4 text-start"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {selected && <Check className="size-4" />}
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{serviceName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {s.active ? serviceDescription : t("order.service.unavailable")}
                  </span>
                </span>
                <span className="text-end">
                  <Price amount={s.price} className="block font-display text-xl font-bold" />
                  <span className="text-[11px] text-muted-foreground">{t("common.misc.perUnit")}</span>
                </span>
              </button>
              {selected && (
                <div className="flex items-center justify-between gap-3 border-t pt-3 sm:border-s sm:border-t-0 sm:ps-4 sm:pt-0">
                  <span className="text-xs font-semibold text-muted-foreground sm:hidden">{t("order.service.quantity")}</span>
                  <QuantityStepper
                    value={q}
                    min={0}
                    max={businessConfig.maxQuantityPerService}
                    onChange={(v) => onQuantity(s.id, v)}
                    label={`${t("order.service.quantity")} – ${serviceName}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {errors["services"] && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {t(`common.${errors["services"]}`)}
        </p>
      )}

      <div className="mt-10 rounded-xl border bg-muted/50 p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold uppercase">{t("order.service.plateTitle")}</h3>
        <p className="mb-5 text-sm text-muted-foreground">{t("order.service.plateText")}</p>
        <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-3" dir="ltr">
          <Field id="plate-serial" label={t("order.service.serial")} error={errors["plate.serial"]}>
            <Input
              id="plate-serial"
              inputMode="numeric"
              maxLength={5}
              value={plate.serial}
              onChange={(e) => onPlate({ serial: e.target.value.replace(/\D/g, "") })}
              placeholder="12345"
              aria-invalid={!!errors["plate.serial"]}
              className="h-12 font-plate text-lg tracking-widest"
            />
          </Field>
          <Field id="plate-letter" label={t("order.service.letter")} error={errors["plate.letter"]}>
            <Select value={plate.letter} onValueChange={(v) => onPlate({ letter: v })}>
              <SelectTrigger id="plate-letter" className="!h-12 font-arabic text-lg" aria-invalid={!!errors["plate.letter"]}>
                <SelectValue placeholder="أ" />
              </SelectTrigger>
              <SelectContent>
                {plateLetters.map((l) => (
                  <SelectItem key={l} value={l} className="font-arabic text-lg">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="plate-region" label={t("order.service.region")} error={errors["plate.region"]}>
            <Input
              id="plate-region"
              inputMode="numeric"
              maxLength={2}
              value={plate.region}
              onChange={(e) => onPlate({ region: e.target.value.replace(/\D/g, "") })}
              placeholder="6"
              aria-invalid={!!errors["plate.region"]}
              className="h-12 font-plate text-lg"
            />
          </Field>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg bg-ink py-7">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{t("order.service.preview")}</span>
          <LicensePlate plate={plate} size="md" className="h-12 w-full max-w-[32rem] gap-1 px-2 text-[clamp(1rem,5.5vw,1.75rem)] sm:h-16 sm:gap-3 sm:px-5 sm:text-4xl" />
        </div>
      </div>
    </div>
  );
}
