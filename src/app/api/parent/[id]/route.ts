import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[Parent API] Fetching parent with ID: ${params.id}`);

    const response = await fetch(`${API_BASE_URL}/parent/${params.id}`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Parent API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch parent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Parent API] Successfully fetched parent:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch parent" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    console.log(`[Parent API] Updating parent ${params.id} with:`, JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/parent/${params.id}`, {
      method: "PUT",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Parent API] Update error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to update parent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Parent API] Successfully updated parent:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update parent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[Parent API] Deleting parent with ID: ${params.id}`);

    const response = await fetch(`${API_BASE_URL}/parent/${params.id}`, {
      method: "DELETE",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Parent API] Delete error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to delete parent" },
        { status: response.status }
      );
    }

    console.log("[Parent API] Successfully deleted parent");
    return NextResponse.json({ success: true, message: "Parent deleted successfully" });
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete parent" },
      { status: 500 }
    );
  }
}
