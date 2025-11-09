import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getApiHeaders } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const accessToken = req.cookies.get("access_token");
  const token = req.cookies.get("token");
  const authHeader = req.headers.get("authorization");

  const tokenFromUtil = getAccessToken(req);
  const headers = getApiHeaders(req);

  return NextResponse.json({
    allCookies: allCookies.map((c) => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
    })),
    accessTokenCookie: accessToken
      ? {
          exists: true,
          length: accessToken.value.length,
          firstChars: accessToken.value.substring(0, 30),
        }
      : { exists: false },
    tokenCookie: token
      ? {
          exists: true,
          length: token.value.length,
          firstChars: token.value.substring(0, 30),
        }
      : { exists: false },
    authorizationHeader: authHeader
      ? { exists: true, value: authHeader.substring(0, 50) }
      : { exists: false },
    tokenFromUtil: tokenFromUtil
      ? {
          exists: true,
          length: tokenFromUtil.length,
          firstChars: tokenFromUtil.substring(0, 30),
        }
      : { exists: false },
    apiHeaders: {
      hasAuthorization: !!(headers as Record<string, string>)["Authorization"],
      headerKeys: Object.keys(headers as Record<string, string>),
    },
  });
}
