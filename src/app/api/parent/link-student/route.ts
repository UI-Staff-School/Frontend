import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Parent API] Linking student with payload:", JSON.stringify(body, null, 2));

    // Normalize the payload to match what the backend might expect
    const payload = {
      parentId: body.parentId,
      admissionNo: body.admissionNo || body.studentAdmissionNo,
    };

    console.log("[Parent API] Normalized payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/parent/link-student`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("[Parent API] Link student response status:", response.status);
    console.log("[Parent API] Link student response body:", responseText);

    if (!response.ok) {
      let errorMessage = "Failed to link student";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
      } catch {
        if (responseText) errorMessage = responseText;
      }
      console.error("[Parent API] Link student error:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    let data = { success: true };
    try {
      data = JSON.parse(responseText);
    } catch {
      // Response might not be JSON
    }
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
