import { Link } from "@tanstack/react-router";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Price } from "@/components/shared/Price";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import type { Order } from "@/types";

export function OrderSuccess({ order, onNew }: { order: Order; onNew: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(order.reference).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-2xl animate-rise py-6 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/15">
        <div className="flex size-14 animate-in zoom-in-50 items-center justify-center rounded-full bg-success text-success-foreground duration-500">
          <Check className="size-8" strokeWidth={3} />
        </div>
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold uppercase sm:text-5xl">{t("order.success.title")}</h1>
      <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
        {t("order.success.text", { name: order.customer.fullName.split(" ")[0] ?? "" })}
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6 text-start shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("order.success.reference")}</p>
            <button type="button" onClick={copy} className="mt-1 inline-flex items-center gap-2 font-plate text-2xl font-bold" dir="ltr">
              {order.reference}
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4 text-muted-foreground" />}
            </button>
          </div>
          <LicensePlate plate={order.plate} size="sm" />
        </div>
        <dl className="grid grid-cols-2 gap-4 py-5 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("order.success.total")}</dt>
            <dd><Price amount={order.total} className="font-display text-2xl font-bold text-primary" /></dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("order.success.payment")}</dt>
            <dd className="font-semibold">{t(`common.paymentMethod.${order.payment.method}`)}</dd>
          </div>
        </dl>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("order.success.next")}</p>
        <ol className="space-y-2.5 text-sm">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-ink-foreground">{n}</span>
              {t(`order.success.next${n}`)}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="whatsapp" size="xl">
          <Link to="/suivi" search={{ reference: order.reference }}>
            <MessageCircle /> {t("order.success.track")}
          </Link>
        </Button>
        <Button variant="outline" size="xl" onClick={onNew}>
          {t("order.success.newOrder")}
        </Button>
        <Button asChild variant="ghost" size="xl">
          <Link to="/">{t("common.actions.backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
