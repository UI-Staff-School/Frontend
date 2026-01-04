import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken } from "./api-utils";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export type AuthUser = {
  id: number | string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
};

export async function getUserFromRequest(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    // Get token using the utility function (checks both access_token and token cookies)
    const token = getAccessToken(req);

    if (!token) {
      console.log("No token found in request");
      return null;
    }

    console.log("Token found, attempting validation...");

    // Try to verify token with our JWT secret first (for internal tokens)
    let isInternalJWT = false;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      isInternalJWT = true;
      console.log("Token is internal JWT, userId:", payload.userId);

      // Only try database query if Prisma is available
      if (prisma) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
          });
          if (!user) {
            console.log(
              "User not found in database for userId:",
              payload.userId
            );
            // Fall through to external API validation
          } else {
            console.log("User found in database:", user.email);
            return { id: user.id, email: user.email, role: user.role };
          }
        } catch (dbError) {
          // If database query fails, try external API validation
          console.warn("Database query failed, trying external API:", dbError);
        }
      } else {
        // If Prisma is not available, skip to external API validation
        console.warn("Prisma not available, using external API validation");
      }
    } catch (jwtError) {
      // If JWT verification fails, token is likely from external API
      console.log(
        "Token is not internal JWT, trying to decode as external JWT"
      );

      // Try to decode the JWT without verification (external API tokens)
      try {
        // Decode JWT without verification to extract payload
        const decoded = jwt.decode(token) as any;

        if (decoded && typeof decoded === "object") {
          console.log("Decoded JWT payload:", decoded);

          // Extract user information from the JWT payload
          // Based on the actual token structure: { id: "STF-0001", role: "Admin", iat, exp }
          const userId = decoded.id || decoded.userId || decoded.sub;
          const role = decoded.role;

          if (userId && role) {
            // Map external user data to our AuthUser format
            const mappedRole =
              role === "Admin" || role === "admin"
                ? "ADMIN"
                : role === "Teacher" || role === "teacher"
                ? "TEACHER"
                : role === "Student" || role === "student"
                ? "STUDENT"
                : "ADMIN";

            console.log("Extracted user from JWT:", {
              userId,
              role: mappedRole,
            });

            // Return user with ID from token (staffId format like "STF-0001")
            return {
              id: userId,
              email: decoded.email || "",
              name: decoded.name || decoded.fullName,
              firstName: decoded.firstName || decoded.first_name,
              lastName: decoded.lastName || decoded.last_name,
              role: mappedRole,
            };
          }
        }
      } catch (decodeError: any) {
        console.error("Failed to decode JWT:", decodeError.message);
      }

      // Try to validate with external API as fallback (though it may not exist)
      try {
        console.log("Trying external API validation endpoint...");
        const response = await fetch(
          "https://ui-staff-school-backend.onrender.com/authentication/validate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("External API response status:", response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log("External API validation successful:", userData);
          // Map external user data to our AuthUser format
          return {
            id: userData.id || 1,
            email: userData.email || userData.username,
            name: userData.name || userData.fullName,
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            role:
              userData.role === "Admin"
                ? "ADMIN"
                : userData.role === "Teacher"
                ? "TEACHER"
                : userData.role === "Student"
                ? "STUDENT"
                : "ADMIN",
          };
        } else {
          const errorText = await response.text();
          console.error(
            "External API validation failed:",
            response.status,
            errorText
          );
        }
      } catch (apiError: any) {
        // If external API validation fails, return null
        console.error("External API validation error:", apiError.message);
      }
    }

    console.log("All validation attempts failed");
    return null;
  } catch (e: any) {
    console.error("Unexpected error in getUserFromRequest:", e.message);
    return null;
  }
}

export function requireRole(user: AuthUser | null, allowed: string[]) {
  if (!user) throw new Error("Unauthorized");
  if (!allowed.includes(user.role)) throw new Error("Forbidden");
  return true;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
