import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, Flame, Moon, Scale, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, linkButtonClass } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";
import {
  EmojiRange,
  moodEmoji,
  moodGradient,
  moodHint,
  stressEmoji,
  stressGradient,
  stressHint,
} from "@/components/ui/emoji-range";
import { StatCard } from "@/components/ui/stat-card";
import { useGenerateSummary, useDailySummary } from "@/features/ai/use-daily-summary";
import { useCheckinActions, useCheckinToday } from "@/features/checkins/use-checkin";
import { useDashboardSummary } from "@/features/dashboard/use-dashboard-summary";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const t = useMessages();
  const toast = useAppToast();
  const { data, isLoading } = useDashboardSummary();
  const { data: checkinData } = useCheckinToday();
  const checkinMutation = useCheckinActions();
  const { data: summaryData } = useDailySummary();
  const generateSummary = useGenerateSummary();

  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [sleepHours, setSleepHours] = useState(
    Number(checkinData?.checkin?.sleep_hours ?? 7),
  );

  const plan = data?.todayPlan as { focus?: string; status?: string; ai_note?: string } | null;
  const summaryText =
    summaryData?.summary?.summary_text ??
    (data?.todaySummary as { summary_text?: string } | null)?.summary_text;

  return (
    <div className="space-y-6">
      <h1 className="gymek-page-title">
        <Activity className="h-6 w-6 text-violet-500 dark:text-violet-400" />
        {t.nav.dashboard}
      </h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard accent="blue" icon={Scale} label={t.dashboard.weight} value={
            data?.todayMetric?.weight_kg
              ? `${data.todayMetric.weight_kg} ${t.common.kg}`
              : "—"
          } />
        <StatCard
          accent="orange"
          icon={Flame}
          label={t.dashboard.calories}
          value={`${Math.round(data?.nutritionTotals.calories ?? 0)} ${t.nutrition.calories}`}
        />
        <StatCard
          accent="emerald"
          icon={Activity}
          label={t.dashboard.protein}
          value={`${Math.round(data?.nutritionTotals.protein ?? 0)} g`}
        />
        <StatCard
          accent="indigo"
          icon={Moon}
          label={t.dashboard.sleep}
          value={
            data?.todayCheckin?.sleep_hours
              ? `${data.todayCheckin.sleep_hours} h`
              : "—"
          }
        />
      </div>

      <section className="gymek-card">
        <h2 className="gymek-section-title">{t.dashboard.today}</h2>
        {isLoading ? (
          <p className="mt-2 gymek-muted">{t.common.loading}</p>
        ) : plan ? (
          <div className="mt-2 space-y-2">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{plan.focus}</p>
            {plan.ai_note ? <p className="gymek-muted">{plan.ai_note}</p> : null}
            <Link className={linkButtonClass("primary")} to="/dashboard/training">
              {t.dashboard.openTraining}
            </Link>
          </div>
        ) : (
          <div className="mt-2">
            <p className="gymek-muted">{t.dashboard.noWorkout}</p>
            <Link className={`${linkButtonClass("primary")} mt-2`} to="/dashboard/training">
              {t.dashboard.openTraining}
            </Link>
          </div>
        )}
      </section>

      <section className="gymek-card-violet">
        <h2 className="gymek-section-title">{t.dashboard.checkinTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <EmojiRange
            emojiForValue={moodEmoji}
            gradientForValue={moodGradient}
            hintForValue={moodHint}
            label={t.dashboard.mood}
            onChange={setMood}
            value={mood}
          />
          <EmojiRange
            emojiForValue={stressEmoji}
            gradientForValue={stressGradient}
            hintForValue={stressHint}
            label={t.dashboard.stress}
            onChange={setStress}
            value={stress}
          />
          <label className="gymek-subcard flex flex-col justify-center text-xs text-zinc-600 dark:text-zinc-400">
            <span className="mb-2 flex items-center gap-1 font-medium">
              <Moon className="h-3.5 w-3.5" />
              {t.dashboard.sleepHours}
            </span>
            <input
              className={`${inputClassName} text-center`}
              disabled={checkinMutation.isPending}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              step={0.5}
              type="number"
              value={sleepHours}
            />
          </label>
        </div>
        <Button
          className="mt-3"
          loading={checkinMutation.isPending}
          loadingLabel={t.common.saving}
          onClick={() =>
            checkinMutation.mutate(
              { moodScore: mood, stressScore: stress, sleepHours },
              {
                onSuccess: () => toast.success(t.toast.checkinSaved),
                onError: (error) => toast.error(error),
              },
            )
          }
          variant="outline"
        >
          {t.dashboard.saveCheckin}
        </Button>
      </section>

      <section className="gymek-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 gymek-section-title">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {t.dashboard.gymekWord}
          </h2>
          <Button
            loading={generateSummary.isPending}
            loadingLabel={t.common.loading}
            onClick={() =>
              generateSummary.mutate(undefined, {
                onSuccess: () => toast.success(t.toast.summaryGenerated),
                onError: (error) => toast.error(error),
              })
            }
            size="sm"
            variant="softViolet"
          >
            {t.dashboard.generateSummary}
          </Button>
        </div>
        <p className="mt-2 gymek-body">
          {summaryText ?? "Пока тишина. Поживи день — вечером Gymek выдаст разбор."}
        </p>
      </section>
    </div>
  );
}
