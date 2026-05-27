import type { Locale } from "@gymek/shared";
import en from "./messages/en.json";
import pl from "./messages/pl.json";
import ru from "./messages/ru.json";
import uk from "./messages/uk.json";

export type Messages = typeof ru;

const catalogs: Record<Locale, Messages> = {
  ru,
  uk,
  en,
  pl,
};

export const defaultLocale: Locale = "ru";

export const getMessages = (locale: Locale): Messages => {
  return catalogs[locale] ?? catalogs.ru;
};

export const localeLabels: Record<Locale, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
  pl: "Polski",
};
