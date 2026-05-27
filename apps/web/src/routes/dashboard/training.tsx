import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WeekCalendar } from "@/components/training/week-calendar";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { useCalendarPlans } from "@/features/training/use-calendar-plans";
import { useTodayWorkout, useWorkoutActions } from "@/features/training/use-today-workout";

export const Route = createFileRoute("/dashboard/training")({
  component: TrainingPage,
});

function TrainingPage() {
  const t = useMessages();
  const toast = useAppToast();
  const { data: plan, isLoading } = useTodayWorkout();
  const { data: calendar } = useCalendarPlans();
  const { seedMutation, sessionMutation } = useWorkoutActions();
  const [nextPlanNote, setNextPlanNote] = useState<string | null>(null);

  const statusLabel =
    plan?.status === "completed"
      ? t.training.statusCompleted
      : plan?.status === "skipped"
        ? t.training.statusSkipped
        : t.training.statusPlanned;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.training.title}</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400">{t.training.calendar}</h2>
        <WeekCalendar plans={calendar?.plans ?? []} />
      </section>

      {isLoading ? <p className="text-sm text-zinc-500">{t.training.loading}</p> : null}

      {!isLoading && !plan ? (
        <button
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          disabled={seedMutation.isPending}
          onClick={() =>
            seedMutation.mutate(undefined, {
              onSuccess: () => toast.success(t.toast.planGenerated),
              onError: (error) => toast.error(error),
            })
          }
          type="button"
        >
          {t.training.seedPlan}
        </button>
      ) : null}

      {plan ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{plan.focus}</h2>
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                {statusLabel}
              </span>
            </div>
            {plan.ai_note ? (
              <p className="mt-3 text-sm text-zinc-400">
                <span className="font-medium text-zinc-200">{t.training.goblinHint}:</span>{" "}
                {plan.ai_note}
              </p>
            ) : null}
          </div>

          <ul className="space-y-2">
            {plan.workout_exercises
              ?.slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm"
                >
                  <span>{exercise.exercise_name}</span>
                  <span className="text-zinc-500">
                    {exercise.target_sets}×{exercise.target_reps}
                  </span>
                </li>
              ))}
          </ul>

          {plan.status === "planned" ? (
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                disabled={sessionMutation.isPending}
                onClick={() =>
                  sessionMutation.mutate(
                    { workoutPlanId: plan.id, status: "completed" },
                    {
                      onSuccess: (data) => {
                        toast.success(t.toast.workoutCompleted);
                        const next = (data as { nextPlan?: { focus?: string } }).nextPlan;
                        setNextPlanNote(next?.focus ? `${t.training.nextPlanReady}: ${next.focus}` : t.training.nextPlanReady);
                      },
                      onError: (error) => toast.error(error),
                    },
                  )
                }
                type="button"
              >
                {t.training.complete}
              </button>
              <button
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-60"
                disabled={sessionMutation.isPending}
                onClick={() =>
                  sessionMutation.mutate(
                    { workoutPlanId: plan.id, status: "skipped" },
                    {
                      onSuccess: (data) => {
                        toast.success(t.toast.workoutSkipped);
                        const next = (data as { nextPlan?: { focus?: string } }).nextPlan;
                        setNextPlanNote(next?.focus ? `${t.training.nextPlanReady}: ${next.focus}` : t.training.nextPlanReady);
                      },
                      onError: (error) => toast.error(error),
                    },
                  )
                }
                type="button"
              >
                {t.training.skip}
              </button>
            </div>
          ) : null}

          {nextPlanNote ? <p className="text-sm text-emerald-400">{nextPlanNote}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
