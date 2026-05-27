import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-provider";

export type CalendarPlan = {
  id: string;
  plan_date: string;
  focus: string;
  status: string;
};

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export const useCalendarPlans = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const from = addDays(-28);
  const to = todayDateString();

  return useQuery({
    queryKey: ["calendar-plans", userId, from, to],
    enabled: Boolean(userId),
    queryFn: () =>
      apiFetch<{ plans: CalendarPlan[] }>(
        `/workouts/calendar/${userId}?from=${from}&to=${to}`,
      ),
  });
};
