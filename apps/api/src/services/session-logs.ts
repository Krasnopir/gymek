import { supabaseAdmin } from "../supabase.js";

export type ExerciseLogInput = {
  workoutExerciseId: string;
  completed: boolean;
  actualWeightKg?: number | null;
  actualReps?: string;
  actualSets?: number;
  note?: string;
};

export async function persistExerciseLogs(params: {
  userId: string;
  sessionId: string;
  workoutPlanId: string;
  logs: ExerciseLogInput[];
}) {
  if (!params.logs.length) {
    return [];
  }

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from("workout_exercises")
    .select("id, exercise_name, target_sets, target_reps, target_weight_kg")
    .eq("workout_plan_id", params.workoutPlanId);

  if (exercisesError) {
    throw exercisesError;
  }

  const exerciseById = new Map((exercises ?? []).map((row) => [row.id, row]));

  const rows = params.logs
    .filter((log) => exerciseById.has(log.workoutExerciseId))
    .map((log) => {
      const planned = exerciseById.get(log.workoutExerciseId)!;
      return {
        workout_session_id: params.sessionId,
        workout_exercise_id: log.workoutExerciseId,
        completed: log.completed,
        planned_weight_kg: planned.target_weight_kg,
        actual_weight_kg: log.actualWeightKg ?? null,
        planned_reps: planned.target_reps,
        actual_reps: log.actualReps ?? null,
        planned_sets: planned.target_sets,
        actual_sets: log.actualSets ?? null,
        note: log.note ?? null,
      };
    });

  if (!rows.length) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("workout_exercise_logs")
    .insert(rows)
    .select("*");

  if (error) {
    throw error;
  }

  const memoryFacts: string[] = [];

  for (const row of rows) {
    const exercise = exerciseById.get(row.workout_exercise_id);
    if (!exercise) {
      continue;
    }

    const plannedWeight = row.planned_weight_kg ? Number(row.planned_weight_kg) : null;
    const actualWeight = row.actual_weight_kg ? Number(row.actual_weight_kg) : null;

    if (!row.completed) {
      memoryFacts.push(
        `${exercise.exercise_name}: не завершил упражнение${row.note ? ` (${row.note})` : ""}. Снизить давление в следующих планах.`,
      );
      continue;
    }

    if (
      plannedWeight &&
      actualWeight &&
      actualWeight < plannedWeight * 0.85
    ) {
      memoryFacts.push(
        `${exercise.exercise_name}: план ${plannedWeight} кг, факт ${actualWeight} кг — не догнал. Не разгонять вес, прогрессия мягче.`,
      );
    }

    if (row.note?.trim()) {
      memoryFacts.push(`${exercise.exercise_name}: ${row.note.trim()}`);
    }
  }

  for (const factText of memoryFacts.slice(0, 8)) {
    await supabaseAdmin.from("ai_memory_facts").insert({
      user_id: params.userId,
      fact_type: "workout_performance",
      fact_text: factText,
      relevance_score: 0.85,
      source_date: new Date().toISOString().slice(0, 10),
      metadata: { sessionId: params.sessionId },
    });
  }

  return data ?? [];
}

export function buildAdaptationReason(params: {
  status: "completed" | "skipped" | "partial";
  skipReasonCode?: string;
  note?: string;
  exerciseLogs?: ExerciseLogInput[];
}): string {
  if (params.status === "skipped") {
    const parts = [
      "User skipped workout",
      params.skipReasonCode ? `reason_code=${params.skipReasonCode}` : null,
      params.note ? `note=${params.note}` : null,
    ].filter(Boolean);
    return `${parts.join(". ")}. Tomorrow lighter, respect recovery.`;
  }

  const completedCount = params.exerciseLogs?.filter((l) => l.completed).length ?? 0;
  const total = params.exerciseLogs?.length ?? 0;
  const notes = (params.exerciseLogs ?? []).filter((l) => l.note?.trim()).length;

  if (params.status === "partial" || (total > 0 && completedCount < total)) {
    return `Partial workout: ${completedCount}/${total} exercises done. Adapt next plan — don't increase loads aggressively.`;
  }

  if (notes > 0) {
    return "Workout completed with user notes on lifts. Read exercise logs and progress conservatively.";
  }

  return "User completed workout — progressive next session if recovery allows.";
}
