import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/announcement/[id] - Get single announcement
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = buildExternalApiUrl(`/announcement/${params.id}`);

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch announcement", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[Announcement][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch announcement" },
      { status: 500 }
    );
  }
}

// PUT /api/announcement/[id] - Update announcement (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const url = buildExternalApiUrl(`/announcement/${params.id}`);

    const response = await fetch(url, {
      method: "PUT",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to update announcement", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[Announcement][PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcement/[id] - Delete announcement (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = buildExternalApiUrl(`/announcement/${params.id}`);

    const response = await fetch(url, {
      method: "DELETE",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: payload?.message || "Failed to delete announcement", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error: any) {
    console.error("[Announcement][DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to delete announcement" },
      { status: 500 }
    );
  }
}
