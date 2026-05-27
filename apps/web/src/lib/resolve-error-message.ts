import type { Messages } from "@/i18n";
import { clientEnv } from "@/lib/client-env";
import { ApiError } from "@/lib/api-error";

export function resolveErrorMessage(error: unknown, t: Messages): string {
  if (error instanceof ApiError) {
    const byCode: Record<string, string | undefined> = {
      VALIDATION_ERROR: t.errors.validation,
      PROFILE_NOT_FOUND: t.errors.profileNotFound,
      PROFILE_SAVE_FAILED: t.errors.profileSaveFailed,
      DATABASE_ERROR: t.errors.database,
      DUPLICATE_RECORD: t.errors.duplicate,
      FORBIDDEN: t.errors.forbidden,
      CORS_BLOCKED: t.errors.cors,
      AI_UNAVAILABLE: t.errors.aiUnavailable,
      INTERNAL_ERROR: t.errors.server,
      API_UNAVAILABLE: t.errors.apiDown,
    };

    if (byCode[error.code]) {
      return byCode[error.code]!;
    }

    if (error.message && error.message.length > 0) {
      return error.message;
    }

    return t.errors.unknown;
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return t.errors.network.replace("{{api}}", clientEnv.VITE_API_BASE_URL);
  }

  if (error instanceof Error) {
    if (error.message === "No active session") {
      return t.errors.notAuthenticated;
    }

    if (error.message.includes("Failed to fetch")) {
      return t.errors.network.replace("{{api}}", clientEnv.VITE_API_BASE_URL);
    }

    return error.message;
  }

  return t.errors.unknown;
}
