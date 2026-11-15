import { ShoppingBag, Truck } from "lucide-react";
import { Price } from "@/components/shared/Price";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import { businessConfig } from "@/config/business";
import type { CartItem, OrderTotals, PlateService } from "@/types";

/** Live cart: lines, subtotal, delivery, total. Used in the wizard sidebar and summary step. */
export function OrderSummaryCard({
  items,
  services,
  totals,
  compact = false,
}: {
  items: CartItem[];
  services: PlateService[];
  totals: OrderTotals;
  compact?: boolean;
}) {
  const { t, lang } = useI18n();
  const remaining = businessConfig.freeDeliveryThreshold - totals.subtotal;

  return (
    <div className={compact ? "" : "rounded-2xl border bg-card p-6 shadow-card"}>
      {!compact && (
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase">
          <ShoppingBag className="size-4 text-primary" /> {t("order.cart.title")}
        </h3>
      )}
      {items.length === 0 ? (
        <p className="rounded-lg bg-muted py-6 text-center text-sm text-muted-foreground">{t("order.cart.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => {
            const s = services.find((x) => x.id === i.serviceId);
            if (!s) return null;
            return (
              <li key={i.serviceId} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">{s.name ?? t(`common.services.${i.serviceId}.name`)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {i.quantity} × {formatMAD(s.price, lang)}
                  </span>
                </span>
                <Price amount={s.price * i.quantity} className="font-semibold" />
              </li>
            );
          })}
        </ul>
      )}
      <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("order.summary.subtotal")}</dt>
          <dd><Price amount={totals.subtotal} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("order.summary.delivery")}</dt>
          <dd>
            {totals.itemCount > 0 && totals.deliveryFee === 0 ? (
              <span className="font-semibold text-success">{t("common.misc.free")}</span>
            ) : (
              <Price amount={totals.deliveryFee} />
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t pt-3">
          <dt className="font-bold">{t("order.summary.total")}</dt>
          <dd><Price amount={totals.total} className="font-display text-3xl font-extrabold text-primary" /></dd>
        </div>
      </dl>
      {totals.itemCount > 0 && remaining > 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
          <Truck className="size-3.5 shrink-0" />
          {t("order.cart.freeDeliveryLeft", { amount: formatMAD(remaining, lang) })}
        </p>
      )}
    </div>
  );
}
