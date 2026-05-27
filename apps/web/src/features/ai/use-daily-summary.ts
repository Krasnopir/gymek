import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";

export const useDailySummary = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["daily-summary", userId],
    enabled: Boolean(userId),
    queryFn: () => apiFetch<{ summary: { summary_text: string } | null }>(`/ai/summary/${userId}`),
  });
};

export const useGenerateSummary = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch("/ai/summary/generate", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["daily-summary", userId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", userId] });
    },
  });
};
