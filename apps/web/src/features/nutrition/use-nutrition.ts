import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";

export type NutritionLog = {
  id: string;
  meal_label: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
};

export const useNutritionToday = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["nutrition-today", userId],
    enabled: Boolean(userId),
    queryFn: () =>
      apiFetch<{ logs: NutritionLog[]; totals: { calories: number; protein: number; carbs: number; fats: number } }>(
        `/nutrition/today/${userId}`,
      ),
  });
};

export const useNutritionActions = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["nutrition-today", userId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", userId] });
  };

  const estimateMutation = useMutation({
    mutationFn: (description: string) =>
      apiFetch<{
        estimate: {
          meal_label: string;
          calories_kcal: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          ai_note: string;
        };
      }>("/nutrition/estimate", {
        method: "POST",
        body: JSON.stringify({ userId, description }),
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: {
      mealLabel: string;
      caloriesKcal: number;
      proteinG: number;
      carbsG?: number;
      fatsG?: number;
      source?: "manual" | "ai";
    }) =>
      apiFetch("/nutrition/logs", {
        method: "POST",
        body: JSON.stringify({ userId, ...payload }),
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (logId: string) =>
      apiFetch(`/nutrition/logs/${logId}?userId=${userId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  return { estimateMutation, saveMutation, deleteMutation };
};
