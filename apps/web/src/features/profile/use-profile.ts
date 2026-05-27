import { useQuery } from "@tanstack/react-query";
import type { Locale } from "@gymek/shared";
import { clientEnv } from "@/lib/client-env";
import { useAuth } from "@/features/auth/auth-provider";
import { useLocaleStore } from "@/features/settings/locale-store";

export type Profile = {
  id: string;
  locale: Locale;
  ai_tone: string;
  training_goal: string;
  onboarding_completed: boolean;
  display_name: string | null;
};

export const useProfile = () => {
  const { session } = useAuth();
  const setLocale = useLocaleStore((state) => state.setLocale);

  return useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: Boolean(session?.user.id),
    queryFn: async (): Promise<Profile | null> => {
      const response = await fetch(
        `${clientEnv.VITE_API_BASE_URL}/profile/${session!.user.id}`,
      );
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      const json = (await response.json()) as { profile: Profile };
      if (json.profile.locale) {
        setLocale(json.profile.locale);
      }
      return json.profile;
    },
  });
};
