import { useMemo } from "react";
import type { Locale } from "@gymek/shared";
import { getMessages } from "@/i18n";
import { useLocaleStore } from "@/features/settings/locale-store";

export const useMessages = (overrideLocale?: Locale) => {
  const locale = useLocaleStore((state) => state.locale);
  const activeLocale = overrideLocale ?? locale;

  return useMemo(() => getMessages(activeLocale), [activeLocale]);
};

export const useLocale = () => {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  return { locale, setLocale };
};
