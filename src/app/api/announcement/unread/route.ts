import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/announcement/unread - Get unread announcements
export async function GET(req: NextRequest) {
  try {
    const url = buildExternalApiUrl("/announcement/unread");

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch unread announcements", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[Announcement/Unread][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch unread announcements" },
      { status: 500 }
    );
  }
}
