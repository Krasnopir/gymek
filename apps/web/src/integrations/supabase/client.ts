import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/client-env";

export const supabase = createClient(
  clientEnv.VITE_SUPABASE_URL,
  clientEnv.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
