import { Languages } from "lucide-react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Segmented FR / ع toggle. Switching to Arabic flips the whole layout to RTL. */
export function LanguageSwitcher({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("common.language.label")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1",
        tone === "light" ? "border-ink-border bg-ink-soft" : "border-border bg-card",
        className,
      )}
    >
      <Languages className={cn("mx-1 size-3.5", tone === "light" ? "text-ink-muted" : "text-muted-foreground")} />
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          title={l.label}
          className={cn(
            "h-7 min-w-8 rounded-full px-2.5 text-xs font-bold transition-colors",
            l.code === "ar" && "font-arabic text-sm",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : tone === "light"
                ? "text-ink-muted hover:text-ink-foreground"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
