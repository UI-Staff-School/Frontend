import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function resolveSessionPath(slug?: string[]): string {
  const suffix = slug && slug.length ? `/${slug.join("/")}` : "";
  return `/session${suffix}`;
}

async function proxyRequest(
  req: NextRequest,
  method: HttpMethod,
  slug?: string[]
) {
  const targetUrl = new URL(
    buildExternalApiUrl(
      `${resolveSessionPath(slug)}${new URL(req.url).search || ""}`
    )
  );

  const init: RequestInit = {
    method,
    headers: getApiHeaders(req),
    cache: "no-store",
  };

  if (method === "POST" || method === "PUT") {
    const rawBody = await req.text();
    if (rawBody) {
      init.body = rawBody;
    }
  }

  const response = await fetch(targetUrl, init);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const text = await response.text();
  const payload = isJson && text ? JSON.parse(text) : text;

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Session request failed";
    return NextResponse.json(
      {
        error: message,
        details: typeof payload === "string" ? undefined : payload,
      },
      { status: response.status }
    );
  }

  if (isJson) {
    return NextResponse.json(payload, { status: response.status });
  }

  return new NextResponse(text, {
    status: response.status,
    headers: { "content-type": contentType || "text/plain" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyRequest(req, "GET", params.slug);
  } catch (error: any) {
    console.error("[Session][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch session data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyRequest(req, "POST", params.slug);
  } catch (error: any) {
    console.error("[Session][POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to process session request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyRequest(req, "PUT", params.slug);
  } catch (error: any) {
    console.error("[Session][PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyRequest(req, "DELETE", params.slug);
  } catch (error: any) {
    console.error("[Session][DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to delete session data" },
      { status: 500 }
    );
  }
}

