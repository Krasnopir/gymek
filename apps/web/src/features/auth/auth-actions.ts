import { supabase } from "@/integrations/supabase/client";

type SignInWithGoogleOptions = {
  redirectTo: string;
};

export const signInWithGoogle = async ({ redirectTo }: SignInWithGoogleOptions) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "https://www.googleapis.com/auth/userinfo.email",
    },
  });

  if (error) {
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};
