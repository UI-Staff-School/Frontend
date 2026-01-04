import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Parent API] Linking student with payload:", JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/parent/link-student`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Parent API] Link student error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to link student" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Parent API] Successfully linked student:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link student" },
      { status: 500 }
    );
  }
}
