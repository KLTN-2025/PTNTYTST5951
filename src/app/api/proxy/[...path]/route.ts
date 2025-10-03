import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { path?: string[] };

const API_BASE_URL = process.env.API_SERVER_ORIGIN ?? "http://localhost:3030";
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
const BROWSER_SPECIFICS = [
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-dest",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
];

const buildTargetUrl = (path: string[] = [], search: string) =>
  `${API_BASE_URL}/api/${path.map(encodeURIComponent).join("/")}${search}`;

const getAccessToken = (t: any) => t?.accessToken ?? t?.access_token;

const createProxyHeaders = (original: Headers, token?: string) => {
  const headers = new Headers();

  for (const [k, v] of original.entries()) {
    const key = k.toLowerCase();
    if (HOP_BY_HOP.has(key)) continue;
    if (BROWSER_SPECIFICS.includes(key)) continue;
    if (key === "authorization") continue;
    headers.set(k, v);
  }

  if (token) headers.set("authorization", `Bearer ${token}`);
  if (!headers.has("x-forwarded-proto"))
    headers.set("x-forwarded-proto", "https");
  if (!headers.has("x-forwarded-host"))
    headers.set("x-forwarded-host", new URL(API_BASE_URL).host);

  return headers;
};

async function proxy(req: NextRequest, params: Params): Promise<Response> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const url = new URL(req.url);
    const targetUrl = buildTargetUrl(params.path ?? [], url.search);
    const headers = createProxyHeaders(req.headers, getAccessToken(token));

    const hasBody = METHODS_WITH_BODY.has(req.method);
    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
      redirect: "manual",
      body: hasBody ? (req.body as any) : undefined,
      duplex: hasBody ? "half" : undefined,
    };

    return fetch(targetUrl, init);
  } catch (e) {
    console.error("Proxy error:", e);
    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 500 }
    );
  }
}

export function GET(req: NextRequest, ctx: { params: Params }) {
  return proxy(req, ctx.params);
}
export function POST(req: NextRequest, ctx: { params: Params }) {
  return proxy(req, ctx.params);
}
export function PUT(req: NextRequest, ctx: { params: Params }) {
  return proxy(req, ctx.params);
}
export function PATCH(req: NextRequest, ctx: { params: Params }) {
  return proxy(req, ctx.params);
}
export function DELETE(req: NextRequest, ctx: { params: Params }) {
  return proxy(req, ctx.params);
}
// Tuỳ nhu cầu CORS:
// export function OPTIONS(req: NextRequest, ctx: { params: Params }) { return proxy(req, ctx.params); }
