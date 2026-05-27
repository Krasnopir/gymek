import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

const seedExercises = [
  { sort_order: 1, exercise_name: "Тяга верхнего блока", target_muscle: "back", target_sets: 4, target_reps: "10-12" },
  { sort_order: 2, exercise_name: "Жим в тренажёре", target_muscle: "chest", target_sets: 3, target_reps: "8-10" },
  { sort_order: 3, exercise_name: "Разведения", target_muscle: "chest", target_sets: 3, target_reps: "12-15" },
  { sort_order: 4, exercise_name: "Пресс", target_muscle: "core", target_sets: 3, target_reps: "15-20" },
];

export const workoutsRouter = Router();

workoutsRouter.get("/today/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const planDate = today();

    const { data: plan, error } = await supabaseAdmin
      .from("workout_plans")
      .select("*, workout_exercises(*)")
      .eq("user_id", userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

workoutsRouter.post("/seed-today", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        focus: z.string().default("Верх: спина + грудь"),
      })
      .parse(req.body);

    const planDate = today();

    const { data: existing } = await supabaseAdmin
      .from("workout_plans")
      .select("id")
      .eq("user_id", payload.userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (existing) {
      const { data: plan } = await supabaseAdmin
        .from("workout_plans")
        .select("*, workout_exercises(*)")
        .eq("id", existing.id)
        .single();
      return res.json({ plan });
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("workout_plans")
      .insert({
        user_id: payload.userId,
        plan_date: planDate,
        focus: payload.focus,
        status: "planned",
        ai_note: "Офисный гоблин mode: не геройствуй, но и не сливай день.",
      })
      .select("*")
      .single();

    if (planError) {
      throw planError;
    }

    const { error: exercisesError } = await supabaseAdmin.from("workout_exercises").insert(
      seedExercises.map((exercise) => ({
        ...exercise,
        workout_plan_id: plan.id,
      })),
    );

    if (exercisesError) {
      throw exercisesError;
    }

    const { data: fullPlan } = await supabaseAdmin
      .from("workout_plans")
      .select("*, workout_exercises(*)")
      .eq("id", plan.id)
      .single();

    res.json({ plan: fullPlan });
  } catch (error) {
    next(error);
  }
});

workoutsRouter.post("/session", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        workoutPlanId: z.string().uuid(),
        status: z.enum(["completed", "skipped", "partial"]),
        durationMinutes: z.number().int().positive().optional(),
        note: z.string().max(500).optional(),
      })
      .parse(req.body);

    const sessionDate = today();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("workout_sessions")
      .insert({
        user_id: payload.userId,
        workout_plan_id: payload.workoutPlanId,
        session_date: sessionDate,
        status: payload.status,
        duration_minutes: payload.durationMinutes,
        note: payload.note,
      })
      .select("*")
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const planStatus = payload.status === "skipped" ? "skipped" : "completed";

    await supabaseAdmin
      .from("workout_plans")
      .update({ status: planStatus })
      .eq("id", payload.workoutPlanId);

    res.json({ session });
  } catch (error) {
    next(error);
  }
});
