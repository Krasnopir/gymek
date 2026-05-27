import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
      <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t.dashboard.weight}
          value={
            data?.todayMetric?.weight_kg
              ? `${data.todayMetric.weight_kg} ${t.common.kg}`
              : "—"
          }
        />
        <StatCard
          label={t.dashboard.calories}
          value={`${Math.round(data?.nutritionTotals.calories ?? 0)} ${t.nutrition.calories}`}
        />
        <StatCard
          label={t.dashboard.protein}
          value={`${Math.round(data?.nutritionTotals.protein ?? 0)} g`}
        />
        <StatCard
          label={t.dashboard.sleep}
          value={
            data?.todayCheckin?.sleep_hours
              ? `${data.todayCheckin.sleep_hours} h`
              : "—"
          }
        />
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.dashboard.today}</h2>
        {isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">{t.common.loading}</p>
        ) : plan ? (
          <div className="mt-2 space-y-2">
            <p className="text-lg font-semibold">{plan.focus}</p>
            {plan.ai_note ? <p className="text-sm text-zinc-400">{plan.ai_note}</p> : null}
            <Link
              className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              to="/dashboard/training"
            >
              {t.dashboard.openTraining}
            </Link>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-zinc-400">{t.dashboard.noWorkout}</p>
            <Link
              className="mt-2 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              to="/dashboard/training"
            >
              {t.dashboard.openTraining}
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.dashboard.checkinTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-zinc-400">
            {t.dashboard.mood}
            <input
              className="mt-1 w-full"
              max={10}
              min={1}
              onChange={(e) => setMood(Number(e.target.value))}
              type="range"
              value={mood}
            />
          </label>
          <label className="text-xs text-zinc-400">
            {t.dashboard.stress}
            <input
              className="mt-1 w-full"
              max={10}
              min={1}
              onChange={(e) => setStress(Number(e.target.value))}
              type="range"
              value={stress}
            />
          </label>
          <label className="text-xs text-zinc-400">
            {t.dashboard.sleepHours}
            <input
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1"
              onChange={(e) => setSleepHours(Number(e.target.value))}
              step={0.5}
              type="number"
              value={sleepHours}
            />
          </label>
        </div>
        <button
          className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm"
          disabled={checkinMutation.isPending}
          onClick={() =>
            checkinMutation.mutate(
              { moodScore: mood, stressScore: stress, sleepHours },
              {
                onSuccess: () => toast.success(t.toast.checkinSaved),
                onError: (error) => toast.error(error),
              },
            )
          }
          type="button"
        >
          {t.dashboard.saveCheckin}
        </button>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-400">{t.dashboard.gymekWord}</h2>
          <button
            className="rounded-lg border border-zinc-700 px-3 py-1 text-xs"
            disabled={generateSummary.isPending}
            onClick={() =>
              generateSummary.mutate(undefined, {
                onSuccess: () => toast.success(t.toast.summaryGenerated),
                onError: (error) => toast.error(error),
              })
            }
            type="button"
          >
            {t.dashboard.generateSummary}
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-300">
          {summaryText ?? "Пока тишина. Поживи день — вечером Gymek выдаст разбор."}
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
