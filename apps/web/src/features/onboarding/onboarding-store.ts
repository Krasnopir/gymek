import type { Locale } from "@gymek/shared";
import { create } from "zustand";
import { defaultLocale } from "@/i18n";

type OnboardingDraft = {
  trainingGoal: string;
  aiTone: "goblin" | "bro" | "chill" | "science";
  locale: Locale;
};

type OnboardingState = {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
};

const initialDraft: OnboardingDraft = {
  trainingGoal: "recomposition",
  aiTone: "goblin",
  locale: defaultLocale,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: initialDraft,
  setDraft: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch,
      },
    })),
  reset: () => set({ draft: initialDraft }),
}));
