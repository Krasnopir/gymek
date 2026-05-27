import { useEffect } from "react";
import { useLocaleStore } from "@/features/settings/locale-store";

export const LocaleHtmlSync = () => {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};
