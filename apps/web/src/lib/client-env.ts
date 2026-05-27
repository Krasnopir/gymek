import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_APP_NAME: z.string().default("Gymek"),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_API_BASE_URL: z.string().url(),
});

export const clientEnv = clientEnvSchema.parse(import.meta.env);
