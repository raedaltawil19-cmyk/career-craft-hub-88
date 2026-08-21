export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

/** A namespace bundle: one object per language, same keys in each. */
export type Bundle = Record<Language, Record<string, string>>;

export function makeBundle<T extends Bundle>(bundle: T): T {
  return bundle;
}
