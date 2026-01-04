import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/export/result/student/[studentId]/term/[termId] - Export student result
export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string; termId: string } }
) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const format = searchParams.get("format") || "pdf";

    const url = buildExternalApiUrl(
      `/export/result/student/${params.studentId}/term/${params.termId}?format=${format}`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to export student result" },
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
        "Content-Disposition": contentDisposition || `attachment; filename="student-result.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("[Export/Result/Student][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to export student result" },
      { status: 500 }
    );
  }
}
