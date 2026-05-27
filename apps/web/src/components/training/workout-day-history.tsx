import { Check, X } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { WorkoutExercise } from "@/features/training/use-today-workout";
import type { WorkoutExerciseLog, WorkoutSession } from "@/features/training/use-workout-day";
import { useMessages } from "@/features/i18n/use-messages";

type WorkoutDayHistoryProps = {
  focus: string;
  planStatus: string;
  aiNote: string | null;
  session: WorkoutSession | null;
  exercises: WorkoutExercise[];
  exerciseLogs: WorkoutExerciseLog[];
};

export function WorkoutDayHistory({
  focus,
  planStatus,
  aiNote,
  session,
  exercises,
  exerciseLogs,
}: WorkoutDayHistoryProps) {
  const t = useMessages();
  const logsByExercise = new Map(
    exerciseLogs.map((log) => [log.workout_exercise_id, log]),
  );

  const statusLabel =
    session?.status === "partial"
      ? t.training.statusPartial
      : planStatus === "completed"
        ? t.training.statusCompleted
        : planStatus === "skipped"
          ? t.training.statusSkipped
          : t.training.statusPlanned;

  const skipReasonMap: Record<string, string> = {
    tired: t.training.skipReasons.tired,
    injury: t.training.skipReasons.injury,
    time: t.training.skipReasons.time,
    no_motivation: t.training.skipReasons.noMotivation,
    soreness: t.training.skipReasons.soreness,
    other: t.training.skipReasons.other,
  };
  const skipReasonLabel = session?.skip_reason_code
    ? skipReasonMap[session.skip_reason_code]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="gymek-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{focus}</h2>
          <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {statusLabel}
          </span>
        </div>
        {aiNote ? (
          <p className="mt-3 flex gap-2 gymek-muted">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{aiNote}</span>
          </p>
        ) : null}
        {session?.status === "skipped" ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            {skipReasonLabel ? <p className="font-medium">{skipReasonLabel}</p> : null}
            {session.note ? <p className="mt-1 opacity-90">{session.note}</p> : null}
            {!skipReasonLabel && !session.note ? (
              <p className="gymek-muted">{t.training.skippedNoDetails}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <ul className="space-y-2">
        {exercises
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((exercise) => {
            const log = logsByExercise.get(exercise.id);
            return (
              <li key={exercise.id} className="gymek-list-row">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-zinc-500">
                    {log?.completed ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : log ? (
                      <X className="h-4 w-4 text-amber-600" />
                    ) : (
                      <span className="inline-block h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {exercise.exercise_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {t.training.plan}: {exercise.target_sets ?? "—"}×
                      {exercise.target_reps ?? "—"}
                      {exercise.target_weight_kg != null
                        ? ` · ${exercise.target_weight_kg} ${t.common.kg}`
                        : ""}
                    </p>
                    {log ? (
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {t.training.actual}:{" "}
                        {log.actual_sets ?? log.planned_sets ?? "—"}×
                        {log.actual_reps ?? log.planned_reps ?? "—"}
                        {log.actual_weight_kg != null
                          ? ` · ${log.actual_weight_kg} ${t.common.kg}`
                          : ""}
                      </p>
                    ) : null}
                    {log?.note ? (
                      <p className="mt-1 text-xs italic text-zinc-500">{log.note}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
