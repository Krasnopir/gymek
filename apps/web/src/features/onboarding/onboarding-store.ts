import { create } from "zustand";

type OnboardingDraft = {
  trainingGoal: string;
  aiTone: "goblin" | "bro" | "chill" | "science";
  locale: "ru" | "uk" | "en" | "pl";
};

type OnboardingState = {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
};

const initialDraft: OnboardingDraft = {
  trainingGoal: "recomposition",
  aiTone: "goblin",
  locale: "ru",
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
