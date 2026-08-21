/**
 * Thin fetch wrapper for the Pantane DevTools backend.
 *
 * All tool logic runs server-side (FastAPI) — the frontend never
 * duplicates security-sensitive processing (JWT decode, hashing, etc.)
 * in the browser, per the product's security requirements.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<TResponse>(res);
}

export async function apiGet<TResponse>(path: string, params?: Record<string, string>): Promise<TResponse> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${API_BASE}/api${path}${query}`, { method: "GET" });
  return handleResponse<TResponse>(res);
}

export async function apiPostFormData<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const res = await fetch(`${API_BASE}/api${path}`, { method: "POST", body: formData });
  return handleResponse<TResponse>(res);
}

async function handleResponse<TResponse>(res: Response): Promise<TResponse> {
  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.success === false) {
    const code = data?.error?.code ?? "UNKNOWN_ERROR";
    const message = data?.error?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(code, message, res.status);
  }

  return data as TResponse;
}