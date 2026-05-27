import { useCallback } from "react";
import type { Messages } from "@/i18n";
import { useMessages } from "@/features/i18n/use-messages";
import { resolveErrorMessage } from "@/lib/resolve-error-message";
import { useToastStore } from "./toast-store";

export const useAppToast = () => {
  const push = useToastStore((state) => state.push);
  const t = useMessages();

  const success = useCallback(
    (message: string) => {
      push({ type: "success", message });
    },
    [push],
  );

  const error = useCallback(
    (err: unknown) => {
      push({ type: "error", message: resolveErrorMessage(err, t) });
    },
    [push, t],
  );

  const info = useCallback(
    (message: string) => {
      push({ type: "info", message });
    },
    [push],
  );

  return { success, error, info };
};

export type ToastMessages = Messages["toast"];
