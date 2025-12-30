import { NextRequest } from "next/server";

/**
 * Gets the access token from the request (cookie or Authorization header)
 */
export function getAccessToken(req: NextRequest): string | null {
  // Prefer Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    console.log("[getAccessToken] Found token in Authorization header");
    return token;
  }

  // Fallback to cookies (check both access_token and token for backwards compatibility)
  const accessToken = req.cookies.get("access_token")?.value;
  if (accessToken) {
    console.log(
      "[getAccessToken] Found access_token cookie, length:",
      accessToken.length
    );
    return accessToken;
  }

  const token = req.cookies.get("token")?.value;
  if (token) {
    console.log("[getAccessToken] Found token cookie, length:", token.length);
    return token;
  }

  // Debug: Log all available cookies with more details
  const allCookies = req.cookies.getAll();
  console.log(
    "[getAccessToken] No token found. Available cookies:",
    allCookies.map((c) => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
    }))
  );
  console.log(
    "[getAccessToken] Cookie header from request:",
    req.headers.get("cookie")
  );
  return null;
}

/**
 * Gets headers for API requests with Authorization header included
 */
export function getApiHeaders(req: NextRequest): HeadersInit {
  const token = getAccessToken(req);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("[getApiHeaders] Authorization header added to request");
  } else {
    console.warn(
      "[getApiHeaders] No token available, request will be unauthenticated"
    );
  }

  return headers;
}
