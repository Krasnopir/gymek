import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";

export type DashboardSummary = {
  profile: Record<string, unknown> | null;
  todayPlan: Record<string, unknown> | null;
  nutritionTotals: { calories: number; protein: number };
  todayMetric: { weight_kg: number } | null;
  todayCheckin: { sleep_hours: number | null } | null;
  todaySummary: { summary_text: string } | null;
};

export const useDashboardSummary = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["dashboard-summary", userId],
    enabled: Boolean(userId),
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary/${userId}`),
  });
};
