import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { whatsappUrl } from "@/lib/whatsapp";

export function CtaBand() {
  const { t } = useI18n();
  return (
    <section className="bg-background px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-red px-6 py-14 text-primary-foreground sm:px-14">
        <div className="absolute -end-20 -top-20 size-72 rounded-full border-[40px] border-primary-foreground/10" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">{t("site.cta.title")}</h2>
            <p className="mt-3 text-lg opacity-90">{t("site.cta.text")}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="ink" size="xl">
              <Link to="/commander">
                {t("common.actions.orderNow")} <ArrowRight className="flip-rtl" />
              </Link>
            </Button>
            <Button asChild variant="outlineLight" size="xl">
              <a href={whatsappUrl(t("common.whatsapp.message"))} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> {t("site.cta.secondary")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
