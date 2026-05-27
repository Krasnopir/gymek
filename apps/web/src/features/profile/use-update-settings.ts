import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Locale } from "@gymek/shared";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";
import type { Profile } from "./use-profile";

export type AiTone = "goblin" | "bro" | "chill" | "science";

export type SettingsPatch = {
  locale?: Locale;
  aiTone?: AiTone;
};

export const useUpdateSettings = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (patch: SettingsPatch) =>
      apiFetch<{ profile: Profile }>("/profile/settings", {
        method: "PATCH",
        body: JSON.stringify({ userId, ...patch }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data.profile);
    },
  });
};
