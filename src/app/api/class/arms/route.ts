import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/class/arms`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch class arms" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Class Arms API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class arms" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/class/arms`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create class arm");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create class arm" },
      { status: 500 }
    );
  }
}

