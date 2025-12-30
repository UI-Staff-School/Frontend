import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Log cookie information for debugging
    const cookies = req.cookies.getAll();
    console.log(
      "Cookies in request:",
      cookies.map((c) => ({
        name: c.name,
        value: c.value ? `${c.value.substring(0, 20)}...` : "empty",
      }))
    );

    const tokenCookie = req.cookies.get("access_token") || req.cookies.get("token");
    console.log("Token cookie exists:", !!tokenCookie);
    console.log(
      "Token cookie value (first 30 chars):",
      tokenCookie?.value?.substring(0, 30) || "N/A"
    );

    const authHeader = req.headers.get("authorization");
    console.log("Authorization header exists:", !!authHeader);

    // TEMPORARILY COMMENTED OUT FOR DEVELOPMENT - Authorization checks disabled
    // const user = await getUserFromRequest(req);
    // if (!user) {
    //   console.log("No user found, returning 401");
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    
    // TEMPORARY: Return default admin user for development
    const user = {
      id: 1,
      email: "dev@example.com",
      role: "ADMIN" as const,
    };

    console.log("User authenticated successfully (DEV MODE):", user.id, user.role);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Auth me endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
