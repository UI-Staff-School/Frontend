import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear all auth-related cookies
    response.cookies.delete("access_token");
    response.cookies.delete("token");

    // Also set them to expire immediately
    response.cookies.set("access_token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: false,
      sameSite: "lax",
    });

    response.cookies.set("token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign out" },
      { status: 500 }
    );
  }
}
