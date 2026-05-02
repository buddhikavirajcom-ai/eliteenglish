export type FieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldErrors;

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const response = await fetch(input, {
    ...init,
    headers: isFormData
      ? init?.headers
      : {
          "Content-Type": "application/json",
          ...(init?.headers ?? {})
        }
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & {
        error?: string;
        fieldErrors?: FieldErrors;
      })
    | null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? "Request failed", response.status, payload?.fieldErrors);
  }

  return payload as T;
}