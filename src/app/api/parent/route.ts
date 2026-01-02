import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).search;
    console.log(`[Parent API] Fetching from: ${API_BASE_URL}/parent${searchParams}`);

    const response = await fetch(`${API_BASE_URL}/parent${searchParams}`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    console.log(`[Parent API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Parent API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch parents" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `[Parent API] Successfully fetched ${
        Array.isArray(data) ? data.length : "unknown"
      } parents`
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch parents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Parent API] Creating parent with payload:", JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/parent`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Parent API] Create error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to create parent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Parent API] Successfully created parent:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create parent" },
      { status: 500 }
    );
  }
}
