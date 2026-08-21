import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGUAGES, type Language } from "./types";
import { dictionary } from "./dictionary";

export { LANGUAGES };
export type { Language };

const STORAGE_KEY = "smartcv.language";
const DEFAULT_LANGUAGE: Language = "en";

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((l) => l.code === value);
}

export function dirFor(lang: Language): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

export function localeFor(lang: Language): string {
  return lang === "sv" ? "sv-SE" : lang === "ar" ? "ar" : "en-GB";
}

type Vars = Record<string, string | number>;

export function translate(lang: Language, key: string, vars?: Vars): string {
  const table = dictionary[lang] ?? dictionary[DEFAULT_LANGUAGE];
  const raw = table[key] ?? dictionary[DEFAULT_LANGUAGE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m: string, name: string) =>
    vars[name] === undefined ? m : String(vars[name]),
  );
}

type I18nValue = {
  lang: Language;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  locale: string;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) {
        setLangState(stored);
        return;
      }
      const nav = window.navigator.language?.slice(0, 2);
      if (isLanguage(nav)) setLangState(nav);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const dir = dirFor(lang);
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", dir);
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: dirFor(lang),
      isRtl: dirFor(lang) === "rtl",
      locale: localeFor(lang),
      setLang,
      t: (key: string, vars?: Vars) => translate(lang, key, vars),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so components never crash outside the provider (e.g. error pages).
    return {
      lang: DEFAULT_LANGUAGE,
      dir: "ltr",
      isRtl: false,
      locale: localeFor(DEFAULT_LANGUAGE),
      setLang: () => {},
      t: (key: string, vars?: Vars) => translate(DEFAULT_LANGUAGE, key, vars),
    };
  }
  return ctx;
}

/** Convenience hook when only the translate function is needed. */
export function useT() {
  return useI18n().t;
}
