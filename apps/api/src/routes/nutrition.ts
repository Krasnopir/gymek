import { Router } from "express";
import { z } from "zod";
import { estimateNutritionFromText } from "../services/ai-coach.js";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

export const nutritionRouter = Router();

nutritionRouter.get("/today/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const logDate = z.string().date().parse(req.query.date ?? today());

    const { data, error } = await supabaseAdmin
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", logDate)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const totals = (data ?? []).reduce(
      (acc, row) => ({
        calories: acc.calories + (row.calories_kcal ?? 0),
        protein: acc.protein + Number(row.protein_g ?? 0),
        carbs: acc.carbs + Number(row.carbs_g ?? 0),
        fats: acc.fats + Number(row.fats_g ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    res.json({ logs: data ?? [], totals, logDate });
  } catch (error) {
    next(error);
  }
});

nutritionRouter.post("/estimate", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        description: z.string().min(3).max(1000),
      })
      .parse(req.body);

    const estimate = await estimateNutritionFromText({
      userId: payload.userId,
      description: payload.description,
    });

    res.json({ estimate });
  } catch (error) {
    next(error);
  }
});

nutritionRouter.post("/logs", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        logDate: z.string().date().optional(),
        mealLabel: z.string().min(1).max(200),
        caloriesKcal: z.number().int().nonnegative(),
        proteinG: z.number().nonnegative(),
        carbsG: z.number().nonnegative().optional(),
        fatsG: z.number().nonnegative().optional(),
        note: z.string().max(500).optional(),
        source: z.enum(["manual", "ai"]).default("manual"),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("nutrition_logs")
      .insert({
        user_id: payload.userId,
        log_date: payload.logDate ?? today(),
        meal_label: payload.mealLabel,
        calories_kcal: payload.caloriesKcal,
        protein_g: payload.proteinG,
        carbs_g: payload.carbsG ?? 0,
        fats_g: payload.fatsG ?? 0,
        note: payload.note,
        source: payload.source,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ log: data });
  } catch (error) {
    next(error);
  }
});

nutritionRouter.delete("/logs/:logId", async (req, res, next) => {
  try {
    const logId = z.string().uuid().parse(req.params.logId);
    const userId = z.string().uuid().parse(req.query.userId);

    const { error } = await supabaseAdmin
      .from("nutrition_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
