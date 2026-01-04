import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("[Auth] Logging out user");

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear all auth-related cookies
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    console.log("[Auth] Cookies cleared successfully");
    return response;
  } catch (error: any) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to logout" },
      { status: 500 }
    );
  }
}

// Also support GET for simple logout links
export async function GET(req: NextRequest) {
  return POST(req);
}
