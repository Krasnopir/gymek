import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

export const progressRouter = Router();

progressRouter.get("/metrics/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const limit = z.coerce.number().int().min(1).max(90).parse(req.query.limit ?? 30);

    const { data, error } = await supabaseAdmin
      .from("body_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("metric_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json({ metrics: (data ?? []).reverse() });
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/metrics", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        metricDate: z.string().date().optional(),
        weightKg: z.number().positive(),
        waistCm: z.number().positive().optional(),
        note: z.string().max(300).optional(),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("body_metrics")
      .upsert(
        {
          user_id: payload.userId,
          metric_date: payload.metricDate ?? today(),
          weight_kg: payload.weightKg,
          waist_cm: payload.waistCm,
          note: payload.note,
        },
        { onConflict: "user_id,metric_date" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ metric: data });
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/photos/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);

    const { data, error } = await supabaseAdmin
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("shot_date", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    res.json({ photos: data ?? [] });
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/photos", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        shotDate: z.string().date().optional(),
        photoPath: z.string().min(1),
        posture: z.string().max(50).optional(),
      })
      .parse(req.body);

    const { data, error } = await supabaseAdmin
      .from("progress_photos")
      .insert({
        user_id: payload.userId,
        shot_date: payload.shotDate ?? today(),
        photo_path: payload.photoPath,
        posture: payload.posture ?? "front",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ photo: data });
  } catch (error) {
    next(error);
  }
});
