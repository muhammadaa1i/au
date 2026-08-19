import { enUS, ruRU } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/shared/types";
import type { Locale } from "./config";

// Clerk has no Uzbek translation upstream; fall back to English rather than
// shipping a partial/guessed translation of their auth UI.
export const clerkLocalizations: Record<Locale, LocalizationResource> = {
  uz: enUS,
  en: enUS,
  ru: ruRU,
};
