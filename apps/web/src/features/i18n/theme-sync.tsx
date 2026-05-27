import { useEffect } from "react";
import { resolveTheme, useThemeStore } from "@/features/settings/theme-store";

export const ThemeSync = () => {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(mode);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.dataset.theme = resolved;
    };

    apply();

    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  return null;
};
