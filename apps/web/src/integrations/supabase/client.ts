import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/client-env";

if (typeof window === "undefined" && !globalThis.WebSocket) {
  const { WebSocket } = await import("ws");
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

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
