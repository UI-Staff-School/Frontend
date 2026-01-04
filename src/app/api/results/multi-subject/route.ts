import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = buildExternalApiUrl("/result/multi-subject");

    console.log("[Results Multi-Subject][POST]", targetUrl);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Results Multi-Subject][POST] Error:", payload);
      return NextResponse.json(
        { error: payload?.message || "Failed to create results", details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error: any) {
    console.error("[Results Multi-Subject][POST] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Unable to create multi-subject results" },
      { status: 500 }
    );
  }
}
