import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    // Validate the current user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to fetch staff details from external API
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = bearerToken || req.cookies.get("token")?.value;

    try {
      // Try to fetch staff details using the user's ID
      const response = await fetch(`${API_BASE_URL}/staff/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const staffData = await response.json();
        return NextResponse.json({ staff: staffData });
      }
    } catch (apiError) {
      // If external API fails, return basic user info as staff
      console.warn(
        "Failed to fetch staff details from external API:",
        apiError
      );
    }

    // Fallback: return basic user info formatted as staff
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
    console.error("Staff me endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get staff information" },
      { status: 500 }
    );
  }
}
