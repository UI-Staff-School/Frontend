import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/export/result/class/[classArmId]/term/[termId]/ranking - Export class ranking
export async function GET(
  req: NextRequest,
  { params }: { params: { classArmId: string; termId: string } }
) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const format = searchParams.get("format") || "pdf";

    const url = buildExternalApiUrl(
      `/export/result/class/${params.classArmId}/term/${params.termId}/ranking?format=${format}`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to export class ranking" },
        { status: response.status }
      );
    }

    // Get the file content
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition || `attachment; filename="class-ranking.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("[Export/Result/Class/Ranking][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to export class ranking" },
      { status: 500 }
    );
  }
}
