import { Router } from "express";
import { z } from "zod";
import { HttpError, mapSupabaseError } from "../lib/http-error.js";
import { supabaseAdmin } from "../supabase.js";

const upsertProfileSchema = z.object({
  userId: z.string().uuid(),
  locale: z.enum(["ru", "uk", "en", "pl"]).default("ru"),
  aiTone: z.enum(["goblin", "bro", "chill", "science"]).default("goblin"),
  trainingGoal: z.string().min(1).max(120),
});

const patchSettingsSchema = z.object({
  userId: z.string().uuid(),
  locale: z.enum(["ru", "uk", "en", "pl"]).optional(),
  aiTone: z.enum(["goblin", "bro", "chill", "science"]).optional(),
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
      throw mapSupabaseError(error);
    }

    if (!data) {
      return res.status(404).json({
        error: "PROFILE_NOT_FOUND",
        message: "Профиль не найден. Пройди onboarding заново.",
      });
    }

    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

profileRouter.patch("/settings", async (req, res, next) => {
  try {
    const payload = patchSettingsSchema.parse(req.body);

    if (!payload.locale && !payload.aiTone) {
      throw new HttpError(400, "VALIDATION_ERROR", "Nothing to update");
    }

    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.locale) {
      updates.locale = payload.locale;
    }
    if (payload.aiTone) {
      updates.ai_tone = payload.aiTone;
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", payload.userId)
      .select("*")
      .single();

    if (error) {
      throw mapSupabaseError(error);
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
      throw mapSupabaseError(error);
    }

    res.json({ profile: data });
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      next(new HttpError(503, "API_UNAVAILABLE", "API недоступен"));
      return;
    }
    next(error);
  }
});
