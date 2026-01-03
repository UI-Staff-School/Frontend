import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { admissionNo: string } }
) {
  try {
    console.log(`[Parent API] Unlinking student with admission number: ${params.admissionNo}`);

    const response = await fetch(
      `${API_BASE_URL}/parent/unlink-student/${params.admissionNo}`,
      {
        method: "POST",
        headers: getApiHeaders(req),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Parent API] Unlink student error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to unlink student" },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({ success: true }));
    console.log("[Parent API] Successfully unlinked student:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Parent API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unlink student" },
      { status: 500 }
    );
  }
}
