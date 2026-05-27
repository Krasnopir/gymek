import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { useProgressActions, useProgressMetrics } from "@/features/progress/use-progress";

export const Route = createFileRoute("/dashboard/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const t = useMessages();
  const toast = useAppToast();
  const { data, isLoading } = useProgressMetrics();
  const { saveWeightMutation, uploadPhotoMutation } = useProgressActions();
  const [weight, setWeight] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const metrics = data?.metrics ?? [];
  const maxWeight = Math.max(...metrics.map((m) => m.weight_kg), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.progress.title}</h1>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <label className="text-sm text-zinc-400" htmlFor="weight">
          {t.progress.weightToday}
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            id="weight"
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
            type="number"
            value={weight}
          />
          <button
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            disabled={saveWeightMutation.isPending || !weight}
            onClick={() =>
              saveWeightMutation.mutate(Number(weight), {
                onSuccess: () => toast.success(t.toast.weightSaved),
                onError: (error) => toast.error(error),
              })
            }
            type="button"
          >
            {t.progress.saveWeight}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.progress.history}</h2>
        {isLoading ? <p className="mt-2 text-sm text-zinc-500">{t.common.loading}</p> : null}
        {!isLoading && metrics.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t.progress.noMetrics}</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-1">
            {metrics.slice(-14).map((metric) => (
              <div key={metric.metric_date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-white/80"
                  style={{ height: `${(metric.weight_kg / maxWeight) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-zinc-500">{metric.metric_date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.progress.photo}</h2>
        <input
          ref={fileRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadPhotoMutation.mutate(file, {
                onSuccess: () => toast.success(t.toast.photoUploaded),
                onError: (error) => toast.error(error),
              });
            }
          }}
          type="file"
        />
        <button
          className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm"
          disabled={uploadPhotoMutation.isPending}
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          {t.progress.uploadPhoto}
        </button>
      </section>
    </div>
  );
}
