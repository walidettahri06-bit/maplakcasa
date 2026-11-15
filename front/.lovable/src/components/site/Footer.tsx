import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";
import { businessConfig } from "@/config/business";
import { useI18n } from "@/i18n/I18nProvider";
import { whatsappUrl } from "@/lib/whatsapp";

export function Footer() {
  const { t } = useI18n();
  const legal = (label: string) => () => toast.info(label, { description: t("common.footer.demo") });

  return (
    <footer className="bg-ink text-ink-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="text-sm leading-relaxed">{t("common.footer.about")}</p>
          <p className="inline-flex items-center gap-2 rounded-full border border-ink-border px-3 py-1 text-xs">
            <MapPin className="size-3.5 text-primary" />
            {t("common.footer.zone")}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-ink-foreground">
            {t("common.footer.links")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {(
              [
                ["/services", "services"],
                ["/tarifs", "pricing"],
                ["/faq", "faq"],
                ["/commander", "order"],
                ["/admin", "admin"],
              ] as const
            ).map(([to, key]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-ink-foreground">
                  {t(`common.nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-ink-foreground">
            {t("common.footer.contact")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`tel:+${businessConfig.whatsappNumber}`} className="flex items-center gap-2.5 hover:text-ink-foreground">
                <Phone className="size-4 text-primary" />
                <span dir="ltr">{businessConfig.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl(t("common.whatsapp.message"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-ink-foreground"
              >
                <MessageCircle className="size-4 text-primary" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${businessConfig.email}`} className="flex items-center gap-2.5 hover:text-ink-foreground">
                <Mail className="size-4 text-primary" />
                {businessConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 text-primary" />
              {businessConfig.openingHours}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-ink-foreground">
            {t("common.footer.legal")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button type="button" onClick={legal(t("common.footer.terms"))} className="hover:text-ink-foreground">
                {t("common.footer.terms")}
              </button>
            </li>
            <li>
              <button type="button" onClick={legal(t("common.footer.privacy"))} className="hover:text-ink-foreground">
                {t("common.footer.privacy")}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © 2026 {businessConfig.brand}. {t("common.footer.rights")}
          </p>
          <p>{t("common.footer.demo")}</p>
        </div>
      </div>
    </footer>
  );
}
