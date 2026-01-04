import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

function buildResultUrl(search: string = "") {
  return buildExternalApiUrl(`/result${search}`);
}

export async function GET(req: NextRequest) {
  const search = new URL(req.url).search;
  try {
    const response = await fetch(buildResultUrl(search), {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch results", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error("[Results][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch results" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(buildResultUrl(), {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to create result", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error: any) {
    console.error("[Results][POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to create result" },
      { status: 500 }
    );
  }
}
