import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastState = {
  items: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ items: [...state.items, { ...toast, id }] }));

    const timeout = setTimeout(() => {
      get().dismiss(id);
      timeouts.delete(id);
    }, 5000);

    timeouts.set(id, timeout);
  },
  dismiss: (id) => {
    const timeout = timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.delete(id);
    }
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
}));
