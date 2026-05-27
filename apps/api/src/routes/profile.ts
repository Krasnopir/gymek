import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";

const upsertProfileSchema = z.object({
  userId: z.string().uuid(),
  locale: z.enum(["ru", "uk", "en", "pl"]).default("ru"),
  aiTone: z.enum(["goblin", "bro", "chill", "science"]).default("goblin"),
  trainingGoal: z.string().min(1).max(120),
});

export const profileRouter = Router();

profileRouter.get("/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }

    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

profileRouter.post("/upsert", async (req, res, next) => {
  try {
    const payload = upsertProfileSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: payload.userId,
          locale: payload.locale,
          ai_tone: payload.aiTone,
          training_goal: payload.trainingGoal,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});
