import { Link, createFileRoute } from "@tanstack/react-router";
import { useMessages } from "@/features/i18n/use-messages";
import { useTodayWorkout } from "@/features/training/use-today-workout";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const t = useMessages();
  const { data: plan, isLoading } = useTodayWorkout();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.dashboard.today}</h2>
        {isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">{t.training.loading}</p>
        ) : plan ? (
          <div className="mt-2 space-y-2">
            <p className="text-lg font-semibold">{plan.focus}</p>
            <p className="text-sm text-zinc-400">{plan.ai_note}</p>
            <Link
              className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              to="/dashboard/training"
            >
              {t.dashboard.openTraining}
            </Link>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-zinc-400">{t.dashboard.noWorkout}</p>
            <Link
              className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              to="/dashboard/training"
            >
              {t.dashboard.openTraining}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
