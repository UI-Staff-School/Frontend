import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function resolvePaymentPath(slug?: string[]): string {
  const suffix = slug && slug.length ? `/${slug.join("/")}` : "";
  return `/payment${suffix}`;
}

async function proxyPayment(
  req: NextRequest,
  method: HttpMethod,
  slug?: string[]
) {
  const targetUrl = buildExternalApiUrl(
    `${resolvePaymentPath(slug)}${new URL(req.url).search || ""}`
  );

  console.log(`[Payment API] ${method} ${targetUrl}`);

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
        : payload?.message || "Payment request failed";
    console.error(`[Payment API] Error: ${response.status} - ${message}`);
    return NextResponse.json(
      {
        error: message,
        details: typeof payload === "string" ? undefined : payload,
      },
      { status: response.status }
    );
  }

  console.log(`[Payment API] Success: ${response.status}`);

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
    return await proxyPayment(req, "GET", params.slug);
  } catch (error: any) {
    console.error("[Payment API][GET] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch payment data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyPayment(req, "POST", params.slug);
  } catch (error: any) {
    console.error("[Payment API][POST] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to process payment request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyPayment(req, "PUT", params.slug);
  } catch (error: any) {
    console.error("[Payment API][PUT] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyPayment(req, "DELETE", params.slug);
  } catch (error: any) {
    console.error("[Payment API][DELETE] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to delete payment record" },
      { status: 500 }
    );
  }
}
