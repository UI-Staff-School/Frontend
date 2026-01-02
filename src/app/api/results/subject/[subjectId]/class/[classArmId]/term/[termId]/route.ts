import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { subjectId: string; classArmId: string; termId: string } }
) {
  try {
    const { subjectId, classArmId, termId } = params;
    const targetUrl = buildExternalApiUrl(
      `/result/subject/${subjectId}/class/${classArmId}/term/${termId}`
    );

    console.log("[Results Subject View][GET]", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Results Subject View][GET] Error:", payload);
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch subject results", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error("[Results Subject View][GET] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch subject results" },
      { status: 500 }
    );
  }
}
