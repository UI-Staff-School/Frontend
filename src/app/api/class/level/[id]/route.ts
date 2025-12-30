import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/class/level/${params.id}`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch class level" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Class Level API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class level" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/class/level/${params.id}`, {
      method: "PUT",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update class level");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update class level" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/class/level/${params.id}`, {
      method: "DELETE",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete class level");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete class level" },
      { status: 500 }
    );
  }
}

