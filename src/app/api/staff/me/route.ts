import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Log cookies for debugging
    const allCookies = req.cookies.getAll();
    console.log(
      "[Staff/Me] All cookies:",
      allCookies.map((c) => c.name)
    );

    // Validate the current user (decode token to get user info)
    const user = await getUserFromRequest(req);
    if (!user) {
      console.log("[Staff/Me] User validation failed - no user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Staff/Me] User validated:", user.id, user.role);

    const headers = getApiHeaders(req);
    const headersObj = headers as Record<string, string>;
    console.log("[Staff/Me] Request headers keys:", Object.keys(headersObj));
    console.log(
      "[Staff/Me] Authorization header present:",
      !!headersObj["Authorization"]
    );

    try {
      // Try to fetch staff details from external API using /staff/me endpoint
      console.log("[Staff/Me] Fetching from:", `${API_BASE_URL}/staff/me`);
      const response = await fetch(`${API_BASE_URL}/staff/me`, {
        method: "GET",
        headers: headers,
      });

      console.log("[Staff/Me] Response status:", response.status);

      if (response.ok) {
        const staffData = await response.json();
        console.log("[Staff/Me] Successfully fetched staff data");
        return NextResponse.json({ staff: staffData });
      } else {
        const errorText = await response.text();
        console.error(
          "[Staff/Me] /staff/me failed:",
          response.status,
          errorText
        );

        // If /staff/me doesn't work, try fetching by ID
        console.log(`[Staff/Me] Trying fallback to /staff/${user.id}`);
        const staffByIdResponse = await fetch(
          `${API_BASE_URL}/staff/${user.id}`,
          {
            method: "GET",
            headers: headers,
          }
        );

        console.log(
          "[Staff/Me] Fallback response status:",
          staffByIdResponse.status
        );

        if (staffByIdResponse.ok) {
          const staffData = await staffByIdResponse.json();
          return NextResponse.json({ staff: staffData });
        } else {
          const fallbackError = await staffByIdResponse.text();
          console.error(
            "[Staff/Me] Fallback also failed:",
            staffByIdResponse.status,
            fallbackError
          );
        }
      }
    } catch (apiError: any) {
      // If external API fails, return basic user info as staff
      console.error("[Staff/Me] API request exception:", apiError.message);
    }

    // Fallback: return basic user info formatted as staff
    console.log("[Staff/Me] Returning fallback user data");
    return NextResponse.json({
      staff: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[Staff/Me] Endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get staff information" },
      { status: 500 }
    );
  }
}
