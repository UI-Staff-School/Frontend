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
    
    // If data is an array, return as is (it should already include classLevel info from backend)
    // If data has a nested structure, extract the array
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    }
    
    // Handle nested response structure
    if (data && Array.isArray(data.data)) {
      return NextResponse.json(data.data);
    }
    
    // Fallback to empty array
    return NextResponse.json([]);
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
    
    console.log("[Class Arms API] Creating class arm with payload:", JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/class/arms`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "Failed to create class arm" };
      }
      
      console.error("[Class Arms API] Backend error:", {
        status: response.status,
        error: errorData,
        payload: body,
      });
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || "Failed to create class arm" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Class Arms API] Successfully created class arm:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Class Arms API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class arm" },
      { status: 500 }
    );
  }
}

