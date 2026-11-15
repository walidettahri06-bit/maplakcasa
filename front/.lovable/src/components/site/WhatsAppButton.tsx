import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { whatsappUrl } from "@/lib/whatsapp";

/** Floating WhatsApp contact button, mirrored to the left in RTL. */
export function WhatsAppButton({ raised = false }: { raised?: boolean }) {
  const { t } = useI18n();
  return (
    <a
      href={whatsappUrl(t("common.whatsapp.message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("common.whatsapp.label")}
      className={cn(
        "group fixed bottom-5 end-5 z-40 flex items-center gap-2 rounded-full bg-whatsapp p-4 text-whatsapp-foreground shadow-card animate-pulse-ring transition-transform hover:scale-105 sm:bottom-7 sm:end-7",
        raised && "bottom-24 sm:bottom-24 lg:bottom-7",
      )}
    >
      <MessageCircle className="size-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-48 sm:inline">
        {t("common.whatsapp.label")}
      </span>
    </a>
  );
}
