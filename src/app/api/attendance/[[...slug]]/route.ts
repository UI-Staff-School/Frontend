import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function resolveAttendancePath(slug?: string[]): string {
  const suffix = slug && slug.length ? `/${slug.join("/")}` : "";
  return `/attendance${suffix}`;
}

async function proxyAttendance(
  req: NextRequest,
  method: HttpMethod,
  slug?: string[]
) {
  const target = buildExternalApiUrl(
    `${resolveAttendancePath(slug)}${new URL(req.url).search || ""}`
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

  const response = await fetch(target, init);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const text = await response.text();
  const payload = isJson && text ? JSON.parse(text) : text;

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Attendance request failed";
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
    return await proxyAttendance(req, "GET", params.slug);
  } catch (error: any) {
    console.error("[Attendance][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch attendance data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyAttendance(req, "POST", params.slug);
  } catch (error: any) {
    console.error("[Attendance][POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to process attendance request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyAttendance(req, "PUT", params.slug);
  } catch (error: any) {
    console.error("[Attendance][PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update attendance" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    return await proxyAttendance(req, "DELETE", params.slug);
  } catch (error: any) {
    console.error("[Attendance][DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to delete attendance record" },
      { status: 500 }
    );
  }
}

