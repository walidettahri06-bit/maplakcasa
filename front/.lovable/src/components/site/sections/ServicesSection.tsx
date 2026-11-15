import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Price } from "@/components/shared/Price";
import { useServices } from "@/hooks/use-services";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../SectionHeading";

export function ServicesSection() {
  const { t, lang } = useI18n();
  const services = useServices().filter((s) => s.active);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t("site.services.eyebrow")}
          title={t("site.services.title")}
          subtitle={t("site.services.subtitle")}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {services.map((s, i) => {
            const featured = s.id === "pair";
            return (
              <article
                key={s.id}
                style={{ animationDelay: `${i * 90}ms` }}
                className={cn(
                  "group relative flex animate-rise flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40",
                  featured && "border-ink bg-ink text-ink-foreground",
                )}
              >
                {featured && (
                  <span className="absolute end-5 top-5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    {t("site.services.popular")}
                  </span>
                )}
                {s.imageUrl && !failedImages[s.id] ? <img src={s.imageUrl} alt={(lang === "ar" ? s.nameAr : s.nameFr) ?? s.name ?? ""} onError={() => setFailedImages((current) => ({ ...current, [s.id]: true }))} className="mb-6 h-36 w-full rounded-xl object-cover" /> : <div
                  className={cn(
                    "mb-6 flex h-36 flex-col items-center justify-center gap-2 rounded-xl",
                    featured ? "bg-ink-soft" : "bg-muted",
                  )}
                >
                  <LicensePlate plate={{}} size="sm" className="transition-transform duration-500 group-hover:scale-105" />
                  {s.id === "pair" && <LicensePlate plate={{}} size="sm" className="opacity-80" />}
                </div>}
                <h3 className="font-display text-2xl font-bold uppercase">{(lang === "ar" ? s.nameAr : s.nameFr) ?? s.name ?? t(`common.services.${s.id}.name`)}</h3>
                <p className={cn("mt-2 flex-1 text-sm", featured ? "text-ink-muted" : "text-muted-foreground")}>
                  {(lang === "ar" ? s.descriptionAr : s.descriptionFr) ?? s.description ?? t(`common.services.${s.id}.description`)}
                </p>
                <p className={cn("mt-4 flex items-center gap-2 text-xs", featured ? "text-ink-muted" : "text-muted-foreground")}>
                  <Check className="size-3.5 text-primary" /> {t("site.services.includes")}
                </p>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <Price amount={s.price} className="font-display text-3xl font-bold" />
                    {s.compareAtPrice && (
                      <p className="text-xs font-semibold text-primary">
                        {t("site.services.save", { amount: formatMAD(s.compareAtPrice - s.price, lang) })}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/commander"
                    search={{ service: s.id }}
                    aria-label={`${t("common.actions.orderNow")} – ${s.name ?? t(`common.services.${s.id}.name`)}`}
                    className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110"
                  >
                    <ArrowRight className="size-5 flip-rtl" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
