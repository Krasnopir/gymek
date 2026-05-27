import type { Locale } from "@gymek/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultLocale } from "@/i18n";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "gymek-locale",
    },
  ),
);
