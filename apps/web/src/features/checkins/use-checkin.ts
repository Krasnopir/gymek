import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";

export const useCheckinToday = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["checkin-today", userId],
    enabled: Boolean(userId),
    queryFn: () => apiFetch<{ checkin: Record<string, unknown> | null }>(`/checkins/today/${userId}`),
  });
};

export const useCheckinActions = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      moodScore?: number;
      stressScore?: number;
      sleepHours?: number;
    }) =>
      apiFetch("/checkins/upsert", {
        method: "POST",
        body: JSON.stringify({ userId, ...payload }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["checkin-today", userId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", userId] });
    },
  });
};
