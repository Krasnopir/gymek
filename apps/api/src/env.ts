import { z } from "zod";

const envSchema = z.object({
  API_PORT: z.coerce.number().default(8787),
  APP_BASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
