import { useQuery } from "@tanstack/react-query";
import { clientEnv } from "@/lib/client-env";
import type { WorkoutPlan } from "@/features/training/use-today-workout";
import { useAuth } from "@/features/auth/auth-provider";

export type WorkoutSession = {
  id: string;
  status: "completed" | "skipped" | "partial";
  note: string | null;
  skip_reason_code: string | null;
  session_date: string;
};

export type WorkoutExerciseLog = {
  id: string;
  workout_exercise_id: string;
  completed: boolean;
  planned_weight_kg: number | null;
  actual_weight_kg: number | null;
  planned_reps: string | null;
  actual_reps: string | null;
  planned_sets: number | null;
  actual_sets: number | null;
  note: string | null;
};

export type WorkoutDayResponse = {
  plan: WorkoutPlan | null;
  session: WorkoutSession | null;
  exerciseLogs: WorkoutExerciseLog[];
};

export function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export const useWorkoutDay = (planDate: string) => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["workout-day", userId, planDate],
    enabled: Boolean(userId && planDate),
    queryFn: async (): Promise<WorkoutDayResponse> => {
      const response = await fetch(
        `${clientEnv.VITE_API_BASE_URL}/workouts/day/${userId}/${planDate}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load workout day");
      }
      return response.json() as Promise<WorkoutDayResponse>;
    },
  });
};
