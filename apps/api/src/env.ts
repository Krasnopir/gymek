import { z } from "zod";

const envSchema = z.object({
  API_PORT: z.coerce.number().default(8787),
  PORT: z.coerce.number().optional(),
  /** Пустая строка в Render до настройки web — не валим старт. */
  APP_BASE_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url().optional(),
  ),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_PROJECT_NUMBER: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const listenPort = env.PORT ?? env.API_PORT;

export const isProduction = process.env.NODE_ENV === "production";

export const corsOrigins = Array.from(
  new Set(
    [
      env.APP_BASE_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      ...(env.CORS_ALLOWED_ORIGINS?.split(",") ?? []),
    ]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim()),
  ),
);

/** Vite часто уходит на 3001+ если 3000 занят — в dev пускаем любой localhost. */
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (corsOrigins.includes(origin)) {
    return true;
  }

  if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  return false;
}
