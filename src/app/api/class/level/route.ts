import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { normalizeClassLevel, normalizeClassLevels } from "@/lib/class-level-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    console.log("[Class Level API] Fetching class levels from backend...");
    const response = await fetch(`${API_BASE_URL}/class/level`, {
      method: "GET",
      headers: {
        ...getApiHeaders(req),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: errorText || "Failed to fetch class levels" },
        { status: response.status }
      );
    }

    let data = await response.json();
    
    // Normalize class level data to ensure consistent ID field
    if (Array.isArray(data)) {
      data = normalizeClassLevels(data);
    } else if (data && typeof data === 'object') {
      // Handle single object response
      data = normalizeClassLevel(data);
    }
    
    console.log("[Class Level API] Fetched class levels:", Array.isArray(data) ? data.length : "unknown", "levels");
    console.log("[Class Level API] Sample data:", Array.isArray(data) && data.length > 0 ? data[0] : "none");
    
    // Set no-cache headers on the response
    const responseHeaders = new Headers();
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");
    
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error: any) {
    console.error("Class Level API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class levels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("[Class Level API] Creating class level with payload:", JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE_URL}/class/level`, {
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
        errorData = { error: errorText || "Failed to create class level" };
      }
      
      console.error("[Class Level API] Backend error:", {
        status: response.status,
        error: errorData,
        payload: body,
      });
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || "Failed to create class level" },
        { status: response.status }
      );
    }

    let data = await response.json();
    
    // Normalize the created class level to ensure it has an 'id' field
    const normalizedData = normalizeClassLevel(data);
    
    // Warn if the created class level still has no ID
    if (normalizedData.id === undefined || normalizedData.id === null) {
      console.warn("[Class Level API] WARNING: Created class level has no ID field!", {
        data,
        allKeys: Object.keys(data),
        normalized: normalizedData,
      });
    }
    
    console.log("[Class Level API] Successfully created class level:", normalizedData);
    return NextResponse.json(normalizedData, { status: 201 });
  } catch (error: any) {
    console.error("[Class Level API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class level" },
      { status: 500 }
    );
  }
}

