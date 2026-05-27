export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function isSupabaseLikeError(
  error: unknown,
): error is { code?: string; message?: string; details?: string } {
  return typeof error === "object" && error !== null && "message" in error;
}

export function mapSupabaseError(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "23505":
      return new HttpError(409, "DUPLICATE_RECORD", "Запись уже существует", error);
    case "42501":
      return new HttpError(403, "FORBIDDEN", "Нет доступа к данным", error);
    case "PGRST116":
      return new HttpError(404, "NOT_FOUND", "Не найдено", error);
    default:
      return new HttpError(500, "DATABASE_ERROR", error.message ?? "Ошибка базы данных", error);
  }
}
