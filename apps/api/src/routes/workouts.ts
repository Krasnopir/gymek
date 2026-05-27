import { Router } from "express";
import { z } from "zod";
import { generateWorkoutPlan } from "../services/ai-coach.js";
import { addDays, persistWorkoutPlan } from "../services/workout-repository.js";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

const fallbackPlan = {
  focus: "Верх: спина + грудь",
  ai_note: "Шаблонный план. AI недоступен — но ноги всё равно не скипай завтра.",
  exercises: [
    { name: "Тяга верхнего блока", muscle: "back", sets: 4, reps: "10-12" },
    { name: "Жим в тренажёре", muscle: "chest", sets: 3, reps: "8-10" },
    { name: "Разведения", muscle: "chest", sets: 3, reps: "12-15" },
    { name: "Пресс", muscle: "core", sets: 3, reps: "15-20" },
  ],
};

export const workoutsRouter = Router();

workoutsRouter.get("/calendar/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const from = z.string().date().parse(req.query.from ?? addDays(today(), -7));
    const to = z.string().date().parse(req.query.to ?? addDays(today(), 7));

    const { data, error } = await supabaseAdmin
      .from("workout_plans")
      .select("id, plan_date, focus, status")
      .eq("user_id", userId)
      .gte("plan_date", from)
      .lte("plan_date", to)
      .order("plan_date", { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ plans: data ?? [] });
  } catch (error) {
    next(error);
  }
});

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
        mode: z.enum(["normal", "compressed", "ultra_compressed"]).optional(),
      })
      .parse(req.body);

    const planDate = today();

    const { data: existing } = await supabaseAdmin
      .from("workout_plans")
      .select("*, workout_exercises(*)")
      .eq("user_id", payload.userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (existing) {
      return res.json({ plan: existing });
    }

    let draft = fallbackPlan;
    try {
      draft = await generateWorkoutPlan({
        userId: payload.userId,
        planDate,
        mode: payload.mode,
      });
    } catch (aiError) {
      console.warn("AI plan fallback:", aiError);
    }

    const plan = await persistWorkoutPlan({
      userId: payload.userId,
      planDate,
      draft,
    });

    res.json({ plan });
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

    let nextPlan = null;
    try {
      const nextDate = addDays(sessionDate, 1);
      const draft = await generateWorkoutPlan({
        userId: payload.userId,
        planDate: nextDate,
        reason:
          payload.status === "skipped"
            ? "User skipped workout — adapt tomorrow lighter"
            : "User completed workout — progressive next session",
      });
      nextPlan = await persistWorkoutPlan({
        userId: payload.userId,
        planDate: nextDate,
        draft,
      });
    } catch (aiError) {
      console.warn("Next plan generation failed:", aiError);
    }

    res.json({ session, nextPlan });
  } catch (error) {
    next(error);
  }
});
