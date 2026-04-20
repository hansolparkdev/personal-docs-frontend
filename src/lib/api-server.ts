import { cookies } from "next/headers";

const BACKEND_BASE = process.env.BACKEND_URL;

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options;

  const cookieStore = await cookies();
  const accessTokenCookie = cookieStore.get("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };

  if (accessTokenCookie?.value) {
    headers["Authorization"] = `Bearer ${accessTokenCookie.value}`;
  }

  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const error = new Error(`[api-server] ${res.status} ${res.statusText}`) as Error & {
      status: number;
    };
    error.status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

export const apiServer = {
  get: <T>(path: string, init?: RequestOptions) => request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...init }),
  put: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "PUT", body, ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...init }),
  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...init }),
};
