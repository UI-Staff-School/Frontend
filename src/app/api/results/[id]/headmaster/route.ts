import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const payload = {
      ...body,
      comments: body.headmasterComment ?? body.comments,
    };

    const response = await fetch(
      buildExternalApiUrl(`/result/${params.id}`),
      {
        method: "PUT",
        headers: getApiHeaders(req),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.message || "Failed to update headmaster comment",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Results][Headmaster PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update headmaster comment" },
      { status: 500 }
    );
  }
}
