import { Banknote, MessageCircle, FileCheck2, MapPin, Pencil, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Checkbox } from "@/components/ui/checkbox";
import { businessConfig } from "@/config/business";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMoroccanPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { CartItem, OrderTotals, PaymentMethod, PlateService } from "@/types";
import { StepHeader } from "./Field";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { documentTypes, type Errors, type WizardState } from "./wizard-state";

function Block({ icon, title, onEdit, children }: { icon: ReactNode; title: string; onEdit: () => void; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {icon} {title}
        </p>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <Pencil className="size-3" /> {t("order.summary.edit")}
        </button>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function StepSummary({
  state,
  services,
  items,
  totals,
  errors,
  goTo,
  onChange,
}: {
  state: WizardState;
  services: PlateService[];
  items: CartItem[];
  totals: OrderTotals;
  errors: Errors;
  goTo: (step: number) => void;
  onChange: (patch: Partial<Pick<WizardState, "paymentMethod" | "acceptTerms" | "acceptPrivacy">>) => void;
}) {
  const { t } = useI18n();
  const methods: { id: PaymentMethod; icon: ReactNode }[] = [
    { id: "cod", icon: <Banknote className="size-5" /> },
    { id: "bank_transfer", icon: <MessageCircle className="size-5" /> },
  ];
  const docCount = documentTypes.filter((d) => state.documents[d]).length;

  return (
    <div>
      <StepHeader title={t("order.summary.title")} text={t("order.summary.text")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Block icon={<UserRound className="size-3.5" />} title={t("order.summary.customer")} onEdit={() => goTo(0)}>
          <p className="font-semibold">{state.customer.fullName}</p>
          <p dir="ltr" className="text-start text-muted-foreground">{formatMoroccanPhone(state.customer.phone)}</p>
          {state.customer.email && <p className="text-muted-foreground">{state.customer.email}</p>}
        </Block>
        <Block icon={<MapPin className="size-3.5" />} title={t("order.summary.deliveryTo")} onEdit={() => goTo(2)}>
          <p className="font-semibold">{state.delivery.address}</p>
          <p className="text-muted-foreground">{state.delivery.neighborhood}, Casablanca</p>
          {state.delivery.instructions && <p className="mt-1 text-xs italic text-muted-foreground">“{state.delivery.instructions}”</p>}
        </Block>
        <Block icon={<span className="size-3.5 rounded-sm border-2 border-current" />} title={t("order.summary.plate")} onEdit={() => goTo(1)}>
          <LicensePlate plate={state.plate} size="sm" />
        </Block>
        <Block icon={<FileCheck2 className="size-3.5" />} title={t("order.summary.documents")} onEdit={() => goTo(2)}>
          <p className="font-semibold">{t("order.summary.docsCount", { count: docCount })}</p>
          <p className="text-xs text-muted-foreground">{documentTypes.map((d) => t(`common.documents.${d}`)).join(" · ")}</p>
        </Block>
      </div>

      <div className="mt-6 rounded-xl border bg-muted/40 p-5 lg:hidden">
        <OrderSummaryCard items={items} services={services} totals={totals} compact />
      </div>

      <h3 className="mb-3 mt-10 font-display text-xl font-bold uppercase">{t("order.summary.paymentTitle")}</h3>
      <div role="radiogroup" aria-label={t("order.summary.paymentTitle")} className="grid gap-3 sm:grid-cols-2">
        {methods.map((m) => {
          const active = state.paymentMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ paymentMethod: m.id })}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 bg-card p-4 text-start transition-all",
                active ? "border-primary shadow-red" : "border-border hover:border-foreground/20",
              )}
            >
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {m.icon}
              </span>
              <span>
                <span className="block font-bold">{t(`order.summary.${m.id}`)}</span>
                <span className="block text-xs text-muted-foreground">{t(`order.summary.${m.id}Text`)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {state.paymentMethod === "bank_transfer" && <a className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium text-primary hover:bg-muted" href={`https://wa.me/${businessConfig.whatsappNumber}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />{t("common.actions.contactWhatsapp")}</a>}

      <div className="mt-8 space-y-4">
        {(["acceptTerms", "acceptPrivacy"] as const).map((k) => (
          <div key={k}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={state[k]}
                onCheckedChange={(v) => onChange({ [k]: v === true })}
                aria-invalid={!!errors[k]}
                className="mt-0.5"
              />
              <span>{t(k === "acceptTerms" ? "order.summary.terms" : "order.summary.privacy")}</span>
            </label>
            {errors[k] && <p role="alert" className="ms-7 mt-1 text-xs font-medium text-destructive">{t(`common.${errors[k]}`)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
