import type { WorkoutPlanDraft } from "./ai-coach.js";
import { supabaseAdmin } from "../supabase.js";

export async function persistWorkoutPlan(params: {
  userId: string;
  planDate: string;
  draft: WorkoutPlanDraft;
  status?: string;
}) {
  const { data: existing } = await supabaseAdmin
    .from("workout_plans")
    .select("id")
    .eq("user_id", params.userId)
    .eq("plan_date", params.planDate)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("workout_exercises").delete().eq("workout_plan_id", existing.id);
    await supabaseAdmin.from("workout_plans").delete().eq("id", existing.id);
  }

  const { data: plan, error: planError } = await supabaseAdmin
    .from("workout_plans")
    .insert({
      user_id: params.userId,
      plan_date: params.planDate,
      focus: params.draft.focus,
      status: params.status ?? "planned",
      ai_note: params.draft.ai_note,
    })
    .select("*")
    .single();

  if (planError) {
    throw planError;
  }

  const { error: exercisesError } = await supabaseAdmin.from("workout_exercises").insert(
    params.draft.exercises.map((exercise, index) => ({
      workout_plan_id: plan.id,
      sort_order: index + 1,
      exercise_name: exercise.name,
      target_muscle: exercise.muscle,
      target_sets: exercise.sets,
      target_reps: exercise.reps,
    })),
  );

  if (exercisesError) {
    throw exercisesError;
  }

  const { data: fullPlan } = await supabaseAdmin
    .from("workout_plans")
    .select("*, workout_exercises(*)")
    .eq("id", plan.id)
    .single();

  return fullPlan;
}

export function addDays(dateStr: string, days: number) {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
