import { Link } from "@tanstack/react-router";
import { Check, Truck } from "lucide-react";
import { Price } from "@/components/shared/Price";
import { Button } from "@/components/ui/button";
import { businessConfig } from "@/config/business";
import { useServices } from "@/hooks/use-services";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../SectionHeading";

export function PricingSection() {
  const { t, tm, lang } = useI18n();
  const services = useServices().filter((s) => s.active);
  const features = tm<string[]>("site.pricing.features");

  return (
    <section className="bg-muted/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t("site.pricing.eyebrow")} title={t("site.pricing.title")} subtitle={t("site.pricing.subtitle")} />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {services.map((s) => {
            const featured = s.id === "pair";
            return (
              <div
                key={s.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 shadow-card",
                  featured && "border-primary ring-1 ring-primary lg:-my-3 lg:py-11",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 start-8 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    {t("site.services.popular")}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold uppercase">{s.name ?? t(`common.services.${s.id}.name`)}</h3>
                <div className="mt-5 flex items-baseline gap-3">
                  <Price amount={s.price} className="font-display text-5xl font-extrabold" />
                  {s.compareAtPrice && (
                    <Price amount={s.compareAtPrice} className="text-lg text-muted-foreground line-through" />
                  )}
                </div>
                <ul className="mt-7 flex-1 space-y-3 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check className="size-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={featured ? "hero" : "ink"} size="xl" className="mt-8 w-full">
                  <Link to="/commander" search={{ service: s.id }}>
                    {t("site.pricing.cta")}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <span className="inline-flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            {t("site.pricing.delivery", { fee: formatMAD(businessConfig.deliveryFee, lang) })}
          </span>
          <span className="font-semibold text-foreground">
            {t("site.pricing.freeDelivery", { amount: formatMAD(businessConfig.freeDeliveryThreshold, lang) })}
          </span>
        </div>
      </div>
    </section>
  );
}
