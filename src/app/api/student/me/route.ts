import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const targetUrl = buildExternalApiUrl("/student/me");
    console.log(`[Student Me API] GET ${targetUrl}`);

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
          : payload?.message || "Failed to fetch student profile";
      console.error(`[Student Me API] Error: ${response.status} - ${message}`);
      return NextResponse.json(
        { error: message, details: typeof payload === "string" ? undefined : payload },
        { status: response.status }
      );
    }

    console.log(`[Student Me API] Success: ${response.status}`);
    return NextResponse.json(payload, { status: response.status });
  } catch (error: any) {
    console.error("[Student Me API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch student profile" },
      { status: 500 }
    );
  }
}
