export type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = {};
  }

  const code = body.error ?? `HTTP_${response.status}`;
  const message =
    body.message ??
    (response.status === 404
      ? "Ресурс не найден"
      : response.status >= 500
        ? "Ошибка сервера"
        : `Ошибка запроса (${response.status})`);

  return new ApiError(response.status, code, message, body.details);
}
