import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/types";

import frCommon from "./locales/fr/common.json";
import frSite from "./locales/fr/site.json";
import frOrder from "./locales/fr/order.json";
import frAdmin from "./locales/fr/admin.json";
import arCommon from "./locales/ar/common.json";
import arSite from "./locales/ar/site.json";
import arOrder from "./locales/ar/order.json";
import arAdmin from "./locales/ar/admin.json";

type Dict = Record<string, unknown>;

export const dictionaries: Record<Lang, Dict> = {
  fr: { common: frCommon, site: frSite, order: frOrder, admin: frAdmin },
  ar: { common: arCommon, site: arSite, order: arOrder, admin: arAdmin },
};

export const LANGS: { code: Lang; label: string; short: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", short: "FR", dir: "ltr" },
  { code: "ar", label: "العربية", short: "ع", dir: "rtl" },
];

const STORAGE_KEY = "maplak.lang";

function lookup(dict: Dict, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Dict)) cur = (cur as Dict)[part];
    else return undefined;
  }
  return cur;
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>) {
  const raw = lookup(dictionaries[lang], key) ?? lookup(dictionaries.fr, key);
  if (typeof raw !== "string") return key;
  if (!vars) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? ""));
}

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  /** Translate a dotted key: "site.hero.title". Supports {{var}} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Raw access for arrays/objects (e.g. FAQ lists). */
  tm: <T = unknown>(key: string) => T;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // French on the server and first client render; stored choice applied after hydration.
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      tm: <T,>(key: string) =>
        (lookup(dictionaries[lang], key) ?? lookup(dictionaries.fr, key)) as T,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
