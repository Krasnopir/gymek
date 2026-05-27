import { createFileRoute } from "@tanstack/react-router";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { signInWithGoogle, signOut } from "@/features/auth/auth-actions";
import { useAuth } from "@/features/auth/auth-provider";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isAuthenticated, isLoading, session } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle({
      redirectTo: window.location.origin,
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-6 text-zinc-100">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-3xl font-bold">Gymek</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Adaptive AI fitness companion. Wide v1 bootstrap.
        </p>

        <div className="mt-6 space-y-4">
          {isLoading ? <p className="text-sm text-zinc-400">Checking session...</p> : null}

          {!isLoading && !isAuthenticated ? (
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              onClick={() => void handleSignIn()}
              type="button"
            >
              Continue with Google
            </button>
          ) : null}

          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
                Logged as <strong>{session?.user.email}</strong>
              </div>
              <OnboardingForm />
              <button
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
                onClick={() => void signOut()}
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
