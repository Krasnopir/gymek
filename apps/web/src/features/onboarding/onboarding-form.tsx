import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Locale } from "@gymek/shared";
import { localeLabels } from "@/i18n";
import { useLocale, useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../auth/auth-provider";
import { useOnboardingStore } from "./onboarding-store";

const onboardingSchema = z.object({
  trainingGoal: z.string().min(2).max(120),
  aiTone: z.enum(["goblin", "bro", "chill", "science"]),
  locale: z.enum(["ru", "uk", "en", "pl"]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const t = useMessages();
  const toast = useAppToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { draft, setDraft } = useOnboardingStore();
  const { locale, setLocale } = useLocale();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { ...draft, locale },
  });

  const watchedLocale = form.watch("locale");

  useEffect(() => {
    if (watchedLocale) {
      setLocale(watchedLocale);
    }
  }, [watchedLocale, setLocale]);

  const saveMutation = useMutation({
    mutationFn: async (values: OnboardingFormValues) => {
      if (!session?.user.id) {
        throw new Error("No active session");
      }

      return apiFetch<{ profile: unknown }>("/profile/upsert", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          userId: session.user.id,
        }),
      });
    },
    onSuccess: (_, values) => {
      setDraft(values);
      setLocale(values.locale);
      toast.success(t.toast.profileSaved);
      void navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (values: OnboardingFormValues) => {
    saveMutation.mutate(values);
  };

  const toneOptions = [
    { value: "goblin", label: t.tones.goblin },
    { value: "bro", label: t.tones.bro },
    { value: "chill", label: t.tones.chill },
    { value: "science", label: t.tones.science },
  ] as const;

  const localeOptions: Locale[] = ["ru", "uk", "en", "pl"];

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="trainingGoal">
          {t.onboarding.goal}
        </label>
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="trainingGoal"
          placeholder={t.onboarding.goalPlaceholder}
          {...form.register("trainingGoal")}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="aiTone">
          {t.onboarding.aiTone}
        </label>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="aiTone"
          {...form.register("aiTone")}
        >
          {toneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="locale">
          {t.onboarding.locale}
        </label>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          id="locale"
          {...form.register("locale")}
        >
          {localeOptions.map((code) => (
            <option key={code} value={code}>
              {localeLabels[code]}
            </option>
          ))}
        </select>
      </div>

      <button
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saveMutation.isPending}
        type="submit"
      >
        {saveMutation.isPending ? t.onboarding.saving : t.onboarding.save}
      </button>
    </form>
  );
}
