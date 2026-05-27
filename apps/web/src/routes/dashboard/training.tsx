import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Dumbbell, SkipForward, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  buildExerciseLogDrafts,
  ExerciseSessionList,
  type ExerciseLogDraft,
} from "@/components/training/exercise-session-list";
import { SkipWorkoutDialog } from "@/components/training/skip-workout-dialog";
import { WeekCalendar } from "@/components/training/week-calendar";
import { WorkoutDayHistory } from "@/components/training/workout-day-history";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { useCalendarPlans } from "@/features/training/use-calendar-plans";
import {
  toSessionExerciseLogs,
  useWorkoutActions,
} from "@/features/training/use-today-workout";
import { todayDateString, useWorkoutDay } from "@/features/training/use-workout-day";

export const Route = createFileRoute("/dashboard/training")({
  component: TrainingPage,
});

function TrainingPage() {
  const t = useMessages();
  const toast = useAppToast();
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const { data: dayData, isLoading } = useWorkoutDay(selectedDate);
  const { data: calendar } = useCalendarPlans();
  const { seedMutation, sessionMutation } = useWorkoutActions();
  const [nextPlanNote, setNextPlanNote] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogDraft[]>([]);
  const [skipOpen, setSkipOpen] = useState(false);

  const plan = dayData?.plan ?? null;
  const isToday = selectedDate === todayDateString();
  const exercises = plan?.workout_exercises ?? [];
  const isInteractive = isToday && plan?.status === "planned";

  useEffect(() => {
    if (selectedDate > todayDateString()) {
      setSelectedDate(todayDateString());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (plan?.workout_exercises?.length && isInteractive) {
      setExerciseLogs(buildExerciseLogDrafts(plan.workout_exercises));
    }
  }, [plan?.id, plan?.workout_exercises, isInteractive]);

  const sessionAction =
    sessionMutation.isPending && sessionMutation.variables
      ? sessionMutation.variables.status
      : null;

  const isPast = selectedDate < todayDateString();

  const selectedLabel = isToday
    ? t.training.todayPlan
    : isPast
      ? t.training.historyOnDate.replace("{{date}}", selectedDate.slice(5))
      : t.training.planOnDate.replace("{{date}}", selectedDate.slice(5));

  const submitComplete = () => {
    if (!plan) {
      return;
    }
    const payloadLogs = toSessionExerciseLogs(exerciseLogs);
    const completedCount = payloadLogs.filter((log) => log.completed).length;
    const status =
      completedCount === 0
        ? "partial"
        : completedCount < payloadLogs.length
          ? "partial"
          : "completed";

    sessionMutation.mutate(
      {
        workoutPlanId: plan.id,
        status,
        exerciseLogs: payloadLogs,
      },
      {
        onSuccess: (data) => {
          toast.success(t.toast.workoutCompleted);
          const next = (data as { nextPlan?: { focus?: string } }).nextPlan;
          setNextPlanNote(
            next?.focus
              ? `${t.training.nextPlanReady}: ${next.focus}`
              : t.training.nextPlanReady,
          );
        },
        onError: (error) => toast.error(error),
      },
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="gymek-page-title">
        <Dumbbell className="h-6 w-6 text-orange-500 dark:text-orange-400" />
        {t.training.title}
      </h1>

      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 gymek-section-title">
          <CalendarDays className="h-3.5 w-3.5" />
          {t.training.calendar}
        </h2>
        <WeekCalendar
          legend={{
            completed: t.training.legendCompleted,
            skipped: t.training.legendSkipped,
            planned: t.training.legendPlanned,
            empty: t.training.legendEmpty,
          }}
          onSelectDate={setSelectedDate}
          plans={calendar?.plans ?? []}
          selectedDate={selectedDate}
        />
      </section>

      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{selectedLabel}</h2>

      {isLoading ? <p className="gymek-muted">{t.training.loading}</p> : null}

      {!isLoading && !plan && isToday ? (
        <Button
          icon={Wand2}
          loading={seedMutation.isPending}
          loadingLabel={t.common.loading}
          onClick={() =>
            seedMutation.mutate(undefined, {
              onSuccess: () => toast.success(t.toast.planGenerated),
              onError: (error) => toast.error(error),
            })
          }
          variant="gradientOrange"
        >
          {t.training.seedPlan}
        </Button>
      ) : null}

      {!isLoading && !plan && !isToday ? (
        <p className="gymek-muted">{t.training.noPlanOnDay}</p>
      ) : null}

      {!isLoading && plan && !isInteractive ? (
        <WorkoutDayHistory
          aiNote={plan.ai_note}
          exerciseLogs={dayData?.exerciseLogs ?? []}
          exercises={exercises}
          focus={plan.focus}
          planStatus={plan.status}
          session={dayData?.session ?? null}
        />
      ) : null}

      {!isLoading && plan && isInteractive ? (
        <div className="space-y-4">
          <div className="gymek-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{plan.focus}</h2>
              <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {t.training.statusPlanned}
              </span>
            </div>
            {plan.ai_note ? (
              <p className="mt-3 flex gap-2 gymek-muted">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {t.training.goblinHint}:
                  </span>{" "}
                  {plan.ai_note}
                </span>
              </p>
            ) : null}
          </div>

          <ExerciseSessionList
            disabled={sessionMutation.isPending}
            exercises={exercises}
            logs={exerciseLogs}
            onChange={setExerciseLogs}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              icon={CheckCircle2}
              loading={sessionAction === "completed" || sessionAction === "partial"}
              loadingLabel={t.common.saving}
              disabled={
                sessionMutation.isPending &&
                sessionAction !== "completed" &&
                sessionAction !== "partial"
              }
              onClick={submitComplete}
              variant="gradientEmerald"
            >
              {t.training.complete}
            </Button>
            <Button
              icon={SkipForward}
              disabled={sessionMutation.isPending}
              onClick={() => setSkipOpen(true)}
              variant="outline"
            >
              {t.training.skip}
            </Button>
          </div>

          <SkipWorkoutDialog
            loading={sessionMutation.isPending && sessionAction === "skipped"}
            onConfirm={({ skipReasonCode, note }) => {
              sessionMutation.mutate(
                {
                  workoutPlanId: plan.id,
                  status: "skipped",
                  skipReasonCode,
                  note,
                },
                {
                  onSuccess: (data) => {
                    setSkipOpen(false);
                    toast.success(t.toast.workoutSkipped);
                    const next = (data as { nextPlan?: { focus?: string } }).nextPlan;
                    setNextPlanNote(
                      next?.focus
                        ? `${t.training.nextPlanReady}: ${next.focus}`
                        : t.training.nextPlanReady,
                    );
                  },
                  onError: (error) => toast.error(error),
                },
              );
            }}
            onOpenChange={setSkipOpen}
            open={skipOpen}
          />

          {nextPlanNote ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{nextPlanNote}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
