import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

export const dashboardRouter = Router();

dashboardRouter.get("/summary/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const date = today();

    const [profile, plan, nutrition, metric, checkin, summary] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      supabaseAdmin
        .from("workout_plans")
        .select("*, workout_exercises(*)")
        .eq("user_id", userId)
        .eq("plan_date", date)
        .maybeSingle(),
      supabaseAdmin.from("nutrition_logs").select("*").eq("user_id", userId).eq("log_date", date),
      supabaseAdmin
        .from("body_metrics")
        .select("*")
        .eq("user_id", userId)
        .eq("metric_date", date)
        .maybeSingle(),
      supabaseAdmin
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .eq("checkin_date", date)
        .maybeSingle(),
      supabaseAdmin
        .from("ai_summaries_daily")
        .select("*")
        .eq("user_id", userId)
        .eq("summary_date", date)
        .maybeSingle(),
    ]);

    const nutritionRows = nutrition.data ?? [];
    const nutritionTotals = nutritionRows.reduce(
      (acc, row) => ({
        calories: acc.calories + (row.calories_kcal ?? 0),
        protein: acc.protein + Number(row.protein_g ?? 0),
      }),
      { calories: 0, protein: 0 },
    );

    res.json({
      profile: profile.data,
      todayPlan: plan.data,
      nutritionTotals,
      todayMetric: metric.data,
      todayCheckin: checkin.data,
      todaySummary: summary.data,
    });
  } catch (error) {
    next(error);
  }
});
