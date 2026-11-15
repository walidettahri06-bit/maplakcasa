import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Logo } from "@/components/shared/Logo";
import { businessConfig } from "@/config/business";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "home" },
  { to: "/services", key: "services" },
  { to: "/tarifs", key: "pricing" },
  { to: "/faq", key: "faq" },
] as const;

export function Navbar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-ink-border bg-ink/95 backdrop-blur-md" : "border-transparent bg-ink",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
        <Logo tone="light" />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: true }}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink-foreground"
                activeProps={{ className: "text-ink-foreground bg-ink-soft" }}
              >
                {t(`common.nav.${l.key}`)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={`tel:+${businessConfig.whatsappNumber}`}
            className="hidden items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink-foreground xl:flex"
          >
            <Phone className="size-4" />
            <span dir="ltr">{businessConfig.phoneDisplay}</span>
          </a>
          <LanguageSwitcher tone="light" className="hidden sm:inline-flex" />
          <Button asChild variant="hero" size="sm" className="hidden h-10 px-5 sm:inline-flex">
            <Link to="/commander">{t("common.actions.orderNow")}</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("common.nav.close") : t("common.nav.menu")}
            aria-expanded={open}
            className="flex size-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-soft lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-ink-border bg-ink px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  className="block border-b border-ink-border py-3.5 text-base font-medium text-ink-muted"
                  activeProps={{ className: "text-ink-foreground" }}
                >
                  {t(`common.nav.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between gap-3">
            <LanguageSwitcher tone="light" />
            <Button asChild variant="hero" className="h-11 flex-1">
              <Link to="/commander" onClick={() => setOpen(false)}>
                {t("common.actions.orderNow")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
