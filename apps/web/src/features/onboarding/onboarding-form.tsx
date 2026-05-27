import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { clientEnv } from "@/lib/client-env";
import { useAuth } from "../auth/auth-provider";
import { useOnboardingStore } from "./onboarding-store";

const onboardingSchema = z.object({
  trainingGoal: z.string().min(2).max(120),
  aiTone: z.enum(["goblin", "bro", "chill", "science"]),
  locale: z.enum(["ru", "uk", "en", "pl"]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const { session } = useAuth();
  const { draft, setDraft } = useOnboardingStore();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: draft,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: OnboardingFormValues) => {
      if (!session?.user.id) {
        throw new Error("No active session");
      }

      const response = await fetch(`${clientEnv.VITE_API_BASE_URL}/profile/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      return response.json();
    },
    onSuccess: (_, values) => {
      setDraft(values);
    },
  });

  const onSubmit = (values: OnboardingFormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="trainingGoal">
          Goal
        </label>
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="trainingGoal"
          placeholder="recomposition"
          {...form.register("trainingGoal")}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="aiTone">
          AI tone
        </label>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="aiTone"
          {...form.register("aiTone")}
        >
          <option value="goblin">Goblin</option>
          <option value="bro">Bro</option>
          <option value="chill">Chill</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="locale">
          Locale
        </label>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="locale"
          {...form.register("locale")}
        >
          <option value="ru">ru</option>
          <option value="uk">uk</option>
          <option value="en">en</option>
          <option value="pl">pl</option>
        </select>
      </div>

      <button
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saveMutation.isPending}
        type="submit"
      >
        {saveMutation.isPending ? "Saving..." : "Save onboarding"}
      </button>
      {saveMutation.isError ? (
        <p className="text-sm text-red-400">Failed to save onboarding.</p>
      ) : null}
      {saveMutation.isSuccess ? <p className="text-sm text-emerald-400">Saved.</p> : null}
    </form>
  );
}
