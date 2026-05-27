import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError, isSupabaseLikeError, mapSupabaseError } from "./http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: firstIssue?.message ?? "Некорректные данные запроса",
      details: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (isSupabaseLikeError(error) && error.code) {
    const mapped = mapSupabaseError(error);
    return res.status(mapped.statusCode).json({
      error: mapped.code,
      message: mapped.message,
      details: mapped.details,
    });
  }

  if (error instanceof Error) {
    if (error.message.startsWith("CORS blocked")) {
      return res.status(403).json({
        error: "CORS_BLOCKED",
        message: "Запрос заблокирован CORS. Проверь APP_BASE_URL в API (.env).",
      });
    }

    if (error.message.includes("OpenAI error")) {
      return res.status(502).json({
        error: "AI_UNAVAILABLE",
        message: "AI временно недоступен. Попробуй позже или без AI-фичи.",
        details: error.message,
      });
    }
  }

  console.error(error);
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Внутренняя ошибка сервера. Смотри логи API.",
  });
};
