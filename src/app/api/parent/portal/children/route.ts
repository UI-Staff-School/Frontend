import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("[Parent Portal API] Fetching children list");

    const response = await fetch(`${API_BASE_URL}/parent/portal/children`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Parent Portal API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch children" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `[Parent Portal API] Successfully fetched ${
        Array.isArray(data) ? data.length : "unknown"
      } children`
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Parent Portal API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch children" },
      { status: 500 }
    );
  }
}
