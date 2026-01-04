import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

// GET /api/export/attendance/class/[classArmId]/term/[termId] - Export class attendance
export async function GET(
  req: NextRequest,
  { params }: { params: { classArmId: string; termId: string } }
) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const format = searchParams.get("format") || "pdf";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let queryString = `format=${format}`;
    if (startDate) queryString += `&startDate=${startDate}`;
    if (endDate) queryString += `&endDate=${endDate}`;

    const url = buildExternalApiUrl(
      `/export/attendance/class/${params.classArmId}/term/${params.termId}?${queryString}`
    );

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to export class attendance" },
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
        "Content-Disposition": contentDisposition || `attachment; filename="class-attendance.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("[Export/Attendance/Class][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to export class attendance" },
      { status: 500 }
    );
  }
}
