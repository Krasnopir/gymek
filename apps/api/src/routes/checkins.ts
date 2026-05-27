import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

export const checkinsRouter = Router();

checkinsRouter.get("/today/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const checkinDate = z.string().date().parse(req.query.date ?? today());

    const { data, error } = await supabaseAdmin
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("checkin_date", checkinDate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({ checkin: data });
  } catch (error) {
    next(error);
  }
});

checkinsRouter.post("/upsert", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        checkinDate: z.string().date().optional(),
        moodScore: z.number().int().min(1).max(10).optional(),
        stressScore: z.number().int().min(1).max(10).optional(),
        sleepHours: z.number().min(0).max(24).optional(),
        soreness: z.record(z.string(), z.number().min(0).max(10)).optional(),
        workloadState: z.string().max(80).optional(),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("daily_checkins")
      .upsert(
        {
          user_id: payload.userId,
          checkin_date: payload.checkinDate ?? today(),
          mood_score: payload.moodScore,
          stress_score: payload.stressScore,
          sleep_hours: payload.sleepHours,
          soreness: payload.soreness ?? {},
          workload_state: payload.workloadState,
        },
        { onConflict: "user_id,checkin_date" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ checkin: data });
  } catch (error) {
    next(error);
  }
});
