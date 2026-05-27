import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && profile?.onboarding_completed) {
      void navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, profile?.onboarding_completed, navigate]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle({
        redirectTo: window.location.origin,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error : new Error(t.errors.authFailed));
      setSigningIn(false);
    }
  };

  const showOnboarding = isAuthenticated && !profileLoading && !profile?.onboarding_completed;

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-6 text-zinc-100">
      <div className="gymek-card">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Gymek</h1>
        <p className="mt-2 gymek-muted">{t.app.tagline}</p>

        <div className="mt-6 space-y-4">
          {isLoading || (isAuthenticated && profileLoading) ? (
            <p className="gymek-muted">{t.app.checkingSession}</p>
          ) : null}

          {!isLoading && !isAuthenticated ? (
            <Button
              loading={signingIn}
              loadingLabel={t.common.loading}
              onClick={() => void handleSignIn()}
              variant="primary"
            >
              {t.auth.continueGoogle}
            </Button>
          ) : null}

          {showOnboarding ? (
            <div className="space-y-4">
              <div className="gymek-subcard text-sm">
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
