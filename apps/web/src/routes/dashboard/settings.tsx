import { createFileRoute } from "@tanstack/react-router";
import type { Locale } from "@gymek/shared";
import { Moon, Settings, Sparkles, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { selectClassName } from "@/components/ui/field";
import { localeLabels } from "@/i18n";
import { useLocale, useMessages } from "@/features/i18n/use-messages";
import { useAppToast } from "@/features/toast/use-app-toast";
import type { AiTone } from "@/features/profile/use-update-settings";
import { useUpdateSettings } from "@/features/profile/use-update-settings";
import { useProfile } from "@/features/profile/use-profile";
import { useThemeStore, type ThemeMode } from "@/features/settings/theme-store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

const localeOptions: Locale[] = ["ru", "uk", "en", "pl"];
const toneOptions: AiTone[] = ["goblin", "bro", "chill", "science"];

function SettingsPage() {
  const t = useMessages();
  const toast = useAppToast();
  const { locale, setLocale } = useLocale();
  const { data: profile, isLoading } = useProfile();
  const updateSettings = useUpdateSettings();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  const [draftLocale, setDraftLocale] = useState<Locale>(locale);
  const [draftTone, setDraftTone] = useState<AiTone>("goblin");

  useEffect(() => {
    setDraftLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (profile?.ai_tone) {
      setDraftTone(profile.ai_tone as AiTone);
    }
  }, [profile?.ai_tone]);

  const toneHint: Record<AiTone, string> = {
    goblin: t.settings.toneHints.goblin,
    bro: t.settings.toneHints.bro,
    chill: t.settings.toneHints.chill,
    science: t.settings.toneHints.science,
  };

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
    { mode: "light", label: t.settings.themeLight, icon: Sun },
    { mode: "dark", label: t.settings.themeDark, icon: Moon },
    { mode: "system", label: t.settings.themeSystem, icon: SunMoon },
  ];

  const hasProfileChanges =
    draftLocale !== (profile?.locale ?? locale) ||
    draftTone !== ((profile?.ai_tone as AiTone) ?? "goblin");

  const saveProfileSettings = () => {
    updateSettings.mutate(
      { locale: draftLocale, aiTone: draftTone },
      {
        onSuccess: () => {
          setLocale(draftLocale);
          toast.success(t.toast.settingsSaved);
        },
        onError: (error) => toast.error(error),
      },
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="gymek-page-title">
        <Settings className="h-6 w-6 text-violet-500 dark:text-violet-400" />
        {t.nav.settings}
      </h1>

      <section className="gymek-card space-y-3">
        <h2 className="gymek-section-title">{t.settings.appearance}</h2>
        <p className="text-xs text-zinc-500">{t.settings.themeHint}</p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition",
                themeMode === mode
                  ? "border-violet-500 bg-violet-50 text-violet-900 dark:border-violet-500/60 dark:bg-violet-950/40 dark:text-violet-100"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/60",
              )}
              onClick={() => setThemeMode(mode)}
              type="button"
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="gymek-card space-y-4">
        <h2 className="gymek-section-title">{t.settings.language}</h2>
        <label className="block text-xs text-zinc-500" htmlFor="settings-locale">
          {t.onboarding.locale}
        </label>
        <select
          className={selectClassName}
          disabled={isLoading || updateSettings.isPending}
          id="settings-locale"
          onChange={(e) => setDraftLocale(e.target.value as Locale)}
          value={draftLocale}
        >
          {localeOptions.map((code) => (
            <option key={code} value={code}>
              {localeLabels[code]}
            </option>
          ))}
        </select>
      </section>

      <section className="gymek-card space-y-4">
        <h2 className="flex items-center gap-1.5 gymek-section-title">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {t.settings.aiTone}
        </h2>
        <p className="text-xs text-zinc-500">{t.settings.aiToneHint}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {toneOptions.map((tone) => (
            <button
              key={tone}
              className={cn(
                "cursor-pointer rounded-xl border p-3 text-left transition",
                draftTone === tone
                  ? "border-amber-500/60 bg-amber-50 dark:bg-amber-950/30"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50",
              )}
              disabled={updateSettings.isPending}
              onClick={() => setDraftTone(tone)}
              type="button"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.tones[tone]}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{toneHint[tone]}</p>
            </button>
          ))}
        </div>
      </section>

      {profile?.training_goal ? (
        <section className="gymek-card">
          <p className="text-xs text-zinc-500">{t.settings.currentGoal}</p>
          <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {profile.training_goal}
          </p>
        </section>
      ) : null}

      <Button
        disabled={!hasProfileChanges}
        loading={updateSettings.isPending}
        loadingLabel={t.common.saving}
        onClick={saveProfileSettings}
        variant="gradientCyan"
      >
        {t.settings.save}
      </Button>
    </div>
  );
}
