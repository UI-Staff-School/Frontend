import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/announcement - List announcements
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const queryString = searchParams.toString();
    const url = buildExternalApiUrl(`/announcement${queryString ? `?${queryString}` : ""}`);

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch announcements", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[Announcement][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/announcement - Create announcement (Admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = buildExternalApiUrl("/announcement");

    const response = await fetch(url, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to create announcement", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error: any) {
    console.error("[Announcement][POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to create announcement" },
      { status: 500 }
    );
  }
}
