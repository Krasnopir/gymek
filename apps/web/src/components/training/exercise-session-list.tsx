import { Check, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { inputClassName } from "@/components/ui/field";
import { useMessages } from "@/features/i18n/use-messages";
import type { WorkoutExercise } from "@/features/training/use-today-workout";
import { cn } from "@/lib/cn";

export type ExerciseLogDraft = {
  workoutExerciseId: string;
  completed: boolean;
  actualWeightKg: string;
  actualReps: string;
  actualSets: string;
  note: string;
};

export function buildExerciseLogDrafts(exercises: WorkoutExercise[]): ExerciseLogDraft[] {
  return exercises
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((exercise) => ({
      workoutExerciseId: exercise.id,
      completed: false,
      actualWeightKg:
        exercise.target_weight_kg != null ? String(exercise.target_weight_kg) : "",
      actualReps: exercise.target_reps ?? "",
      actualSets: exercise.target_sets != null ? String(exercise.target_sets) : "",
      note: "",
    }));
}

type ExerciseSessionListProps = {
  exercises: WorkoutExercise[];
  logs: ExerciseLogDraft[];
  disabled?: boolean;
  onChange: (logs: ExerciseLogDraft[]) => void;
};

export function ExerciseSessionList({
  exercises,
  logs,
  disabled,
  onChange,
}: ExerciseSessionListProps) {
  const t = useMessages();
  const [infoExerciseId, setInfoExerciseId] = useState<string | null>(null);

  const sortedExercises = useMemo(
    () => exercises.slice().sort((a, b) => a.sort_order - b.sort_order),
    [exercises],
  );

  const infoExercise = sortedExercises.find((ex) => ex.id === infoExerciseId);

  const updateLog = (exerciseId: string, patch: Partial<ExerciseLogDraft>) => {
    onChange(
      logs.map((log) =>
        log.workoutExerciseId === exerciseId ? { ...log, ...patch } : log,
      ),
    );
  };

  return (
    <>
      <ul className="space-y-2">
        {sortedExercises.map((exercise) => {
          const log =
            logs.find((item) => item.workoutExerciseId === exercise.id) ??
            buildExerciseLogDrafts([exercise])[0];
          const hasWeight = exercise.target_weight_kg != null;

          return (
            <li
              key={exercise.id}
              className={cn(
                "rounded-xl border p-3 transition",
                log.completed
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30",
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  aria-label={t.training.markDone}
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition",
                    log.completed
                      ? "border-emerald-500 bg-emerald-500 text-black"
                      : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-400",
                  )}
                  disabled={disabled}
                  onClick={() =>
                    updateLog(exercise.id, { completed: !log.completed })
                  }
                  type="button"
                >
                  {log.completed ? <Check className="h-4 w-4" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{exercise.exercise_name}</p>
                    <button
                      aria-label={t.training.exerciseInfo}
                      className="cursor-pointer rounded p-0.5 text-zinc-500 transition hover:bg-zinc-200 hover:text-violet-600 dark:hover:bg-zinc-800 dark:hover:text-violet-300"
                      disabled={disabled}
                      onClick={() => setInfoExerciseId(exercise.id)}
                      type="button"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {t.training.plan}: {exercise.target_sets ?? "—"}×{exercise.target_reps ?? "—"}
                    {hasWeight ? ` · ${exercise.target_weight_kg} ${t.common.kg}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {hasWeight ? (
                  <label className="text-xs text-zinc-500">
                    {t.training.actualWeight}
                    <input
                      className={`${inputClassName} mt-1`}
                      disabled={disabled}
                      inputMode="decimal"
                      onChange={(e) =>
                        updateLog(exercise.id, { actualWeightKg: e.target.value })
                      }
                      placeholder={String(exercise.target_weight_kg ?? "")}
                      type="number"
                      value={log.actualWeightKg}
                    />
                  </label>
                ) : null}
                <label className="text-xs text-zinc-500">
                  {t.training.actualReps}
                  <input
                    className={`${inputClassName} mt-1`}
                    disabled={disabled}
                    onChange={(e) => updateLog(exercise.id, { actualReps: e.target.value })}
                    placeholder={exercise.target_reps ?? ""}
                    value={log.actualReps}
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  {t.training.actualSets}
                  <input
                    className={`${inputClassName} mt-1`}
                    disabled={disabled}
                    inputMode="numeric"
                    onChange={(e) => updateLog(exercise.id, { actualSets: e.target.value })}
                    placeholder={String(exercise.target_sets ?? "")}
                    type="number"
                    value={log.actualSets}
                  />
                </label>
              </div>
              <input
                className={`${inputClassName} mt-2`}
                disabled={disabled}
                onChange={(e) => updateLog(exercise.id, { note: e.target.value })}
                placeholder={t.training.exerciseNotePlaceholder}
                value={log.note}
              />
            </li>
          );
        })}
      </ul>

      <Dialog
        onOpenChange={(open) => !open && setInfoExerciseId(null)}
        open={Boolean(infoExercise)}
        title={infoExercise?.exercise_name}
      >
        {infoExercise ? (
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              {infoExercise.exercise_description?.trim() || t.training.noDescription}
            </p>
            {infoExercise.coaching_tip ? (
              <p className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-amber-100/90">
                {infoExercise.coaching_tip}
              </p>
            ) : null}
            <p className="text-xs text-zinc-500">
              {t.training.plan}: {infoExercise.target_sets ?? "—"}×
              {infoExercise.target_reps ?? "—"}
              {infoExercise.target_weight_kg != null
                ? ` · ${infoExercise.target_weight_kg} ${t.common.kg}`
                : ""}
            </p>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
