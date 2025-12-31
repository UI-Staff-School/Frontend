import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(buildExternalApiUrl("/student"), {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch students", details: payload },
        { status: response.status }
      );
    }

    const raw =
      Array.isArray(payload?.data) || Array.isArray(payload?.students)
        ? payload.data || payload.students
        : Array.isArray(payload)
        ? payload
        : [];

    return NextResponse.json({ students: raw });
  } catch (error: any) {
    console.error("[Students][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch students" },
      { status: 500 }
    );
  }
}
