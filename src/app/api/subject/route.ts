import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    const headers = getApiHeaders(req);
    const headersObj = headers as Record<string, string>;
    console.log("[Subject API] Request headers:", Object.keys(headersObj));
    console.log(
      "[Subject API] Authorization header present:",
      !!headersObj["Authorization"]
    );

    const response = await fetch(`${API_BASE_URL}/subject`, {
      method: "GET",
      headers: headers,
    });

    console.log("[Subject API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Subject API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch subjects" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Subject API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/subject`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create subject");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create subject" },
      { status: 500 }
    );
  }
}
