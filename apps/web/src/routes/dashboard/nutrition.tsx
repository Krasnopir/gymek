import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMessages } from "@/features/i18n/use-messages";
import { useNutritionActions, useNutritionToday } from "@/features/nutrition/use-nutrition";

export const Route = createFileRoute("/dashboard/nutrition")({
  component: NutritionPage,
});

function NutritionPage() {
  const t = useMessages();
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.nutrition.title}</h1>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <textarea
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.nutrition.describeMeal}
          rows={3}
          value={description}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
            disabled={estimateMutation.isPending || description.length < 3}
            onClick={() =>
              estimateMutation.mutate(description, {
                onSuccess: (res) => setDraft(res.estimate),
              })
            }
            type="button"
          >
            {t.nutrition.estimate}
          </button>
          {draft ? (
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              disabled={saveMutation.isPending}
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
                  { onSuccess: () => { setDraft(null); setDescription(""); } },
                )
              }
              type="button"
            >
              {t.nutrition.saveMeal}
            </button>
          ) : null}
        </div>
        {draft ? (
          <div className="rounded-lg border border-zinc-700 p-3 text-sm">
            <p className="font-medium">{draft.meal_label}</p>
            <p className="text-zinc-400 mt-1">
              {draft.calories_kcal} {t.nutrition.calories} · {draft.protein_g}g {t.nutrition.protein}
            </p>
            {draft.ai_note ? <p className="mt-2 text-zinc-500">{draft.ai_note}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">{t.nutrition.totals}</h2>
        <p className="mt-2 text-lg font-semibold">
          {Math.round(data?.totals.calories ?? 0)} {t.nutrition.calories} ·{" "}
          {Math.round(data?.totals.protein ?? 0)}g {t.nutrition.protein}
        </p>
      </section>

      <section className="space-y-2">
        {isLoading ? <p className="text-sm text-zinc-500">{t.common.loading}</p> : null}
        {!isLoading && !data?.logs.length ? (
          <p className="text-sm text-zinc-500">{t.nutrition.empty}</p>
        ) : null}
        {data?.logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{log.meal_label}</p>
              <p className="text-zinc-500">
                {log.calories_kcal} {t.nutrition.calories} · {log.protein_g}g
              </p>
            </div>
            <button
              className="text-xs text-red-400"
              onClick={() => deleteMutation.mutate(log.id)}
              type="button"
            >
              {t.nutrition.delete}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
