import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// POST /api/announcement/[id]/publish - Publish announcement (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = buildExternalApiUrl(`/announcement/${params.id}/publish`);

    const response = await fetch(url, {
      method: "POST",
      headers: getApiHeaders(req),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to publish announcement", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[Announcement/Publish][POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to publish announcement" },
      { status: 500 }
    );
  }
}
