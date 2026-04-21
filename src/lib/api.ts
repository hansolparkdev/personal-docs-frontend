const BFF_BASE = "/api";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

const REFRESH_PATH = "/auth/refresh";
// 인증 없이 호출하는 경로 — 401 시 refresh 시도 안 함
const NO_RETRY_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/callback"];

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { body, ...rest } = options;

  const isMultipart = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (rest.headers) {
    const incoming = rest.headers as Record<string, string>;
    Object.assign(headers, incoming);
  }

  const res = await fetch(`${BFF_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers,
    body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !isRetry && !NO_RETRY_PATHS.includes(path)) {
    // refresh 시도
    const refreshRes = await fetch(`${BFF_BASE}${REFRESH_PATH}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!refreshRes.ok) {
      // refresh 실패 → 이미 로그인 페이지면 redirect 안 함
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new Error("[api] refresh failed");
    }

    // 원래 요청 재시도
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(`[api] ${res.status} ${res.statusText}`) as Error & {
      status: number;
      body: unknown;
    };
    error.status = res.status;
    error.body = errorBody;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...init }),
  put: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "PUT", body, ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...init }),
  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...init }),
};
