import { Router } from "express";
import { z } from "zod";
import { generateWorkoutPlan, type WorkoutPlanDraft } from "../services/ai-coach.js";
import {
  buildAdaptationReason,
  persistExerciseLogs,
} from "../services/session-logs.js";
import { addDays, persistWorkoutPlan } from "../services/workout-repository.js";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

const fallbackPlan: WorkoutPlanDraft = {
  focus: "Верх: спина + грудь",
  ai_note: "Шаблонный план. AI недоступен — но ноги всё равно не скипай завтра.",
  exercises: [
    {
      name: "Тяга верхнего блока",
      muscle: "back",
      sets: 4,
      reps: "10-12",
      weight_kg: 45,
      description: "Тяга к груди сидя — спина, широчайшие. Лопатки сводить в конце.",
      coaching_tip: "Не раскачивайся корпусом.",
    },
    {
      name: "Жим в тренажёре",
      muscle: "chest",
      sets: 3,
      reps: "8-10",
      weight_kg: 35,
      description: "Жим от груди в тренажёре — грудные, передние дельты.",
      coaching_tip: "Лопатки прижаты, локти под 45°.",
    },
    {
      name: "Разведения",
      muscle: "chest",
      sets: 3,
      reps: "12-15",
      weight_kg: 10,
      description: "Разведение гантелей лёжа — растяжка груди.",
      coaching_tip: "Лёгкий вес, контроль внизу.",
    },
    {
      name: "Пресс",
      muscle: "core",
      sets: 3,
      reps: "15-20",
      weight_kg: null,
      description: "Скручивания или планка — кор.",
      coaching_tip: "Поясница прижата.",
    },
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

workoutsRouter.get("/day/:userId/:planDate", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const planDate = z.string().date().parse(req.params.planDate);

    const { data: plan, error: planError } = await supabaseAdmin
      .from("workout_plans")
      .select("*, workout_exercises(*)")
      .eq("user_id", userId)
      .eq("plan_date", planDate)
      .maybeSingle();

    if (planError) {
      throw planError;
    }

    if (!plan) {
      return res.json({ plan: null, session: null, exerciseLogs: [] });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("workout_sessions")
      .select("*")
      .eq("workout_plan_id", plan.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    let exerciseLogs: unknown[] = [];
    if (session) {
      const { data: logs, error: logsError } = await supabaseAdmin
        .from("workout_exercise_logs")
        .select("*")
        .eq("workout_session_id", session.id)
        .order("created_at", { ascending: true });

      if (logsError) {
        throw logsError;
      }
      exerciseLogs = logs ?? [];
    }

    res.json({ plan, session, exerciseLogs });
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

const exerciseLogSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  completed: z.boolean(),
  actualWeightKg: z.number().nonnegative().nullable().optional(),
  actualReps: z.string().max(40).optional(),
  actualSets: z.number().int().positive().optional(),
  note: z.string().max(300).optional(),
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
        skipReasonCode: z
          .enum(["tired", "injury", "time", "no_motivation", "soreness", "other"])
          .optional(),
        exerciseLogs: z.array(exerciseLogSchema).optional(),
      })
      .parse(req.body);

    const sessionDate = today();
    const exerciseLogs = payload.exerciseLogs ?? [];
    const completedCount = exerciseLogs.filter((log) => log.completed).length;
    const resolvedStatus =
      payload.status === "skipped"
        ? "skipped"
        : exerciseLogs.length > 0 && completedCount < exerciseLogs.length
          ? "partial"
          : payload.status;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("workout_sessions")
      .insert({
        user_id: payload.userId,
        workout_plan_id: payload.workoutPlanId,
        session_date: sessionDate,
        status: resolvedStatus,
        duration_minutes: payload.durationMinutes,
        note: payload.note,
        skip_reason_code: payload.skipReasonCode,
      })
      .select("*")
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (resolvedStatus !== "skipped" && exerciseLogs.length > 0) {
      await persistExerciseLogs({
        userId: payload.userId,
        sessionId: session.id,
        workoutPlanId: payload.workoutPlanId,
        logs: exerciseLogs,
      });
    }

    if (resolvedStatus === "skipped" && (payload.note || payload.skipReasonCode)) {
      await supabaseAdmin.from("ai_memory_facts").insert({
        user_id: payload.userId,
        fact_type: "workout_skip",
        fact_text: `Скип тренировки: ${payload.skipReasonCode ?? "other"}${payload.note ? ` — ${payload.note}` : ""}`,
        relevance_score: 0.8,
        source_date: sessionDate,
        metadata: { skipReasonCode: payload.skipReasonCode },
      });
    }

    const planStatus =
      resolvedStatus === "skipped"
        ? "skipped"
        : resolvedStatus === "partial"
          ? "completed"
          : "completed";

    await supabaseAdmin
      .from("workout_plans")
      .update({ status: planStatus })
      .eq("id", payload.workoutPlanId);

    let nextPlan = null;
    try {
      const nextDate = addDays(sessionDate, 1);
      const adaptationReason = buildAdaptationReason({
        status: resolvedStatus,
        skipReasonCode: payload.skipReasonCode,
        note: payload.note,
        exerciseLogs,
      });
      const draft = await generateWorkoutPlan({
        userId: payload.userId,
        planDate: nextDate,
        reason: adaptationReason,
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
