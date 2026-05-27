import type { Locale } from "@gymek/shared";
import { openaiJsonCompletion } from "../lib/openai.js";
import { supabaseAdmin } from "../supabase.js";

const tonePrompts: Record<string, Record<Locale, string>> = {
  goblin: {
    ru: "Ты Gymek — саркастичный gym goblin коуч. Маты умеренно, юмор, без токсичной мотивации.",
    uk: "Ти Gymek — саркастичний gym goblin коуч. Матюки помірно, гумор.",
    en: "You are Gymek — sarcastic gym goblin coach. Mild profanity, humor, no cringe motivation.",
    pl: "Jesteś Gymek — sarkastyczny gym goblin coach. Lekki humor, bez cringe.",
  },
  bro: {
    ru: "Ты Gymek — gym bro, дружелюбно и по делу.",
    uk: "Ти Gymek — gym bro, дружелюбно.",
    en: "You are Gymek — friendly gym bro coach.",
    pl: "Jesteś Gymek — gym bro coach.",
  },
  chill: {
    ru: "Ты Gymek — спокойный коуч без мата.",
    uk: "Ти Gymek — спокійний коуч.",
    en: "You are Gymek — calm supportive coach.",
    pl: "Jesteś Gymek — spokojny coach.",
  },
  science: {
    ru: "Ты Gymek — коуч с упором на факты и прогрессию нагрузки.",
    uk: "Ти Gymek — науковий коуч.",
    en: "You are Gymek — evidence-based coach.",
    pl: "Jesteś Gymek — coach oparty na faktach.",
  },
};

export type PlannedExercise = {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
};

export type WorkoutPlanDraft = {
  focus: string;
  ai_note: string;
  exercises: PlannedExercise[];
};

export async function buildUserContext(userId: string) {
  const [profileRes, plansRes, sessionsRes, metricsRes, nutritionRes, checkinRes] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      supabaseAdmin
        .from("workout_plans")
        .select("plan_date, focus, status")
        .eq("user_id", userId)
        .order("plan_date", { ascending: false })
        .limit(14),
      supabaseAdmin
        .from("workout_sessions")
        .select("session_date, status, note")
        .eq("user_id", userId)
        .order("session_date", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("body_metrics")
        .select("metric_date, weight_kg")
        .eq("user_id", userId)
        .order("metric_date", { ascending: false })
        .limit(7),
      supabaseAdmin
        .from("nutrition_logs")
        .select("log_date, meal_label, calories_kcal, protein_g")
        .eq("user_id", userId)
        .order("log_date", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("daily_checkins")
        .select("checkin_date, sleep_hours, stress_score, soreness")
        .eq("user_id", userId)
        .order("checkin_date", { ascending: false })
        .limit(5),
    ]);

  return {
    profile: profileRes.data,
    recentPlans: plansRes.data ?? [],
    recentSessions: sessionsRes.data ?? [],
    recentMetrics: metricsRes.data ?? [],
    recentNutrition: nutritionRes.data ?? [],
    recentCheckins: checkinRes.data ?? [],
  };
}

export async function generateWorkoutPlan(params: {
  userId: string;
  planDate: string;
  mode?: "normal" | "compressed" | "ultra_compressed";
  reason?: string;
}): Promise<WorkoutPlanDraft> {
  const ctx = await buildUserContext(params.userId);
  const profile = ctx.profile;
  const locale = (profile?.locale ?? "ru") as Locale;
  const tone = (profile?.ai_tone ?? "goblin") as keyof typeof tonePrompts;
  const toneSystem = tonePrompts[tone]?.[locale] ?? tonePrompts.goblin.ru;

  const minutes =
    params.mode === "ultra_compressed"
      ? 20
      : params.mode === "compressed"
        ? 35
        : profile?.preferred_workout_minutes ?? 60;

  const result = await openaiJsonCompletion<WorkoutPlanDraft>([
    {
      role: "system",
      content: `${toneSystem} Отвечай JSON: {"focus":"","ai_note":"","exercises":[{"name":"","muscle":"","sets":3,"reps":"8-12"}]}. Учитывай травмы и recovery. ${minutes} минут max.`,
    },
    {
      role: "user",
      content: JSON.stringify({
        planDate: params.planDate,
        mode: params.mode ?? "normal",
        reason: params.reason,
        profile: {
          goal: profile?.training_goal,
          level: profile?.training_level,
          minutes,
          mode: profile?.default_workout_mode,
          injuries: profile?.injuries,
          equipment: profile?.equipment,
        },
        history: {
          plans: ctx.recentPlans,
          sessions: ctx.recentSessions,
          checkins: ctx.recentCheckins,
        },
      }),
    },
  ]);

  if (!result.exercises?.length) {
    throw new Error("AI returned empty workout");
  }

  return result;
}

export async function estimateNutritionFromText(params: {
  userId: string;
  description: string;
}) {
  const ctx = await buildUserContext(params.userId);
  const profile = ctx.profile;
  const locale = (profile?.locale ?? "ru") as Locale;
  const tone = (profile?.ai_tone ?? "goblin") as keyof typeof tonePrompts;
  const toneSystem = tonePrompts[tone]?.[locale] ?? tonePrompts.goblin.ru;

  return openaiJsonCompletion<{
    meal_label: string;
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    ai_note: string;
  }>([
    {
      role: "system",
      content: `${toneSystem} Оцени еду. JSON: {"meal_label":"","calories_kcal":0,"protein_g":0,"carbs_g":0,"fats_g":0,"ai_note":""}`,
    },
    {
      role: "user",
      content: params.description,
    },
  ]);
}

export async function generateDailySummary(userId: string, summaryDate: string) {
  const ctx = await buildUserContext(userId);
  const profile = ctx.profile;
  const locale = (profile?.locale ?? "ru") as Locale;
  const tone = (profile?.ai_tone ?? "goblin") as keyof typeof tonePrompts;
  const toneSystem = tonePrompts[tone]?.[locale] ?? tonePrompts.goblin.ru;

  const dayPlans = ctx.recentPlans.filter((p) => p.plan_date === summaryDate);
  const dayNutrition = ctx.recentNutrition.filter((n) => n.log_date === summaryDate);

  const result = await openaiJsonCompletion<{ summary_text: string; facts: string[] }>([
    {
      role: "system",
      content: `${toneSystem} Сделай вечерний summary дня. JSON: {"summary_text":"","facts":["..."]}`,
    },
    {
      role: "user",
      content: JSON.stringify({
        date: summaryDate,
        plans: dayPlans,
        nutrition: dayNutrition,
        metrics: ctx.recentMetrics[0],
        checkin: ctx.recentCheckins[0],
      }),
    },
  ]);

  await supabaseAdmin.from("ai_summaries_daily").upsert(
    {
      user_id: userId,
      summary_date: summaryDate,
      summary_text: result.summary_text,
      payload: { facts: result.facts },
    },
    { onConflict: "user_id,summary_date" },
  );

  for (const fact of result.facts.slice(0, 5)) {
    await supabaseAdmin.from("ai_memory_facts").insert({
      user_id: userId,
      fact_type: "daily_insight",
      fact_text: fact,
      relevance_score: 0.7,
      source_date: summaryDate,
    });
  }

  return result;
}
