import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname.replace("/api", "");
  const search = req.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const resHeaders = new Headers(res.headers);
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
