import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { classLevelId: string } }
) {
  try {
    console.log(`[Class Students API] Fetching students for class: ${params.classLevelId}`);

    const response = await fetch(
      `${API_BASE_URL}/class/${params.classLevelId}/students`,
      {
        method: "GET",
        headers: getApiHeaders(req),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Class Students API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch students" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `[Class Students API] Successfully fetched ${
        Array.isArray(data) ? data.length : "unknown"
      } students`
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Class Students API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
