import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_TOKEN_PATHS = ["/auth/login", "/auth/refresh"];
const AUTH_LOGOUT_PATH = "/auth/logout";
const AUTH_REFRESH_PATH = "/auth/refresh";

function isTokenPath(path: string): boolean {
  return AUTH_TOKEN_PATHS.some((p) => path === p);
}

function isLogoutPath(path: string): boolean {
  return path === AUTH_LOGOUT_PATH;
}

function setCookieHeader(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

async function proxy(req: NextRequest): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_URL;
  const path = req.nextUrl.pathname.replace("/api", "");
  const search = req.nextUrl.search;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // 로그아웃: Keycloak 세션 종료 + 쿠키 삭제
  if (isLogoutPath(path)) {
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      const keycloakUrl = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
      const realm = process.env.KEYCLOAK_REALM ?? "personal-docs";
      const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "backend";

      await fetch(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            refresh_token: refreshToken,
          }),
        }
      ).catch(() => {}); // Keycloak 실패해도 쿠키는 삭제
    }

    const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
    res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  const url = `${backendUrl}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("cookie");
  headers.set("connection", "close"); // keep-alive 재사용으로 인한 소켓 에러 방지

  // access_token 쿠키 → Authorization 헤더로 변환
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  let body: BodyInit | undefined;

  // refresh 요청: 쿠키의 refresh_token을 body에 주입
  if (path === AUTH_REFRESH_PATH && req.method === "POST") {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    body = JSON.stringify({ refresh_token: refreshToken ?? "" });
    headers.set("content-type", "application/json");
  } else if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const resHeaders = new Headers(res.headers);

  // SSE pass-through: text/event-stream 응답은 body를 버퍼링 없이 그대로 반환
  if (res.headers.get("content-type")?.includes("text/event-stream")) {
    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  }

  // 로그인/refresh: 토큰을 HttpOnly 쿠키로 변환, body에서 토큰 제거
  if (isTokenPath(path) && res.ok) {
    const data = await res.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (data.access_token) {
      const maxAge = data.expires_in ?? 300;
      resHeaders.append("set-cookie", setCookieHeader("access_token", data.access_token, maxAge));
    }
    if (data.refresh_token) {
      resHeaders.append("set-cookie", setCookieHeader("refresh_token", data.refresh_token, 60 * 60 * 24 * 30));
    }

    // body에서 토큰 제거 — Content-Length도 새 body에 맞게 설정
    const safeBody = JSON.stringify({ ok: true });
    resHeaders.set("content-length", String(Buffer.byteLength(safeBody)));
    resHeaders.delete("transfer-encoding");
    return new NextResponse(safeBody, {
      status: 200,
      headers: resHeaders,
    });
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
