import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientEnv } from "@/lib/client-env";
import type { ExerciseLogDraft } from "@/components/training/exercise-session-list";
import type { SkipReasonCode } from "@/components/training/skip-workout-dialog";
import { useAuth } from "@/features/auth/auth-provider";

export type WorkoutExercise = {
  id: string;
  exercise_name: string;
  target_sets: number | null;
  target_reps: string | null;
  target_weight_kg: number | null;
  target_muscle: string | null;
  exercise_description: string | null;
  coaching_tip: string | null;
  sort_order: number;
};

export type WorkoutPlan = {
  id: string;
  focus: string;
  status: string;
  ai_note: string | null;
  plan_date: string;
  workout_exercises: WorkoutExercise[];
};

export type SessionPayload = {
  workoutPlanId: string;
  status: "completed" | "skipped" | "partial";
  note?: string;
  skipReasonCode?: SkipReasonCode;
  exerciseLogs?: Array<{
    workoutExerciseId: string;
    completed: boolean;
    actualWeightKg?: number | null;
    actualReps?: string;
    actualSets?: number;
    note?: string;
  }>;
};

export function toSessionExerciseLogs(logs: ExerciseLogDraft[]) {
  return logs.map((log) => ({
    workoutExerciseId: log.workoutExerciseId,
    completed: log.completed,
    actualWeightKg:
      log.actualWeightKg.trim() === "" ? null : Number(log.actualWeightKg),
    actualReps: log.actualReps.trim() || undefined,
    actualSets:
      log.actualSets.trim() === "" ? undefined : Number(log.actualSets),
    note: log.note.trim() || undefined,
  }));
}

export const useTodayWorkout = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["workout-today", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<WorkoutPlan | null> => {
      const response = await fetch(`${clientEnv.VITE_API_BASE_URL}/workouts/today/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to load workout");
      }
      const json = (await response.json()) as { plan: WorkoutPlan | null };
      return json.plan;
    },
  });
};

export const useWorkoutActions = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["workout-today", userId] });
    void queryClient.invalidateQueries({ queryKey: ["workout-day", userId] });
    void queryClient.invalidateQueries({ queryKey: ["calendar-plans", userId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", userId] });
  };

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${clientEnv.VITE_API_BASE_URL}/workouts/seed-today`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to seed workout");
      }
      return response.json();
    },
    onSuccess: invalidate,
  });

  const sessionMutation = useMutation({
    mutationFn: async (payload: SessionPayload) => {
      const response = await fetch(`${clientEnv.VITE_API_BASE_URL}/workouts/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutPlanId: payload.workoutPlanId,
          status: payload.status,
          note: payload.note,
          skipReasonCode: payload.skipReasonCode,
          exerciseLogs: payload.exerciseLogs,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save session");
      }
      return response.json();
    },
    onSuccess: invalidate,
  });

  return { seedMutation, sessionMutation };
};
