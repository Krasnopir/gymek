import { createFileRoute } from "@tanstack/react-router";
import { Flame, Save, Sparkles, Trash2, UtensilsCrossed, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { textareaClassName } from "@/components/ui/field";
import { useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { useNutritionActions, useNutritionToday } from "@/features/nutrition/use-nutrition";

export const Route = createFileRoute("/dashboard/nutrition")({
  component: NutritionPage,
});

function NutritionPage() {
  const t = useMessages();
  const toast = useAppToast();
  const { data, isLoading } = useNutritionToday();
  const { estimateMutation, saveMutation, deleteMutation } = useNutritionActions();
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState<{
    meal_label: string;
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    ai_note?: string;
  } | null>(null);

  const deletingId =
    deleteMutation.isPending && typeof deleteMutation.variables === "string"
      ? deleteMutation.variables
      : null;

  return (
    <div className="space-y-6">
      <h1 className="gymek-page-title">
        <UtensilsCrossed className="h-6 w-6 text-lime-600 dark:text-lime-400" />
        {t.nutrition.title}
      </h1>

      <section className="gymek-card-lime space-y-3">
        <textarea
          className={textareaClassName}
          disabled={estimateMutation.isPending}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.nutrition.describeMeal}
          rows={3}
          value={description}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            className="min-w-[9.5rem]"
            disabled={description.length < 3}
            icon={Wand2}
            loading={estimateMutation.isPending}
            loadingLabel={t.nutrition.estimating}
            onClick={() =>
              estimateMutation.mutate(description, {
                onSuccess: (res) => setDraft(res.estimate),
                onError: (error) => toast.error(error),
              })
            }
            variant="softLime"
          >
            {t.nutrition.estimate}
          </Button>
          {draft ? (
            <Button
              icon={Save}
              loading={saveMutation.isPending}
              loadingLabel={t.common.saving}
              onClick={() =>
                saveMutation.mutate(
                  {
                    mealLabel: draft.meal_label,
                    caloriesKcal: draft.calories_kcal,
                    proteinG: draft.protein_g,
                    carbsG: draft.carbs_g,
                    fatsG: draft.fats_g,
                    source: "ai",
                  },
                  {
                    onSuccess: () => {
                      setDraft(null);
                      setDescription("");
                      toast.success(t.toast.mealSaved);
                    },
                    onError: (error) => toast.error(error),
                  },
                )
              }
              variant="gradientLime"
            >
              {t.nutrition.saveMeal}
            </Button>
          ) : null}
        </div>
        {draft ? (
          <div className="gymek-subcard text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{draft.meal_label}</p>
            <p className="mt-1 gymek-muted">
              {draft.calories_kcal} {t.nutrition.calories} · {draft.protein_g}g {t.nutrition.protein}
            </p>
            {draft.ai_note ? (
              <p className="mt-2 flex gap-1.5 text-zinc-600 dark:text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                {draft.ai_note}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="gymek-card">
        <h2 className="flex items-center gap-1.5 gymek-section-title">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          {t.nutrition.totals}
        </h2>
        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {Math.round(data?.totals.calories ?? 0)} {t.nutrition.calories} ·{" "}
          {Math.round(data?.totals.protein ?? 0)}g {t.nutrition.protein}
        </p>
      </section>

      <section className="space-y-2">
        {isLoading ? <p className="gymek-muted">{t.common.loading}</p> : null}
        {!isLoading && !data?.logs.length ? (
          <p className="gymek-muted">{t.nutrition.empty}</p>
        ) : null}
        {data?.logs.map((log) => (
          <div key={log.id} className="gymek-list-row flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{log.meal_label}</p>
              <p className="text-zinc-500 dark:text-zinc-500">
                {log.calories_kcal} {t.nutrition.calories} · {log.protein_g}g
              </p>
            </div>
            <Button
              icon={Trash2}
              loading={deletingId === log.id}
              loadingLabel={t.common.loading}
              onClick={() =>
                deleteMutation.mutate(log.id, {
                  onSuccess: () => toast.success(t.toast.mealDeleted),
                  onError: (error) => toast.error(error),
                })
              }
              size="sm"
              variant="danger"
            >
              {t.nutrition.delete}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
