import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/auth-provider";
import { queryClient } from "./query-client";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};
