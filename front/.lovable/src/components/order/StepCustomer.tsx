import { Mail, Phone, UserRound, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/I18nProvider";
import { Field, StepHeader } from "./Field";
import type { Errors, WizardState } from "./wizard-state";

export function StepCustomer({
  value,
  errors,
  onChange,
}: {
  value: WizardState["customer"];
  errors: Errors;
  onChange: (patch: Partial<WizardState["customer"]>) => void;
}) {
  const { t } = useI18n();
  const inputCls = "h-12 ps-10 text-base";
  return (
    <div>
      <StepHeader title={t("order.customer.title")} text={t("order.customer.text")} />
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
        <UserX className="size-3.5" /> {t("order.customer.noAccount")}
      </div>
      <div className="grid gap-5">
        <Field id="fullName" label={t("order.customer.fullName")} error={errors["fullName"]}>
          <div className="relative">
            <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              autoComplete="name"
              maxLength={80}
              value={value.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder={t("order.customer.fullNamePh")}
              aria-invalid={!!errors["fullName"]}
              className={inputCls}
            />
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label={t("order.customer.phone")} error={errors["phone"]} hint={t("order.customer.phoneHint")}>
            <div className="relative">
              <Phone className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                autoComplete="tel"
                maxLength={20}
                value={value.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder={t("order.customer.phonePh")}
                aria-invalid={!!errors["phone"]}
                className={`${inputCls} text-start`}
              />
            </div>
          </Field>
          <Field id="email" label={t("order.customer.email")} optional error={errors["email"]}>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                maxLength={120}
                value={value.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder={t("order.customer.emailPh")}
                aria-invalid={!!errors["email"]}
                className={`${inputCls} text-start`}
              />
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
