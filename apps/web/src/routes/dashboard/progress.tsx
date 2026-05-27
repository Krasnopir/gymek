import { createFileRoute } from "@tanstack/react-router";
import { Camera, LineChart, Scale, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";
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
      <h1 className="gymek-page-title">
        <LineChart className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
        {t.progress.title}
      </h1>

      <section className="gymek-card space-y-3">
        <label
          className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400"
          htmlFor="weight"
        >
          <Scale className="h-4 w-4" />
          {t.progress.weightToday}
        </label>
        <div className="flex gap-2">
          <input
            className={inputClassName}
            disabled={saveWeightMutation.isPending}
            id="weight"
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
            type="number"
            value={weight}
          />
          <Button
            disabled={!weight}
            loading={saveWeightMutation.isPending}
            loadingLabel={t.common.saving}
            onClick={() =>
              saveWeightMutation.mutate(Number(weight), {
                onSuccess: () => toast.success(t.toast.weightSaved),
                onError: (error) => toast.error(error),
              })
            }
            variant="gradientCyan"
          >
            {t.progress.saveWeight}
          </Button>
        </div>
      </section>

      <section className="gymek-card">
        <h2 className="flex items-center gap-1.5 gymek-section-title">
          <TrendingUp className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          {t.progress.history}
        </h2>
        {isLoading ? <p className="mt-2 gymek-muted">{t.common.loading}</p> : null}
        {!isLoading && metrics.length === 0 ? (
          <p className="mt-2 gymek-muted">{t.progress.noMetrics}</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-1">
            {metrics.slice(-14).map((metric) => (
              <div key={metric.metric_date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-cyan-300 dark:from-cyan-600 dark:to-cyan-300"
                  style={{ height: `${(metric.weight_kg / maxWeight) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-zinc-500">{metric.metric_date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="gymek-card">
        <h2 className="flex items-center gap-1.5 gymek-section-title">
          <Camera className="h-3.5 w-3.5" />
          {t.progress.photo}
        </h2>
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
        <Button
          className="mt-3"
          icon={Camera}
          loading={uploadPhotoMutation.isPending}
          loadingLabel={t.common.loading}
          onClick={() => fileRef.current?.click()}
          variant="softCyan"
        >
          {t.progress.uploadPhoto}
        </Button>
      </section>
    </div>
  );
}
