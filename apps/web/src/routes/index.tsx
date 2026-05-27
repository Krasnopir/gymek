import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { signInWithGoogle } from "@/features/auth/auth-actions";
import { useAuth } from "@/features/auth/auth-provider";
import { useMessages } from "@/features/i18n/use-messages";
import { useProfile } from "@/features/profile/use-profile";
import { useAppToast } from "@/features/toast/use-app-toast";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const t = useMessages();
  const toast = useAppToast();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, session } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (isAuthenticated && profile?.onboarding_completed) {
      void navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, profile?.onboarding_completed, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle({
        redirectTo: window.location.origin,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error : new Error(t.errors.authFailed));
    }
  };

  const showOnboarding = isAuthenticated && !profileLoading && !profile?.onboarding_completed;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-6 text-zinc-100">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-3xl font-bold">Gymek</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.app.tagline}</p>

        <div className="mt-6 space-y-4">
          {isLoading || (isAuthenticated && profileLoading) ? (
            <p className="text-sm text-zinc-400">{t.app.checkingSession}</p>
          ) : null}

          {!isLoading && !isAuthenticated ? (
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              onClick={() => void handleSignIn()}
              type="button"
            >
              {t.auth.continueGoogle}
            </button>
          ) : null}

          {showOnboarding ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                {t.auth.loggedAs} <strong>{session?.user.email}</strong>
              </div>
              <OnboardingForm />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
