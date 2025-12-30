import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

function buildResultDetailUrl(id: string) {
  return buildExternalApiUrl(`/result/${id}`);
}

async function proxyRequest(
  req: NextRequest,
  method: "GET" | "PUT" | "DELETE",
  id: string
) {
  const init: RequestInit = {
    method,
    headers: getApiHeaders(req),
  };

  if (method === "PUT") {
    const body = await req.json();
    init.body = JSON.stringify(body);
  }

  const response = await fetch(buildResultDetailUrl(id), init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      { error: payload?.message || "Result request failed", details: payload },
      { status: response.status }
    );
  }

  return NextResponse.json(payload, {
    status: method === "DELETE" ? 200 : response.status,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await proxyRequest(req, "GET", params.id);
  } catch (error: any) {
    console.error("[Results][GET:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch result" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await proxyRequest(req, "PUT", params.id);
  } catch (error: any) {
    console.error("[Results][PUT:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to update result" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await proxyRequest(req, "DELETE", params.id);
  } catch (error: any) {
    console.error("[Results][DELETE:id] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to delete result" },
      { status: 500 }
    );
  }
}