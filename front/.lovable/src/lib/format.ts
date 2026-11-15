import type { Lang } from "@/types";

const locales: Record<Lang, string> = { fr: "fr-MA", ar: "ar-MA" };

export function formatMAD(amount: number, lang: Lang = "fr"): string {
  const n = new Intl.NumberFormat(lang === "ar" ? "fr-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  }).format(amount);
  return lang === "ar" ? `${n} د.م.` : `${n} MAD`;
}

export function formatDate(iso: string, lang: Lang = "fr", withTime = false): string {
  return new Intl.DateTimeFormat(locales[lang], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Casablanca",
  }).format(new Date(iso));
}

export function formatPlate(p: { serial: string; letter: string; region: string }): string {
  return `${p.serial} | ${p.letter} | ${p.region}`;
}
