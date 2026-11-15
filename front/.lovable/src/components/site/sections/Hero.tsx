import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-car.jpg";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

export function Hero() {
  const { t } = useI18n();
  const stats = [1, 2, 3].map((i) => ({ v: t(`site.hero.stat${i}`), l: t(`site.hero.stat${i}Label`) }));

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <img
        src={heroImg}
        alt=""
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 -z-20 size-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:min-h-[44rem]">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex animate-rise items-center gap-2 rounded-full border border-ink-border bg-ink/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            {t("site.hero.eyebrow")}
          </p>
          <h1 className="animate-rise font-display text-5xl font-extrabold uppercase leading-[0.92] text-ink-foreground [animation-delay:80ms] sm:text-7xl lg:text-[5.5rem]">
            {t("site.hero.title")}
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-ink-muted [animation-delay:160ms] sm:text-lg">
            {t("site.hero.subtitle")}
          </p>
          <div className="mt-9 flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/commander">
                {t("common.actions.orderNow")}
                <ArrowRight className="flip-rtl" />
              </Link>
            </Button>
            <Button asChild variant="outlineLight" size="xl">
              <Link to="/tarifs">{t("common.actions.seePricing")}</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-lg animate-rise grid-cols-3 gap-6 border-t border-ink-border pt-6 [animation-delay:320ms]">
            {stats.map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-3xl font-bold text-ink-foreground">{s.v}</dd>
                <dd className="text-xs uppercase tracking-wider text-ink-muted">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pointer-events-none absolute bottom-10 end-6 hidden animate-rise flex-col items-end gap-3 [animation-delay:500ms] xl:flex">
          <LicensePlate plate={{ serial: "84217", letter: "د", region: "6" }} size="lg" className="-rotate-2" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-ink-foreground backdrop-blur">
            <ShieldCheck className="size-3.5 text-primary" />
            {t("site.hero.badge")}
          </span>
        </div>
      </div>
    </section>
  );
}
