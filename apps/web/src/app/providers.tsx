import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/auth-provider";
import { LocaleHtmlSync } from "@/features/i18n/locale-html-sync";
import { ThemeSync } from "@/features/i18n/theme-sync";
import { Toaster } from "@/features/toast/toaster";
import { queryClient } from "./query-client";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocaleHtmlSync />
        <ThemeSync />
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};
