const BACKEND_BASE = process.env.BACKEND_URL;

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...rest } = options;
  const res = await fetch(`${BACKEND_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[api-server] ${res.status} ${res.statusText}`);
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
