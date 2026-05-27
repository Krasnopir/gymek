import { Router } from "express";
import { z } from "zod";
import { generateDailySummary } from "../services/ai-coach.js";
import { supabaseAdmin } from "../supabase.js";

const today = () => new Date().toISOString().slice(0, 10);

export const aiRouter = Router();

aiRouter.get("/summary/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().parse(req.params.userId);
    const summaryDate = z.string().date().parse(req.query.date ?? today());

    const { data, error } = await supabaseAdmin
      .from("ai_summaries_daily")
      .select("*")
      .eq("user_id", userId)
      .eq("summary_date", summaryDate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({ summary: data });
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/summary/generate", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().uuid(),
        summaryDate: z.string().date().optional(),
      })
      .parse(req.body);

    const summaryDate = payload.summaryDate ?? today();
    const result = await generateDailySummary(payload.userId, summaryDate);

    res.json({ summary: result });
  } catch (error) {
    next(error);
  }
});
