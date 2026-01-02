import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

function resolveAlumniPath(slug?: string[]): string {
  const suffix = slug && slug.length ? `/${slug.join("/")}` : "";
  return `/alumni${suffix}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const targetUrl = buildExternalApiUrl(
      `${resolveAlumniPath(params.slug)}${new URL(req.url).search || ""}`
    );

    console.log(`[Alumni API] Fetching: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const text = await response.text();
    const payload = isJson && text ? JSON.parse(text) : text;

    if (!response.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.message || "Alumni request failed";
      console.error(`[Alumni API] Error: ${response.status} - ${message}`);
      return NextResponse.json(
        {
          error: message,
          details: typeof payload === "string" ? undefined : payload,
        },
        { status: response.status }
      );
    }

    console.log(`[Alumni API] Success: ${response.status}`);

    if (isJson) {
      return NextResponse.json(payload, { status: response.status });
    }

    return new NextResponse(text, {
      status: response.status,
      headers: { "content-type": contentType || "text/plain" },
    });
  } catch (error: any) {
    console.error("[Alumni API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch alumni data" },
      { status: 500 }
    );
  }
}
