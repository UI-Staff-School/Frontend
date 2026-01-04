import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(buildExternalApiUrl("/class/arms"), {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Class Arms API] Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch class arms" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize the response - backend might return array directly or wrapped
    const classArms = Array.isArray(data)
      ? data
      : Array.isArray(data?.classArms)
      ? data.classArms
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return NextResponse.json(classArms);
  } catch (error: any) {
    console.error("[Class Arms API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class arms" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[Class Arms API] Creating class arm with payload:", JSON.stringify(body, null, 2));

    const response = await fetch(buildExternalApiUrl("/class/arms"), {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to create class arm" };
      }
      
      console.error("[Class Arms API] Backend error:", {
        status: response.status,
        error: errorData,
        payload: body,
      });
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || "Failed to create class arm" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Class Arms API] Successfully created class arm:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Class Arms API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class arm" },
      { status: 500 }
    );
  }
}

