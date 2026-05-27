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
import { Button } from "@/components/ui/button";
import { inputClassName, selectClassName } from "@/components/ui/field";
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
          className={inputClassName}
          disabled={saveMutation.isPending}
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
          className={selectClassName}
          disabled={saveMutation.isPending}
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
          className={selectClassName}
          disabled={saveMutation.isPending}
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

      <Button
        loading={saveMutation.isPending}
        loadingLabel={t.onboarding.saving}
        type="submit"
        variant="primary"
      >
        {t.onboarding.save}
      </Button>
    </form>
  );
}
